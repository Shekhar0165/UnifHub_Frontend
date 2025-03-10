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
import Link from 'next/link'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const apiUrl = process.env.NEXT_PUBLIC_API;





const ShowParticiPants = ({ eventid, currentUser }) => {
  const [participants, setParticipants] = useState({ teamName: "", participants: [] });
  const [newUserId, setNewUserId] = useState("");
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchData = async () => {
      // Ensure we have the necessary data to make the request
      if (!eventid || !currentUser || !currentUser._id) {
        setLoading(false);
        return;
      }

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const data = {
          eventid: eventid,
          userid: currentUser._id,
        };
        const response = await axios.post(
          `${apiUrl}/participants/user`,
          data,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        // Ensure response.data.newParticipants is an object with participants array
        if (response.data && response.data.newParticipants) {
          setParticipants({
            teamName: response.data.newParticipants.teamName || "",
            participants: Array.isArray(response.data.newParticipants.participants) 
              ? response.data.newParticipants.participants 
              : []
          });
        }
      } catch (error) {
        console.error("Error fetching participants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventid, currentUser]);

  // Function to add a new participant
  const handleAddParticipant = async () => {
    if (!newUserId) return alert("Please enter a user ID!");
    if (!eventid) return alert("Event ID is missing!");

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return alert("You need to be logged in!");

    try {
      const response = await axios.post(
        `${apiUrl}/participants/add`,
        { eventid, userid: newUserId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Safely update the participants state
      if (response.data && response.data.participant) {
        setParticipants(prev => ({
          ...prev,
          participants: Array.isArray(prev.participants) 
            ? [...prev.participants, response.data.participant]
            : [response.data.participant]
        }));
      }

      setNewUserId(""); // Reset input field
    } catch (error) {
      console.error("Error adding participant:", error);
      alert("Failed to add participant. Please try again.");
    }
  };

  // Show loading state
  if (loading) {
    return <div className="max-w-2xl mx-auto mt-10">
      <Card className="p-6 shadow-lg border-t-4 border-primary">
        <p className="text-center">Loading participants...</p>
      </Card>
    </div>;
  }

  // Fixed the condition - proper way to check if array has items
  const hasParticipants = Array.isArray(participants?.participants) && participants.participants.length > 0;

  // If no participants and we're not loading, don't render anything
  if (!hasParticipants) return null;

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card className="p-6 shadow-lg border-t-4 border-primary">
        <h2 className="text-xl font-semibold mb-4">Participants for Event</h2>

        {hasParticipants ? (
          <div>
            <p className="font-semibold text-lg mb-2">Team Name: {participants.teamName}</p>
            <ul className="space-y-3">
              {participants.participants.map((participant) => (
                <Link href={`/user/${participant.userid}`} key={participant.userid || participant._id || Math.random().toString()}>
                  <li className="p-3 border rounded-lg flex items-center gap-3">
                    <img
                      src={participant.profileImage ? `${apiUrl}${participant.profileImage}` : '/default-avatar.png'}
                      alt={participant.name || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{participant.name || "Unknown User"}</p>
                      <p className="text-gray-500">{participant.userid || "No ID"}</p>
                    </div>
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500">No participants yet.</p>
        )}

        {/* Add Participant Section */}
        <div className="mt-6 flex gap-2">
          <Input
            type="text"
            placeholder="Enter User ID"
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
          />
          <Button onClick={handleAddParticipant} className="bg-primary">
            Add User
          </Button>
        </div>
      </Card>
    </div>
  );
};

const ApplyEvent = ({ ApplyForEvent, closePopup, eventData, currentUser, showToast }) => {
  // State management
  const [invited, setInvited] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [teamName, setTeamName] = useState("");

  const [teamNameCheck, setTeamNameCheck] = useState({ result: undefined, checkedName: "" });
  const [loading, setLoading] = useState(false);

  const router = useRouter();

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
        setSearchResults(data.members || []);
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
          eventid: eventData?._id,
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
    if (!invited.some(id => id === member._id)) {
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
        eventid: eventData?._id,
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

      if (response.status === 200 || response.status === 201) {
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
            <div className="text-sm">You'll be applying as the team admin. Click below to search for additional team members to invite to this event.</div>

            {currentUser && (
              <div className="p-3 bg-primary/10 rounded-md">
                <div className="font-medium">Team Leader:</div>
                <div className="flex items-center mt-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-2">
                    {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span>{currentUser.name || 'Current User'}</span>
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Team size: {eventData?.minTeamMembers || 1} - {eventData?.maxTeamMembers || 1} members
            </div>

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

                    {!isLoading && searchResults && searchResults.length > 0 ? (
                      searchResults.map((member) => (
                        <div
                          key={member._id}
                          className="flex justify-between items-center p-2 border-b hover:bg-primary/5 transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-2">
                              {member.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-xs text-muted-foreground">{member.email}</div>
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
                        <div className="p-4 text-center text-muted-foreground">
                          {searchQuery.trim() ? "No members found" : "Enter a name or email to search"}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mt-2">
                <div className="text-sm font-medium mb-2">
                  Team Members ({invited.length}/{eventData?.maxTeamMembers || 1}):
                </div>

                {/* Display current user (admin) */}
                {currentUser && (
                  <div className="flex justify-between items-center p-2 bg-primary/5 rounded-md mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-2">
                        {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-medium">{currentUser.name}</div>
                        <div className="text-xs">Team Admin</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Display other invited members */}
                {invited.length > 0 && currentUser && invited.filter(id => id !== currentUser._id).length > 0 ? (
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
                    <div className="text-sm text-muted-foreground p-2">
                      No additional team members added yet
                    </div>
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
                <div className="text-xs text-amber-500 mt-2 text-center">
                  You need at least {eventData.minTeamMembers} team members to apply
                </div>
              )}

              {teamNameCheck.result === false && (
                <div className="text-xs text-amber-500 mt-2 text-center">
                  You need to choose an available team name
                </div>
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
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const router = useRouter()

  // Toast notification handler for consistent notifications
  const showToast = (type, title, description = "") => {
    toast({
      variant: type === "success" ? "default" : "destructive",
      title,
      description
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/user/one`, {
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
  const eventData = events?.find(event => event.eventName.trim() === decodeURIComponent(params.events).trim());

  // Show loading state
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>
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

  // Safely get UserType from localStorage (client-side only)
  const getUserType = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("UserType") || "";
    }
    return "";
  };
  
  const UserType = getUserType();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
      {visible && UserType === "Organization" && (
        <div className='flex justify-end items-end'>
        <Alert className="bg-red-100 border-red-500 mt-2 text-red-700 mx-10 flex items-end w-[70%] justify-between">
          <div>
            <AlertDescription>
              You cannot participate. Please switch from Organization to User mode.
            </AlertDescription>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-red-700 hover:text-red-900"
          >
            <X className="w-5 h-5" />
          </button>
        </Alert>
        </div>
      )}

        {/* Header Section */}
        {/* <div className="border-b bg-background">
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
        </div> */}

        {/* Main content container with 70-30 split */}
        <div className="container max-w-7xl mx-auto py-8">
          <div className="flex flex-col lg:flex-row gap-8 px-6 lg:px-8">
            {/* Left content area (70%) */}
            <div className="w-full lg:w-[70%]">
              <div className="rounded-lg p-2 border-1 border-primary">
                <img className='rounded-lg shadow-lg h-96 w-[100%]'
                  src={eventData?.image_path ? `${process.env.NEXT_PUBLIC_API}/events${eventData.image_path}` : '/event-placeholder.jpg'}
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
                  {/* Fix for potentially invalid HTML in content */}
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: typeof eventData?.content === 'string' 
                        ? eventData.content
                            .replace(/<p>\s*<p>/g, '<p>')  // Fix nested <p> tags
                            .replace(/<\/p>\s*<\/p>/g, '</p>') 
                        : JSON.stringify(eventData?.content) 
                    }}
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
                        {/* Fix for undefined .length property */}
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
                        disabled={eventData?.status === "completed" || eventData?.status === "cancelled" || UserType === "Organization"}
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
                <ShowParticiPants eventid={eventData._id} currentUser={currentUser} />
              </div>
            </div>
          </div>
        </div>

        {/* More Events Section */}
            {/* Fix for potentially undefined _id and category */}
        <div className='flex flex-col lg:flex gap-8 px-6 lg:px-8'>
          <div>
            {eventData && <MoreEvents 
              currentEventId={eventData?._id || ""} 
              currentCategory={eventData?.category || ""} 
            />}
          </div>
        </div>

        {/* Apply Event Popup */}
        {eventData && (
          <ApplyEvent
            ApplyForEvent={ApplyForEvent}
            closePopup={HandleCloseApply}
            eventData={eventData}
            currentUser={currentUser}
          />
        )}
      </div>
      <Footer />
    </>
  )
}