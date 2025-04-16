import { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

const UserSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [followedUsers, setFollowedUsers] = useState(new Set());
  const api = process.env.NEXT_PUBLIC_API
  const router = useRouter()

  // Fetch initial suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        // Get the auth token from localStorage or wherever you store it
        const token = localStorage.getItem('authToken');
        
        const response = await axios.get(`${api}/follow-suggestion`, {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true,
        });
        
        if (response.data.success) {
          // Format the suggestions to match your component's expected format
          const formattedSuggestions = response.data.suggestions.map(suggestion => ({
            id: suggestion.userId || suggestion._id,
            userid: suggestion.userid,
            name: suggestion.name,
            role: suggestion.bio || suggestion.suggestionReason || "User",
            image: suggestion.image_path || "https://via.placeholder.com/40" // Fallback image if none provided
          }));
          
          setSuggestions(formattedSuggestions);
          setAllSuggestions(formattedSuggestions);
          setSkip(formattedSuggestions.length);
          setHasMore(response.data.hasMore !== false);
        } else {
          setError("Failed to fetch suggestions");
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setError("An error occurred while fetching suggestions");
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  // Function to load more suggestions
  const loadMoreSuggestions = async () => {
    if (!hasMore || loading) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await axios.get(`${api}/follow-suggestion/more?skip=${skip}`, {
        headers: {
            "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      
      if (response.data.success) {
        const formattedSuggestions = response.data.suggestions.map(suggestion => ({
          id: suggestion.userId || suggestion._id,
          userid: suggestion.userid,
          name: suggestion.name,
          role: suggestion.bio || suggestion.suggestionReason || "User",
          image: suggestion.image_path || "https://via.placeholder.com/40"
        }));
        
        setAllSuggestions(prev => [...prev, ...formattedSuggestions]);
        setSkip(prev => prev + formattedSuggestions.length);
        setHasMore(response.data.hasMore);
        
        if (showAll) {
          setSuggestions(prev => [...prev, ...formattedSuggestions]);
        }
      }
    } catch (err) {
      console.error("Error loading more suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle between showing 5 or all suggestions
  const toggleShowAll = () => {
    if (!showAll) {
      setSuggestions(allSuggestions);
      if (allSuggestions.length <= 5 && hasMore) {
        loadMoreSuggestions();
      }
    } else {
      setSuggestions(allSuggestions.slice(0, 5));
    }
    setShowAll(!showAll);
  };

  // Function to follow a user
  const handleFollow = async (userId) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/follower/add`,
        { userid: userId },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      toast({
        title: "Followed",
        description: response.data.message,
        variant: "default",
      });
      
      if (response.data.success) {
        // Update followedUsers state instead of removing from suggestions
        setFollowedUsers(prev => new Set(prev).add(userId));
      }
    } catch (err) {
      console.error("Error following user:", err);
      toast({
        title: "Error",
        description: "Failed to follow user. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to unfollow a user
  const handleUnfollow = async (userId) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/follower/remove`,
        { userid: userId },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      toast({
        title: "Unfollowed",
        description: response.data.message,
        variant: "default",
      });
      
      if (response.data.success) {
        // Remove from followedUsers set
        const newFollowedUsers = new Set(followedUsers);
        newFollowedUsers.delete(userId);
        setFollowedUsers(newFollowedUsers);
      }
    } catch (err) {
      console.error("Error unfollowing user:", err);
      toast({
        title: "Error",
        description: "Failed to unfollow user. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="w-64 flex-shrink-0 hidden md:block">
        <div className="rounded-lg shadow-md overflow-hidden">
          <div className="p-4">
            <p className="text-red-500">Failed to load suggestions</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster/>
      <div className="w-64 flex-shrink-0 hidden md:block">
        <div className="rounded-lg shadow-md overflow-hidden sticky top-20">
          <div className="p-3">
            <h3 className="font-semibold text-lg">Suggestions for you</h3>

            {loading && suggestions.length === 0 ? (
              <div className="mt-3 text-center py-4">
                <div className="animate-pulse flex flex-col space-y-3">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : suggestions.length > 0 ? (
              <>
                {/* Suggestions List with overflow */}
                <div className="mt-2 max-h-96 overflow-y-auto">
                  <ul className="space-y-2">
                    {suggestions.map((suggestion) => (
                      <li key={suggestion.id} className="flex items-start gap-2 p-1 border-b pb-3 hover:scale-105 duration-300 transition-all ease-in-out cursor-pointer">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full overflow-hidden">
                            <img
                              src={suggestion.image}
                              alt={suggestion.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/40";
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 onClick={()=>{router.push(`/user/${suggestion.userid}`)}} className="font-medium truncate">{suggestion.name}</h4>
                          <p className="text-xs line-clamp-2 mt-1">{suggestion.role.slice(0,20)}..</p>
                          {followedUsers.has(suggestion.id) ? (
                            <button 
                              className="mt-2 text-sm font-medium hover:underline flex items-center gap-1 text-red-500"
                              onClick={() => handleUnfollow(suggestion.id)}
                            >
                              <UserMinus className="h-3.5 w-3.5" /> unfollow
                            </button>
                          ) : (
                            <button 
                              className="mt-2 text-sm font-medium hover:underline flex items-center gap-1"
                              onClick={() => handleFollow(suggestion.id)}
                            >
                              <UserPlus className="h-3.5 w-3.5" /> follow
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 text-center">
                  <button className="hover:underline text-sm font-medium" onClick={toggleShowAll}>
                    {showAll ? "Show less" : "View all suggestions"}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center py-4">No suggestions available</p>
            )}

            {loading && suggestions.length > 0 && (
              <div className="mt-2 text-center">
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserSuggestions;