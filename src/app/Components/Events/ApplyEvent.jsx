import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Loader2, X, Check, UserPlus, Flag, XCircle, CheckCircle, AlertTriangle, UserX, Send, ChevronLeft } from 'lucide-react';

const ApplyEvent = ({ ApplyForEvent, closePopup, eventData, currentUser, showToast }) => {
  // State management
  const [invited, setInvited] = useState([currentUser._id]);
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
        eventid: eventData?._id,
        teamName: teamName,
        participant_ids: invited
      };

      const response = await axios.post(
        `${apiUrl}/participants/register`,
        applicationData,
        {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json" 
         },
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
  const handleSearch = (e) => {
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
                    {currentUser.name?.charAt(0).toUpperCase() || 'U'}
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
                  onChange={handleSearch}
                  className="pl-10 pr-10"
                />
              </div>
              
              <Button 
                onClick={searchMembers}
                disabled={isLoading || !searchQuery.trim()}
                variant="outline"
                className="w-full"
              >
                {isLoading ? "Searching..." : "Search Members"}
              </Button>
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

              {invited.length > 0 && (
                <div className="space-y-2 max-h-40">
                  {invited.map(id => {
                    const member = searchResults.find(m => m._id === id) || {};
                    return (
                      <div key={id} className="flex justify-between items-center p-2.5 border rounded-lg hover:bg-primary/5 transition-colors">
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
                          onClick={() => handleRemoveMember(id)}
                          className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
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

export default ApplyEvent;