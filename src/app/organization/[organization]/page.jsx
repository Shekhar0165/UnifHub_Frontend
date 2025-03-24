'use client'
import React, { useEffect, useState } from 'react'
import { useParams, usePathname, useSearchParams } from 'next/navigation'
import {
    Users, UserPlus, History, UsersIcon, Award, FileText, Calendar,
    Share2, MapPin, GraduationCap, Mail, Phone, Star, Activity,
    BarChart2, Github, Linkedin, Twitter, Clock, ChevronRight, X,
    BriefcaseIcon, ChevronDown, Building
} from 'lucide-react';

// UI components from shadcn/ui or your UI library
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { useRouter } from 'next/navigation';
import Header from '@/app/Components/Header/Header'
import { Chart } from "react-google-charts";
import EventComponent from '@/app/Components/Organization/CreatePost'
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import OrganizationJourney from '@/app/Components/Organization/OrganizationJourney';



// Helper function to get activity level color
const getActivityColor = (count) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-700';
    if (count < 3) return 'bg-blue-200 dark:bg-blue-900/30';
    if (count < 5) return 'bg-blue-400 dark:bg-blue-800';
    return 'bg-blue-600 dark:bg-blue-600';
};



const LeftComponent = ({ user }) => {
    return (
        <>
            <div className="w-full lg:w-1/3">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
                    {/* Profile Picture and Basic Info */}
                    <div className="p-6">
                        <div className="flex flex-col items-center">
                            <img
                                src={`${process.env.NEXT_PUBLIC_API}${user?.profileImage}`}
                                alt={user?.name}
                                className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl mb-4"
                            />
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
                            <p className="text-blue-600 dark:text-blue-400">{user?.university}</p>
                            <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span className="text-sm">{user?.location}</span>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <p className="text-gray-700 dark:text-gray-300 text-sm">{user?.bio}</p>

                            <div className="flex justify-center space-x-4 pt-4">
                                <a
                                    href={user?.socialLinks?.github}
                                    className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                                >
                                    <Github className="h-5 w-5" />
                                </a>
                                <a
                                    href={user?.socialLinks?.linkedin}
                                    className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                >
                                    <Linkedin className="h-5 w-5" />
                                </a>
                                <a
                                    href={user?.socialLinks?.twitter}
                                    className="text-gray-500 hover:text-blue-400 dark:text-gray-400 dark:hover:text-blue-300 transition-colors"
                                >
                                    <Twitter className="h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 divide-y divide-gray-200 dark:divide-gray-700">
                            <div className="flex items-center p-4">
                                <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">{user?.email}</span>
                            </div>

                        </div>
                    </div>



                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <button className="w-full flex justify-center items-center py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 dark:bg-transparent dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Profile
                        </button>
                    </div>
                </div>

                {/* Upcoming Events Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
                    <div className="p-6">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                            <Clock className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                            Upcoming Events
                        </h3>

                        {user?.upcomingEvents?.length > 0 ? (
                            <div className="space-y-4">
                                {user.upcomingEvents.map((event, index) => (
                                    <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</h4>
                                            <span className={`text-xs px-2 py-1 rounded-full ${event.status === 'Registered'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                }`}>
                                                {event.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <Calendar className="h-3 w-3 inline mr-1" />
                                            {event.date}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <MapPin className="h-3 w-3 inline mr-1" />
                                            {event.location}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
                                            Organized by {event.organizer}
                                        </p>
                                        <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                                            View details <ChevronRight className="h-3 w-3 ml-1" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming events.</p>
                        )}
                    </div>
                </div>


            </div>
        </>
    )
}

const RightComponent = ({ user, setIsNavigating }) => {
    const [activeTab, setActiveTab] = useState('team');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [showTeamPopup, setShowTeamPopup] = useState(false);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Fetch teams from the backend
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                setLoading(true);
                const authToken = localStorage.getItem('accessToken');

                // Use the id from the user object
                const response = await fetch(`${process.env.NEXT_PUBLIC_API}/team/${user._id}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    }
                });

                const data = await response.json();
                setTeams(data);
            } catch (error) {
                console.error('Error fetching teams:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?._id) {
            fetchTeams();
        }
    }, [user]);

    const handleTeamClick = (team) => {
        setSelectedTeam(team);
        setShowTeamPopup(true);
    };


    const closeTeamPopup = () => {
        setShowTeamPopup(false);
        setSelectedTeam(null);
    };



    const TeamMembersPopup = () => {
        if (!selectedTeam) return null;

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl transform transition-all">
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    {selectedTeam.teamName}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Team Members ({selectedTeam.teamMembers?.length || 0})
                                </p>
                            </div>
                            <button
                                onClick={closeTeamPopup}
                                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-auto max-h-[60vh]">
                        {/* Team Lead Section */}
                        <div className="mb-8">
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                                Team Lead
                            </h4>
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl ">
                                <Link href={`/user/${selectedTeam.teamLeader.userid}`} className="flex items-center hover:bg-white/10 p-3 rounded-xl">
                                    <Avatar className="h-12 w-12 border-4 border-white dark:border-gray-800 shadow-sm">
                                        {selectedTeam.teamLeader?.profile_path ? (
                                            <AvatarImage
                                                src={`${process.env.NEXT_PUBLIC_API}${selectedTeam.teamLeader.profile_path}`}
                                                alt={selectedTeam.teamLeader.name}
                                            />
                                        ) : (
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                                {selectedTeam.teamLeader?.name?.charAt(0).toUpperCase() || 'T'}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className="ml-4">
                                        <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {selectedTeam.teamLeader?.name || "Team Leader"}
                                        </h5>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">
                                            {selectedTeam.teamLeader?.role || "Team Lead"}
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Team Members Section */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                                Team Members
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {selectedTeam.teamMembers?.map((member, index) => (
                                    <div key={member.id || index}>
                                        <Link
                                            href={`/user/${member.userid}`}
                                            onClick={() => setIsNavigating(true)}
                                            className="block group relative p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 
                border border-gray-200 dark:border-gray-700 rounded-xl 
                hover:shadow-lg hover:-translate-y-1 
                dark:hover:shadow-blue-500/5 
                transition-all duration-300"
                                        >
                                            {/* Hover Effect Overlay */}
                                            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 dark:group-hover:bg-blue-500/10 rounded-xl transition-colors duration-300"></div>

                                            <div className="relative flex items-center space-x-4">
                                                {/* Avatar Section */}
                                                <div className="flex-shrink-0">
                                                    <Avatar className="h-14 w-14 ring-2 ring-white dark:ring-gray-800 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-800 shadow-md transform group-hover:scale-105 transition-transform duration-300">
                                                        {member.profile_path ? (
                                                            <AvatarImage
                                                                src={`${process.env.NEXT_PUBLIC_API}${member.profile_path}`}
                                                                alt={member.name}
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-semibold">
                                                                {member.name.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                </div>

                                                {/* Content Section */}
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                                            {member.name}
                                                        </h4>
                                                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all duration-300" />
                                                    </div>

                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors duration-300"
                                                        >
                                                            <div className="flex items-center gap-1.5">
                                                                <BriefcaseIcon className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                                                <span className="text-xs">{member.role}</span>
                                                            </div>
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={closeTeamPopup}
                            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <X className="h-4 w-4" />
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="w-full lg:w-2/3">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
                    {/* Tab Navigation - Remove Achievements, change Events to Journey */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('team')}
                            className={`flex-1 py-4 px-6 text-center border-b-2 font-medium transition-all duration-500 text-sm ${activeTab === 'team'
                                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-center">
                                <Users className="h-5 w-5 mr-2" />
                                Teams
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('journey')}
                            className={`flex-1 transition-all duration-500 py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'journey'
                                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-center">
                                <History className="h-5 w-5 mr-2" />
                                Journey
                            </div>
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'team' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Our Teams</h2>
                                    <button
                                        onClick={() => router.push(`/organization/${user.userid}/edit`)}
                                        className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 dark:bg-transparent dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Manage Teams
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md animate-pulse">
                                                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                                    <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                                                </div>
                                                <div className="p-4">
                                                    <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-600 rounded mb-3"></div>
                                                    <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                                                    <div className="flex items-center justify-between mt-4">
                                                        <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                                                        <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : teams.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {teams.map((team) => (
                                            <div
                                                key={team._id}
                                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
                                            >
                                                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                                                    <h3 className="font-medium text-gray-900 dark:text-white truncate flex items-center">
                                                        <Users className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                                                        {team.teamName}
                                                    </h3>
                                                </div>

                                                <div className="p-4">
                                                    <Link href={`/user/${team.teamLeader.userid}`} className="flex items-center mb-3 hover:bg-white/10 p-2 rounded-md">
                                                        <div className="flex-shrink-0">
                                                            <Avatar className="h-9 w-9 border-2 border-primary/20">
                                                                {team.teamLeader?.profile_path ? (
                                                                    <AvatarImage src={`${process.env.NEXT_PUBLIC_API}${team.teamLeader.profile_path}`} alt={team.teamLeader.name} />
                                                                ) : (
                                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                                        {team.teamLeader?.name?.charAt(0).toUpperCase() || 'T'}
                                                                    </AvatarFallback>
                                                                )}
                                                            </Avatar>
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {team.teamLeader?.name || "Team Leader"}
                                                            </p>
                                                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                                                {team.teamLeader?.role || "Team Lead"}
                                                            </p>
                                                        </div>
                                                    </Link>

                                                    <div className="flex flex-wrap gap-1 mt-3 mb-4">
                                                        {team.teamMembers?.slice(0, 3).map((member) => (
                                                            <Badge
                                                                key={member.id}
                                                                variant="outline"

                                                            >
                                                                <Link className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/10 border border-gray-600 hovre:bg-white/10 rounded-md" href={`/user/${member.userid}`}>
                                                                    <Avatar className="h-4 w-4">
                                                                        {member.profile_path ? (
                                                                            <AvatarImage src={`${process.env.NEXT_PUBLIC_API}${member.profile_path}`} alt={member.name} />
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

                                                        {team.teamMembers?.length > 3 && (
                                                            <Badge onClick={() => handleTeamClick(team)} variant="outline" className="px-2 py-1">
                                                                <span className="text-xs">+{team.teamMembers.length - 3} more</span>
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            Members: {team.teamMembers?.length || 0}
                                                        </span>
                                                        <button onClick={() => handleTeamClick(team)} className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                                                            View details <ChevronRight className="h-4 w-4 ml-1" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                                            <UsersIcon className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Teams Yet</h3>
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">This organization hasn't created any teams yet.</p>
                                        <button
                                            onClick={() => router.push(`/organization/${user.userid}/manage-teams`)}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                        >
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Create Team
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'journey' && (
                            <OrganizationJourney organizationId={user._id} />
                        )}
                    </div>
                </div>

                {/* Keep the event component and user activity */}
                <EventComponent user={user} />
                <UserActivity user={user} />
            </div>

            {/* Render Popups - keep them for now */}
            {showTeamPopup && <TeamMembersPopup />}
        </>
    );
};


const UserActivity = ({ user }) => {
    // Month names for labeling
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Prepare data for Google Charts
    const chartData = [
        ["Month", "Contributions", { role: "style" }], // Chart header
        ...user?.activities?.contributions?.map((count, index) => [
            months[index] || `Month ${index + 1}`, // Use month names or fallback
            count,
            "stroke-color: #2563eb; stroke-width: 1; fill-color: #2563eb; opacity: 0.9; border-radius: 10px",
        ]),
    ];

    const options = {
        legend: { position: "none" },
        chartArea: { width: "85%", height: "75%" },
        backgroundColor: "transparent",
        bar: { groupWidth: "40%" }, // Reduce bar width
        colors: ["#2563eb"],
        hAxis: {
            title: "Months",
            textStyle: { color: "#6b7280", fontSize: 12, fontWeight: 500 },
            gridlines: { color: "rgba(107, 114, 128, 0.2)" }, // Subtle grid lines
        },
        vAxis: {
            minValue: 0,
            title: "Contributions",
            textStyle: { color: "#6b7280", fontSize: 12, fontWeight: 500 },
            gridlines: { color: "rgba(107, 114, 128, 0.2)" }, // Subtle grid lines
        },
        tooltip: {
            textStyle: { fontSize: 12, color: "#ffffff" },
            showColorCode: true
        },
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6 p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                Activity Overview
            </h3>

            {/* Activity Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                    { label: "This Month", value: user?.activities?.thisMonth },
                    { label: "Last Month", value: user?.activities?.lastMonth },
                    { label: "Current Streak", value: `${user?.activities?.streakDays} days` },
                    { label: "Longest Streak", value: `${user?.activities?.longestStreak} days` },
                ].map((item, index) => (
                    <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                        <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Monthly Activity Chart */}
            <div className="mt-8 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 shadow">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Monthly Activity</h4>
                <Chart
                    chartType="ColumnChart"
                    width="100%"
                    height="200px"
                    data={chartData}
                    options={options}
                />
            </div>

            {/* GitHub Link */}
            <div className="mt-6 flex justify-center">
                <a href={user.socialLinks.github} className="text-blue-600 dark:text-blue-400 text-sm hover:underline flex items-center">
                    View full activity on GitHub
                    <ChevronRight className="h-4 w-4 ml-1" />
                </a>
            </div>
        </div>
    );
};
export default function ProfilePage() {
    const { organization } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Single useEffect for handling navigation state
    useEffect(() => {
        setIsNavigating(false);
    }, [pathname, searchParams]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');

                if (!accessToken) {
                    setLoading(false);
                    return; // User not authenticated
                }

                if (!organization) {
                    console.error('organization is missing');
                    setLoading(false);
                    return;
                }
                console.log("working from here")

                const response = await fetch(`${process.env.NEXT_PUBLIC_API}/org/one`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    credentials: 'include', // Equivalent to withCredentials: true in axios
                    body: JSON.stringify({ userid: organization })
                });

                const data = await response.json();

                setUser(data); // Axios auto-parses JSON
            } catch (error) {
                console.error('Error fetching user data:', error);

                if (error.response?.status === 401) {
                    // Token expired, clear storage and redirect
                    localStorage.removeItem('user');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    router.push('/');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [organization]);

    console.log('user', user);

    return (
        <>
            <Header />
            {isNavigating && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            )}
            <div className="min-h-screen bg-background">
                {/* Header with cover image */}
                {user ? (
                    <>
                        <div className="relative h-60 w-full overflow-hidden">
                            <img
                                src={`${process.env.NEXT_PUBLIC_API}${user?.coverImage}`}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>

                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="relative -mt-16 flex flex-col lg:flex-row gap-8">
                                {/* Left Column - Profile Info */}
                                <LeftComponent user={user} />

                                {/* Right Column - Content Area */}
                                <RightComponent
                                    user={user}
                                    isNavigating={isNavigating}
                                    setIsNavigating={setIsNavigating}
                                />
                            </div>
                        </div>
                    </>
                ) : loading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="flex justify-center items-center h-60">
                        <p>Please log in to view this profile</p>
                    </div>
                )}
            </div>
        </>
    );
}