'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Send, Check, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import axios from 'axios';

export default function ChatBox({ recipientUser, currentUser, type }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [typingStatus, setTypingStatus] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const hasLoadedOldMessages = useRef(false);
  const visibilityRef = useRef(null);
  const readTimeoutRef = useRef(null);
  const isLoadingMoreRef = useRef(false);

  const MESSAGES_PER_PAGE = 10;

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? "smooth" : "instant" 
      });
    }
  };

  const scrollToPosition = (position) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = position;
    }
  };

  // Scroll to bottom for initial load and new messages, but not when loading more
  useEffect(() => {
    if (!isLoadingMore && hasLoadedOldMessages.current) {
      // Use instant scroll for initial load, smooth for new messages
      const shouldUseSmooth = messages.some(msg => msg.isFromNotification);
      scrollToBottom(shouldUseSmooth);
    }
  }, [messages, isLoadingMore]);

  // Intersection Observer for marking messages as read
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageElement = entry.target;
            const messageId = messageElement.getAttribute('data-message-id');
            const messageStatus = messageElement.getAttribute('data-message-status');
            const messageSender = messageElement.getAttribute('data-message-sender');
            
            if (messageId && messageSender !== currentUser?._id && messageStatus !== 'read') {
              markMessageAsRead(messageId);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    visibilityRef.current = observer;
    return () => observer.disconnect();
  }, [currentUser?._id]);

  // Mark message as read
  const markMessageAsRead = useCallback((messageId) => {
    if (!window.socket || !conversationId || !messageId) return;

    if (readTimeoutRef.current) {
      clearTimeout(readTimeoutRef.current);
    }

    readTimeoutRef.current = setTimeout(() => {
      console.log('📖 Marking message as read:', messageId);
      window.socket.emit('markMessageRead', {
        conversationId,
        messageId,
        userId: currentUser._id
      });
    }, 500);
  }, [conversationId, currentUser?._id]);

  // Mark all messages as read when entering chat
  const markAllMessagesAsRead = useCallback(() => {
    if (!window.socket || !conversationId) return;

    console.log('📖 Marking all messages as read');
    window.socket.emit('markAllMessagesRead', {
      conversationId,
      userId: currentUser._id
    });
  }, [conversationId, currentUser?._id]);

  // Check for pending notification message
  const checkPendingMessage = useCallback(() => {
    const pendingMessage = sessionStorage.getItem('pendingMessage');
    if (pendingMessage) {
      try {
        const messageData = JSON.parse(pendingMessage);
        
        if (messageData.sender === recipientUser?._id) {
          setMessages(prev => {
            const exists = prev.some(msg => 
              msg.id === messageData.id || 
              (msg.content === messageData.content && 
               Math.abs(new Date(msg.timestamp) - new Date(messageData.timestamp)) < 5000)
            );
            
            if (!exists) {
              console.log("Adding pending notification message:", messageData);
              return [...prev, { ...messageData, isFromNotification: true }];
            }
            return prev;
          });
        }
        
        sessionStorage.removeItem('pendingMessage');
      } catch (error) {
        console.error("Error processing pending message:", error);
        sessionStorage.removeItem('pendingMessage');
      }
    }
  }, [recipientUser?._id]);

  // Load messages with pagination
  const loadMessages = async (page = 0, isLoadMore = false) => {
    if (!recipientUser?._id || !currentUser?._id) {
      if (!isLoadMore) setIsLoading(false);
      return;
    }

    if (isLoadMore) {
      setIsLoadingMore(true);
      isLoadingMoreRef.current = true;
    } else {
      setIsLoading(true);
      hasLoadedOldMessages.current = false;
    }
    
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/chat/get-messages`,
        {
          userId: currentUser._id,
          recipientId: recipientUser._id,
          page: page,
          limit: MESSAGES_PER_PAGE
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true
        }
      );

      const data = res.data;

      // Set conversation ID
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      // Check if there are more messages to load
      setHasMoreMessages(data.hasMore || false);

      // Format messages with proper type and read status
      const formattedMessages = (data.messages || []).map(msg => {
        const isRead = msg.readBy?.some(read => read.userId === currentUser._id);
        const isSent = msg.sender === currentUser._id;
        
        return {
          id: msg.id || msg._id,
          content: msg.content || msg.message,
          timestamp: msg.timestamp || msg.createdAt,
          sender: msg.sender,
          type: isSent ? 'sent' : 'received',
          status: msg.status || (isRead ? 'read' : 'sent'),
          readBy: msg.readBy || []
        };
      });

      if (isLoadMore) {
        // Save current scroll position before adding new messages
        const container = messagesContainerRef.current;
        const scrollHeight = container.scrollHeight;
        const scrollTop = container.scrollTop;
        
        // Prepend older messages to the beginning
        setMessages(prev => [...formattedMessages, ...prev]);
        
        // Restore scroll position after new messages are added
        setTimeout(() => {
          const newScrollHeight = container.scrollHeight;
          const heightDifference = newScrollHeight - scrollHeight;
          container.scrollTop = scrollTop + heightDifference;
        }, 50);
      } else {
        setMessages(formattedMessages);
        hasLoadedOldMessages.current = true;
        
        // Scroll to bottom immediately after setting initial messages
        setTimeout(() => {
          scrollToBottom(false); // Use instant scroll for initial load
        }, 50);
        
        // Check for pending notification message after loading initial messages
        setTimeout(() => {
          checkPendingMessage();
        }, 100);
      }
      
    } catch (err) {
      console.error("Error fetching messages:", err);
      if (!isLoadMore) {
        setMessages([]);
        hasLoadedOldMessages.current = true;
        
        // Ensure scroll to bottom even when no messages
        setTimeout(() => {
          scrollToBottom(false);
        }, 50);
        
        setTimeout(() => {
          checkPendingMessage();
        }, 100);
      }
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false);
        isLoadingMoreRef.current = false;
      } else {
        setIsLoading(false);
      }
    }
  };

  // Load initial messages when component mounts or users change
  useEffect(() => {
    setCurrentPage(0);
    setHasMoreMessages(true);
    loadMessages(0, false);
  }, [recipientUser?._id, currentUser?._id, checkPendingMessage]);

  // Handle scroll event for loading more messages
  const handleScroll = useCallback((e) => {
    const container = e.target;
    const scrollTop = container.scrollTop;
    
    // Load more messages when user scrolls to top and there are more messages
    if (scrollTop < 100 && hasMoreMessages && !isLoadingMore && !isLoadingMoreRef.current) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadMessages(nextPage, true);
    }
  }, [currentPage, hasMoreMessages, isLoadingMore]);

  // Handle incoming messages without duplicating
  const handlePrivateMessage = useCallback((data) => {
    const newMessage = {
      id: data.id || Date.now(),
      content: data.message || data.content,
      timestamp: data.timestamp || new Date().toISOString(),
      sender: data.from?._id || data.from || data.sender,
      type: 'received',
      status: 'sent',
      readBy: []
    };

    setMessages(prev => {
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

    if (data.conversationId) {
      setConversationId(data.conversationId);
    }
  }, []);

  // Handle sent message confirmation
  const handleMessageSent = useCallback((data) => {
    console.log("✅ Message sent confirmation:", data);
    
    const sentMessage = {
      id: data.id || Date.now(),
      content: data.message || data.content,
      timestamp: data.timestamp || new Date().toISOString(),
      sender: data.from?._id || data.from || data.sender || currentUser._id,
      type: 'sent',
      status: data.status || 'sent',
      readBy: []
    };

    setMessages(prev => {
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

    if (data.conversationId) {
      setConversationId(data.conversationId);
    }
  }, [currentUser._id]);

  // Handle message read receipt
  const handleMessageRead = useCallback((data) => {
    console.log("📖 Message read receipt:", data);
    
    setMessages(prev => prev.map(msg => {
      if (msg.id === data.messageId) {
        return {
          ...msg,
          status: 'read',
          readBy: [...(msg.readBy || []), {
            userId: data.readBy,
            readAt: data.timestamp
          }]
        };
      }
      return msg;
    }));
  }, []);

  // Handle all messages read receipt
  const handleAllMessagesRead = useCallback((data) => {
    console.log("📖 All messages read receipt:", data);
    
    setMessages(prev => prev.map(msg => {
      if (msg.sender === currentUser._id && msg.status !== 'read') {
        return {
          ...msg,
          status: 'read',
          readBy: [...(msg.readBy || []), {
            userId: data.readBy,
            readAt: data.timestamp
          }]
        };
      }
      return msg;
    }));
  }, [currentUser._id]);

  // Socket connection and event listeners
  useEffect(() => {
    if (!recipientUser?._id || !currentUser?._id) return;

    let cleanupFn = null;

    const setupSocketListeners = () => {
      if (window.socket) {
        console.log("🎯 Setting up chat listeners for:", recipientUser.name);
        
        setSocketConnected(window.socket.connected);
        console.log("socket connection", window.socket.connected);

        window.socket.emit('enter-chat', {
          userId: currentUser._id,
          chatWith: recipientUser._id
        });

        window.socket.off('privateMessage');
        window.socket.off('messageSent');
        window.socket.off('messageRead');
        window.socket.off('allMessagesRead');
        window.socket.off('connect');
        window.socket.off('disconnect');
        
        window.socket.on('privateMessage', handlePrivateMessage);
        window.socket.on('messageSent', handleMessageSent);
        window.socket.on('messageRead', handleMessageRead);
        window.socket.on('allMessagesRead', handleAllMessagesRead);
        window.socket.on('connect', () => setSocketConnected(true));
        window.socket.on('disconnect', () => setSocketConnected(false));

        cleanupFn = () => {
          console.log("🧹 Cleaning up chat listeners");
          
          window.socket.emit('leave-chat', {
            userId: currentUser._id
          });
          
          window.socket.off('privateMessage', handlePrivateMessage);
          window.socket.off('messageSent', handleMessageSent);
          window.socket.off('messageRead', handleMessageRead);
          window.socket.off('allMessagesRead', handleAllMessagesRead);
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
          window.socket.off('messageRead', handleMessageRead);
          window.socket.off('allMessagesRead', handleAllMessagesRead);
          window.socket.off('connect');
          window.socket.off('disconnect');
        }
      };
    }

    return cleanupFn;
  }, [recipientUser?._id, currentUser?._id, handlePrivateMessage, handleMessageSent, handleMessageRead, handleAllMessagesRead]);

  // Mark all messages as read when component mounts and messages are loaded
  useEffect(() => {
    if (hasLoadedOldMessages.current && conversationId && messages.length > 0) {
      setTimeout(() => {
        markAllMessagesAsRead();
      }, 1000);
    }
  }, [hasLoadedOldMessages.current, conversationId, markAllMessagesAsRead]);

  // Observe messages for read receipts
  useEffect(() => {
    if (!visibilityRef.current) return;

    const messageElements = document.querySelectorAll('[data-message-id]');
    messageElements.forEach(element => {
      visibilityRef.current.observe(element);
    });

    return () => {
      if (visibilityRef.current) {
        messageElements.forEach(element => {
          visibilityRef.current.unobserve(element);
        });
      }
    };
  }, [messages]);

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

  const getMessageStatusIcon = (msg) => {
    if (msg.type !== 'sent') return null;
    
    if (msg.status === 'read') {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    } else {
      return <Check className="h-3 w-3 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b flex items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
        <Link href={`/${type}/${recipientUser.userid}`} className="flex items-center gap-3">
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
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 px-4 py-4 overflow-y-auto space-y-4"
        onScroll={handleScroll}
      >
        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading older messages...</span>
            </div>
          </div>
        )}

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
              data-message-id={msg.id}
              data-message-status={msg.status}
              data-message-sender={msg.sender}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  msg.type === 'sent'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-secondary text-secondary-foreground rounded-bl-md'
                } ${msg.isFromNotification ? 'ring-2 ring-blue-500/20 animate-pulse' : ''}`}
              >
                <p className="text-sm pt-1">{msg.content}</p>
                <div className={`flex items-center gap-1 mt-1 ${
                  msg.type === 'sent' ? 'justify-end' : 'justify-start'
                }`}>
                  <p className="text-xs opacity-70">
                    {formatTime(msg.timestamp)}
                  </p>
                  {getMessageStatusIcon(msg)}
                </div>
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