'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Search, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import axios from 'axios';
const ChatPreview = ({ chat, isActive, onClick }) => {
  const [socketConnected, setSocketConnected] = useState(false);
  const [userStatus, SetUserStatus] = useState(false);
  const [lastmess, setLastmess] = useState(chat.lastMessage.content)
  const [unreadCount, setUnreadCount] = useState(chat.unreadCount);
  const [lastseen, setlastseen] = useState(chat.lastMessage.timestamp);

  console.log("chat",chat)

  useEffect(() => {
    if (!window.socket) return;

    const handleStatus = (data) => {
      if (data.userId === chat.participant.id) {
        SetUserStatus(data.isOnline);
      }
    };

    const handleLastSeen = (data) => {
      if (data.from._id === chat.participant.id) {
        setLastmess(data.message);
        setUnreadCount(prev => prev + 1);
        setlastseen(data.timestamp)
        console.log("data",data)
      }
    };

    const statusEvent = `user_online_status_${chat.participant.id}`;

    window.socket.off(statusEvent, handleStatus);
    window.socket.on(statusEvent, handleStatus);

    window.socket.off("last-seen", handleLastSeen); // remove old
    window.socket.on("last-seen", handleLastSeen);  // add fresh

    window.socket.emit("check_user_status", chat.participant.id);

    const interval = setInterval(() => {
      window.socket.emit("check_user_status", chat.participant.id);
    }, 5000);

    return () => {
      clearInterval(interval);
      window.socket.off(statusEvent, handleStatus);
      window.socket.off("last-seen", handleLastSeen);
    };
  }, [chat.participant.id]);

  const handleClick = () => {
  setUnreadCount(0);
  onClick?.();
};

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-3 flex items-start gap-3 cursor-pointer transition-all",
        "hover:bg-muted/50 active:scale-[0.99]",
        isActive && "bg-muted"
      )}
    >
      <div className="relative">
        <Avatar className="h-12 w-12 transition-transform hover:scale-105">
          <AvatarImage src={chat.participant.profileImage} className="object-cover" />
          <AvatarFallback>{chat.participant.name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        {userStatus && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <h4 className="font-medium truncate">{chat.participant.name}</h4>
          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
            {formatDistanceToNow(new Date(lastseen), {
              addSuffix: true,
              includeSeconds: true
            })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate max-w-[180px]">
            {lastmess || 'No messages yet'}
          </p>
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};


const ChatList = ({ onChatSelect }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [pagination, setPagination] = useState({});
  const [unreadCount, setUnreadCount] = useState({ totalUnreadMessages: 0, unreadChatsCount: 0 });
  // Fetch chat list from backend
  const fetchChatList = async (page = 1, limit = 20) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/chat/list?page=${page}&limit=${limit}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setChats(response.data.chats);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching chat list:", error);
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };


  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/chat/list/unread-count`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setUnreadCount({
          totalUnreadMessages: response.data.totalUnreadMessages,
          unreadChatsCount: response.data.unreadChatsCount
        });
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Search chats through backend
  const searchChats = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/chat/list/search?search=${encodeURIComponent(query)}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setSearchResults(response.data.chats);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching chats:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle chat selection and navigation
  const handleChatSelect = (chat) => {
    onChatSelect && onChatSelect(chat);
    // Navigate to /messages with the conversation ID
    router.push(`/messages?tab=${chat.userid}`);
  };

  // Pin/Unpin conversation
  const togglePin = async (conversationId, isPinned) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API}/chat/list/${conversationId}`,
        {
          action: 'pin',
          value: !isPinned
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true
        }
      );

      // Refresh chat list after update
      fetchChatList();
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        searchChats(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Initial data fetch
  useEffect(() => {
    fetchChatList();
    fetchUnreadCount();
  }, []);

  // Get current items to display
  const currentItems = searchQuery.trim() ? searchResults : chats;

  return (
    <div className="flex flex-col border-r h-full max-h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg">Messages</h2>
            {unreadCount.unreadChatsCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium rounded-full bg-red-500 text-white">
                {unreadCount.unreadChatsCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setShowSearchInput(!showSearchInput)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {showSearchInput && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 bg-muted/50 border-0 rounded-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 h-[calc(100vh-10rem)]">
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (currentItems && currentItems.length > 0) ? (
            currentItems.map((chat) => (
              <ChatPreview
                key={chat.conversationId}
                chat={chat}
                isActive={searchParams.get('tab') === chat.participant.userid}
                onClick={() => handleChatSelect(chat.participant)}
              />
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              {searchQuery.trim()
                ? "No conversations found matching your search"
                : "No conversations yet"
              }
            </div>
          )}
        </div>

        {/* Load more button for pagination */}
        {!searchQuery && pagination?.hasNextPage && (
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fetchChatList(pagination.currentPage + 1)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ChatList;