'use client'
import React, { useState } from 'react';
import { Calendar, Users, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import events from './events';
import { useRouter } from 'next/navigation';

const EventsPage = () => {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");

  // Helper function to determine if an event is upcoming, ongoing, or past
  const getEventStatus = (eventDate) => {
    const now = new Date();
    const eventDateTime = new Date(eventDate);
    
    // Assuming events last for 24 hours
    const eventEndDateTime = new Date(eventDateTime);
    eventEndDateTime.setHours(eventEndDateTime.getHours() + 24);

    if (eventDateTime > now) {
      return "upcoming";
    } else if (eventDateTime <= now && now <= eventEndDateTime) {
      return "ongoing";
    } else {
      return "past";
    }
  };

  // Filter events based on both search query and timeframe
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const eventTimeframe = getEventStatus(event.date);
    const matchesTimeframe = timeframe === eventTimeframe;

    return matchesSearch && matchesTimeframe;
  });

  const HandleOpenEvent = (id) => {
    router.push(`/events/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="relative border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Events</h1>
          <p className="text-muted-foreground">
            Discover and participate in exciting events
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Tabs value={timeframe} className="w-full sm:w-auto" onValueChange={setTimeframe}>
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="w-full sm:w-72">
              <Input
                type="search"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <Card key={event.id} className="group overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Badge variant="secondary" className="bg-background/95 backdrop-blur-sm">
                        {event.category}
                      </Badge>
                      <Badge 
                        variant={event.status === "Open" ? "default" : "secondary"}
                        className="bg-background/95 text-primary backdrop-blur-sm"
                      >
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <CardTitle className="text-xl mb-2 line-clamp-1">
                    {event.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{event.participants} participants</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="px-6 pb-6">
                  <Button onClick={() => HandleOpenEvent(event.id)} className="w-full gap-2">
                    View Event
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No events found for the selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;