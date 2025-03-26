"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Clock, Users, Edit, Plus, Trophy, Trash2, X, User as UserIcon, ChevronDown, ChevronUp, HelpCircle, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Toaster } from '@/components/ui/toaster'
import EventResultPopup from "./EventResultPopup";
import EventPositionsPopup from "./EventPositionsPopup";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import AddTeamMemberPopup from "./AddTeamMembers";
import ViewTeamPopup from "./ViewTeamPopup";


const EventComponent = ({ user }) => {
    const [events, setEvents] = useState([]);
    const [visibleEvents, setVisibleEvents] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventPopup, setShowEventPopup] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);
    const [showEventResult, setShowEventResult] = useState(false);
    const [userType, setUserType] = useState('');
    const [selectedAddTeamMember, setSelectedAddTeamMember] = useState(null);
    const [showAddTeamMemberPopup, setShowAddTeamMemberPopup] = useState(false);
    const [selectedViewTeam, setSelectedViewTeam] = useState(null);
    const [showViewTeamPopup, setShowViewTeamPopup] = useState(false);
    const eventsPerPage = 3;
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const storedUserType = localStorage.getItem("UserType");
        // Get user type from localStorage
        setUserType(storedUserType);

        const fetchEvents = async () => {
            try {
                setLoading(true);
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API}/events/getevents`,
                    { _id: user?._id },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        },
                    }
                );
                setEvents(response.data);
                setVisibleEvents(response.data.slice(0, eventsPerPage));
            } catch (error) {
                console.error("Error fetching events:", error);
                toast({
                    variant: "destructive",
                    title: "Error Fetching Events",
                    description: error.response?.data?.message || "Failed to fetch events.",
                });
            } finally {
                setLoading(false);
            }
        };

        if (user?._id) {
            fetchEvents();
        }
    }, [user, toast]);


   


    const formatEventDate = (dateString) => {
        try {
            return format(parseISO(dateString), "MMMM d, yyyy");
        } catch (error) {
            return dateString;
        }
    };

    const navigateToCreateEvent = () => {
        router.push(`/organization/${user.userid}/create-event`);
    };

    const navigateToEditEvent = (eventId) => {
        router.push(`/organization/${user.userid}/edit/${eventId}`);
    };

    const loadMoreEvents = () => {
        const nextPage = page + 1;
        const nextEvents = events.slice(0, nextPage * eventsPerPage);
        setVisibleEvents(nextEvents);
        setPage(nextPage);
    };

    const openDeleteConfirmation = (event) => {
        setEventToDelete(event);
        setIsDeleteDialogOpen(true);
    };

    const cancelDelete = () => {
        setEventToDelete(null);
        setIsDeleteDialogOpen(false);
    };

    const closeEventPopup = () => {
        setShowEventPopup(false);
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setShowEventPopup(true);
    };

    const handleAddTeamMemberClick = (event) => {
        setSelectedAddTeamMember(event);
        setShowAddTeamMemberPopup(true);
    };

    const handleViewTeamClick = (event) => {
        setSelectedViewTeam(event);
        setShowViewTeamPopup(true);
    };

    const handleSecondButtonClick = (event) => {
        if(event?.isteamadded){
            handleViewTeamClick(event)
        }else{
            handleAddTeamMemberClick(event)
        }
        FetchEventTeamsMembers(event._id)
        window.location.reload()
    };

    const closeResultPopup = () => {
        setShowEventResult(false);
        setSelectedResult(null);
    };

    const handleResultClick = (event) => {
        setSelectedResult(event);
        setShowEventResult(true);
    };

    const confirmDelete = async () => {
        if (!eventToDelete) return;

        try {
            setLoading(true);

            const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_API}/events/delete/${eventToDelete._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

            if (response.status === 200) {
                toast({
                    title: "Event Deleted",
                    description: "The event has been successfully removed.",
                });
                setEvents(response.data); // Update state with new event list
                setVisibleEvents(response.data.slice(0, eventsPerPage * page));
            } else {
                throw new Error("Unexpected response status");
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            toast({
                variant: "destructive",
                title: "Failed to Delete Event",
                description: error.response?.data?.message || "An unexpected error occurred.",
            });
        } finally {
            setLoading(false);
            setIsDeleteDialogOpen(false);
            setEventToDelete(null);
        }
    };


    return (
        <>
            <Toaster />
            <div className="w-full max-w-4xl mx-auto my-4 px-4 sm:px-6 md:px-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold">Your Events</h2>
                    {userType === 'Organization' && (
                        <Button
                            onClick={navigateToCreateEvent}
                            className="flex items-center gap-2 w-full sm:w-auto"
                        >
                            <Plus size={16} />
                            Create Event
                        </Button>
                    )}
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : events.length === 0 ? (
                    <Card className="mb-4 p-6 text-center border border-border/40 bg-background">
                        <p className="text-muted-foreground mb-4">You haven't created any events yet.</p>
                        {userType === 'Organization' && (
                            <Button onClick={navigateToCreateEvent} className="mx-auto">
                                Create Your First Event
                            </Button>
                        )}
                    </Card>
                ) : (
                    <>
                        <div className="grid gap-6">
                            {visibleEvents.map((event) => (
                                <Card key={event._id} className="overflow-hidden bg-background border border-border/40 shadow-sm hover:shadow-md transition-all">
                                    <CardHeader className="pb-3 border-b border-border">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-xl font-medium text-foreground">{event.eventName}</CardTitle>
                                            {userType === 'Organization' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigateToEditEvent(event._id)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="py-4 space-y-4">
                                        <div>
                                            <p className="line-clamp-2 text-foreground">{event.description}</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {event.eventDate && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar size={16} />
                                                    <span>{formatEventDate(event.eventDate)}</span>
                                                </div>
                                            )}

                                            {event.location && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <MapPin size={16} />
                                                    <span className="truncate">{event.location}</span>
                                                </div>
                                            )}

                                            {event.duration && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock size={16} />
                                                    <span>{event.duration}</span>
                                                </div>
                                            )}

                                            {event.attendees && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Users size={16} />
                                                    <span>{event.attendees} Attendees</span>
                                                </div>
                                            )}
                                        </div>

                                        {event.tags && event.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {event.tags.map((tag, index) => (
                                                    <Badge key={index} variant="secondary">{tag}</Badge>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Users size={16} />
                                                    <span>{event?.totalparticipants} Participants</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Users size={16} />
                                                    <span>{event?.totalteams} Teams</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2">

                                                <Button
                                                    onClick={() => handleEventClick(event)}
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex items-center gap-1 w-full sm:w-auto bg-blue-50/20 hover:bg-blue-50/40 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 border border-border"
                                                >
                                                    <Trophy size={16} className="text-amber-500" />
                                                    Show Positions
                                                </Button>

                                                 {userType === 'Organization' && (<Button
                                                    onClick={() => handleSecondButtonClick(event)}
                                                    size="sm"
                                                    variant="default"
                                                    className="flex items-center gap-1 w-full sm:w-auto"
                                                    disabled={userType !== 'Organization'}
                                                >
                                                   {event?.isteamadded ? <Eye size={16} /> : <Plus size={16} /> }
                                                    {event?.isteamadded ? "View Team" : "Add Team Member"}
                                                </Button> )}

                                                 {<Button
                                                    onClick={() => handleSecondButtonClick(event)}
                                                    size="sm"
                                                    variant="default"
                                                    className={`flex items-center gap-1 w-full sm:w-auto ${event?.isteamadded ? '' : 'hidden'} ${userType === 'Organization' ? 'hidden' : ''}`}
                                                >
                                                   {event?.isteamadded ? <Eye size={16} /> : ''}
                                                    {event?.isteamadded ? "View Team" : ""}
                                                </Button> }



                                                {userType === 'Organization' && (
                                                    <Button
                                                        onClick={() => handleResultClick(event)}
                                                        size="sm"
                                                        variant="default"
                                                        className="flex items-center gap-1 w-full sm:w-auto"
                                                    >
                                                        Declare Results
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="pt-3 pb-4 flex flex-col sm:flex-row justify-between border-t border-border gap-4">
                                        <div className="flex items-center">
                                            <Avatar className="h-6 w-6 mr-2">
                                                <AvatarImage src={user?.profileImage} />
                                                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm text-muted-foreground">
                                                Organized by <span className="font-medium">{user?.name || "you"}</span>
                                            </span>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            {userType === 'Organization' && (
                                                <Button
                                                    onClick={() => openDeleteConfirmation(event)}
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-300 dark:border-red-800/40 text-red-600 dark:text-red-400 hover:bg-red-50/30 dark:hover:bg-red-900/20 hover:text-red-700"
                                                >
                                                    <Trash2 size={14} className="mr-1" />
                                                    Delete
                                                </Button>
                                            )}
                                            <Button
                                                onClick={() => router.push(`/events/${event.eventName}`)}
                                                variant="outline"
                                                size="sm"
                                                className="ml-auto sm:ml-0 border border-border hover:bg-secondary/20"
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        {visibleEvents.length < events.length && (
                            <div className="mt-6 mb-2 text-center">
                                <Button variant="outline" onClick={loadMoreEvents} className="mx-auto border border-border hover:bg-secondary/20">
                                    Show More Events
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to delete this event?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the event
                                "{eventToDelete?.eventName}".
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            {showEventPopup && <EventPositionsPopup
                selectedEvent={selectedEvent}
                closeEventPopup={closeEventPopup}
                events={events}
                isOpen={showEventPopup} // Add this prop
            />}
            {showEventResult && <EventResultPopup selectedResult={selectedResult} closeResultPopup={closeResultPopup} />}
            {showAddTeamMemberPopup && <AddTeamMemberPopup
                selectedAddTeamMember={selectedAddTeamMember}
                closeAddTeamMemberPopup={() => setShowAddTeamMemberPopup(false)}
                isOpen={showAddTeamMemberPopup} // Add this prop
                organizationId={user?._id}
            />}
            {showViewTeamPopup && <ViewTeamPopup selectedViewTeam={selectedViewTeam} closeViewTeamPopup={() => setShowViewTeamPopup(false)} isOpen={showViewTeamPopup} user={user} />}

        </>
    );
};

export default EventComponent;