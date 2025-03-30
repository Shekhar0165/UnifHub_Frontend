"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { ChevronDown, Plus, Trash, Pencil, Save, X, User, UserPlus, UserX, Briefcase, Loader2, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";

// API base URL from environment variable
const api = process.env.NEXT_PUBLIC_API;

export default function TeamManagement({ OrgId }) {
    const { toast } = useToast();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
    const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [editSearchQuery, setEditSearchQuery] = useState("");
    const [editSearchResults, setEditSearchResults] = useState([]);

    const [currentTeam, setCurrentTeam] = useState(null);
    const [newTeam, setNewTeam] = useState({
        teamName: "",
        teamLeader: null,
        teamMembers: []
    });

    // Fetch teams on component mount
    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const authToken = localStorage.getItem('accessToken');
            setLoading(true);
            const response = await axios.get(`${api}/team/${OrgId}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setTeams(response.data);
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data || 'Failed to fetch teams',
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Search members function
    const searchMembers = async (query) => {
        if (!query.trim()) return;

        setIsSearching(true);

        try {
            const authToken = localStorage.getItem('accessToken');
            const response = await axios.get(
                `${api}/user/members/search?query=${encodeURIComponent(query)}`,
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            const data = response.data;

            if (data.success) {
                setSearchResults(data.members || []);
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to search members",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Error searching members",
                variant: "destructive",
            });
        } finally {
            setIsSearching(false);
        }
    };

    // Search members for edit dialog
    const searchMembersForEdit = async (query) => {
        if (!query.trim()) return;

        setIsSearching(true);

        try {
            const response = await axios.get(
                `${api}/user/members/search?query=${encodeURIComponent(query)}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true
                }
            );

            const data = response.data;

            if (data.success) {
                setEditSearchResults(data.members || []);
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to search members",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Error searching members",
                variant: "destructive",
            });
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddTeam = async () => {
        try {
            const authToken = localStorage.getItem('accessToken');
            if (!newTeam.teamName) {
                return toast({
                    title: "Error",
                    description: 'Team name is required',
                    variant: "destructive",
                });
            }

            if (!newTeam.teamLeader) {
                return toast({
                    title: "Error",
                    description: 'Please select a team leader',
                    variant: "destructive",
                });
            }

            if (newTeam.teamMembers.length === 0) {
                return toast({
                    title: "Error",
                    description: 'Please add at least one team member',
                    variant: "destructive",
                });
            }

            const response = await axios.post(`${api}/team/add`, {
                teamName: newTeam.teamName,
                teamLeader: newTeam.teamLeader,
                OrganizationId: OrgId,
                teamMembers: newTeam.teamMembers
            }, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            toast({
                title: "Success",
                description: 'Team created successfully',
            });
            setIsAddTeamOpen(false);
            resetNewTeam();
            fetchTeams();
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data || 'Failed to create team',
                variant: "destructive",
            });
        }
    };

    const handleUpdateTeam = async () => {
        try {
            const authToken = localStorage.getItem('accessToken');
            if (!currentTeam?._id) return;

            if (!currentTeam.teamName) {
                return toast({
                    title: "Error",
                    description: 'Team name is required',
                    variant: "destructive",
                });
            }

            if (!currentTeam.teamLeader) {
                return toast({
                    title: "Error",
                    description: 'Please select a team leader',
                    variant: "destructive",
                });
            }

            if (currentTeam.teamMembers.length === 0) {
                return toast({
                    title: "Error",
                    description: 'Please add at least one team member',
                    variant: "destructive",
                });
            }

            const response = await axios.put(`${api}/team/update/${OrgId}`, {
                teamid: currentTeam._id,
                teamName: currentTeam.teamName,
                teamLeader: currentTeam.teamLeader,
                teamMembers: currentTeam.teamMembers
            });

            toast({
                title: "Success",
                description: 'Team updated successfully',
            });
            setIsEditTeamOpen(false);
            fetchTeams();
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data?.message || 'Failed to update team',
                variant: "destructive",
            });
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (!confirm('Are you sure you want to delete this team?')) return;

        try {
            const authToken = localStorage.getItem('accessToken');
            await axios.delete(`${api}/team/delete`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
                data: {
                    teamid: teamId,
                    organizationId: OrgId
                }
            });

            toast({
                title: "Success",
                description: 'Team deleted successfully',
            });
            fetchTeams();
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data?.message || 'Failed to delete team',
                variant: "destructive",
            });
        }
    };

    // Add member to current team being edited
    const handleAddMember = (userId, userName, userImage) => {
        // Check if user is already in team
        if (currentTeam.teamMembers.some(member => member.id === userId)) {
            return toast({
                title: "Error",
                description: 'User is already a team member',
                variant: "destructive",
            });
        }

        const updatedTeam = {
            ...currentTeam,
            teamMembers: [
                ...currentTeam.teamMembers,
                {
                    id: userId,
                    name: userName,
                    profile_path: userImage,
                    role: "Member" // Default role
                }
            ]
        };

        setCurrentTeam(updatedTeam);
        setEditSearchQuery("");
        setEditSearchResults([]);
    };

    // Remove member from current team being edited
    const handleRemoveMember = (memberId) => {
        // Check if this member is the team leader
        if (currentTeam.teamLeader?.id === memberId) {
            toast({
                title: "Error",
                description: 'Cannot remove the team leader. Please assign a new leader first.',
                variant: "destructive",
            });
            return;
        }

        const updatedMembers = currentTeam.teamMembers.filter(member => member.id !== memberId);
        setCurrentTeam({
            ...currentTeam,
            teamMembers: updatedMembers
        });
    };

    const resetNewTeam = () => {
        setNewTeam({
            teamName: "",
            teamLeader: null,
            teamMembers: []
        });
        setSearchQuery("");
        setSearchResults([]);
    };

    // Add member to new team being created
    const handleAddTeamMember = (userId, userName, userImage) => {
        // Check if user is already in team
        if (newTeam.teamMembers.some(member => member.id === userId)) {
            return toast({
                title: "Error",
                description: 'User is already added to the team',
                variant: "destructive",
            });
        }

        setNewTeam({
            ...newTeam,
            teamMembers: [
                ...newTeam.teamMembers,
                {
                    id: userId,
                    name: userName,
                    profile_path: userImage,
                    role: "Member" // Default role
                }
            ]
        });

        // Clear search results after adding
        setSearchQuery("");
        setSearchResults([]);
    };

    // Remove member from new team being created
    const handleRemoveTeamMember = (memberId) => {
        // Check if this member is the team leader
        if (newTeam.teamLeader?.id === memberId) {
            setNewTeam({
                ...newTeam,
                teamLeader: null,
                teamMembers: newTeam.teamMembers.filter(member => member.id !== memberId)
            });
        } else {
            setNewTeam({
                ...newTeam,
                teamMembers: newTeam.teamMembers.filter(member => member.id !== memberId)
            });
        }
    };

    // Select team leader for new team
    const handleSelectTeamLeader = (userId) => {
        // Check if user exists in team members
        const member = newTeam.teamMembers.find(m => m.id === userId);
        if (!member) {
            return toast({
                title: "Error",
                description: 'Please add this user to the team first',
                variant: "destructive",
            });
        }

        setNewTeam({
            ...newTeam,
            teamLeader: {
                id: member.id,
                name: member.name,
                profile_path: member.profile_path,
                role: "Team Leader"
            }
        });
    };

    // Update member role in new team
    const handleUpdateNewTeamMemberRole = (memberId, role) => {
        const updatedMembers = newTeam.teamMembers.map(member => {
            if (member.id === memberId) {
                return { ...member, role };
            }
            return member;
        });

        // If this is the team leader, update the team leader role too
        if (newTeam.teamLeader?.id === memberId) {
            setNewTeam({
                ...newTeam,
                teamLeader: {
                    ...newTeam.teamLeader,
                    role
                },
                teamMembers: updatedMembers
            });
        } else {
            setNewTeam({
                ...newTeam,
                teamMembers: updatedMembers
            });
        }
    };

    const handleEditTeam = (team) => {
        setCurrentTeam(team);
        setIsEditTeamOpen(true);
    };

    // Change team leader in edit mode
    const handleChangeTeamLeader = (userId) => {
        // Check if user exists in team members
        const member = currentTeam.teamMembers.find(m => m.id === userId);
        if (!member) {
            return toast({
                title: "Error",
                description: 'Please add this user to the team first',
                variant: "destructive",
            });
        }

        setCurrentTeam({
            ...currentTeam,
            teamLeader: {
                id: member.id,
                name: member.name,
                profile_path: member.profile_path,
                role: member.role || "Team Leader"
            }
        });
    };

    // Update member role in edit mode
    const handleUpdateMemberRole = (memberId, role) => {
        const updatedMembers = currentTeam.teamMembers.map(member => {
            if (member.id === memberId) {
                return { ...member, role };
            }
            return member;
        });

        // If this is the team leader, update the team leader role too
        if (currentTeam.teamLeader?.id === memberId) {
            setCurrentTeam({
                ...currentTeam,
                teamLeader: {
                    ...currentTeam.teamLeader,
                    role
                },
                teamMembers: updatedMembers
            });
        } else {
            setCurrentTeam({
                ...currentTeam,
                teamMembers: updatedMembers
            });
        }
    };

    return (
        <div className="container mx-auto p-4">
            <Toaster />
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Team Management</h1>
                    <p className="text-muted-foreground">Manage your organization's teams and members</p>
                </div>
                <Button onClick={() => setIsAddTeamOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Add New Team
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2 mt-2" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="border-b pb-2">
                                    <Skeleton className="h-4 w-1/4 mb-2" />
                                    <div className="flex items-center">
                                        <Skeleton className="h-8 w-8 rounded-full mr-2" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Skeleton className="h-4 w-1/4 mb-2" />
                                    <div className="flex flex-wrap gap-1">
                                        {[1, 2, 3].map((j) => (
                                            <Skeleton key={j} className="h-5 w-20" />
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : teams.length === 0 ? (
                <Card className="text-center p-8">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Users className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">No Teams Yet</h3>
                                <p className="text-muted-foreground">Create your first team to get started</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map(team => (
                        <Card key={team._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{team.teamName}</CardTitle>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditTeam(team)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit Team
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600"
                                                onClick={() => handleDeleteTeam(team._id)}
                                            >
                                                <Trash className="mr-2 h-4 w-4" /> Delete Team
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardDescription className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {team.teamMembers.length} members
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="border-b pb-3">
                                        <p className="text-sm font-medium mb-2">Team Leader</p>
                                        <Link href={`/user/${team.teamLeader.userid}`} className="flex items-center hover:bg-white/10 p-2 rounded-md">
                                            <Avatar className="mr-3 h-10 w-10 border-2 border-primary/20">
                                                {team.teamLeader.profile_path ? (
                                                    <AvatarImage src={team.teamLeader.profile_path} alt={team.teamLeader.name} />
                                                ) : (
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        {team.teamLeader.name.charAt(0).toUpperCase()}
                                                        {team.teamLeader.profile_path}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <div>
                                                <span className="block font-medium">{team.teamLeader.name}</span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Briefcase className="h-3 w-3" /> {team.teamLeader.role}
                                                </span>
                                            </div>

                                        </Link>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium mb-2">Team Members</p>
                                        <div className="flex flex-wrap gap-2">
                                            {team.teamMembers.map(member => (
                                                <Badge
                                                    key={member.id}
                                                    variant="outline"
                                                >
                                                    <Link className="flex items-center gap-1.5 px-2 py-1" href={`/user/${member.userid}`}>
                                                        <Avatar className="h-4 w-4">
                                                            {member.profile_path ? (
                                                                <AvatarImage src={member?.profile_path} alt={member.name} />
                                                            ) : (
                                                                <AvatarFallback className="text-xs">
                                                                    {member.name.charAt(0).toUpperCase()}
                                                                </AvatarFallback>
                                                            )}
                                                        </Avatar>
                                                        <span className="text-xs">{member.name}</span>
                                                    </Link>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Team Dialog */}
            <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Team</DialogTitle>
                        <DialogDescription>
                            Add a new team to your organization.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label htmlFor="teamName" className="text-sm font-medium">
                                Team Name
                            </label>
                            <Input
                                id="teamName"
                                placeholder="Enter team name"
                                value={newTeam.teamName}
                                onChange={(e) => setNewTeam({ ...newTeam, teamName: e.target.value })}
                            />
                        </div>

                        {/* Team Members Selection */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Add Team Members</label>
                            </div>
                            <div className="relative">
                                <Input
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (e.target.value.trim().length > 2) {
                                            searchMembers(e.target.value);
                                        } else {
                                            setSearchResults([]);
                                        }
                                    }}
                                />
                                {isSearching && (
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                                    </div>
                                )}
                                {searchResults.length > 0 && (
                                    <div className="absolute z-10 mt-1 w-full bg-background shadow-lg rounded-md max-h-60 overflow-auto border">
                                        {searchResults.map(user => (
                                            <div
                                                key={user._id}
                                                className="flex items-center p-2 hover:bg-white/10 cursor-pointer"
                                                onClick={() => handleAddTeamMember(user._id, user.name, user.profileImage)}
                                            >
                                                <Avatar className="mr-2 h-6 w-6">
                                                    {user.profileImage && (
                                                        <AvatarImage src={user?.profileImage} alt={user.name} />
                                                    )}
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="">{user.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Team Members Table with Role Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Team Members</label>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Team Leader</TableHead>
                                        <TableHead className="w-8">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {newTeam.teamMembers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">
                                                No members added yet
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        newTeam.teamMembers.map(member => (
                                            <TableRow key={member.id}>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <Avatar className="mr-2 h-6 w-6">
                                                            {member.profile_path && (
                                                                <AvatarImage src={member?.profile_path} alt={member.name} />
                                                            )}
                                                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span>{member.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        defaultValue={member.role}
                                                        onValueChange={(value) => handleUpdateNewTeamMemberRole(member.id, value)}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select role" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Member">Member</SelectItem>
                                                            <SelectItem value="Developer">Developer</SelectItem>
                                                            <SelectItem value="Designer">Designer</SelectItem>
                                                            <SelectItem value="Project Manager">Project Manager</SelectItem>
                                                            <SelectItem value="QA">QA</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center">
                                                        <input
                                                            type="radio"
                                                            name="teamLeader"
                                                            checked={newTeam.teamLeader?.id === member.id}
                                                            onChange={() => handleSelectTeamLeader(member.id)}
                                                            className="h-4 w-4"
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700 p-0"
                                                        onClick={() => handleRemoveTeamMember(member.id)}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsAddTeamOpen(false);
                            resetNewTeam();
                        }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddTeam}
                            disabled={!newTeam.teamName || !newTeam.teamLeader || newTeam.teamMembers.length === 0}
                        >
                            Create Team
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Team Dialog */}
            <Dialog open={isEditTeamOpen} onOpenChange={setIsEditTeamOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Team</DialogTitle>
                        <DialogDescription>
                            Update team information.
                        </DialogDescription>
                    </DialogHeader>
                    {currentTeam && (
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <label htmlFor="editTeamName" className="text-sm font-medium">
                                    Team Name
                                </label>
                                <Input
                                    id="editTeamName"
                                    placeholder="Enter team name"
                                    value={currentTeam.teamName}
                                    onChange={(e) => setCurrentTeam({ ...currentTeam, teamName: e.target.value })}
                                />
                            </div>

                            {/* Search and Add Members */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Add Team Members</label>
                                </div>
                                <div className="relative">
                                    <Input
                                        placeholder="Search users..."
                                        value={editSearchQuery}
                                        onChange={(e) => {
                                            setEditSearchQuery(e.target.value);
                                            if (e.target.value.trim().length > 2) {
                                                searchMembersForEdit(e.target.value);
                                            } else {
                                                setEditSearchResults([]);
                                            }
                                        }}
                                    />
                                    {isSearching && (
                                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                            <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                                        </div>
                                    )}
                                    {editSearchResults.length > 0 && (
                                        <div className="absolute z-10 mt-1 w-full bg-background shadow-lg rounded-md max-h-60 overflow-auto border">
                                            {editSearchResults.map(user => (
                                                <div
                                                    key={user._id}
                                                    className="flex items-center p-2 hover:bg-white/10 cursor-pointer"
                                                    onClick={() => handleAddMember(user._id, user.name, user.profileImage)}
                                                >
                                                    <Avatar className="mr-2 h-6 w-6">
                                                        {user.profileImage && (
                                                            <AvatarImage src={user.profileImage} alt={user.name} />
                                                        )}
                                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{user.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Team Members Table */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Team Members</label>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Team Leader</TableHead>
                                            <TableHead className="w-8">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentTeam.teamMembers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center">
                                                    No members added yet
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            currentTeam.teamMembers.map(member => (
                                                <TableRow key={member.id}>
                                                    <TableCell>
                                                        <div className="flex items-center">
                                                            <Avatar className="mr-2 h-6 w-6">
                                                                {member.profile_path && (
                                                                    <AvatarImage src={member?.profile_path} alt={member.name} />
                                                                )}
                                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <span>{member.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            defaultValue={member.role}
                                                            onValueChange={(value) => handleUpdateMemberRole(member.id, value)}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select role" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Member">Member</SelectItem>
                                                                <SelectItem value="Developer">Developer</SelectItem>
                                                                <SelectItem value="Designer">Designer</SelectItem>
                                                                <SelectItem value="Project Manager">Project Manager</SelectItem>
                                                                <SelectItem value="QA">QA</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-center">
                                                            <input
                                                                type="radio"
                                                                name="editTeamLeader"
                                                                checked={currentTeam.teamLeader?.id === member.id}
                                                                onChange={() => handleChangeTeamLeader(member.id)}
                                                                className="h-4 w-4"
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700 p-0"
                                                            onClick={() => handleRemoveMember(member.id)}
                                                            disabled={currentTeam.teamLeader?.id === member.id}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditTeamOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateTeam}
                            disabled={!currentTeam?.teamName || !currentTeam?.teamLeader || currentTeam?.teamMembers.length === 0}
                        >
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}