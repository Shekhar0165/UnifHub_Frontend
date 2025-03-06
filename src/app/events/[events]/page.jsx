'use client'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Calendar, MapPin, Users, Clock, Share2, BookmarkPlus, Search, UserPlus, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import MoreEvents from '@/app/Components/MoreEvents/page'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import axios from 'axios'
import Header from '@/app/Components/Header/Header'
import Footer from '@/app/Components/Footer/Footer'

const ApplyEvent = ({ ApplyForEvent, closePopup, eventData }) => {
  // State management
  const [invited, setInvited] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [teamNameCheck, setTeamNameCheck] = useState({ result: undefined, checkedName: "" });
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API;

  // Toast notification handler for consistent notifications
  const showToast = (type, title, description = "") => {
    toast({
      variant: type === "success" ? "default" : "destructive",
      title,
      description
    });
  };

  // Fetch current user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/user`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          
          // Process user data
          const user = typeof userData === 'string' ? JSON.parse(userData) : userData;
          setCurrentUser(user);
          
          // Add current user to invited list automatically
          if (user._id) {
            setInvited([user._id]);
          }
        } else {
          showToast("error", "Authentication Error", "Failed to fetch user data");
          
          // Handle authentication error
          if (response.status === 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            router.push('/');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        showToast("error", "Error", "Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [apiUrl, router]);

  // Search for members
  const searchMembers = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setIsLoading(true);

    try {
      const authToken = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${apiUrl}/user/members/search?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const data = response.data;

      if (data.success) {
        setSearchResults(data.members);
      } else {
        showToast("error", "Search Error", data.message || "Failed to search members");
      }
    } catch (error) {
      showToast("error", "Search Error", error.message || "Error searching members");
    } finally {
      setIsLoading(false);
    }
  };

  // Team name availability check
  const checkTeamAvailability = async () => {
    if (!teamName.trim()) {
      showToast("error", "Please enter a team name");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${apiUrl}/Participants/check-team`,
        {
          eventid: eventData._id,
          teamName: teamName,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = response.data;
      
      setTeamNameCheck({
        result: data.result,
        checkedName: teamName
      });

      if (data.result) {
        showToast("success", "✅ Team name is available!");
      } else {
        showToast("error", "❌ Team name is taken!");
      }
    } catch (error) {
      showToast("error", "Error", "Failed to check team name availability");
    } finally {
      setLoading(false);
    }
  };

  // Handle member invitation
  const handleInvite = (member) => {
    if (!invited.includes(member._id)) {
      const newInvited = [...invited, member._id];
      
      // Check team size constraints
      if (eventData?.maxTeamMembers && newInvited.length > eventData.maxTeamMembers) {
        showToast("error", "Team size limit reached", `Maximum team size is ${eventData.maxTeamMembers}`);
        return;
      }
      
      setInvited(newInvited);
    }
  };

  // Handle member removal
  const handleRemoveMember = (memberId) => {
    // Don't allow removing the current user (admin)
    if (currentUser && memberId === currentUser._id) return;
    setInvited(invited.filter(id => id !== memberId));
  };

  // Form submission handler
  const handleSubmit = async () => {
    // Validation checks
    if (teamName !== teamNameCheck.checkedName || !teamNameCheck.result) {
      showToast("error", "Team name not verified", "Please check team name availability first");
      return;
    }

    if (invited.length < (eventData?.minTeamMembers || 1)) {
      showToast("error", "Not enough team members", `Minimum team size is ${eventData?.minTeamMembers || 1}`);
      return;
    }

    setIsLoading(true);

    try {
      const authToken = localStorage.getItem('accessToken');
      const applicationData = {
        eventid: eventData._id,
        teamName: teamName,
        participant_id: invited
      };

      const response = await axios.post(
        `${apiUrl}/participants/register`,
        applicationData,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const data = response.data;

      if (response.ok) {
        showToast("success", "Success", "Application submitted successfully!");
        closePopup();
      } else {
        showToast("error", "Submission Error", data.message || "Failed to submit application");
      }
      // window.location.reload();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
      showToast("error", "Submission Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Event handlers
  const handleSearch = (e) => setSearchQuery(e.target.value);
  
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchMembers();
    }
  };

  // Return null if not showing
  if (!ApplyForEvent) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg max-w-md w-full ">
        <h2 className="text-xl font-bold mb-4">Apply for Event</h2>

        {!showSearch ? (
          // Initial screen - Team setup
          <div className="space-y-4">
            <p>You'll be applying as the team admin. Click below to search for additional team members to invite to this event.</p>

            {currentUser && (
              <div className="p-3 bg-primary/10 rounded-md">
                <p className="font-medium">Team Leader:</p>
                <div className="flex items-center mt-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-2">
                    {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span>{currentUser.name || 'Current User'}</span>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Team size: {eventData?.minTeamMembers || 1} - {eventData?.maxTeamMembers || 1} members
            </p>
            
            <div className="flex flex-col space-y-4 p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Create New Team</h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Enter team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    disabled={loading}
                    className="w-full"
                  />
                  {teamName && teamNameCheck.result !== undefined && (
                    <div className="absolute right-0 -bottom-6">
                      <span className={`text-sm ${teamNameCheck.result ? 'text-green-500' : 'text-destructive'} font-medium`}>
                        {teamNameCheck.result ? "✓ Available" : "✗ Not Available"}
                      </span>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={checkTeamAvailability}
                  disabled={loading || !teamName}
                  variant="default"
                >
                  {loading ? (
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 border-2 border-t-transparent rounded-full animate-spin"></div>
                      <span>Checking</span>
                    </div>
                  ) : (
                    "Check"
                  )}
                </Button>
              </div>

              <div className="my-2"></div>

              <div className="flex gap-3 mt-4">
                <Button
                  disabled={
                    teamNameCheck.result === false ||
                    !teamNameCheck.result ||
                    teamName !== teamNameCheck.checkedName
                  }
                  className="flex-1"
                  onClick={() => setShowSearch(true)}
                >
                  Add Team Members
                </Button>
                
                <Button
                  variant="outline"
                  onClick={closePopup}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Member search screen
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Search members by name or email..."
                    value={searchQuery}
                    onChange={handleSearch}
                    onKeyPress={handleSearchKeyPress}
                    className="flex-1"
                  />
                  
                  <Button
                    size="icon"
                    onClick={searchMembers}
                    disabled={isLoading || !searchQuery.trim()}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {isSearching && (
                  <div className="max-h-64 overflow-y-auto border rounded-md">
                    {isLoading && (
                      <div className="p-4 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </div>
                    )}

                    {!isLoading && searchResults.length > 0 ? (
                      searchResults.map((member) => (
                        <div
                          key={member._id}
                          className="flex justify-between  items-center p-2 border-b hover:bg-primary/5 transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-2">
                              {member.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            variant={invited.includes(member._id) ? "outline" : "default"}
                            onClick={() => handleInvite(member)}
                            disabled={invited.includes(member._id)}
                          >
                            {invited.includes(member._id) ? "Added" : "Add"}
                            {!invited.includes(member._id) && (
                              <UserPlus className="ml-2 w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      ))
                    ) : (
                      !isLoading && (
                        <p className="p-4 text-center text-muted-foreground">
                          {searchQuery.trim() ? "No members found" : "Enter a name or email to search"}
                        </p>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mt-2">
                <p className="text-sm font-medium mb-2">
                  Team Members ({invited.length}/{eventData?.maxTeamMembers || 1}):
                </p>

                {/* Display current user (admin) */}
                {currentUser && (
                  <div className="flex justify-between items-center p-2 bg-primary/5 rounded-md mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-2">
                        {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium">{currentUser.name}</p>
                        <p className="text-xs">Team Admin</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Display other invited members */}
                {invited.filter(id => currentUser && id !== currentUser._id).length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {invited
                      .filter(id => currentUser && id !== currentUser._id)
                      .map(id => {
                        const member = searchResults.find(m => m._id === id);
                        return member ? (
                          <div key={id} className="flex justify-between items-center p-2 border rounded-md">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
                                {member.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <span>{member.name}</span>
                            </div>
                            
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveMember(id)}
                              className="hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : null;
                      })}
                  </div>
                ) : (
                  invited.length <= 1 && (
                    <p className="text-sm text-muted-foreground p-2">
                      No additional team members added yet
                    </p>
                  )
                )}
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setShowSearch(false)}>
                  Back
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  disabled={
                    isLoading ||
                    invited.length < (eventData?.minTeamMembers || 1) ||
                    invited.length > (eventData?.maxTeamMembers || 1) ||
                    !teamNameCheck.result ||
                    teamName !== teamNameCheck.checkedName
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>

              {/* Error messages */}
              {eventData?.minTeamMembers > 1 && invited.length < eventData.minTeamMembers && (
                <p className="text-xs text-amber-500 mt-2 text-center">
                  You need at least {eventData.minTeamMembers} team members to apply
                </p>
              )}
              
              {teamNameCheck.result === false && (
                <p className="text-xs text-amber-500 mt-2 text-center">
                  You need to choose an available team name
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
export default function EventDetailPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [ApplyForEvent, SetApplyForEvent] = useState(false);
  const router = useRouter()

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        // Check if user is authenticated (has token)
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
          setLoading(false)
          return // User is not authenticated
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API}/events/all`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setEvents(data)
          console.log(data)
        } else {
          console.error('Failed to fetch event data')
          // Handle authentication error (e.g., token expired)
          if (response?.status === 401) {
            // Clear tokens and redirect to login
            localStorage.removeItem('user')
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            router.push('/')
          }
        }
      } catch (error) {
        console.error('Error fetching event data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEventData()
  }, [router])

  // Find the event from our events data
  const eventData = events?.find(event => event._id === params.events)
  console.log("Event data:", eventData)

  // Show loading state
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading event details...</div>
  }

  // Show message if event not found
  if (!eventData && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-4">Event not found</h1>
        <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or you may not have access.</p>
        <Button onClick={() => router.push('/events')}>Back to Events</Button>
      </div>
    )
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-green-600'
      case 'ongoing': return 'bg-blue-600'
      case 'completed': return 'bg-gray-600'
      case 'cancelled': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  const HandleOpenApply = () => {
    SetApplyForEvent(true);
  };

  const HandleCloseApply = () => {
    SetApplyForEvent(false);
  };

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-background">
        <div className="container max-w-7xl mx-auto py-8 px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">{eventData?.category}</Badge>
            <Badge variant="default" className={getStatusColor(eventData?.status)}>
              {eventData?.status}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">{eventData?.eventName}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {eventData?.description}
          </p>
        </div>
      </div>

      {/* Main content container with 70-30 split */}
      <div className="container max-w-7xl mx-auto py-8">
        <div className="flex flex-col lg:flex-row gap-8 px-6 lg:px-8">
          {/* Left content area (70%) */}
          <div className="w-full lg:w-[70%]">
            <div className="rounded-lg p-2 border-1 border-primary">
              <img className='rounded-lg shadow-lg h-96 w-[100%]'
                src={`${process.env.NEXT_PUBLIC_API}/events${eventData?.image_path}` || '/event-placeholder.jpg'}
                alt={eventData?.eventName || 'Event image'} />
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
                  dangerouslySetInnerHTML={{ __html: eventData?.content }}
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
                        {eventData?.eventDate ? new Date(eventData.eventDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Date not available'}
                      </p>
                      <p className="text-muted-foreground mt-1">{eventData?.time}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 mt-1 text-primary" />
                    <div>
                      <h3 className="font-semibold">Location</h3>
                      <p className="text-muted-foreground">{eventData?.venue}</p>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 mt-1 text-primary" />
                    <div>
                      <h3 className="font-semibold">Participants</h3>
                      {/* <p className="text-muted-foreground">
                        {eventData?.participants?.length || 0} registered
                      </p> */}
                      <p className="text-sm mt-1">Team size: {eventData?.minTeamMembers || 1} - {eventData?.maxTeamMembers || 1} members</p>
                    </div>
                  </div>

                  {/* Prizes Section */}
                  {(eventData?.firstPrize || eventData?.secondPrize || eventData?.thirdPrize) && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 mt-1 text-primary" />
                      <div>
                        <h3 className="font-semibold">Prizes</h3>
                        {eventData?.firstPrize && <p className="text-muted-foreground">🥇 {eventData.firstPrize}</p>}
                        {eventData?.secondPrize && <p className="text-muted-foreground">🥈 {eventData.secondPrize}</p>}
                        {eventData?.thirdPrize && <p className="text-muted-foreground">🥉 {eventData.thirdPrize}</p>}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={HandleOpenApply}
                      disabled={eventData?.status === "completed" || eventData?.status === "cancelled"}
                    >
                      {eventData?.status === "upcoming"
                        ? "Apply Now"
                        : eventData?.status === "ongoing"
                          ? "Event In Progress"
                          : eventData?.status === "completed"
                            ? "Event Completed"
                            : "Event Cancelled"}
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                      {eventData?.status === "upcoming" ? "Registration is open" :
                        eventData?.status === "ongoing" ? "Registration closed" :
                          eventData?.status === "completed" ? "Event has ended" :
                            "Event was cancelled"}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* More Events Section */}
      <div className='flex flex-col lg:flex gap-8 px-6 lg:px-8'>
        <div>
          <MoreEvents currentEventId={eventData?._id} currentCategory={eventData?.category} />
        </div>
      </div>

      {/* Apply Event Popup */}
      <ApplyEvent
        ApplyForEvent={ApplyForEvent}
        closePopup={HandleCloseApply}
        eventData={eventData}
      />
    </div>
    <Footer/>
    </>
  )
}