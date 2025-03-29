'use client'
import { useParams } from 'next/navigation'
import React, { useEffect, useState, useCallback } from 'react'
import { Calendar, MapPin, Users, AlertCircle, Share2, BookmarkPlus, Search, UserPlus, Loader2, X, Circle, Flag, CheckCircle, ChevronLeft, Send, Check, UserX, XCircle, CalendarX, ArrowLeft,AlertTriangle } from 'lucide-react'
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
import { refreshTokens, authenticatedFetch } from '@/utils/authUtils'
import Cookies from 'js-cookie'


const apiUrl = process.env.NEXT_PUBLIC_API;

// Create axios instance with interceptors for token refresh
const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't already tried to refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Refresh the token
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
          // Redirect to login if no refresh token
          window.location.href = '/';
          return Promise.reject(error);
        }
        
        // Call the refresh token endpoint
        const response = await axios.post(
          `${apiUrl}/auth/refresh`,
          { token: refreshToken },
          { withCredentials: true }
        );
        
        if (response.status === 200) {
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// This prevents this page from being pre-rendered statically
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ShowParticipants = ({ eventid, currentUser, event }) => {
  const [participants, setParticipants] = useState({ teamName: "", participants: [] });
  const [loading, setLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removingUserId, setRemovingUserId] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  // Ensure we only run client-side code after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run after component is mounted on client
    if (!isMounted) return;
    if (!eventid || !currentUser || !currentUser._id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const data = {
          eventid: eventid,
          userid: currentUser._id,
        };
        
        const response = await api.post(
          `/participants/user`,
          data
        );

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
  }, [eventid, currentUser, isMounted]);

  // Check if current user is admin
  const isAdmin = currentUser && currentUser.role === "admin";

  // Count current participants
  const currentParticipantsCount = Array.isArray(participants?.participants) 
    ? participants.participants.length 
    : 0;

  // Check if team has room for more members
  const hasRoomForMoreMembers = event?.maxTeamMembers > currentParticipantsCount;

  // Handler for opening add member dialog
  const handleAddMember = () => {
    setShowAddMember(true);
  };

  const handleCloseAddMember = () => {
    setShowAddMember(false);
  };

  // Refresh participants data
  const refreshParticipants = async () => {
    setLoading(true);
    try {
      const data = {
        eventid: eventid,
        userid: currentUser._id,
      };
      
      const response = await api.post(
        `/participants/user`,
        data
      );

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

  // Handle removing a team member
  const handleRemoveMember = async (userId) => {
    if (!userId) return;
    if (!eventid) return alert("Event ID is missing!");

    // Check if removing member would violate minimum team size
    if (event && event.minTeamMembers && currentParticipantsCount <= event.minTeamMembers) {
      return alert(`Cannot remove member. Minimum ${event.minTeamMembers} members required.`);
    }

    setIsRemoving(true);
    setRemovingUserId(userId);

    try {
      await api.post(
        `/participants/remove-member`,
        { eventid, userid: userId }
      );

      // Update local state by removing the member
      setParticipants(prev => ({
        ...prev,
        participants: prev.participants.filter(p => p.userid !== userId)
      }));

    } catch (error) {
      console.error("Error removing team member:", error);
      alert("Failed to remove team member. Please try again.");
    } finally {
      setIsRemoving(false);
      setRemovingUserId(null);
    }
  };

  // Function to remove entire team
  const handleRemoveTeam = async () => {
    if (!eventid) return alert("Event ID is missing!");

    if (!confirm("Are you sure you want to remove the entire team?")) return;

    setIsRemoving(true);

    try {
      await api.post(
        `/participants/remove-team`,
        { eventid }
      );

      // Update local state by clearing participants
      setParticipants({ teamName: "", participants: [] });

    } catch (error) {
      console.error("Error removing team:", error);
      alert("Failed to remove team. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Show loading state with a skeleton loader
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <Card className="p-6 shadow-lg border-t-4 border-primary overflow-hidden">
          <div className="h-8 w-64 bg-gray-200 rounded-md mb-6 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const hasParticipants = Array.isArray(participants?.participants) && participants.participants.length > 0;

  if (!hasParticipants) return null;

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Card className="p-6 shadow-lg border-t-4 border-primary overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Participants</h2>
          <div className="flex items-center gap-3">
            {participants.teamName && (
              <div className="px-3 py-1 bg-primary/10 rounded-full">
                <p className="font-medium text-primary">Team: {participants.teamName}</p>
              </div>
            )}
            {isAdmin && (
              <Button 
                variant="destructive" 
                onClick={handleRemoveTeam}
                disabled={isRemoving}
                className="text-sm"
              >
                {isRemoving ? "Removing..." : "Remove Team"}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {participants.participants.map((participant) => (
            <div key={participant.userid || participant._id || Math.random().toString()}
                 className="p-4 border rounded-lg flex items-center gap-4 hover:bg-white/5 transition-colors duration-200">
              <Link
                href={`/user/${participant.userid}`}
                className="flex items-center gap-4 flex-grow"
              >
                {participant.profileImage ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API}${participant.profileImage}`}
                    alt={participant.name || "User"}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {getInitials(participant.name)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-lg">{participant.name || "Unknown User"}</p>
                  <p className="text-gray-500 text-sm">{participant.userid || "No ID"}</p>
                </div>
              </Link>
              
              {/* Remove user button for admin or team members */}
              {(isAdmin || currentUser._id === participant.userid) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleRemoveMember(participant.userid)}
                  disabled={isRemoving || removingUserId === participant.userid}
                >
                  {isRemoving && removingUserId === participant.userid ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Team status display */}
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {event && event.maxTeamMembers && (
              <span>
                Participants: {currentParticipantsCount}/{event.maxTeamMembers}
              </span>
            )}
          </div>
          
          {event && event.minTeamMembers && (
            <div className="text-sm text-gray-500">
              Minimum required: {event.minTeamMembers}
            </div>
          )}
        </div>

        {/* Add "Add Member" button if there's room for more team members */}
        {hasRoomForMoreMembers && event?.status === "upcoming" && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4 border-primary text-primary hover:bg-primary/10"
            onClick={handleAddMember}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        )}
        
        {/* Add Member Dialog */}
        {showAddMember && (
          <AddTeamMember 
            showDialog={showAddMember}
            closeDialog={handleCloseAddMember}
            eventData={event}
            teamName={participants.teamName}
            currentParticipants={participants.participants}
            refreshParticipants={refreshParticipants}
            showToast={(type, title, description) => toast({
              variant: type === "success" ? "default" : "destructive",
              title,
              description
            })}
          />
        )}
      </Card>
    </div>
  );
};

// New component for adding team members
const AddTeamMember = ({ 
  showDialog, 
  closeDialog, 
  eventData, 
  teamName, 
  currentParticipants,
  refreshParticipants,
  showToast 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Search for members
  const searchMembers = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${apiUrl}/user/members/search?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true
        }
      );

      const data = response.data;

      if (data.success) {
        const results = data.members || [];
        // Filter out members who are already part of the team
        const filteredResults = results.filter(member => 
          !currentParticipants.some(p => p.userid === member._id)
        );
        setSearchResults(filteredResults);
      } else {
        showToast("error", "Search Error", data.message || "Failed to search members");
      }
    } catch (error) {
      showToast("error", "Search Error", error.message || "Error searching members");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle member selection
  const handleSelectMember = (member) => {
    if (!selectedMembers.some(m => m._id === member._id)) {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  // Handle member removal
  const handleRemoveMember = (memberId) => {
    setSelectedMembers(selectedMembers.filter(member => member._id !== memberId));
  };

  // Handle input change and search
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim()) {
      searchMembers();
    }
  };

  // Submit selected members
  const handleSubmit = async () => {
    if (selectedMembers.length === 0) {
      showToast("error", "No members selected", "Please select at least one member to add");
      return;
    }

    // Check if adding these members would exceed the maximum team size
    if (currentParticipants.length + selectedMembers.length > eventData.maxTeamMembers) {
      showToast("error", "Team size limit exceeded", `Maximum team size is ${eventData.maxTeamMembers}`);
      return;
    }

    setIsLoading(true);

    try {
      const memberIds = selectedMembers.map(member => member._id);
      
      const response = await axios.post(
        `${apiUrl}/participants/update-team`,
        {
          eventid: eventData._id,
          teamName: teamName,
          participant_ids: memberIds
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      );

      if (response.status === 200) {
        showToast("success", "Team updated", "Team members added successfully!");
        refreshParticipants(); // Refresh the participants list
        closeDialog();
      } else {
        showToast("error", "Update Error", response.data.message || "Failed to update team");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
      showToast("error", "Update Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showDialog) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto border border-primary/20 animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Add Team Members
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeDialog}
            className="rounded-full hover:bg-primary/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members by userid"
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="pl-10 pr-10"
              />
            </div>
          </div>

          {isSearching && (
            <div className="max-h-64 overflow-y-auto border rounded-lg bg-background shadow-sm">
              {isLoading && (
                <div className="p-6 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground mt-2">Searching members...</p>
                </div>
              )}

              {!isLoading && searchResults && searchResults.length > 0 ? (
                <div className="divide-y">
                  {searchResults.map((member) => (
                    <div
                      key={member._id}
                      className="flex justify-between items-center p-3 hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3 shadow-sm">
                          {member.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.userid}</div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={selectedMembers.some(m => m._id === member._id) ? "outline" : "default"}
                        onClick={() => handleSelectMember(member)}
                        disabled={selectedMembers.some(m => m._id === member._id)}
                        className={selectedMembers.some(m => m._id === member._id) ? "opacity-70" : ""}
                      >
                        {selectedMembers.some(m => m._id === member._id) ? (
                          <>
                            <Check className="mr-1 w-3 h-3" />
                            Added
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-1 w-3 h-3" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                !isLoading && (
                  <div className="p-6 text-center text-muted-foreground">
                    {searchQuery.trim() ? (
                      <>
                        <UserX className="h-8 w-8 mx-auto mb-2 text-muted-foreground/70" />
                        <p>No members found matching "{searchQuery}"</p>
                      </>
                    ) : (
                      <>
                        <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/70" />
                        <p>Enter a name or email to search</p>
                      </>
                    )}
                  </div>
                )
              )}
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Selected Members ({selectedMembers.length})
              </div>

              <div className="text-xs px-2 py-1 rounded bg-primary/10 text-primary/80">
                Team Size: {currentParticipants.length}/{eventData.maxTeamMembers}
              </div>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedMembers.length > 0 ? (
                selectedMembers.map(member => (
                  <div key={member._id} className="flex justify-between items-center p-2.5 border rounded-lg hover:bg-primary/5 transition-colors">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2 shadow-sm">
                        {member.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground">{member.userid}</div>
                      </div>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveMember(member._id)}
                      className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center text-muted-foreground bg-primary/5 rounded-lg border border-dashed border-primary/20">
                  <UserPlus className="h-8 w-8 mb-2 text-primary/40" />
                  <p className="text-sm">No members selected yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Team status info */}
          {currentParticipants.length + selectedMembers.length > eventData.maxTeamMembers && (
            <div className="flex items-center gap-1.5 text-xs text-amber-500 py-1.5 px-3 bg-amber-500/10 rounded-lg">
              <AlertTriangle className="h-3.5 w-3.5" />
              Selected members exceed maximum team size of {eventData.maxTeamMembers}
            </div>
          )}

          <div className="flex justify-between gap-3 pt-2">
            <Button
              variant="outline"
              onClick={closeDialog}
              className="flex-1"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={
                isLoading ||
                selectedMembers.length === 0 ||
                currentParticipants.length + selectedMembers.length > eventData.maxTeamMembers
              }
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add to Team
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
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
  const [selectedMembers, setSelectedMembers] = useState([]); // New state to track selected members

  const router = useRouter();
  
  // Initialize the invited array with the current user
  useEffect(() => {
    if (currentUser) {
      setInvited([currentUser._id]);
      // Also add current user to selected members for display purposes
      setSelectedMembers([currentUser]);
    }
  }, [currentUser]);

  // Search for members
  const searchMembers = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${apiUrl}/user/members/search?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true
        }
      );

      const data = response.data;

      if (data.success) {
        // Mark members that are already selected
        const results = data.members || [];
        setSearchResults(results);
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
          headers: { 
            "Content-Type": "application/json",
          },
          withCredentials: true
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

      // Update both the invited IDs and the selected members object array
      setInvited(newInvited);
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  // Handle member removal
  const handleRemoveMember = (memberId) => {
    // Don't allow removing the current user (admin)
    if (currentUser && memberId === currentUser._id) return;
    
    setInvited(invited.filter(id => id !== memberId));
    setSelectedMembers(selectedMembers.filter(member => member._id !== memberId));
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
      const applicationData = {
        eventid: eventData?._id,
        teamName: teamName,
        participant_ids: invited
      };

      const response = await axios.post(
        `${apiUrl}/participants/register`,
        applicationData,
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      );

      const data = response.data;

      if (response.status === 200 || response.status === 201) {
        showToast("success", "Success", "Application submitted successfully!");
        closePopup();
      } else {
        showToast("error", "Submission Error", data.message || "Failed to submit application");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
      showToast("error", "Submission Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Event handlers
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    searchMembers();
  };

  // Return null if not showing
  if (!ApplyForEvent) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto border border-primary/20 animate-in fade-in duration-300 sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Apply for Event
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={closePopup}
            className="rounded-full hover:bg-primary/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {!showSearch ? (
          <div className="space-y-5">
            <div className="text-sm bg-primary/5 p-3 rounded-lg border border-primary/10">
              You'll be applying as the team leader. Add team members after setting up your team name.
            </div>

            {currentUser && (
              <div className="p-4 bg-primary/10 rounded-lg shadow-sm border border-primary/20">
                <div className="font-medium text-sm text-primary/80 mb-2">Team Leader:</div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3 shadow-sm">
                    {currentUser.profileImage ? (
                      <img className="w-12 h-12 rounded-full object-cover border-2 border-primary" src={`${process.env.NEXT_PUBLIC_API}${currentUser.profileImage}`} alt="" />
                    ) :
                      currentUser.name?.charAt(0).toUpperCase() || 'U'
                    }
                  </div>
                  <div>
                    <span className="font-semibold">{currentUser.name || 'Current User'}</span>
                    <div className="text-xs text-muted-foreground">leader</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 bg-primary/5 p-2 rounded-lg">
              <Users className="h-4 w-4 text-primary" />
              <div className="text-sm">
                Required team size: <span className="font-semibold">{eventData?.minTeamMembers || 1} - {eventData?.maxTeamMembers || 1} members</span>
              </div>
            </div>

            <div className="flex flex-col space-y-4 p-5 rounded-xl border border-primary/20 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Flag className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold">Create Your Team</h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Team Name</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Enter a unique team name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      disabled={loading}
                      className="w-full pr-8 focus-within:ring-1 focus-within:ring-primary/50"
                    />
                    {teamName && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {teamNameCheck.result === true && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {teamNameCheck.result === false && (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    )}
                    {teamName && teamNameCheck.result !== undefined && (
                      <div className="absolute left-0 -bottom-5">
                        <span className={`text-xs ${teamNameCheck.result ? 'text-green-500' : 'text-destructive'} font-medium`}>
                          {teamNameCheck.result ? "✓ Available" : "✗ Name already taken"}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={checkTeamAvailability}
                    disabled={loading || !teamName}
                    variant="default"
                    size="sm"
                    className="min-w-20"
                  >
                    {loading ? (
                      <div className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Checking</span>
                      </div>
                    ) : (
                      "Check Name"
                    )}
                  </Button>
                </div>
              </div>

              <div className="my-2"></div>

              <Button
                disabled={
                  teamNameCheck.result === false ||
                  !teamNameCheck.result ||
                  teamName !== teamNameCheck.checkedName
                }
                className="w-full"
                onClick={() => setShowSearch(true)}
                size="lg"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Team Members
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={closePopup}
              className="w-full mt-2"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members by userid"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="pl-10 pr-10"
                />
              </div>
            </div>

            {isSearching && (
              <div className="max-h-64 overflow-y-auto border rounded-lg bg-background shadow-sm">
                {isLoading && (
                  <div className="p-6 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground mt-2">Searching members...</p>
                  </div>
                )}

                {!isLoading && searchResults && searchResults.length > 0 ? (
                  <div className="divide-y">
                    {searchResults.map((member) => (
                      <div
                        key={member._id}
                        className="flex justify-between items-center p-3 hover:bg-primary/5 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3 shadow-sm">
                            {member.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-xs text-muted-foreground">{member.userid}</div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant={invited.includes(member._id) ? "outline" : "default"}
                          onClick={() => handleInvite(member)}
                          disabled={invited.includes(member._id)}
                          className={invited.includes(member._id) ? "opacity-70" : ""}
                        >
                          {invited.includes(member._id) ? (
                            <>
                              <Check className="mr-1 w-3 h-3" />
                              Added
                            </>
                          ) : (
                            <>
                              <UserPlus className="mr-1 w-3 h-3" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  !isLoading && (
                    <div className="p-6 text-center text-muted-foreground">
                      {searchQuery.trim() ? (
                        <>
                          <UserX className="h-8 w-8 mx-auto mb-2 text-muted-foreground/70" />
                          <p>No members found matching "{searchQuery}"</p>
                        </>
                      ) : (
                        <>
                          <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/70" />
                          <p>Enter a name or email to search</p>
                        </>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Team Members ({invited.length}/{eventData?.maxTeamMembers || 1})
                </div>

                <div className="text-xs px-2 py-1 rounded bg-primary/10 text-primary/80">
                  Min: {eventData?.minTeamMembers || 1} members
                </div>
              </div>

              {currentUser && (
                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg mb-3 border border-primary/10">
                  <div className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3 shadow-sm">
                      {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-medium">{currentUser.name}</div>
                      <div className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary inline-block">Team Leader</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-40">
                {selectedMembers.length > 1 ? (
                  selectedMembers
                    .filter(member => currentUser && member._id !== currentUser._id)
                    .map(member => (
                      <div key={member._id} className="flex justify-between items-center p-2.5 border rounded-lg hover:bg-primary/5 transition-colors">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2 shadow-sm">
                            {member.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-xs text-muted-foreground">{member.userid}</div>
                          </div>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveMember(member._id)}
                          className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center text-muted-foreground bg-primary/5 rounded-lg border border-dashed border-primary/20">
                    <UserPlus className="h-8 w-8 mb-2 text-primary/40" />
                    <p className="text-sm">No additional team members added yet</p>
                    <p className="text-xs mt-1">
                      {eventData?.minTeamMembers > 1 ?
                        `You need to add at least ${eventData.minTeamMembers - 1} more members` :
                        "Add team members if needed"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {eventData?.minTeamMembers > 1 && invited.length < eventData.minTeamMembers && (
              <div className="flex items-center gap-1.5 text-xs text-amber-500 py-1.5 px-3 bg-amber-500/10 rounded-lg">
                <AlertTriangle className="h-3.5 w-3.5" />
                You need at least {eventData.minTeamMembers} team members to apply
              </div>
            )}

            {teamNameCheck.result === false && (
              <div className="flex items-center gap-1.5 text-xs text-amber-500 py-1.5 px-3 bg-amber-500/10 rounded-lg">
                <AlertTriangle className="h-3.5 w-3.5" />
                You need to choose an available team name
              </div>
            )}

            <div className="flex justify-between gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowSearch(false)}
                className="flex-1"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
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
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function EventDetailPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [ApplyForEvent, SetApplyForEvent] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [visible, setVisible] = useState(true)
  const [isParticipating, setIsParticipating] = useState(false)
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  // Ensure we only run client-side code after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Toast notification handler for consistent notifications
  const showToast = (type, title, description = "") => {
    toast({
      variant: type === "success" ? "default" : "destructive",
      title,
      description
    })
  }

  // Check if the user is already participating in the event
  useEffect(() => {
    // Only run after component is mounted on client
    if (!isMounted || !currentUser || !events.length) return;

    const eventData = events?.find(event => event.eventName.trim() === decodeURIComponent(params.events).trim());
    if (!eventData || !eventData._id) return;

    const checkParticipation = async () => {
      try {
        const data = {
          eventid: eventData._id,
          userid: currentUser._id,
        };
        
        const response = await api.post(
          `/participants/user`,
          data
        );

        if (response.data && response.data.newParticipants) {
          const participants = response.data.newParticipants.participants || [];
          // If the participants array is not empty, the user is participating
          setIsParticipating(Array.isArray(participants) && participants.length > 0);
        }
      } catch (error) {
        console.error("Error checking participation:", error);
      }
    };

    checkParticipation();
  }, [events, currentUser, params.events, isMounted]);

  useEffect(() => {
    // Only run after component is mounted on client
    if (!isMounted) return;

    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        const userData = await authenticatedFetch(
          `${apiUrl}/user/one`,
          { method: 'GET' },
          router
        );
        
        // Process user data
        const user = typeof userData === 'string' ? JSON.parse(userData) : userData;
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching user data:', error);
        showToast("error", "Error", "Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [apiUrl, router, isMounted]);

  useEffect(() => {
    // Only run after component is mounted on client
    if (!isMounted) return;

    const fetchEventData = async () => {
      try {
        const data = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_API}/events/all`,
          { method: 'GET' },
          router
        );
        
        setEvents(data);
      } catch (error) {
        console.error('Error fetching event data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEventData();
  }, [router, isMounted]);

  // Find the event from our events data
  const eventData = events?.find(event => event.eventName.trim() === decodeURIComponent(params.events).trim())

  // Show loading state - this will be shown both during server rendering and client loading
  if (!isMounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <LoadingSpinner className="h-12 w-12" />
          <p className="mt-4 text-muted-foreground animate-pulse">Loading event details...</p>
        </div>
      </div>
    )
  }

  // Show message if event not found
  if (!eventData && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="text-center max-w-md mx-auto">
          <CalendarX className="h-16 w-16 mx-auto mb-4 text-primary opacity-70" />
          <h1 className="text-3xl font-bold mb-2">Event not found</h1>
          <p className="text-muted-foreground mb-8">The event you're looking for doesn't exist or you may not have access.</p>
          <Button onClick={() => router.push('/events')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        </div>
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
      case 'Add Member': return 'bg-yello-600'
      case 'Team Full': return  'bg-green-600' 
      default: return 'bg-gray-600'
    }
  }

  const HandleOpenApply = () => {
    SetApplyForEvent(true)
  }

  const HandleCloseApply = () => {
    SetApplyForEvent(false)
  }

  // Safely get UserType from cookies (client-side only)
  const getUserType = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("UserType") || ""
    }
    return ""
  }

  const UserType = getUserType()

  // Return button label based on participation status
  const getApplyButtonLabel = () => {
    if (isParticipating) {
      return "Already Registered";
    }
    
    if (eventData?.status === "upcoming") {
      return "Apply Now";
    } else if (eventData?.status === "ongoing") {
      return "Event In Progress";
    } else if (eventData?.status === "completed") {
      return "Event Completed";
    } else {
      return "Event Cancelled";
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        {/* Hero section with event cover image and overlay */}
        <div className="relative h-80 lg:h-96 w-full overflow-hidden">
          <img
            className="object-cover w-full h-full"
            src={eventData?.image_path ? `${process.env.NEXT_PUBLIC_API}/events${eventData.image_path}` : '/event-placeholder.jpg'}
            alt={eventData?.eventName || 'Event image'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
            <div className="container max-w-7xl mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(eventData?.status)} text-white`}>
                  {eventData?.status?.toUpperCase()}
                </span>
                {eventData?.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                    {eventData.category}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-md">{eventData?.eventName}</h1>
            </div>
          </div>
        </div>

        {/* Organization User Alert */}
        {visible && UserType === "Organization" && (
          <div className="container max-w-7xl mx-auto px-6 lg:px-8 mt-4">
            <Alert className="bg-red-100 border-red-500 text-red-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription>
                  You cannot participate. Please switch from Organization to User mode.
                </AlertDescription>
              </div>
              <button
                onClick={() => setVisible(false)}
                className="text-red-700 hover:text-red-900 p-1 rounded-full hover:bg-red-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </Alert>
          </div>
        )}

        {/* Main content container with 70-30 split */}
        <div className="container max-w-7xl mx-auto py-8">
          <div className="flex flex-col lg:flex-row gap-8 px-6 lg:px-8">
            {/* Left content area (70%) */}
            <div className="w-full lg:w-[70%]">
              <Card className="overflow-hidden shadow-lg border-0 mb-8">
                {/* Action buttons */}
                <div className="flex gap-4 p-6 border-b">
                  <Button variant="outline" size="sm" className="gap-2 rounded-full">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 rounded-full">
                    <BookmarkPlus className="h-4 w-4" />
                    Save
                  </Button>
                </div>

                {/* Event overview section */}
                <CardContent className="p-6 lg:p-8">
                  <div className="prose dark:prose-invert max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: typeof eventData?.content === 'string'
                          ? eventData.content
                            .replace(/<p>\s*<p>/g, '<p>')  // Fix nested <p> tags
                            .replace(/<\/p>\s*<\/p>/g, '</p>')
                          : JSON.stringify(eventData?.content)
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right sidebar (30%) */}
            <div className="w-full lg:w-[30%]">
              <div className="lg:sticky lg:top-8 space-y-6">
                {/* Event Details Card */}
                <Card className="overflow-hidden shadow-lg border-t-4 border-primary">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Date and Time */}
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Date & Time</h3>
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
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Location</h3>
                          <p className="text-muted-foreground">{eventData?.venue}</p>
                        </div>
                      </div>

                      {/* Participants */}
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Team Size</h3>
                          <p className="text-muted-foreground">{eventData?.minTeamMembers || 1} - {eventData?.maxTeamMembers || 1} members</p>
                        </div>
                      </div>

                      {/* Prizes Section */}
                      {(eventData?.firstPrize || eventData?.secondPrize || eventData?.thirdPrize) && (
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Trophy className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Prizes</h3>
                            <div className="space-y-2 mt-2">
                              {eventData?.firstPrize && (
                                <div className="flex items-center gap-2">
                                  <span className="text-yellow-500 text-lg">🥇</span>
                                  <p className="text-muted-foreground">{eventData.firstPrize}</p>
                                </div>
                              )}
                              {eventData?.secondPrize && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 text-lg">🥈</span>
                                  <p className="text-muted-foreground">{eventData.secondPrize}</p>
                                </div>
                              )}
                              {eventData?.thirdPrize && (
                                <div className="flex items-center gap-2">
                                  <span className="text-amber-700 text-lg">🥉</span>
                                  <p className="text-muted-foreground">{eventData.thirdPrize}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-4">
                        <Button
                          className="w-full rounded-full"
                          size="lg"
                          onClick={HandleOpenApply}
                          disabled={
                            eventData?.status === "completed" || 
                            eventData?.status === "cancelled" || 
                            UserType === "Organization" ||
                            isParticipating
                          }
                        >
                          {getApplyButtonLabel()}
                        </Button>
                        <p className="text-sm text-center text-muted-foreground mt-2">
                          {isParticipating ? (
                            <span className="flex items-center justify-center gap-1">
                              <CheckCircle className="h-3 w-3 fill-green-500 text-green-500" />
                              You are registered for this event
                            </span>
                          ) : eventData?.status === "upcoming" ? (
                            <span className="flex items-center justify-center gap-1">
                              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                              Registration is open
                            </span>
                          ) : eventData?.status === "ongoing" ? (
                            <span className="flex items-center justify-center gap-1">
                              <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
                              Registration closed
                            </span>
                          ) : eventData?.status === "completed" ? (
                            <span className="flex items-center justify-center gap-1">
                              <Circle className="h-2 w-2 fill-gray-500 text-gray-500" />
                              Event has ended
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1">
                              <Circle className="h-2 w-2 fill-red-500 text-red-500" />
                              Event was cancelled
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Participants Card */}
                <ShowParticipants eventid={eventData._id} currentUser={currentUser} event={eventData} />
              </div>
            </div>
          </div>

          {/* More Events Section */}
          <div className="mt-12 px-6 lg:px-8">
            <div className="border-b pb-2 mb-6">
              <h2 className="text-2xl font-bold">More Events</h2>
            </div>
            {eventData && (
              <MoreEvents
                currentEventId={eventData?._id || ""}
                currentCategory={eventData?.category || ""}
              />
            )}
          </div>
        </div>

        {/* Apply Event Popup */}
        {eventData && (
          <ApplyEvent
            ApplyForEvent={ApplyForEvent}
            closePopup={HandleCloseApply}
            eventData={eventData}
            currentUser={currentUser}
            showToast={showToast}
          />
        )}
      </div>
      <Footer />
    </>
  )
}