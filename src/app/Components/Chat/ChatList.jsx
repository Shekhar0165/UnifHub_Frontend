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

const ChatPreview = ({ chat, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={cn(
      "p-3 flex items-start gap-3 cursor-pointer transition-all",
      "hover:bg-muted/50 active:scale-[0.99]",
      isActive && "bg-muted"
    )}
  >
    <div className="relative">
      <Avatar className="h-12 w-12 transition-transform hover:scale-105">
        <AvatarImage src={chat.user.profileImage} className="object-cover" />
        <AvatarFallback>{chat.user.name[0]}</AvatarFallback>
      </Avatar>
      {chat.user.isOnline && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start mb-0.5">
        <h4 className="font-medium truncate">{chat.user.name}</h4>
        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
          {formatDistanceToNow(new Date(chat.lastMessage.timestamp), { 
            addSuffix: true,
            includeSeconds: true
          })}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground truncate max-w-[180px]">
          {chat.lastMessage.text}
        </p>
        {chat.unreadCount > 0 && (
          <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
            {chat.unreadCount}
          </span>
        )}
      </div>
    </div>
  </div>
);

const ChatList = ({ chats = [], activeChat, onChatSelect }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Handle chat selection and navigation
  const handleChatSelect = (item) => {
    onChatSelect(item);
    // Navigate to /messages with the selected user's ID as a tab parameter
    router.push(`/messages?tab=${item._id || item.id}`);
  };

  // Debounce search to prevent too many requests
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Search users through API
  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/user/members/search?query=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        setSearchResults(response.data.members);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter chats based on search query or show search results
  const filteredItems = searchQuery.trim()
    ? searchResults
    : chats.filter(chat => 
        chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="flex flex-col border-r h-full max-h-[calc(100vh-4rem)] overflow-hidden bg-background">
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Messages</h2>
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
              placeholder="Search messages..."
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
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <ChatPreview
                key={item._id || item.id}
                chat={{
                  id: item._id || item.id,
                  user: {
                    name: item.name || item.user?.name,
                    profileImage: item.profileImage || item.user?.profileImage,
                    isOnline: item.isOnline || item.user?.isOnline
                  },
                  lastMessage: item.lastMessage || { text: '', timestamp: new Date() },
                  unreadCount: item.unreadCount || 0
                }}
                isActive={searchParams.get('tab') === (item._id || item.id)}
                onClick={() => handleChatSelect(item)}
              />
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              {searchQuery.trim() 
                ? "No users found matching your search"
                : "No conversations yet"
              }
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatList;