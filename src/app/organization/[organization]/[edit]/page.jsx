'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Github, Linkedin, Twitter, Search, Building, GraduationCap, UserPlus, MapPin, Phone, Upload, X, Plus, Mail } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/app/Components/Header/Header';
import { Toast } from '@/components/ui/toast';


const TeamMembersPopup = ({ selectedTeam, closeTeamPopup, updateTeam }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberRole, setMemberRole] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [newUpdatedTeam, setNewUpdatedTeam] = useState(null);

    if (!selectedTeam) return null;

    const searchMembers = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setIsLoading(true);

        try {
            const authToken = localStorage.getItem('accessToken');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/user/members/search?query=${encodeURIComponent(searchQuery)}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const data = await response.data;

            if (data.success) {
                setSearchResults(data.members);
            } else {
                Toast.error("Error searching members: " + data.message);
            }
        } catch (error) {
            Toast.error("Failed to search members: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const addMemberToTeam = async () => {
        if (!selectedMember || !memberRole.trim()) return;

        setIsLoading(true);

        try {
            const updatedTeam = {
                ...selectedTeam,
                members: [
                    ...selectedTeam.members,
                    { name: selectedMember.name, role: memberRole }
                ]
            };
            setNewUpdatedTeam(updatedTeam);
            Toast.success("Member added successfully!");

            setSelectedMember(null);
            setMemberRole('');
            setSearchQuery('');
            setSearchResults([]);
            setIsSearching(false);
        } catch (error) {
            Toast.error("Failed to add member: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-[70%] max-h-[80vh] overflow-auto shadow-xl">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{selectedTeam.name} Team Members</h3>
                    <button onClick={closeTeamPopup} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Add New Team Member</h4>

                    <div className="flex mb-3">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                console.log(e.target.value)
                                
                            }}
                            placeholder="Search by name or ID"
                            className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                        />
                        <button
                            onClick={searchMembers}
                            disabled={isLoading}
                            className="px-4 py-2 bg-foreground hover:bg-primary-dark text-background rounded-r-lg flex items-center justify-center"
                        >
                            {isLoading ? 'Searching...' : <Search className="h-5 w-5" />}
                        </button>
                    </div>

                    {isSearching && (
                        <div className="mb-4">
                            {isLoading ? (
                                <p className="text-center text-gray-600 dark:text-gray-400">Searching...</p>
                            ) : searchResults.length > 0 ? (
                                <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                    {searchResults.map((member) => (
                                        <div
                                            key={member.id}
                                            onClick={() => setSelectedMember(member)}
                                            className={`p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedMember?.id === member.id ? 'bg-primary-light dark:bg-primary-dark/20' : ''
                                                }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-white font-semibold">
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-2">
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">{member.userid}</p>
                                                    </div>
                                                </div>
                                                <button onClick={addMemberToTeam} className="px-1 py-1 bg-foreground text-background font-semibold rounded-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">
                                                    Invite
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-600 dark:text-gray-400">No results found</p>
                            )}

                            {selectedMember && (
                                <div className="mt-3">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selected: {selectedMember.name}</p>
                                    <div className="flex">
                                        <input
                                            type="text"
                                            value={memberRole}
                                            onChange={(e) => setMemberRole(e.target.value)}
                                            placeholder="Enter role (e.g. Developer)"
                                            className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                                        />
                                        <button
                                            onClick={addMemberToTeam}
                                            disabled={isLoading || !memberRole.trim()}
                                            className="px-4 py-2 bg-success hover:bg-success-dark text-white rounded-r-lg flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            <UserPlus className="h-5 w-5 " />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <div className="mb-4 p-3 bg-primary-light dark:bg-primary-dark/20 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white">Team Lead</h4>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-white font-semibold shadow-sm">
                                    {selectedTeam.head.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-3 flex-grow">
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedTeam.head}</p>
                                    {/* <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{member.role}</p> */}
                                </div>
                            </div>
                        </div>
                    </div>

                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Team Members</h4>

                    {selectedTeam?.members?.length > 0 ? (
                        <ul className="space-y-3">
                            {newUpdatedTeam?.members ? newUpdatedTeam.members.map((member, index) => {
                                return (
                                    <li key={index} className="p-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-white font-semibold shadow-sm">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-3 flex-grow">
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{member.name}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{member.role}</p>
                                            </div>
                                        </div>
                                    </li>
                                );
                            }) : selectedTeam.members.map((member, index) => {
                                return (
                                    <li key={index} className="p-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-white font-semibold shadow-sm">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-3 flex-grow">
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{member.name}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{member.role}</p>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center p-4">No team members yet</p>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                    <button
                        onClick={() => updateTeam(newUpdatedTeam)}
                        className="flex-1 px-4 py-2 bg-foreground hover:bg-success-dark text-background font-medium rounded-lg transition-colors"
                    >
                        Update Team
                    </button>

                    <button
                        onClick={closeTeamPopup}
                        className="flex-1 px-4 py-2 bg-background hover:bg-primary-dark text-foreground font-medium rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const OrganizationProfileEditForm = () => {
    const { toast } = useToast();
    const [organization, setOrganization] = useState({
        name: '',
        email: '',
        phone: '',
        university: '',
        location: '',
        bio: '',
        teams: [],
        upcomingEvents: [],
        events: [],
        socialLinks: {
            github: '',
            linkedin: '',
            twitter: ''
        }
    });

    const [profileImage, setProfileImage] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [showTeamPopup, setShowTeamPopup] = useState(false);
    const [members, setMembers] = useState([
        { id: 1, name: "", head: "" } // Initial member
    ]);
    // For team fields
    const [teamField, setTeamField] = useState({
        name: '',
        head: '',
        members: []
    });



    // Fetch organization data on component mount
    useEffect(() => {
        const fetchOrganizationData = async () => {
            try {
                const token = localStorage.getItem('accessToken');


                const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/org`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    credentials: 'include',
                });

                setOrganization(response.data);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load organization data. Please try again.",
                    variant: "destructive",
                });
            }
        };

        fetchOrganizationData();
    }, [toast]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Handle nested objects (socialLinks)
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setOrganization({
                ...organization,
                [parent]: {
                    ...organization[parent],
                    [child]: value
                }
            });
        } else {
            setOrganization({
                ...organization,
                [name]: value
            });
        }
    };

    // Handle file changes
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'profileImage') {
            setProfileImage(files[0]);
            organization.profileImage = files[0].name;
        } else if (name === 'coverImage') {
            setCoverImage(files[0]);
            organization.coverImage = files[0].name;
        }
    };

    // Handle team field changes
    const handleTeamChange = (e) => {
        const { name, value } = e.target;
        setTeamField({
            ...teamField,
            [name]: value
        });
    };

    // Handle adding a team
    const handleAddTeam = () => {
        if (teamField.name.trim() !== '' && teamField.head.trim() !== '') {
            setOrganization({
                ...organization,
                teams: [...(organization.teams || []), { ...teamField, members: [] }]
            });
            setTeamField({
                name: '',
                head: ''
            });
            console.log(teamField)
        }
    };

   



    const handleUpdateTeam = async (updatedTeam) => {
        try {
            // Make an API call to update the team in the backend
            const authToken = localStorage.getItem('accessToken');
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API}/org/update-team/${organization._id}`,
                updatedTeam,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            );

            if (response.data.success) {
                const updatedTeams = response.data.organization.teams;

                setOrganization((prevOrg) => ({
                    ...prevOrg,
                    teams: updatedTeams
                }));

                alert("Team updated successfully!");
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error("Failed to update team:", error);
            alert("Failed to update team.");
        }
    };





    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = localStorage.getItem('accessToken');

            // Create FormData for file uploads
            const formData = new FormData();

            // Add all organization data fields to FormData
            // Converting the object to JSON string since FormData doesn't handle nested objects well
            formData.append('organizationData', JSON.stringify(organization));

            // Append files if selected
            if (profileImage) {
                formData.append('profileImage', profileImage);
            }

            if (coverImage) {
                formData.append('coverImage', coverImage);
            }

            await axios.put(
                `${process.env.NEXT_PUBLIC_API}/org/${organization._id}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            toast({
                title: "Success",
                description: "Organization profile updated successfully!",
            });

            // Reset file states after successful upload
            setProfileImage(null);
            setCoverImage(null);

        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data?.message || 'Failed to update profile. Please try again.',
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };


    const handleTeamClick = (team) => {
        setSelectedTeam(team);
        setShowTeamPopup(true);
    };


    const closeTeamPopup = () => {
        setShowTeamPopup(false);
        setSelectedTeam(null);
    };

    return (
        <>
            <Header />
            <div className="container max-w-6xl mx-auto py-6">
                <Card className="border-none shadow-lg">
                    <form onSubmit={handleSubmit}>
                        <Tabs defaultValue="basic" className="w-full">
                            <div className="px-6 pt-2">
                                <TabsList className="grid w-full grid-cols-5">
                                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                    <TabsTrigger value="social">Social</TabsTrigger>
                                    <TabsTrigger value="teams">Teams</TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Cover Image - Outside tabs as it's always visible */}
                            <div className="px-6 pt-6">
                                <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
                                    {organization?.coverImage && !coverImage && (
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API}${organization?.coverImage}`}
                                            alt="Cover"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    {coverImage && (
                                        <img
                                            src={URL.createObjectURL(coverImage)}
                                            alt="Cover Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                                        <Label htmlFor="coverImage" className="bg-background text-foreground py-2 px-4 rounded-md cursor-pointer flex items-center gap-2">
                                            <Upload className="h-4 w-4" />
                                            Change Cover
                                            <Input
                                                id="coverImage"
                                                type="file"
                                                name="coverImage"
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Image - Also outside tabs */}
                            <div className="flex justify-center -mt-16 mb-4 relative z-10">
                                <div className="relative">
                                    <Avatar className="h-32 w-32 border-4 border-background">
                                        {organization?.profileImage && !profileImage ? (
                                            <AvatarImage src={`${process.env.NEXT_PUBLIC_API}${organization?.profileImage}`}
                                                alt={organization?.name} />
                                        ) : profileImage ? (
                                            <AvatarImage src={URL.createObjectURL(profileImage)} alt={organization?.name} />
                                        ) : (
                                            <AvatarFallback>{organization?.name?.charAt(0) || "O"}</AvatarFallback>
                                        )}
                                    </Avatar>
                                    <Label
                                        htmlFor="profileImage"
                                        className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                                    >
                                        <Upload className="h-4 w-4" />
                                        <Input
                                            id="profileImage"
                                            type="file"
                                            name="profileImage"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                    </Label>
                                </div>
                            </div>

                            <CardContent>
                                <TabsContent value="basic" className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="flex items-center gap-2">
                                                <Building className="h-4 w-4" />
                                                Organization Name
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={organization?.name || ''}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                Email
                                            </Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                value={organization?.email || ''}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                Phone Number
                                            </Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                value={organization?.phone || ''}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="university" className="flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4" />
                                                University
                                            </Label>
                                            <Input
                                                id="university"
                                                name="university"
                                                value={organization?.university || ''}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="location" className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Location
                                            </Label>
                                            <Input
                                                id="location"
                                                name="location"
                                                value={organization?.location || ''}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            name="bio"
                                            value={organization?.bio || ''}
                                            onChange={handleChange}
                                            rows="4"
                                            placeholder="Tell us about your organization..."
                                            className="resize-none"
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="social" className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="github" className="flex items-center gap-2">
                                            <Github className="h-4 w-4" />
                                            GitHub URL
                                        </Label>
                                        <Input
                                            id="github"
                                            name="socialLinks.github"
                                            value={organization?.socialLinks?.github || ''}
                                            onChange={handleChange}
                                            placeholder="https://github.com/organization"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="linkedin" className="flex items-center gap-2">
                                            <Linkedin className="h-4 w-4" />
                                            LinkedIn URL
                                        </Label>
                                        <Input
                                            id="linkedin"
                                            name="socialLinks.linkedin"
                                            value={organization?.socialLinks?.linkedin || ''}
                                            onChange={handleChange}
                                            placeholder="https://linkedin.com/company/organization"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="twitter" className="flex items-center gap-2">
                                            <Twitter className="h-4 w-4" />
                                            Twitter URL
                                        </Label>
                                        <Input
                                            id="twitter"
                                            name="socialLinks.twitter"
                                            value={organization?.socialLinks?.twitter || ''}
                                            onChange={handleChange}
                                            placeholder="https://twitter.com/organization"
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="teams" className="space-y-4">
                                    <div className="space-y-3">
                                        {organization?.teams?.map((team, index) => (
                                            <Card key={index} onClick={() => handleTeamClick(team)} className="relative border border-muted">
                                                <CardContent className="p-4">
                                                    <div className="font-semibold">{team.name}</div>
                                                    <div className="text-sm">Team Head: {team.head}</div>
                                                    <div className="text-muted-foreground text-sm">
                                                        {team.members?.length || 0} members
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    <Card className="border border-dashed border-muted">
                                        <CardContent className="p-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="teamName">Team Name</Label>
                                                    <Input
                                                        id="teamName"
                                                        name="name"
                                                        value={teamField.name}
                                                        onChange={handleTeamChange}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="teamHead">Team Head</Label>
                                                    <Input
                                                        id="teamHead"
                                                        name="head"
                                                        value={teamField.head}
                                                        onChange={handleTeamChange}
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleAddTeam}
                                                className="w-full flex items-center justify-center gap-1"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add Team
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                            </CardContent>

                            <CardFooter className="flex justify-end p-6 border-t bg-muted/20">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-8"
                                >
                                    {isLoading ? 'Saving...' : 'Save Profile'}
                                </Button>
                            </CardFooter>
                        </Tabs>
                    </form>
                </Card>
            </div>

            {showTeamPopup &&
                <TeamMembersPopup
                    selectedTeam={selectedTeam}
                    closeTeamPopup={closeTeamPopup}
                    updateTeam={handleUpdateTeam}
                />
            }
        </>
    );
};

export default OrganizationProfileEditForm;