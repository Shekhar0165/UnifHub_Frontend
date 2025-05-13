'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { io } from "socket.io-client";

// Create socket connection only once
const socket = io(process.env.NEXT_PUBLIC_API || '');

// Separate Message component with proper sender check
const Message = ({ message, currentUserId }) => {
  const isOwn = message.sender.id === currentUserId;
  
  return (
    <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} max-w-[70%]`}>
        <Avatar className="w-8 h-8 mx-2">
          <AvatarImage src={message.sender.profileImage} alt={message.sender.name} />
          <AvatarFallback>{message.sender.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          {message.image && (
            <div className="my-1">
              <img
                src={message.image}
                alt="Message attachment"
                className="max-w-full h-auto rounded"
              />
            </div>
          )}

          <div 
            className={`p-3 rounded-lg break-words overflow-wrap-normal ${
              isOwn 
                ? 'bg-blue-500 text-white rounded-tr-none' 
                : 'bg-gray-200 text-gray-800 rounded-tl-none'
            }`}
          >
            {message.content}
          </div>

          <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ChatBox({ recipientUser, currentUser }) {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pendingMessageIds, setPendingMessageIds] = useState(new Set());
  const fileInputRef = useRef(null);
  const scrollAreaRef = useRef(null);
  
  // Initialize chat with room joining and message listeners
  useEffect(() => {
    if (!currentUser?._id || !recipientUser?._id) return;
    
    // Add welcome message when chat starts

    setMessages(prev => [
      ...prev, ]);
    
    // Join the chat room
    const joinData = {
      userId: currentUser._id,
      recipientId: recipientUser._id,
    };
    
    console.log('Socket connection established:', joinData);
    socket.emit('join-chat', joinData);

    // Clean up function to remove listeners when component unmounts
    return () => {
      socket.off('new-message');
      socket.off('joined');
      socket.off('error');
    };
  }, [recipientUser?._id, currentUser?._id, recipientUser?.name, recipientUser?.profileImage]);

  // Set up message listener after initial setup
  useEffect(() => {
    // Add socket listener for new messages
    const handleNewMessage = (data) => {
      console.log('Received message:', data);
      
      // If this is our own message coming back from the server, ignore it
      // because we've already added it to the UI
      if (data.sender === currentUser?._id && 
          pendingMessageIds.has(data.message.content)) {
        // Remove this message from pending set
        setPendingMessageIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.message.content);
          return newSet;
        });
        return;
      }
      
      // If it's a message from the other user, add it
      if (data.sender !== currentUser?._id) {
        const newMessage = {
          id: data.message._id || 'msg-' + Date.now(),
          content: data.message.content,
          image: data.message.image,
          timestamp: new Date(),
          sender: {
            id: data.sender,
            name: recipientUser?.name,
            profileImage: recipientUser?.profileImage
          }
        };
        setMessages(prev => [...prev, newMessage]);
      }
    };
    
    socket.on('new-message', handleNewMessage);
    
    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [currentUser, recipientUser, pendingMessageIds]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() && !selectedImage) return;
    
    // Track this message content to avoid duplicates
    setPendingMessageIds(prev => {
      const newSet = new Set(prev);
      newSet.add(message);
      return newSet;
    });
    
    // Create message object
    const newMessage = {
      id: 'local-' + Date.now(),
      content: message,
      image: selectedImage ? URL.createObjectURL(selectedImage) : null,
      timestamp: new Date(),
      sender: {
        id: currentUser?._id,
        name: currentUser?.name,
        profileImage: currentUser?.profileImage
      }
    };

    // Add message to UI immediately (optimistic UI update)
    setMessages(prev => [...prev, newMessage]);

    // Emit the message to the server
    socket.emit('send-message', {
      senderId: currentUser?._id,
      recipientId: recipientUser?._id,
      content: message,
      image: selectedImage ? URL.createObjectURL(selectedImage) : null,
    });

    // Reset form
    setMessage('');
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 transition-transform hover:scale-105">
            <AvatarImage src={recipientUser?.profileImage} className="object-cover" />
            <AvatarFallback>{recipientUser?.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium leading-none mb-1">{recipientUser?.name || 'User'}</h3>
            <p className="text-xs text-muted-foreground">
              {recipientUser?.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem>Clear Chat</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Block User</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-6">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => (
              <Message
                key={msg.id}
                message={msg}
                currentUserId={currentUser?._id}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="px-4 py-3 border-t bg-muted/30 flex-shrink-0">
          <div className="relative inline-block group">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Selected"
              className="h-20 w-20 object-cover rounded-lg border-2 border-background"
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                setSelectedImage(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageSelect}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-shadow"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full shadow-sm hover:shadow-md transition-shadow"
            disabled={!message.trim() && !selectedImage}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}