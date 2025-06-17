'use client'
import React, { useState, useEffect, useId } from 'react';
import { Bell, Check, X, Clock, MessageSquare, Heart, Share2, AlertCircle, CheckCircle2, Info, User, UserPlus, Menu } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Header from '../Components/Header/Header';
import UserProfile from '../Components/Feed/UserProfile';
import UserSuggestions from '../Components/UserProfile/UserSuggestions';
import axios from 'axios';

export default function NotificationPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'like',
      title: 'New Like',
      message: 'Sarah liked your post "Getting started with React"',
      time: '2 minutes ago',
      read: false,
      avatar: '👩‍💻',
      icon: Heart
    },
    {
      id: 2,
      type: 'comment',
      title: 'New Comment',
      message: 'John commented on your article about web development',
      time: '15 minutes ago',
      read: false,
      avatar: '👨‍💼',
      icon: MessageSquare
    },
    {
      id: 3,
      type: 'share',
      title: 'Post Shared',
      message: 'Alex shared your tutorial with their network',
      time: '1 hour ago',
      read: true,
      avatar: '👨‍🎨',
      icon: Share2
    },
    {
      id: 4,
      type: 'system',
      title: 'System Update',
      message: 'Your profile has been successfully updated',
      time: '2 hours ago',
      read: true,
      avatar: '⚙️',
      icon: CheckCircle2
    },
    {
      id: 5,
      type: 'warning',
      title: 'Security Alert',
      message: 'New login detected from a different device',
      time: '3 hours ago',
      read: false,
      avatar: '🔒',
      icon: AlertCircle
    },
    {
      id: 6,
      type: 'info',
      title: 'Feature Update',
      message: 'Check out our new dark mode feature!',
      time: '1 day ago',
      read: true,
      avatar: '🌙',
      icon: Info
    },
    // Add more notifications for testing scroll
    {
      id: 7,
      type: 'like',
      title: 'Another Like',
      message: 'Emma liked your recent post about TypeScript',
      time: '2 days ago',
      read: true,
      avatar: '👩‍🎨',
      icon: Heart
    },
    {
      id: 8,
      type: 'comment',
      title: 'New Comment',
      message: 'Michael replied to your comment on the React discussion',
      time: '3 days ago',
      read: true,
      avatar: '👨‍🔬',
      icon: MessageSquare
    }
  ]);

   useEffect(() => {
    const fetchUserData = async () => {
        try {
            setLoading(true);
            const userid = localStorage.getItem('UserId');
            console.log(userid);

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

    fetchUserData();
}, []);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationColor = (type) => {
    switch (type) {
      case 'like': return 'text-red-500';
      case 'comment': return 'text-blue-500';
      case 'share': return 'text-green-500';
      case 'system': return 'text-purple-500';
      case 'warning': return 'text-orange-500';
      case 'info': return 'text-cyan-500';
      default: return 'text-gray-500';
    }
  };

  const renderNotifications = (notificationList) => {
    if (notificationList.length === 0) {
      return (
        <Card>
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

    return notificationList.map((notification) => {
      const IconComponent = notification.icon;
      return (
        <Card key={notification.id} className={`transition-all hover:shadow-md ${!notification.read ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-lg">
                    {notification.avatar}
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
                      {notification.time}
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
                      onClick={() => markAsRead(notification.id)}
                      className="gap-1 h-7"
                    >
                      <Check className="h-3 w-3" />
                      <span className="hidden sm:inline">Mark Read</span>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteNotification(notification.id)}
                    className="gap-1 h-7 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
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
            {<UserProfile user={user}/>}
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

            {/* Notifications Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="all" className="text-sm">
                  All Notifications
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-sm">
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {renderNotifications(notifications)}
              </TabsContent>

              <TabsContent value="unread" className="space-y-4">
                {notifications.filter(n => !n.read).length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">All caught up!</h3>
                      <p className="text-muted-foreground text-center">
                        No unread notifications. You're doing great!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  renderNotifications(notifications.filter(n => !n.read))
                )}
              </TabsContent>
            </Tabs>
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