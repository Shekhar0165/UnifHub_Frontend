'use client'
import React, { useEffect, useState } from 'react'
import { useParams, usePathname, useSearchParams } from 'next/navigation'
import {
    Users, UserPlus, History, UsersIcon, Award, FileText, Calendar,
    Share2, MapPin, GraduationCap, Mail, Phone, Star, Activity,
    BarChart2, Github, Linkedin, Twitter, Clock, ChevronRight, X,
    BriefcaseIcon, ChevronDown, Building, Check, Edit
} from 'lucide-react';
import Cookies from 'js-cookie';
import axios from 'axios';
import FollowerFollowingPopup from '@/app/Components/UserProfile/FollowerList';

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
import OrganizationActivity from '@/app/Components/Organization/OrganizationActivity';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';



// Helper function to get activity level color
const getActivityColor = (count) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-700';
    if (count < 3) return 'bg-blue-200 dark:bg-blue-900/30';
    if (count < 5) return 'bg-blue-400 dark:bg-blue-800';
    return 'bg-blue-600 dark:bg-blue-600';
};



const LeftComponent = ({ user }) => {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const [follow, setFollow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [List, setList] = useState({ followerList: [], followingList: [] });
    const [showPopup, setShowPopup] = useState(false);
    const [Userid, SetUserid] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!user || !user._id) return;
        const UserIDByLocalStorage = localStorage.getItem('UserId');
        SetUserid(UserIDByLocalStorage);

        const fetchFollowerList = async () => {
            try {
                const listResponse = await axios.get(`${process.env.NEXT_PUBLIC_API}/follower/list/${user._id}`, {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                });
                setList(listResponse.data);
            } catch (error) {
                console.error("Error fetching follower list:", error);
            }
        };

        fetchFollowerList();
    }, [user]);

    useEffect(() => {
        if (!user || !user._id) return;

        const checkFollowerStatus = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/follower/checkfollower/${user?._id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                });
                setFollow(response.data.isFollower);
            } catch (error) {
                console.error("Error checking follower status:", error);
            }
        };

        checkFollowerStatus();
    }, [user]);

    const handleFollowOrganization = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API}/follower/add`,
                { userid: user._id },
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                toast({
                    title: "Followed",
                    description: response.data.message,
                    variant: "default",
                });
                setFollow(true);

                const listResponse = await axios.get(`${process.env.NEXT_PUBLIC_API}/follower/list/${user._id}`, {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                });
                setList(listResponse.data);
            }
        } catch (error) {
            console.error("Error following organization:", error);
            toast({
                title: "Error",
                description: "Failed to follow organization",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUnfollowOrganization = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API}/follower/remove`,
                { userid: user._id },
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                toast({
                    title: "Unfollowed",
                    description: "You have unfollowed this organization",
                    variant: "default",
                });
                setFollow(false);

                const listResponse = await axios.get(`${process.env.NEXT_PUBLIC_API}/follower/list/${user._id}`, {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                });
                setList(listResponse.data);
            }
        } catch (error) {
            console.error("Error unfollowing organization:", error);
            toast({
                title: "Error",
                description: "Failed to unfollow organization",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        const profileLink = window.location.href;

        navigator.clipboard.writeText(profileLink)
            .then(() => {
                setCopied(true);
                toast({
                    title: "Success",
                    description: "Profile link copied to clipboard!",
                    variant: "default",
                });
                setTimeout(() => setCopied(false), 2000);
            })
            .catch((err) => {
                console.error("Failed to copy: ", err);
                toast({
                    title: "Error",
                    description: "Failed to copy profile link!",
                    variant: "destructive",
                });
            });
    };

    const handleTogglePopup = () => {
        setShowPopup(!showPopup);
    };

    return (
        <>
            <Toaster />
            <div className="w-full lg:w-1/3">
                <div className="bg-background rounded-xl shadow-lg overflow-hidden mb-6 border border-border/40">
                    {/* Profile Picture and Basic Info */}
                    <div className="p-6">
                        <div className="flex flex-col items-center">
                            <img
                                src={user?.profileImage}
                                alt={user?.name}
                                className="h-32 w-32 rounded-full border-4 border-background dark:border-gray-700 shadow-xl mb-4"
                            />
                            <h1 className="text-2xl font-bold text-foreground">{user?.name}</h1>
                            <p className="text-blue-600 dark:text-blue-400">{user?.university}</p>
                            <div className="flex items-center mt-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span className="text-sm">{user?.location}</span>
                            </div>
                        </div>
                        {/* add some code  */}
                        <div className="mt-6 space-y-4">
                            <p className="text-foreground text-sm">{user?.bio}</p>

                            <div className="mt-6 border rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col items-center rounded-lg p-2 transition-all duration-200 ease-in-out hover:bg-white/10">
                                        <span className="text-xl font-bold text-foreground">{user?.events?.length || 12}</span>
                                        <span className="text-xs text-muted-foreground mt-1">Events</span>
                                    </div>
                                    <div onClick={handleTogglePopup} className="flex flex-col items-center rounded-lg p-2 transition-all duration-200 ease-in-out hover:bg-white/10 cursor-pointer">
                                        <span className="text-xl font-bold text-foreground">{List?.followerList?.length || 0}</span>
                                        <span className="text-xs text-muted-foreground mt-1">Followers</span>
                                    </div>
                                    <div onClick={handleTogglePopup} className="flex flex-col items-center rounded-lg p-2 transition-all duration-200 ease-in-out hover:bg-white/10 cursor-pointer">
                                        <span className="text-xl font-bold text-foreground">{List?.followingList?.length || 0}</span>
                                        <span className="text-xs text-muted-foreground mt-1">Following</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center pt-2">
                                <div className="flex space-x-2">
                                    <Button
                                        onClick={
                                            Userid === user?.userid
                                                ? handleCopyLink
                                                : follow
                                                    ? handleUnfollowOrganization
                                                    : handleFollowOrganization
                                        }
                                        variant="outline"
                                        className="flex items-center px-4 py-2"
                                        disabled={loading}
                                    >
                                        {Userid === user?.userid ? (
                                            <>
                                                {copied ? (
                                                    <>
                                                        <Check className="h-4 w-4 mr-2 text-green-500 transition-transform duration-300 scale-110" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Share2 className="h-4 w-4 mr-2 transition-transform duration-300" />
                                                        Share Profile
                                                    </>
                                                )}
                                            </>
                                        ) : loading ? (
                                            <LoadingSpinner fullScreen={false} istexthide={false} />
                                        ) : follow ? (
                                            'Unfollow'
                                        ) : (
                                            'Follow'
                                        )}
                                    </Button>

                                    {Userid === user?.userid && (
                                        <Button
                                            onClick={() => router.push(`/organization/${user.userid}/edit`)}
                                            variant="outline"
                                            className="px-3 py-2"
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-center space-x-4 pt-4">
                                <a
                                    href={user?.socialLinks?.github}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Github className="h-5 w-5" />
                                </a>
                                <a
                                    href={user?.socialLinks?.linkedin}
                                    className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    <Linkedin className="h-5 w-5" />
                                </a>
                                <a
                                    href={user?.socialLinks?.twitter}
                                    className="text-muted-foreground hover:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                >
                                    <Twitter className="h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border">
                        <div className="grid grid-cols-1 divide-y divide-border">
                            <div className="flex items-center p-4">
                                <Mail className="h-5 w-5 text-muted-foreground mr-3" />
                                <span className="text-sm text-foreground">{user?.email}</span>
                            </div>

                        </div>
                    </div>



                    <div className="p-4 border-t border-border">
                        <button onClick={handleCopyLink} className="w-full flex justify-center items-center py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-background hover:bg-secondary transition-colors">
                            {copied ? (
                                <Check className="h-4 w-4 mr-2 text-green-500 transition-transform duration-300 scale-110" />
                            ) : (
                                <Share2 className="h-4 w-4 mr-2 transition-transform duration-300" />
                            )}
                            {copied ? "Copied!" : "Share Profile"}
                        </button>
                    </div>
                </div>

                {/* Upcoming Events Section */}
                <div className="bg-background rounded-xl shadow-lg overflow-hidden mb-6 border border-border/40">
                    <div className="p-6">
                        <h3 className="font-medium text-foreground mb-4 flex items-center">
                            <Clock className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                            Upcoming Events
                        </h3>

                        {user?.upcomingEvents?.length > 0 ? (
                            <div className="space-y-4">
                                {user.upcomingEvents.map((event, index) => (
                                    <div key={index} className="p-3 border border-border rounded-lg hover:bg-secondary/20 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-medium text-foreground">{event.title}</h4>
                                            <span className={`text-xs px-2 py-1 rounded-full ${event.status === 'Registered'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                                }`}>
                                                {event.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            <Calendar className="h-3 w-3 inline mr-1" />
                                            {event.date}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            <MapPin className="h-3 w-3 inline mr-1" />
                                            {event.location}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1 mb-2">
                                            Organized by {event.organizer}
                                        </p>
                                        <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                                            View details <ChevronRight className="h-3 w-3 ml-1" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No upcoming events.</p>
                        )}
                    </div>
                </div>


            </div>

            {showPopup && (
                <FollowerFollowingPopup
                    isOpen={showPopup}
                    onClose={() => setShowPopup(false)}
                    followerList={List?.followerList}
                    followingList={List?.followingList}
                    router={router}
                />
            )}
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

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API}/team/${user._id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });

                if (response.status === 401) {
                    Cookies.remove('accessToken');
                    Cookies.remove('refreshToken');
                    Cookies.remove('UserType');
                    Cookies.remove('UserId');
                    router.push('/');
                    return;
                }

                const data = await response.json();
                setTeams(data);
            } catch (error) {
                console.error('Error fetching teams:', error);
                if (error.response?.status === 401) {
                    Cookies.remove('accessToken');
                    Cookies.remove('refreshToken');
                    Cookies.remove('UserType');
                    Cookies.remove('UserId');
                    router.push('/');
                }
            } finally {
                setLoading(false);
            }
        };

        if (user?._id) {
            fetchTeams();
        }
    }, [user, router]);

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
                <div className="bg-background rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl transform transition-all border border-border/30">
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 border-b border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    {selectedTeam.teamName}
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Team Members ({selectedTeam.teamMembers?.length || 0})
                                </p>
                            </div>
                            <button
                                onClick={closeTeamPopup}
                                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="h-5 w-5 text-muted-foreground" />
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
                            <div className="bg-blue-50/30 dark:bg-blue-900/20 rounded-xl ">
                                <Link href={`/user/${selectedTeam.teamLeader.userid}`} className="flex items-center hover:bg-white/10 p-3 rounded-xl">
                                    <Avatar className="h-12 w-12 border-4 border-white dark:border-gray-800 shadow-sm">
                                        {selectedTeam.teamLeader?.profile_path ? (
                                            <AvatarImage
                                                src={selectedTeam.teamLeader.profile_path}
                                                alt={selectedTeam.teamLeader.name}
                                            />
                                        ) : (
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                                {selectedTeam.teamLeader?.name?.charAt(0).toUpperCase() || 'T'}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className="ml-4">
                                        <h5 className="text-lg font-semibold text-foreground">
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
                                                                src={member.profile_path}
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
                    <div className="p-4 bg-secondary/30 border-t border-border">
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
                <div className="bg-background rounded-xl shadow-lg overflow-hidden mb-6 border border-border/40">
                    {/* Tab Navigation - Remove Achievements, change Events to Journey */}
                    <div className="flex border-b border-border">
                        <button
                            onClick={() => setActiveTab('team')}
                            className={`flex-1 py-4 px-6 text-center border-b-2 font-medium transition-all duration-500 text-sm ${activeTab === 'team'
                                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
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
                                : 'border-transparent text-muted-foreground hover:text-foreground'
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
                                    <h3 className="text-xl font-semibold text-foreground">Our Teams</h3>
                                    <button
                                        onClick={() => router.push(`/organization/${user.userid}/edit`)}
                                        className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-lg text-blue-600 bg-background hover:bg-secondary/20 transition-colors"
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
                                                className="bg-background border border-border rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
                                            >
                                                <div className="p-4 border-b border-border bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-900/20 dark:to-indigo-900/20">
                                                    <h3 className="font-medium text-foreground truncate flex items-center">
                                                        <Users className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                                                        {team.teamName}
                                                    </h3>
                                                </div>

                                                <div className="p-4">
                                                    <Link href={`/user/${team.teamLeader.userid}`} className="flex items-center mb-3 hover:bg-secondary/20 p-2 rounded-md">
                                                        <div className="flex-shrink-0">
                                                            <Avatar className="h-9 w-9 border-2 border-primary/20">
                                                                {team.teamLeader?.profile_path ? (
                                                                    <AvatarImage src={team.teamLeader.profile_path} alt={team.teamLeader.name} />
                                                                ) : (
                                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                                        {team.teamLeader?.name?.charAt(0).toUpperCase() || 'T'}
                                                                    </AvatarFallback>
                                                                )}
                                                            </Avatar>
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-foreground">
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
                                                                <Link className="flex items-center gap-1 py-1 hover:bg-secondary/20  rounded-md" href={`/user/${member.userid}`}>
                                                                    <Avatar className="h-4 w-4">
                                                                        {member.profile_path ? (
                                                                            <AvatarImage src={member.profile_path} alt={member.name} />
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
                                    <div className="text-center p-8 border border-dashed border-border rounded-xl">
                                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                                            <UsersIcon className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-lg font-medium text-foreground mb-2">No Teams Yet</h3>
                                        <p className="text-muted-foreground mb-4">This organization hasn't created any teams yet.</p>
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
                <OrganizationActivity organizationId={user._id} />
            </div>

            {/* Render Popups - keep them for now */}
            {showTeamPopup && <TeamMembersPopup />}
        </>
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

    useEffect(() => {
        setIsNavigating(false);
    }, [pathname, searchParams]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!organization) {
                    console.error('organization is missing');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API}/org/one`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ userid: organization })
                });

                if (response.status === 401) {
                    Cookies.remove('accessToken');
                    Cookies.remove('refreshToken');
                    Cookies.remove('UserType');
                    Cookies.remove('UserId');
                    router.push('/');
                    return;
                }

                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error('Error fetching user data:', error);
                if (error.response?.status === 401) {
                    Cookies.remove('accessToken');
                    Cookies.remove('refreshToken');
                    Cookies.remove('UserType');
                    Cookies.remove('UserId');
                    router.push('/');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [organization, router]);

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
                                src={user?.coverImage}
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