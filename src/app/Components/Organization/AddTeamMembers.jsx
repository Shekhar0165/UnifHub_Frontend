"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, HelpCircle, Search, ChevronDown, ChevronUp, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Badge } from "@/components/ui/badge";

const apiUrl = process.env.NEXT_PUBLIC_API;

const AddTeamMemberPopup = ({ selectedAddTeamMember, closeAddTeamMemberPopup, isOpen, organizationId }) => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [expandedTeams, setExpandedTeams] = useState([]);
    const [headMember, setHeadMember] = useState(null);
    const [viceHeadMember, setViceHeadMember] = useState(null);
    const [eventTeams, setEventTeams] = useState([]);
    const [newTeamName, setNewTeamName] = useState('');
    const [activeTab, setActiveTab] = useState("members"); // "members" or "positions"
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchTeams();
        }
    }, [isOpen]);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            
            if (!organizationId) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Organization ID not found.",
                });
                return;
            }

            const response = await axios.get(
                `${apiUrl}/team/${organizationId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true
                }
            );

            if (response.data) {
                setTeams(response.data);
            }
        } catch (error) {
            console.error("Error fetching teams:", error);
            toast({
                variant: "destructive",
                title: "Error Fetching Teams",
                description: error.response?.data?.message || "Failed to fetch teams.",
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleTeamExpansion = (teamId) => {
        setExpandedTeams(prev => 
            prev.includes(teamId) 
                ? prev.filter(id => id !== teamId) 
                : [...prev, teamId]
        );
    };

    const toggleMemberSelection = (member, teamName) => {
        const memberWithTeam = { ...member, teamName };
        
        // Check if member is already selected
        const isAlreadySelected = selectedMembers.some(m => m.id === member.id);
        
        if (isAlreadySelected) {
            // Remove member
            setSelectedMembers(prev => prev.filter(m => m.id !== member.id));
            
            // If member was head or vice head, remove that designation
            if (headMember?.id === member.id) {
                setHeadMember(null);
            }
            if (viceHeadMember?.id === member.id) {
                setViceHeadMember(null);
            }
            
            // Remove from event teams if assigned
            setEventTeams(teams => 
                teams.map(team => ({
                    ...team,
                    members: team.members.filter(m => m.id !== member.id)
                }))
            );
        } else {
            // Add member
            setSelectedMembers(prev => [...prev, memberWithTeam]);
        }
    };

    const setMemberAsHead = (member) => {
        if (member.id === viceHeadMember?.id) {
            setViceHeadMember(null);
        }
        setHeadMember(member);
    };

    const setMemberAsViceHead = (member) => {
        if (member.id === headMember?.id) {
            setHeadMember(null);
        }
        setViceHeadMember(member);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredTeams = teams.filter(team => {
        // If search term is empty, return all teams
        if (!searchTerm.trim()) return true;
        
        // Check if team name matches
        if (team.teamName.toLowerCase().includes(searchTerm.toLowerCase())) {
            return true;
        }
        
        // Check if any team member matches
        return team.teamMembers.some(member => 
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.userid.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const assignMemberToEventTeam = (member, teamId) => {
        // Check if member is already in any team, remove if so
        const updatedTeams = eventTeams.map(team => ({
            ...team,
            members: team.id === teamId 
                ? [...team.members.filter(m => m.id !== member.id), member] 
                : team.members.filter(m => m.id !== member.id)
        }));
        
        setEventTeams(updatedTeams);
    };
    
    const removeMemberFromEventTeam = (member, teamId) => {
        setEventTeams(teams => 
            teams.map(team => ({
                ...team,
                members: team.id === teamId 
                    ? team.members.filter(m => m.id !== member.id) 
                    : team.members
            }))
        );
    };

    const getMemberEventTeam = (memberId) => {
        for (const team of eventTeams) {
            if (team.members.some(m => m.id === memberId)) {
                return team.id;
            }
        }
        return null;
    };
    
    const addNewTeam = () => {
        if (!newTeamName.trim()) {
            toast({
                variant: "destructive", 
                title: "Team Name Required",
                description: "Please enter a team name."
            });
            return;
        }
        
        // Check if team name already exists
        if (eventTeams.some(team => team.name.toLowerCase() === newTeamName.trim().toLowerCase())) {
            toast({
                variant: "destructive",
                title: "Team Already Exists",
                description: "A team with this name already exists."
            });
            return;
        }
        
        // Generate a unique ID
        const newTeamId = `team_${Date.now()}`;
        
        setEventTeams([
            ...eventTeams,
            {
                id: newTeamId,
                name: newTeamName.trim(),
                members: []
            }
        ]);
        
        setNewTeamName('');
        
        toast({
            title: "Team Created",
            description: `${newTeamName.trim()} team has been created.`
        });
    };
    
    const removeEventTeam = (teamId) => {
        // Check if team has members
        const team = eventTeams.find(t => t.id === teamId);
        if (team && team.members.length > 0) {
            if (!confirm(`Are you sure you want to remove the "${team.name}" team? All members will be unassigned.`)) {
                return;
            }
        }
        
        setEventTeams(eventTeams.filter(team => team.id !== teamId));
    };

    // Check if there's at least one team with members
    const hasValidTeam = eventTeams.length > 0 && eventTeams.some(team => team.members.length > 0);
    const canSave = selectedMembers.length > 0 && headMember && hasValidTeam;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (selectedMembers.length === 0) {
            toast({
                variant: "destructive",
                title: "No Members Selected",
                description: "Please select at least one team member.",
            });
            return;
        }

        if (!headMember) {
            toast({
                variant: "destructive",
                title: "Event Head Not Assigned",
                description: "Please assign a head for this event.",
            });
            return;
        }

        if (!hasValidTeam) {
            toast({
                variant: "destructive",
                title: "No Teams Created",
                description: "Please create at least one team and assign members to it.",
            });
            return;
        }

        try {
            setIsSubmitting(true);
            
            // Check if each member is assigned to a team
            const unassignedMembers = selectedMembers.filter(
                member => !getMemberEventTeam(member.id)
            );
            
            if (unassignedMembers.length > 0 && eventTeams.some(team => team.members.length > 0)) {
                toast({
                    variant: "destructive",
                    title: "Unassigned Members",
                    description: `${unassignedMembers.length} members are not assigned to any team. Please assign all members to a team.`,
                });
                setIsSubmitting(false);
                return;
            }
            
            // Prepare data for API
            const teamData = {
                eventId: selectedAddTeamMember._id,
                eventHead: headMember.id,
                eventViceHead: viceHeadMember?.id || null,
                eventTeams: eventTeams.map(team => ({
                    teamId: team.id,
                    teamName: team.name,
                    members: team.members.map(member => member.id)
                }))
            };

            // Make the API call to save team data
            const response = await axios.post(
                `${apiUrl}/events/teams/add/${organizationId}`,
                teamData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true
                }
            );

            console.log("Team data submitted:", response.data);
            
            toast({
                title: "Team Added",
                description: `Successfully added team members to ${selectedAddTeamMember.eventName}.`,
            });
            
            closeAddTeamMemberPopup();
            window.location.reload()
        } catch (error) {
            console.error("Error adding team members:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || "An error occurred while adding team members.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-1 sm:p-4 overflow">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-[98%] sm:max-w-[90%] md:max-w-4xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden flex flex-col">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-4 border-b gap-2">
                    <div className="flex items-center gap-2 overflow-hidden w-full sm:w-auto">
                        <h2 className="text-base sm:text-lg md:text-xl font-semibold truncate">
                            Add Team for {selectedAddTeamMember.eventName}
                        </h2>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <HelpCircle size={16} className="text-muted-foreground flex-shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">
                                        Select team members from your organization to add to this event.<br/>
                                        You need to create at least one team with members before saving.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button 
                            variant={activeTab === "members" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveTab("members")}
                            className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3"
                        >
                            Select Members
                        </Button>
                        <Button 
                            variant={activeTab === "positions" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveTab("positions")}
                            disabled={selectedMembers.length === 0}
                            className="flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3"
                        >
                            Create Teams
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={closeAddTeamMemberPopup}
                            className="ml-auto sm:ml-0 flex-shrink-0"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </Button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto  ">
                    {activeTab === "members" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 h-full overflow-hidden">
                            {/* Left Side - Teams and Members */}
                            <div className="border-b md:border-b-0 md:border-r border-border flex flex-col h-[40vh] md:h-full overflow-hidden">
                                <div className="p-2 sm:p-4">
                                    <div className="relative mb-2 sm:mb-3">
                                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            placeholder="Search teams or members..."
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            className="pl-8 text-sm sm:text-base h-8 sm:h-9"
                                        />
                                    </div>
                                    
                                    <h3 className="text-sm sm:text-base font-medium mb-2">Teams</h3>
                                </div>
                                
                                {loading ? (
                                    <div className="flex items-center justify-center h-40">
                                        <LoadingSpinner />
                                    </div>
                                ) : teams.length === 0 ? (
                                    <div className="text-center text-muted-foreground p-4 text-sm sm:text-base">
                                        No teams found. Please create teams for your organization first.
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-hidden">
                                        <ScrollArea className="h-full px-2 sm:px-4">
                                            <div className="space-y-2 sm:space-y-3 pr-2 sm:pr-3 pb-8">
                                                {filteredTeams.map((team) => (
                                                    <div key={team._id} className="border border-border rounded-md">
                                                        <div 
                                                            className="flex items-center justify-between p-2 sm:p-3 cursor-pointer hover:bg-secondary/20"
                                                            onClick={() => toggleTeamExpansion(team._id)}
                                                        >
                                                            <div className="font-medium text-sm sm:text-base truncate">{team.teamName}</div>
                                                            {expandedTeams.includes(team._id) ? 
                                                                <ChevronUp size={16} className="flex-shrink-0" /> : 
                                                                <ChevronDown size={16} className="flex-shrink-0" />
                                                            }
                                                        </div>
                                                        
                                                        {expandedTeams.includes(team._id) && (
                                                            <div className="border-t border-border max-h-[30vh] overflow-y-auto">
                                                                {team.teamMembers.map((member) => {
                                                                    const isSelected = selectedMembers.some(m => m.id === member.id);
                                                                    const isHead = headMember?.id === member.id;
                                                                    const isViceHead = viceHeadMember?.id === member.id;
                                                                    
                                                                    return (
                                                                        <div 
                                                                            key={member._id || member.id} 
                                                                            className={`flex items-center justify-between p-2 pl-3 sm:pl-4 hover:bg-secondary/10 ${isSelected ? 'bg-secondary/20' : ''}`}
                                                                        >
                                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                                <Avatar className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0">
                                                                                    <AvatarImage src={member.profile_path} />
                                                                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                                                                </Avatar>
                                                                                <span className="text-sm sm:text-base truncate">{member.name}</span>
                                                                                <div className="flex gap-1">
                                                                                    {isHead && (
                                                                                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs sm:text-sm px-1 py-0.5 rounded flex-shrink-0">Head</span>
                                                                                    )}
                                                                                    {isViceHead && (
                                                                                        <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs sm:text-sm px-1 py-0.5 rounded flex-shrink-0">Vice</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    toggleMemberSelection(member, team.teamName);
                                                                                }}
                                                                                className="h-6 w-6 sm:h-7 sm:w-7 p-0 flex-shrink-0"
                                                                            >
                                                                                {isSelected ? <Check size={14} className="text-primary" /> : <Plus size={14} />}
                                                                            </Button>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                )}
                            </div>
                            
                            {/* Right Side - Selected Members */}
                            <div className="flex flex-col h-[40vh] md:h-full overflow-hidden">
                                <div className="p-2 sm:p-4 border-b border-border">
                                    <h3 className="text-sm sm:text-base font-medium">Selected Members ({selectedMembers.length})</h3>
                                </div>
                                
                                <div className="flex-1 overflow-hidden">
                                    <ScrollArea className="h-full px-2 sm:px-4">
                                        {selectedMembers.length === 0 ? (
                                            <div className="text-center text-muted-foreground p-4 text-sm sm:text-base">
                                                No members selected yet. Select members from the teams list.
                                            </div>
                                        ) : (
                                            <div className="space-y-2 sm:space-y-3 pr-2 sm:pr-3 pb-8 pt-2">
                                                {selectedMembers.map((member) => (
                                                    <div key={member.id} className="border border-border rounded-md p-2 sm:p-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <Avatar className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0">
                                                                    <AvatarImage src={member.profile_path} />
                                                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="overflow-hidden">
                                                                    <div className="text-sm sm:text-base truncate">{member.name}</div>
                                                                    <div className="text-xs sm:text-sm text-muted-foreground truncate">Team: {member.teamName}</div>
                                                                </div>
                                                            </div>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm"
                                                                onClick={() => toggleMemberSelection(member, member.teamName)}
                                                                className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-destructive flex-shrink-0"
                                                            >
                                                                <X size={14} />
                                                            </Button>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 gap-1 sm:gap-2">
                                                            <Button
                                                                variant={headMember?.id === member.id ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => setMemberAsHead(member)}
                                                                className="w-full text-xs sm:text-sm h-7 sm:h-8 px-1 sm:px-2"
                                                            >
                                                                {headMember?.id === member.id ? "Head ✓" : "Set as Head"}
                                                            </Button>
                                                            <Button
                                                                variant={viceHeadMember?.id === member.id ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => setMemberAsViceHead(member)}
                                                                className="w-full text-xs sm:text-sm h-7 sm:h-8 px-1 sm:px-2"
                                                            >
                                                                {viceHeadMember?.id === member.id ? "Vice ✓" : "Set as Vice"}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full overflow-hidden">
                            <ScrollArea className="h-full">
                                <div className="p-2 sm:p-4 pb-10">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
                                        <h3 className="text-sm sm:text-base font-medium truncate">Create Teams for Event</h3>
                                        {(headMember || viceHeadMember) && (
                                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                                                <span className="text-muted-foreground">
                                                    {hasValidTeam ? 
                                                        "✓ Ready to save" : 
                                                        "⚠️ Create a team with members to continue"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                                        {selectedMembers.some(m => m.id === headMember?.id) && (
                                            <div className="p-1 sm:p-2 border border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 rounded-md flex-1 min-w-[120px]">
                                                <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">
                                                    <Avatar className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0">
                                                        <AvatarImage src={headMember.profile_path} />
                                                        <AvatarFallback>{headMember.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <Badge className="bg-blue-500 hover:bg-blue-600 text-xs sm:text-sm mb-0.5">Event Head</Badge>
                                                        <div className="font-medium text-sm sm:text-base truncate">{headMember.name}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {viceHeadMember && selectedMembers.some(m => m.id === viceHeadMember?.id) && (
                                            <div className="p-1 sm:p-2 border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-md flex-1 min-w-[120px]">
                                                <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">
                                                    <Avatar className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0">
                                                        <AvatarImage src={viceHeadMember.profile_path} />
                                                        <AvatarFallback>{viceHeadMember.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <Badge className="bg-green-500 hover:bg-green-600 text-xs sm:text-sm mb-0.5">Event Vice</Badge>
                                                        <div className="font-medium text-sm sm:text-base truncate">{viceHeadMember.name}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Create New Team Section */}
                                    <div className="mb-3 sm:mb-4 border border-border rounded-md p-2 sm:p-3">
                                        <h4 className="font-medium mb-2 text-sm sm:text-base">Create New Team</h4>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <Input
                                                placeholder="Team name (e.g. Technical, Marketing)"
                                                value={newTeamName}
                                                onChange={(e) => setNewTeamName(e.target.value)}
                                                className="flex-1 text-sm h-9"
                                            />
                                            <Button 
                                                onClick={addNewTeam} 
                                                disabled={!newTeamName.trim()}
                                                className="text-sm h-9 px-3 whitespace-nowrap"
                                            >
                                                <Plus size={16} className="mr-1" /> Create Team
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {/* Event Teams Section */}
                                    {eventTeams.length > 0 ? (
                                        <div className="mb-3 sm:mb-4">
                                            <h4 className="font-medium mb-2 text-sm sm:text-base flex items-center">
                                                Event Teams 
                                                {hasValidTeam && <span className="ml-2 text-xs text-green-600">✓</span>}
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                                {eventTeams.map(team => (
                                                    <div key={team.id} className="border border-border rounded-md">
                                                        <div className="flex items-center justify-between p-2 border-b border-border">
                                                            <h5 className="font-medium text-sm truncate max-w-[70%]">{team.name}</h5>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs text-muted-foreground">{team.members.length} members</span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeEventTeam(team.id)}
                                                                    className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-destructive flex-shrink-0"
                                                                >
                                                                    <X size={14} />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="p-2">
                                                            <div className="space-y-1 min-h-[30px] max-h-[150px] overflow-y-auto">
                                                                {team.members.length === 0 ? (
                                                                    <div className="text-xs sm:text-sm text-muted-foreground">No members assigned</div>
                                                                ) : (
                                                                    team.members.map(member => (
                                                                        <div key={member.id} className="flex items-center justify-between border-b border-border/50 pb-1">
                                                                            <div className="flex items-center gap-1 overflow-hidden">
                                                                                <Avatar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0">
                                                                                    <AvatarImage src={member.profile_path} />
                                                                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                                                                </Avatar>
                                                                                <span className="text-xs sm:text-sm truncate">{member.name}</span>
                                                                            </div>
                                                                            <Button 
                                                                                variant="ghost" 
                                                                                size="sm"
                                                                                onClick={() => removeMemberFromEventTeam(member, team.id)}
                                                                                className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-destructive flex-shrink-0"
                                                                            >
                                                                                <X size={12} />
                                                                            </Button>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center border border-dashed border-border rounded-md p-3 sm:p-4 mb-3 sm:mb-4">
                                            <p className="text-muted-foreground mb-1 text-xs sm:text-sm">No teams created yet</p>
                                            <p className="text-xs">Create a team above to organize your event</p>
                                        </div>
                                    )}
                                    
                                    {/* Unassigned Members Section */}
                                    <h4 className="font-medium mb-1 text-sm sm:text-base flex items-center justify-between flex-wrap gap-1">
                                        <span>Unassigned Members</span>
                                        {eventTeams.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs p-0 px-2"
                                                onClick={() => {
                                                    const unassigned = selectedMembers.filter(m => !getMemberEventTeam(m.id));
                                                    if (unassigned.length > 0 && eventTeams.length > 0) {
                                                        unassigned.forEach(member => {
                                                            assignMemberToEventTeam(member, eventTeams[0].id);
                                                        });
                                                        toast({
                                                            title: "Members Assigned",
                                                            description: `Assigned ${unassigned.length} members to ${eventTeams[0].name} team`,
                                                        });
                                                    }
                                                }}
                                                disabled={eventTeams.length === 0 || selectedMembers.filter(m => !getMemberEventTeam(m.id)).length === 0}
                                            >
                                                Auto-assign to first team
                                            </Button>
                                        )}
                                    </h4>
                                    <div className="border border-border rounded-md p-2">
                                        <div className="space-y-1 max-h-[150px] overflow-y-auto">
                                            {selectedMembers.filter(member => !getMemberEventTeam(member.id)).length === 0 ? (
                                                <div className="text-xs sm:text-sm text-muted-foreground">All members are assigned to teams</div>
                                            ) : (
                                                selectedMembers.filter(member => !getMemberEventTeam(member.id)).map(member => (
                                                    <div key={member.id} className="flex items-center justify-between border-b border-border/50 pb-1">
                                                        <div className="flex items-center gap-1 overflow-hidden">
                                                            <Avatar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0">
                                                                <AvatarImage src={member.profile_path} />
                                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-xs sm:text-sm truncate">{member.name}</span>
                                                        </div>
                                                        {eventTeams.length > 0 ? (
                                                            <Select onValueChange={(value) => assignMemberToEventTeam(member, value)}>
                                                                <SelectTrigger className="w-24 sm:w-28 h-6 sm:h-7 text-xs flex-shrink-0 border-dashed">
                                                                    <SelectValue placeholder="Assign" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {eventTeams.map(team => (
                                                                        <SelectItem key={team.id} value={team.id} className="text-xs">{team.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        ) : (
                                                            <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">Create a team first</span>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
                
                <div className="p-2 sm:p-3 border-t border-border">
                    <div className="flex justify-between gap-2">
                        <div>
                            {activeTab === "members" && selectedMembers.length > 0 && (
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => setActiveTab("positions")}
                                    className="text-xs sm:text-sm h-8 sm:h-9 px-3"
                                >
                                    Next: Create Teams
                                </Button>
                            )}
                            {activeTab === "positions" && (
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => setActiveTab("members")}
                                    className="text-xs sm:text-sm h-8 sm:h-9 px-3"
                                >
                                    Back
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={closeAddTeamMemberPopup}
                                className="text-xs sm:text-sm h-8 sm:h-9 px-3"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="button" 
                                onClick={handleSubmit}
                                disabled={!canSave || isSubmitting}
                                className="text-xs sm:text-sm h-8 sm:h-9 px-3"
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoadingSpinner className="mr-1 h-3 w-3" />
                                        Saving...
                                    </>
                                ) : (
                                    hasValidTeam ? 'Save Teams' : 'Create a Team First'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddTeamMemberPopup;