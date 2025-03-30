import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Users, User, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const ViewTeamPopup = ({ 
  isOpen, 
  closeViewTeamPopup, 
  user, 
  selectedViewTeam 
}) => {
  const [EventMember, setEventMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API;

  // Fetch team data when the popup is opened
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!isOpen || !selectedViewTeam) return;
      
      setLoading(true);
      try {
        const response = await axios.post(
          `${apiUrl}/events/teams/get/${user?._id}`,
          { eventId: selectedViewTeam._id },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true
          }
        );

        if (response.data && response.data.eventDetails) {
          setEventMember({ eventDetails: response.data.eventDetails });
        } else {
          throw new Error("Failed to fetch team data");
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
        if (error.response?.status === 401) {
          Cookies.remove('user');
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          router.push('/');
        }
        toast({
          title: "Error",
          description: error.message || "Failed to load team data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [isOpen, selectedViewTeam, user, apiUrl, toast, router]);

  // Utility function to get initials from a name
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get event details and teams
  const eventDetails = EventMember?.eventDetails;
  const teams = eventDetails?.teams || [];

  return (
    <Dialog open={isOpen} onOpenChange={closeViewTeamPopup}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="relative bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              {eventDetails?.eventName || "Event Teams"} 
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <LoadingSpinner/>
          ) : !eventDetails ? (
            <div className="text-center py-12 text-muted-foreground">
              No team data available for this event.
            </div>
          ) : (
            <>
              {/* Event Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className='cursor-pointer hover:bg-white/5'>
                    <Link href={`/user/${eventDetails.eventHead?.userid}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Event Head</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={eventDetails.eventHead?.profilePath} 
                        alt={eventDetails.eventHead?.name} 
                      />
                      <AvatarFallback>
                        {getInitials(eventDetails.eventHead?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{eventDetails.eventHead?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {eventDetails.eventHead?.role}
                      </p>
                    </div>
                  </CardContent>
                  </Link>
                </Card>
                
                <Card className='cursor-pointer hover:bg-white/5'>
                <Link href={`/user/${eventDetails.eventViceHead?.userid}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Event Vice Head</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={eventDetails.eventViceHead?.profilePath} 
                        alt={eventDetails.eventViceHead?.name} 
                      />
                      <AvatarFallback>
                        {getInitials(eventDetails.eventViceHead?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{eventDetails.eventViceHead?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {eventDetails.eventViceHead?.role}
                      </p>
                    </div>
                  </CardContent>
                  </Link>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Event Name</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-medium">
                      {(eventDetails.eventName.charAt(0).toUpperCase() + eventDetails.eventName.slice(1)).slice(0, 20)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Teams Section */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Event Teams</h3>
                
                {teams.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No teams found for this event.
                  </div>
                ) : (
                  <Accordion type="multiple" className="space-y-3">
                    {teams.map((team) => (
                      <AccordionItem 
                        key={team.teamId} 
                        value={team.teamId}
                        className="border rounded-lg overflow-hidden bg-card shadow-sm"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              <Users className="h-4 w-4" />
                            </div>
                            <div className="flex-1 text-left">
                              <span className="font-medium">
                                {team.teamName.charAt(0).toUpperCase() + team.teamName.slice(1)}
                              </span>
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({team.members?.length || 0} members)
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 py-3 border-t bg-background/50">
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                Team Name: {team.teamName.charAt(0).toUpperCase() + team.teamName.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="space-y-3">
                              <h4 className="text-sm font-medium text-muted-foreground">Team Members</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {team.members && team.members.length > 0 ? (
                                  team.members.map((member) => (
                                    <Link href={`/user/${member.userid}`} key={member._id} className="flex cursor-pointer hover:bg-white/5 items-center gap-3 p-2 rounded-md border bg-card">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={member.profilePath} alt={member.name} />
                                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{member.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                                      </div>
                                      <Badge variant="outline" className="text-xs">
                                        {member.role}
                                      </Badge>
                                    </Link>
                                  ))
                                ) : (
                                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                                    <p className="text-sm text-muted-foreground">No members in this team</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTeamPopup;