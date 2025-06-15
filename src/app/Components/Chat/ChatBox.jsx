'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import axios from 'axios';

export default function ChatBox({ recipientUser, currentUser }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const hasLoadedOldMessages = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for pending notification message
  const checkPendingMessage = useCallback(() => {
    const pendingMessage = sessionStorage.getItem('pendingMessage');
    if (pendingMessage) {
      try {
        const messageData = JSON.parse(pendingMessage);
        
        // Only add if it's for the current recipient
        if (messageData.sender === recipientUser?._id) {
          setMessages(prev => {
            // Check if message already exists
            const exists = prev.some(msg => 
              msg.id === messageData.id || 
              (msg.content === messageData.content && 
               Math.abs(new Date(msg.timestamp) - new Date(messageData.timestamp)) < 5000)
            );
            
            if (!exists) {
              console.log("Adding pending notification message:", messageData);
              return [...prev, messageData];
            }
            return prev;
          });
        }
        
        // Clear the pending message
        sessionStorage.removeItem('pendingMessage');
      } catch (error) {
        console.error("Error processing pending message:", error);
        sessionStorage.removeItem('pendingMessage');
      }
    }
  }, [recipientUser?._id]);

  // Load old messages when component mounts or users change
  useEffect(() => {
    const getOldMessages = async () => {
      if (!recipientUser?._id || !currentUser?._id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      hasLoadedOldMessages.current = false;
      
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API}/chat/get-messages`,
          {
            userId: currentUser._id,
            recipientId: recipientUser._id
          },
          {
            headers: {
              "Content-Type": "application/json"
            },
            withCredentials: true
          }
        );

        const data = res.data;
        console.log("Old messages loaded:", data);

        // Format messages with proper type based on sender
        const formattedMessages = data.map(msg => ({
          id: msg._id || msg.id,
          content: msg.message || msg.content,
          timestamp: msg.timestamp || msg.createdAt,
          sender: msg.sender,
          type: msg.sender === currentUser._id ? 'sent' : 'received'
        }));

        setMessages(formattedMessages);
        hasLoadedOldMessages.current = true;
        
        // Check for pending notification message after loading old messages
        setTimeout(() => {
          checkPendingMessage();
        }, 100);
        
      } catch (err) {
        console.error("Error fetching old messages:", err);
        setMessages([]);
        hasLoadedOldMessages.current = true;
        
        // Still check for pending message even if old messages failed to load
        setTimeout(() => {
          checkPendingMessage();
        }, 100);
      } finally {
        setIsLoading(false);
      }
    };

    getOldMessages();
  }, [recipientUser?._id, currentUser?._id, checkPendingMessage]);

  // Handle incoming messages without duplicating
  const handlePrivateMessage = useCallback((data) => {
    console.log("📨 Received message:", data);
    
    const newMessage = {
      id: data.id || Date.now(),
      content: data.message || data.content,
      timestamp: data.timestamp || new Date().toISOString(),
      sender: data.from || data.sender,
      type: 'received'
    };

    setMessages(prev => {
      // Check if message already exists to prevent duplicates
      const exists = prev.some(msg => 
        msg.id === newMessage.id || 
        (msg.content === newMessage.content && 
         msg.sender === newMessage.sender &&
         Math.abs(new Date(msg.timestamp) - new Date(newMessage.timestamp)) < 5000)
      );
      
      if (exists) {
        console.log("Duplicate message prevented");
        return prev;
      }
      
      return [...prev, newMessage];
    });
  }, []);

  // Handle sent message confirmation
  const handleMessageSent = useCallback((data) => {
    console.log("✅ Message sent confirmation:", data);
    
    const sentMessage = {
      id: data.id || Date.now(),
      content: data.message || data.content,
      timestamp: data.timestamp || new Date().toISOString(),
      sender: data.from || data.sender || currentUser._id,
      type: 'sent'
    };

    setMessages(prev => {
      // Check if message already exists to prevent duplicates
      const exists = prev.some(msg => 
        msg.id === sentMessage.id || 
        (msg.content === sentMessage.content && 
         msg.sender === sentMessage.sender &&
         Math.abs(new Date(msg.timestamp) - new Date(sentMessage.timestamp)) < 5000)
      );
      
      if (exists) {
        console.log("Duplicate sent message prevented");
        return prev;
      }
      
      return [...prev, sentMessage];
    });
  }, [currentUser._id]);

  // Socket connection and event listeners
  useEffect(() => {
    if (!recipientUser?._id || !currentUser?._id) return;

    let cleanupFn = null;

    const setupSocketListeners = () => {
      if (window.socket) {
        console.log("🎯 Setting up chat listeners for:", recipientUser.name);
        
        setSocketConnected(window.socket.connected);

        // Notify backend that user entered this chat
        window.socket.emit('enter-chat', {
          userId: currentUser._id,
          chatWith: recipientUser._id
        });

        // Remove existing listeners to prevent duplicates
        window.socket.off('privateMessage');
        window.socket.off('messageSent');
        window.socket.off('connect');
        window.socket.off('disconnect');
        
        // Add new listeners
        window.socket.on('privateMessage', handlePrivateMessage);
        window.socket.on('messageSent', handleMessageSent);
        window.socket.on('connect', () => setSocketConnected(true));
        window.socket.on('disconnect', () => setSocketConnected(false));

        cleanupFn = () => {
          console.log("🧹 Cleaning up chat listeners");
          
          // Notify backend that user left this chat
          window.socket.emit('leave-chat', {
            userId: currentUser._id
          });
          
          window.socket.off('privateMessage', handlePrivateMessage);
          window.socket.off('messageSent', handleMessageSent);
          window.socket.off('connect');
          window.socket.off('disconnect');
        };

        return true;
      }
      return false;
    };

    if (!setupSocketListeners()) {
      const interval = setInterval(() => {
        if (setupSocketListeners()) {
          clearInterval(interval);
        }
      }, 100);

      cleanupFn = () => {
        clearInterval(interval);
        if (window.socket) {
          window.socket.emit('leave-chat', { userId: currentUser._id });
          window.socket.off('privateMessage', handlePrivateMessage);
          window.socket.off('messageSent', handleMessageSent);
          window.socket.off('connect');
          window.socket.off('disconnect');
        }
      };
    }

    return cleanupFn;
  }, [recipientUser?._id, currentUser?._id, handlePrivateMessage, handleMessageSent]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !window.socket || !socketConnected) return;

    const messageData = {
      from: currentUser._id,
      to: recipientUser._id,
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    console.log("📤 Sending message:", messageData);
    window.socket.emit('privateMessage', messageData);
    setMessage('');
  };

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return 'Invalid time';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b flex items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
        <Link href={`/${recipientUser.type}/${recipientUser.userid}`} className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
            {recipientUser?.profileImage ? (
              <img 
                className='w-full h-full rounded-full object-cover' 
                src={recipientUser.profileImage} 
                alt={recipientUser.name || 'User'} 
              />
            ) : (
              <span className="text-sm font-medium text-primary">
                {recipientUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-medium">{recipientUser?.name || 'User'}</h3>
            <p className="text-xs text-muted-foreground">
              {socketConnected ? 'Online' : 'Offline'}
            </p>
          </div>
        </Link>
        <div className="ml-auto text-xs text-muted-foreground">
          {messages.length} messages
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 px-4 py-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p>Start your conversation with {recipientUser?.name}</p>
              <p className="text-xs mt-2 opacity-60">Messages are end-to-end encrypted</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  msg.type === 'sent'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-secondary text-secondary-foreground rounded-bl-md'
                } ${msg.isFromNotification ? 'ring-2 ring-blue-500/20 animate-pulse' : ''}`}
              >
                <p className="text-sm pt-1">{msg.content}</p>
                <p className={`text-xs mt-1 opacity-70 ${
                  msg.type === 'sent' ? 'text-right' : 'text-left'
                }`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${recipientUser?.name || 'user'}...`}
            className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-shadow"
            disabled={!socketConnected}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full shadow-sm hover:shadow-md transition-shadow"
            disabled={!message.trim() || !socketConnected}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        {!socketConnected && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            Connecting to chat...
          </p>
        )}
      </form>
    </div>
  );
}