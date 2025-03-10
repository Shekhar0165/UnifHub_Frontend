import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Trophy, 
  Medal, 
  Award,
  Users, 
  Calendar, 
  ChevronDown, 
  Info
} from "lucide-react";

const EventPositionsPopup = ({ selectedEvent, closeEventPopup, isOpen }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!selectedEvent?._id) return;
      
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API}/Participants/for-events/${selectedEvent._id}`, 
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch participants");
        }
        
        const data = await response.json();
        setParticipants(data.participants || []);
      } catch (error) {
        console.error("Error fetching participants:", error);
        toast({
          title: "Error",
          description: "Failed to load participants. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen && selectedEvent?._id) {
      fetchParticipants();
    }
  }, [selectedEvent?._id, isOpen, toast]);

  if (!selectedEvent) return null;

  // Sort teams by position (null or 0 positions at the end)
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.position && b.position) return a.position - b.position;
    if (a.position && !b.position) return -1;
    if (!a.position && b.position) return 1;
    return 0;
  });

  const topTeams = sortedParticipants.filter(team => [1, 2, 3].includes(team.position));
  const otherTeams = sortedParticipants.filter(team => team.position && ![1, 2, 3].includes(team.position));
  const unrankedTeams = sortedParticipants.filter(team => team.position === 0);

  const getMedalIcon = (position) => {
    switch (position) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return null;
    }
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 1: return "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800/30";
      case 2: return "bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600";
      case 3: return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/30";
      default: return "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeEventPopup}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {selectedEvent?.eventName} Results
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Event Date</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">{selectedEvent?.eventDate.split("T")[0]}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Teams</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <p className="text-lg font-medium">{participants?.length || 0}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">{selectedEvent?.totalteams || 0}</p>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Podium display for top 3 */}
              {topTeams.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Podium Finishers
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(position => {
                      const team = topTeams.find(team => team.position === position);
                      if (!team) return (
                        <Card key={position} className="opacity-50">
                          <CardHeader className={`${getPositionColor(position)} border-b`}>
                            <CardTitle className="text-center flex justify-center items-center gap-2">
                              {getMedalIcon(position)}
                              Position {position}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6 text-center text-muted-foreground">
                            No team
                          </CardContent>
                        </Card>
                      );

                      return (
                        <Card key={team._id} className="overflow-hidden">
                          <CardHeader className={`${getPositionColor(position)} border-b`}>
                            <CardTitle className="flex justify-center items-center gap-2">
                              {getMedalIcon(position)}
                              Position {position}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <h4 className="text-lg font-semibold text-center mb-2">{team.teamName}</h4>
                            <div className="flex justify-center mb-3">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {team.participant_id.length} members
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              {team.participant_id.slice(0, 2).map((member, idx) => (
                                <div key={idx} className="flex items-center gap-2 border p-2 rounded-md hover:bg-white/5 cursor-pointer">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className={position === 1 ? "bg-yellow-100 text-yellow-800" : 
                                                      position === 2 ? "bg-gray-100 text-gray-800" : 
                                                      "bg-amber-100 text-amber-800"}>
                                      {member.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">{member.name}</p>
                                    <p className="text-xs text-muted-foreground">@{member.userid}</p>
                                  </div>
                                  {idx === 0 && (
                                    <Badge variant="outline" className="ml-auto text-xs">
                                      Leader
                                    </Badge>
                                  )}
                                </div>
                              ))}
                              {team.participant_id.length > 2 && (
                                <Button variant="ghost" size="sm" className="w-full text-xs mt-1">
                                  +{team.participant_id.length - 2} more
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Other ranked teams */}
              {otherTeams.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Other Ranked Teams</h3>
                  <Accordion type="multiple" className="space-y-2">
                    {otherTeams.map((team) => (
                      <AccordionItem key={team._id} value={team._id} className="border rounded-lg overflow-hidden">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
                              {team.position}
                            </div>
                            <div className="flex-1 text-left">
                              <span className="font-medium">{team.teamName}</span>
                              <span className="ml-2 text-xs text-muted-foreground">({team.participant_id.length} members)</span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {team.participant_id.map((member, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-2 border cursor-pointer hover:bg-muted/50 rounded-md">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                    {member.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center">
                                    <p className="text-sm font-medium">{member.name}</p>
                                    {idx === 0 && (
                                      <Badge variant="outline" className="ml-2 text-xs">Leader</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">@{member.userid}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}

              {/* Unranked teams */}
              {unrankedTeams.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Unranked Teams</h3>
                  <Accordion type="multiple" className="space-y-2">
                    {unrankedTeams.map((team) => (
                      <AccordionItem key={team._id} value={team._id} className="border rounded-lg overflow-hidden">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 font-medium">
                              -
                            </div>
                            <div className="flex-1 text-left">
                              <span className="font-medium">{team.teamName}</span>
                              <span className="ml-2 text-xs text-muted-foreground">({team.participant_id.length} members)</span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {team.participant_id.map((member, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-2 hover:bg-muted/50 border cursor-pointer rounded-md">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                    {member.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center">
                                    <p className="text-sm font-medium">{member.name}</p>
                                    {idx === 0 && (
                                      <Badge variant="outline" className="ml-2 text-xs">Leader</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">@{member.userid}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}

              {/* No participants message */}
              {participants.length === 0 && (
                <Card className="border-dashed border-2">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Info className="h-12 w-12 text-muted-foreground mb-4" />
                    <CardTitle className="text-lg mb-2">No Participants Yet</CardTitle>
                    <CardDescription className="text-center max-w-md">
                      There are no teams registered for this event yet. Check back later or encourage participants to sign up.
                    </CardDescription>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={closeEventPopup} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventPositionsPopup;