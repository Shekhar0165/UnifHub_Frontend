'use client'
import React, { useEffect, useState } from 'react';
import { Calendar, Users, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';
import { authenticatedFetch } from '@/utils/authUtils';

const MoreEvents = ({ currentEventId, currentCategory }) => {
  const router = useRouter();

  const [Loading, setLoading] = useState(true)
  const [events, SetEvents] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_API}/events/all`,
          { method: 'GET' },
          router
        );
        
        SetEvents(data);
      } catch (error) {
        console.error('Error fetching events data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [router]);

  // Filter events to show only those from the same category, excluding current event
  const relatedEvents = events
    ?.filter(event =>
      event?.category === currentCategory &&
      event?._id !== currentEventId
    )
    .slice(0, 3); // Limit to 3 events

  const handleOpenEvent = (name) => {
    router.push(`/events/${name}`);
  };

  if (!relatedEvents || relatedEvents.length === 0) {
    return null;
  }

  return (
    <div className="py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">More Events</h2>
          <Button variant="outline" onClick={() => router.push('/events')}>
            View All Events
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedEvents.map(event => (
            <Card key={event._id} className="group overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={event?.image_path} 
                    alt={event?.title}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge variant="secondary" className="bg-background/95 backdrop-blur-sm">
                      {event?.category}
                    </Badge>
                    <Badge
                      variant={event?.status === "Open" ? "default" : "secondary"}
                      className="bg-background/95 text-primary backdrop-blur-sm"
                    >
                      {event?.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <CardTitle className="text-xl mb-2 line-clamp-1">
                  {event?.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {event?.description}
                </p>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event?.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{event?.participants?.length || 0} participants</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="px-6 pb-6">
                <Button onClick={() => handleOpenEvent(event?.eventName)} className="w-full gap-2">
                  View Event
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoreEvents;