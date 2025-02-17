'use client'
import { useParams } from 'next/navigation'
import React from 'react'
import { Calendar, MapPin, Users, Clock, Share2, BookmarkPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Twitter, Dis } from 'lucide-react';
import Events from '../events'
import Moreevents from '@/app/Components/MoreEvents/page'

export default function EventDetailPage() {
  const params = useParams()
  console.log(params.events)

  // Find the event from our events data
  const eventData = Events.find(event => event.id === Number(params.events)) || Events[0];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="border-b bg-white dark:bg-gray-900">
        <div className="container max-w-7xl mx-auto py-8 px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">{eventData.category}</Badge>
            <Badge variant="default" className={eventData.status === "Open" ? "bg-green-600" : "bg-gray-600"}>
              {eventData.status}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">{eventData.title}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {eventData.description}
          </p>
        </div>
      </div>

      {/* Main content container with 70-30 split */}

      <div className="container max-w-7xl mx-auto py-8">
        <div className="flex flex-col lg:flex-row gap-8 px-6 lg:px-8">
          {/* Left content area (70%) */}
          <div className="w-full lg:w-[70%]">
            <div className="rounded-lg p-2 border-1 border-primary">
              <img className='rounded-lg shadow-lg h-96 w-[100%]' src={eventData.image} alt="" />
            </div>
            <Card className="p-6 lg:p-8 shadow-lg">
              {/* Action buttons */}
              <div className="flex gap-4 mb-6">
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <BookmarkPlus className="h-4 w-4" />
                  Save
                </Button>
              </div>

              {/* Event overview section */}
              <div className="space-y-6">
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: eventData.overview }}
                />
              </div>
            </Card>
          </div>

          {/* Right sidebar (30%) */}
          <div className="w-full lg:w-[30%]">
            <div className="lg:sticky lg:top-8">
              <Card className="p-6 shadow-lg border-t-4 border-primary">
                <div className="space-y-6">
                  {/* Date and Time */}
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 mt-1 text-primary" />
                    <div>
                      <h3 className="font-semibold">Date</h3>
                      <p className="text-muted-foreground">
                        {new Date(eventData.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 mt-1 text-primary" />
                    <div>
                      <h3 className="font-semibold">Location</h3>
                      <p className="text-muted-foreground">{eventData.venue}</p>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 mt-1 text-primary" />
                    <div>
                      <h3 className="font-semibold">Participants</h3>
                      <p className="text-muted-foreground">{eventData.participants} registered</p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 mt-1 text-primary" />
                    <div>
                      <h3 className="font-semibold">Duration</h3>
                      <p className="text-muted-foreground">36 hours</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Button className="w-full" size="lg">
                      Apply Now
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                      {eventData.status === "Open" ? "Registration closes in 3 days" : "Registration closed"}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <div className='flex flex-col lg:flex gap-8 px-6 lg:px-8'>
        <div>
          <Moreevents currentEventId={eventData.id} currentCategory={eventData.category} />
        </div>

      </div>
    </div>
  )
}


