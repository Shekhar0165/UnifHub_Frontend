'use client'
import React, { useState, useEffect } from 'react';
import {
  Bell, Check, CheckCheck, X, Clock, MessageSquare, Heart, Share2, AlertCircle, CheckCircle2, Info, User, UserPlus, Menu,
  MessageCircle,
  Server,
  AlertTriangle,
  BellRing,
  XCircle,
  Users,
  Ban,
  PartyPopper,
  RefreshCcw

} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Header from '../Components/Header/Header';
import UserProfile from '../Components/Feed/UserProfile';
import UserSuggestions from '../Components/UserProfile/UserSuggestions';
import axios from 'axios';
import Link from 'next/link';

export default function NotificationPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalNotifications, setTotalNotifications] = useState(0);
   const [notificationData, setNotificationData] = useState(null);

  // Helper function to refresh tokens (implement according to your auth system)
  const refreshTokens = async () => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/auth/refresh`, {}, {
        withCredentials: true
      });
      return response.data.accessToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  };


  // Updated fetchNotifications function for infinite scroll
  const fetchNotifications = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      console.log(`Fetching notifications - Page: ${page}`);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/notification/all`, {
        params: { page, limit: 10 },
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Notifications response:', res.data);
      const newNotifications = res.data.notifications || [];
      const paginationData = res.data.pagination || {};

      if (append && page > 1) {
        // Append new notifications to existing ones
        setNotifications(prev => [...prev, ...newNotifications]);
      } else {
        // Replace notifications (first load)
        setNotifications(newNotifications);
      }

      setCurrentPage(page);
      setHasMore(paginationData.hasNextPage || false);
      setTotalNotifications(paginationData.totalNotifications || 0);

    } catch (error) {
      console.error("Failed to fetch notifications:", error);

      // If unauthorized, try to refresh token and retry
      if (error.response && error.response.status === 401) {
        try {
          const newAccessToken = await refreshTokens();
          if (newAccessToken) {
            const retryResponse = await axios.get(`${process.env.NEXT_PUBLIC_API}/notification/all`, {
              params: { page, limit: 10 },
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
              }
            });

            console.log('Retry notifications response:', retryResponse.data);
            const newNotifications = retryResponse.data.notifications || [];
            const paginationData = retryResponse.data.pagination || {};

            if (append && page > 1) {
              setNotifications(prev => [...prev, ...newNotifications]);
            } else {
              setNotifications(newNotifications);
            }

            setCurrentPage(page);
            setHasMore(paginationData.hasNextPage || false);
            setTotalNotifications(paginationData.totalNotifications || 0);
          }
        } catch (retryError) {
          console.error('Failed to fetch notifications after refreshing token:', retryError);
        }
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more notifications (for infinite scroll)
  const loadMoreNotifications = () => {
    if (!loadingMore && hasMore) {
      fetchNotifications(currentPage + 1, true);
    }
  };

  // Infinite scroll hook
  useEffect(() => {
    const handleScroll = () => {
      // Check if user scrolled near bottom (within 100px)
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
        loadMoreNotifications();
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, currentPage]);

  // Update the initial data fetch useEffect
  useEffect(() => {
    fetchUserData();
    fetchNotifications(1, false); // Start with page 1, don't append
  }, []);

  // Reset notifications when new real-time notification arrives
  useEffect(() => {
    // When new notifications come via socket, reset to page 1
    if (notifications.length > 0) {
      // Reset pagination state when new notifications arrive
      setCurrentPage(1);
      setHasMore(true);
    }
  }, [refreshKey]);

  // Loading more component
  const LoadingMore = () => {
    if (!loadingMore || !hasMore) return null;

    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
        <span className="text-muted-foreground">Loading more notifications...</span>
      </div>
    );
  };

  // End of notifications indicator
  const EndOfNotifications = () => {
    if (hasMore || notifications.length === 0) return null;

    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">You've reached the end!</p>
          <p className="text-xs text-muted-foreground">No more notifications to load</p>
        </div>
      </div>
    );
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userid = localStorage.getItem('UserId');
      console.log('User ID:', userid);

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/user/profile/${userid}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);

      // If unauthorized, try to refresh token and retry
      if (error.response && error.response.status === 401) {
        try {
          const newAccessToken = await refreshTokens();
          if (newAccessToken) {
            const userid = localStorage.getItem('UserId');
            const retryResponse = await axios.get(`${process.env.NEXT_PUBLIC_API}/user/profile/${userid}`, {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
              },
            });

            setUser(retryResponse.data);
          }
        } catch (retryError) {
          console.error('Failed to fetch user data after refreshing token:', retryError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
    fetchNotifications();
  }, []);

  // Helper function to get icon component from icon name string
  const getIconComponent = (iconName) => {
  const iconMap = {
    'Heart': Heart,
    'MessageSquare': MessageSquare,
    'Share2': Share2,
    'AlertCircle': AlertCircle,
    'CheckCircle2': CheckCircle2,
    'Info': Info,
    'User': User,
    'UserPlus': UserPlus,
    'CheckCircle': CheckCircle2,
    'XCircle': XCircle,
    'PartyPopper': PartyPopper,
    'BellRing': BellRing,
    'Bell': Bell,
  };
  return iconMap[iconName] || Bell;
};

  // Helper function to format time from Date string
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));

      if (diffInMinutes < 1) return 'just now';
      if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'some time ago';
    }
  };

  // Socket connection and real-time notifications
  useEffect(() => {
    // Check if socket is available
    if (!window.socket) {
      console.warn('Socket not available yet. Notifications will not work in real-time.');
      return;
    }


    // Handle like notifications
    const handleNotification = (data) => {
      const processedNotification = {
        ...data,
      };


      setNotifications(prev => {
        const newNotifications = [processedNotification, ...prev];
        console.log('Updated notifications after like:', newNotifications);
        return newNotifications;
      });

      // Force re-render
      setRefreshKey(prevKey => prevKey + 1);
    };


    // Remove existing listeners to prevent duplicates
    window.socket.off("Notification");

    // Add new listeners
    window.socket.on("Notification", handleNotification);

    // Cleanup function
    return () => {
      if (window.socket) {
        window.socket.off("Notification");
      }
    };
  }, []);

  // Mark a single notification as read
  const markAsRead = async (id) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API}/notification/mark-as-read/${id}`, {}, {
        withCredentials: true
      });
      setNotifications(prev => prev.map(notif => notif._id === id ? { ...notif, read: true } : notif));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API}/notification/mark-all-read`, {}, {
        withCredentials: true
      });
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API}/notification/delete/${id}`, {
        withCredentials: true
      });

      // Update state - React will re-render
      setNotifications(prev => prev.filter(notif => notif._id !== id));

    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'like': return 'text-red-500';
      case 'comment': return 'text-blue-500';
      case 'share': return 'text-green-500';
      case 'follow': return 'text-purple-500';
      case 'system': return 'text-purple-500';
      case 'warning': return 'text-orange-500';
      case 'alert': return 'text-red-600';
      case 'error': return 'text-red-600';
      case 'info': return 'text-cyan-500';
      case 'join': return 'text-green-500';
      case 'confirm': return 'text-teal-500';
      case 'success': return 'text-emerald-500';
      case 'reject': return 'text-rose-500';
      case 'canceled': return 'text-yellow-600';
      case 'congratulation': return 'text-amber-500';
      case 'update': return 'text-indigo-500';
      default: return 'text-gray-500';
    }
  };


  const renderNotifications = (notificationList) => {

    if (notificationList.length === 0) {
      return (
        <Card key={`empty-${refreshKey}`}>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No notifications</h3>
            <p className="text-muted-foreground text-center">
              You're all caught up! New notifications will appear here.
            </p>
          </CardContent>
        </Card>
      );
    }

    return notificationList.map((notification, index) => {
      // Handle icon component
      const IconComponent = getIconComponent(notification.icon);

      return (
        <Card key={notification._id} className={`transition-all my-2 hover:shadow-md `}>
          <CardContent className="p-4 hover:bg-primary/10 rounded-lg transition-all ease-in-out duration-150">
            <Link href={notification.link}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-lg">
                      {notification.avatar || '👤'}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                      <IconComponent className="h-3 w-3" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-foreground truncate">
                      {notification.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(notification.time)}
                      </span>
                      {!notification.read && (
                        <div className="h-2 w-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(notification._id)}
                        className="gap-1 h-7"
                      >
                        <Check className="h-3 w-3" />
                        <span className="hidden sm:inline">Mark Read</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNotification(notification._id)}
                      className="gap-1 h-7 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      );
    });
  };


  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Profile (sticky on desktop) */}
          <div className="hidden lg:block flex-shrink-0">
            {user && <UserProfile user={user} />}
          </div>

          {/* Main Content - Notifications */}
          <div className="flex-1 min-w-0">
            {/* Notifications Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-foreground" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Notifications</h1>
                  <p className="text-sm text-muted-foreground">
                    {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="outline" size="sm" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Mark All Read</span>
                  <span className="sm:hidden">Mark All</span>
                </Button>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Notifications Tabs */}
            {/* Notifications Tabs */}
            {!loading && (
              <Tabs defaultValue="unread" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="unread" className="text-sm">
                    Unread {unreadCount > 0 && `(${unreadCount})`}
                  </TabsTrigger>
                  <TabsTrigger value="all" className="text-sm">
                    All Notifications ({totalNotifications})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="unread" className="space-y-4">
                  {notifications.filter(n => !n.read).length === 0 ? (
                    <Card key={`unread-empty-${refreshKey}`}>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">All caught up!</h3>
                        <p className="text-muted-foreground text-center">
                          No unread notifications. You're doing great!
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div key={`unread-list-${refreshKey}`}>
                      {renderNotifications(notifications.filter(n => !n.read))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="all" className="space-y-4">
                  <div key={`all-notifications-${refreshKey}`}>
                    {renderNotifications(notifications)}
                  </div>
                  {/* Loading more indicator */}
                  <LoadingMore />
                  {/* End of notifications indicator */}
                  <EndOfNotifications />
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Right Sidebar - User Suggestions (sticky on desktop) */}
          <div className="hidden xl:block xl:w-80 flex-shrink-0">
            <UserSuggestions />
          </div>
        </div>
      </main>
    </div>
  );
}