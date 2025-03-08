'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
    User, Award, FileText, Calendar, Download, Share2, MapPin,
    Briefcase, GraduationCap, Mail, Phone, Star, Activity,
    BarChart2, Github, Linkedin, Twitter, Clock, ChevronRight, X,BriefcaseIcon,ChevronDown
} from 'lucide-react'
import { useRouter } from 'next/navigation';
import Header from '@/app/Components/Header/Header'
import { Chart } from "react-google-charts";
import EventComponent from '@/app/Components/Organization/CreatePost'
import LoadingSpinner from '@/components/ui/LoadingSpinner';



// Helper function to get activity level color
const getActivityColor = (count) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-700';
    if (count < 3) return 'bg-blue-200 dark:bg-blue-900/30';
    if (count < 5) return 'bg-blue-400 dark:bg-blue-800';
    return 'bg-blue-600 dark:bg-blue-600';
};



const LeftComponent = ({user}) => {
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

const RightComponent = ({user}) => {
    const [activeTab, setActiveTab] = useState('achievements');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showTeamPopup, setShowTeamPopup] = useState(false);
    const [showEventsCreatePopup, setShowEventsCreatePopup] = useState(false);
    const [showEventPopup, setShowEventPopup] = useState(false);
    const router = useRouter();

    const handleTeamClick = (team) => {
        setSelectedTeam(team);
        setShowTeamPopup(true);
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setShowEventPopup(true);
    };

    const closeTeamPopup = () => {
        setShowTeamPopup(false);
        setSelectedTeam(null);
    };

    const closeEventPopup = () => {
        setShowEventPopup(false);
        setSelectedEvent(null);
    };

    const HandleCreateEvents = ()=>{
        router.push(`/organization/${user.userid}/create-event`)
    }

    

    // Team Members Popup
    const TeamMembersPopup = () => {
        if (!selectedTeam) return null;

        return (
            <div className="fixed inset-0 transition-all duration-700  bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[80vh] overflow-auto shadow-xl">
                    <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{selectedTeam.name} Team Members</h3>
                        <button onClick={closeTeamPopup} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-4">
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-white">Team Lead</h4>
                            <p className="text-blue-600 dark:text-blue-400">{selectedTeam?.head}</p>
                        </div>

                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Team Members</h4>
                        <ul className="space-y-3">
                            {selectedTeam?.members?.map((member, index) => {
                                const [name, role] = Object.entries(member)[0];
                                
                                return (
                                    <li key={index} className="p-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
                                                {name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-3 flex-grow">
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{name}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{role}</p>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={closeTeamPopup}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Event Positions Popup
    const EventPositionsPopup = () => {
        if (!selectedEvent) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl w-[70%] max-h-[70vh] overflow-auto shadow-xl">
                    <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{selectedEvent?.title} - Positions</h3>
                        <button onClick={closeEventPopup} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-4">
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm text-gray-500 dark:text-gray-400">{selectedEvent?.date}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">Total Participants: {selectedEvent?.participants}</p>
                        </div>

                        {/* Team Section (if needed) */}
                        {selectedEvent?.team && selectedEvent?.team.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <BriefcaseIcon className="h-5 w-5 text-indigo-500" />
                                    Event Team
                                </h4>
                                <div className="space-y-2">
                                    {selectedEvent?.team.map((member, index) => {
                                        const [name, role] = Object.entries(member)[0];
                                        return (
                                            <div key={index} className="flex justify-between items-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                                                <span className="font-medium text-gray-800 dark:text-gray-200">{name}</span>
                                                <span className="text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 px-2 py-1 rounded">{role}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <h4 className="font-medium mt-4 text-gray-900 dark:text-white mb-2">Top Positions</h4>

                        <div className="space-y-3">
                            {selectedEvent?.position?.slice(0, 3).map((person, index) => (
                                <div key={index} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <div className={`p-2 rounded-full mr-3 ${index === 0 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            index === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' :
                                                'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                        }`}>
                                        <span className="font-bold">{index + 1}</span>
                                    </div>
                                    <span className="text-gray-700 dark:text-gray-300">{person}</span>
                                </div>
                            ))}
                        </div>


                        <h4 className="font-medium text-gray-900 dark:text-white my-4">Other Participants</h4>

                        <div className="grid grid-cols-2 gap-2">
                            {selectedEvent?.position?.slice(3).map((person, index) => (
                                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                    {index + 4}. {person}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={closeEventPopup}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const EventsList = () => {
        const [visibleEvents, setVisibleEvents] = useState(3);
        const [isLoading, setIsLoading] = useState(false);
        
        // Function to handle showing more events
        const handleShowMore = () => {
            setIsLoading(true);
            
            // Simulate loading with a slight delay for better UX
            setTimeout(() => {
                setVisibleEvents(prev => Math.min(prev + 3, user.events.length));
                setIsLoading(false);
            }, 300);
        };
    
        // Get medal icon and color based on position
        const getMedalInfo = (position) => {
            if (position === 0) return { icon: <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />, bg: "bg-yellow-100 dark:bg-yellow-900/30" };
            if (position === 1) return { icon: <Award className="h-6 w-6 text-gray-600 dark:text-gray-400" />, bg: "bg-gray-100 dark:bg-gray-700/50" };
            if (position === 2) return { icon: <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />, bg: "bg-amber-100 dark:bg-amber-900/30" };
            return { icon: <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />, bg: "bg-blue-100 dark:bg-blue-900/30" };
        };
    
        return (
            <div className="space-y-2">
                <div className="space-y-3">
                    {user?.events?.slice(0, visibleEvents).map((event, index) => {
                        const { icon, bg } = getMedalInfo(index);
                        
                        return (
                            <div 
                                onClick={() => handleEventClick(event)} 
                                key={index} 
                                className="cursor-pointer flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 group transform transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md"
                                style={{
                                    animation: `fadeSlideIn 0.5s ease-out ${index * 0.1}s both`
                                }}
                            >
                                <div className={`flex-shrink-0 p-3 ${bg} rounded-full group-hover:scale-110 transition-transform`}>
                                    {icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        {event.title}
                                    </p>
                                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                        1st {event.position[0]}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {event.date}
                                    </p>
                                </div>
                                <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {visibleEvents < user?.events?.length && (
                    <div className="py-4 flex justify-center">
                        <button 
                            onClick={handleShowMore}
                            disabled={isLoading}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium rounded-lg transition-colors group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        >
                            {isLoading ? (
                                <LoadingSpinner/>
                            ) : (
                                <>
                                    <span>Show More</span>
                                    <ChevronDown className="h-5 w-5 group-hover:translate-y-1 transition-transform duration-300" />
                                </>
                            )}
                        </button>
                    </div>
                )}
                
                {visibleEvents >= user?.events?.length && user?.events?.length > 3 && (
                    <div className="py-3 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No more events to show
                        </p>
                    </div>
                )}
    
                <style jsx>{`
                    @keyframes fadeSlideIn {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>
            </div>
        );
    };
    
    return (
        <>
            <div className="w-full lg:w-2/3">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('achievements')}
                            className={`flex-1 transition-all duration-500 py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'achievements'
                                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-center">
                                <Award className="h-5 w-5 mr-2" />
                                Achievements
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`flex-1 transition-all duration-500 py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'events'
                                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-center">
                                <FileText className="h-5 w-5 mr-2" />
                                Events
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('team')}
                            className={`flex-1 py-4 px-6 text-center border-b-2 font-medium transition-all duration-500 text-sm ${activeTab === 'team'
                                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-center">
                                <Star className="h-5 w-5 mr-2" />
                                Team
                            </div>
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'achievements' && (
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Latest Achievements</h2>
                                <div className="space-y-6">
                                    <EventsList/>
                                </div>
                            </div>
                        )}

                        {activeTab === 'events' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Events</h2>
                                    <button onClick={HandleCreateEvents} className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 dark:bg-transparent dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors">
                                        <Download className="h-4 w-4 mr-2" />
                                        Create New Events
                                    </button>
                                </div>

                                {/* Education Section */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                        <GraduationCap className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                                        Education
                                    </h3>

                                    {user?.education?.map((edu, index) => (
                                        <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <h4 className="text-md font-medium text-gray-900 dark:text-white">{edu.degree}</h4>
                                            <p className="text-blue-600 dark:text-blue-400">{edu.institution}</p>
                                            <div className="flex justify-between mt-2">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">{edu.duration}</span>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">GPA: {edu.gpa}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Experience Section */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                        <Briefcase className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                                        Work Experience
                                    </h3>

                                    {user?.experience?.map((exp, index) => (
                                        <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <h4 className="text-md font-medium text-gray-900 dark:text-white">{exp.role}</h4>
                                            <p className="text-blue-600 dark:text-blue-400">{exp.company}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{exp.duration}</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{exp.description}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Upcoming Events Section */}
                                {/* <div className="mt-8">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                        <FileText className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                                        Upcoming Events
                                    </h3>

                                    {user?.upcomingEvents && user?.upcomingEvents?.map((event, index) => (
                                        <div key={index} className="mb-4 p-4 border border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                                            <h4 className="text-md font-medium text-gray-900 dark:text-white">{event.title}</h4>
                                            <p className="text-blue-600 dark:text-blue-400">{event.organizer}</p>
                                            <div className="flex justify-between mt-2">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">{event.date}</span>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{event.location}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div> */}
                            </div>
                        )}

                        {activeTab === 'team' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Team</h2>
                                    <button className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 dark:bg-transparent dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download All
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {user?.teams?.map((team, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleTeamClick(team)}
                                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                                        >
                                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                                                <h3 className="font-medium text-gray-900 dark:text-white truncate">{team.name}</h3>
                                            </div>

                                            <div className="p-4">
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                                    <span className="font-medium">Head:</span> {team.head}
                                                </p>
                                                <div className="flex items-center justify-between mt-4">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Members: {team.members.length}</span>
                                                    <button
                                                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                    >
                                                        View details <ChevronRight className="h-4 w-4 ml-1" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* <AddEvetns/> */}
                {/* Activity Section */}
                <EventComponent user={user}/>
                <UserActivity user={user}/>
            </div>

            {/* Render Popups */}
            {showTeamPopup && <TeamMembersPopup />}
            {showEventPopup && <EventPositionsPopup />}
        </>
    );
};


// const AddEvetns =()=>{
//     return (
//         <>
//             <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6 p-6'></div>
//         </>
//     )
// }

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
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    
    useEffect(() => {
        const fetchUserData = async () => {
          try {
            // Check if user is authenticated (has token)
            const accessToken = localStorage.getItem('accessToken');
    
            if (!accessToken) {
              setLoading(false);
              return; // User is not authenticated
            }
    
            const response = await fetch(`${process.env.NEXT_PUBLIC_API}/org`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
              credentials: 'include',
            });
    
            if (response.ok) {
              const data = await response.json();
              setUser(data);
            } else {
              console.error('Failed to fetch user data');
              // Handle authentication error (e.g., token expired)
              if (response.status === 401) {
                // Clear tokens and redirect to login
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                router.push('/');
              }
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchUserData();
      }, [router]);


    return (
        <>
        <Header/>
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
                            <LeftComponent user={user}/>

                            {/* Right Column - Content Area */}
                            <RightComponent user={user}/>
                        </div>
                    </div>
                </>
            ) : loading ? (
                <LoadingSpinner/>
            ) : (
                <div className="flex justify-center items-center h-60">
                    <p>Please log in to view this profile</p>
                </div>
            )}
        </div>
        </>
    )
}