"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Clock, Users, Edit, Plus } from "lucide-react";
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

const EventComponent = ({ user }) => {
    const [events, setEvents] = useState([]);
    const [visibleEvents, setVisibleEvents] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const eventsPerPage = 3;
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
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
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Events</h2>
                <Button onClick={navigateToCreateEvent} className="flex items-center gap-2">
                    <Plus size={16} />
                    Create Event
                </Button>
            </div>

            {loading ? (
                <LoadingSpinner/>
            ) : events.length === 0 ? (
                <Card className="mb-4 p-6 text-center">
                    <p className="text-gray-500 mb-4">You haven't created any events yet.</p>
                    <Button onClick={navigateToCreateEvent} className="mx-auto">
                        Create Your First Event
                    </Button>
                </Card>
            ) : (
                <>
                    <div className="grid gap-6">
                        {visibleEvents.map((event) => (
                            <Card key={event._id} className="overflow-hidden">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl">{event.eventName}</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigateToEditEvent(event._id)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <Edit size={16} />
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent className="pb-4">
                                    <div className="mb-4">
                                        <p className="text-gray-600 line-clamp-2">{event.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        {event.eventDate && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar size={16} />
                                                <span>{formatEventDate(event.eventDate)}</span>
                                            </div>
                                        )}

                                        {event.location && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin size={16} />
                                                <span>{event.location}</span>
                                            </div>
                                        )}

                                        {event.duration && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Clock size={16} />
                                                <span>{event.duration}</span>
                                            </div>
                                        )}

                                        {event.attendees && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Users size={16} />
                                                <span>{event.attendees} Attendees</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {event.tags &&
                                            event.tags.map((tag, index) => (
                                                <Badge key={index} variant="outline" className="bg-gray-100">
                                                    {tag}
                                                </Badge>
                                            ))}
                                    </div>
                                </CardContent>

                                <CardFooter className="pb-4 flex justify-between border-t border-gray-100 pt-4">
                                    <div className="flex items-center">
                                        <Avatar className="h-6 w-6 mr-2">
                                            <AvatarImage src={user?.profileImage} />
                                            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm text-gray-600">Organized by {user?.name || "you"}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => openDeleteConfirmation(event)}
                                            variant="destructive"
                                            size="sm"
                                        >
                                            Delete
                                        </Button>
                                        <Button onClick={() => router.push(`/events/${event.eventName}`)} variant="outline" size="sm">
                                            View Details
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {visibleEvents.length < events.length && (
                        <div className="mt-6 text-center">
                            <Button variant="outline" onClick={loadMoreEvents} className="mx-auto">
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
        </>
    );
};

export default EventComponent;