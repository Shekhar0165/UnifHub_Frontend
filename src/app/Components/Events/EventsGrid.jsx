'use client';
import React from 'react';
import { Calendar, Users, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const EventCard = ({ event, onClick }) => {
  return (
    <Card className="group bg-background border border-border/40 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={event?.image_path} 
            alt={event?.eventName || "Event image"}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute top-3 right-3 flex gap-2 flex-wrap justify-end">
            <Badge variant="secondary" className="bg-background/95 backdrop-blur-md px-3 py-1 text-xs rounded-full">
              {event?.category}
            </Badge>
            <Badge 
              variant={event.status === "Open" ? "default" : "secondary"}
              className="bg-background/95 backdrop-blur-md hover:bg-background/70 text-primary px-3 py-1 text-xs rounded-full"
            >
              {event?.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 space-y-3">
        <CardTitle className="text-lg font-bold line-clamp-1">
          {event.eventName}
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary" />
            {/* <span>{event?.participants}</span> */}
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-5 pb-5 pt-0">
        <Button 
          onClick={onClick}
          className="w-full gap-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm h-9"
        >
          View Details
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

const EventsGrid = ({ events, router }) => {
  const handleOpenEvent = (eventName) => {
    router.push(`/events/${eventName}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard 
          key={event.id || event.eventName} 
          event={event} 
          onClick={() => handleOpenEvent(event.eventName)}
        />
      ))}
    </div>
  );
};

export default EventsGrid;