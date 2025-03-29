'use client'
import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, User, LogOut, Settings, HelpCircle, Pencil, Moon, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from '../ModeToggle/ModeToggle';
import { toast } from "@/hooks/use-toast";
import Cookies from 'js-cookie';

const Profile = () => {
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const UserType = localStorage.getItem('UserType');

  const endpoint = UserType === 'individual'
    ? `${process.env.NEXT_PUBLIC_API}/user/one`
    : `${process.env.NEXT_PUBLIC_API}/org`;

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if user is authenticated (has token)

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error('Failed to fetch user data');
          // Handle authentication error (e.g., token expired)
          if (response.status === 401) {
            // Clear tokens and redirect to login
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            Cookies.remove('UserType');
            Cookies.remove('UserId');
            router.push('/');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router, endpoint]);

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!userData || !userData.name) return 'U';

    // Get first letter of first name
    const nameParts = userData.name.split(' ');
    return nameParts[0].charAt(0).toUpperCase();
  };

  // Logout function
  const handleLogout = async () => {
    try {

      // Call the logout API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/logout`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important to include cookies
      });

      if (response.ok) {
        // Show success toast if available
        localStorage.removeItem('UserType')
        localStorage.removeItem('UserId')

        if (typeof toast === 'function') {
          toast({
            title: "Logged out",
            description: "You have been successfully logged out.",
            variant: "success",
          });
        }
        // Redirect to login page
        router.push('/');
      } else {
        console.error('Logout failed');
        if (typeof toast === 'function') {
          toast({
            title: "Logout failed",
            description: "There was a problem logging you out. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error during logout:', error);
      if (typeof toast === 'function') {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // If loading or not authenticated, show loading or login button
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
          <span className="sr-only">Loading</span>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </Button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => router.push('/')}>
          Login
        </Button>
      </div>
    );
  }

  const HandleSendToProfile = () => {
    const newroute = UserType === 'individual'
      ? `/user/${userData.userid}`
      : `/organization/${userData.userid}`
    router.push(newroute)
  }

  const HandleEditButton = () => {
    const newEdit = UserType === 'individual'
      ? `/user/${userData.userid}`
      : `/organization/${userData.userid}`
    router.push(`${newEdit}/edit`)
  }
  return (
    <div className="flex items-center gap-2">

      {/* Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 hover:bg-accent rounded-lg">
            <Avatar className="h-8 w-8 border-2 border-primary">
              {userData.profileImage ? (
                <AvatarImage
                  src={`${process.env.NEXT_PUBLIC_API}${userData?.profileImage}`}
                  alt={userData.name || 'Profile'}
                />
              ) : null}
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium">{userData.name || 'User'}</span>
              <span className="text-xs text-muted-foreground">{UserType || 'Student'}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64 p-2">
          <div className="flex items-center p-2 bg-accent/50 rounded-md mb-2">
            <Avatar className="h-10 w-10 border-2 border-primary">
              {userData.profileImage ? (
                <AvatarImage
                  src={`${process.env.NEXT_PUBLIC_API}/uploads/${userData.profileImage}`}
                  alt={userData.name || 'Profile'}
                />
              ) : null}
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="ml-3 space-y-0.5">
              <p className="text-sm font-medium">{userData.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{userData.email || ''}</p>
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                {userData.subscription || 'Free Plan'}
              </Badge>
            </div>
          </div>

          <DropdownMenuItem
            onClick={HandleSendToProfile}
            className="flex items-center cursor-pointer rounded-md p-2 hover:bg-accent"
          >
            <User className="mr-2 h-4 w-4" />
            <div className="flex flex-col">
              <span>Profile</span>
              <span className="text-xs text-muted-foreground">View and edit your profile</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push('/settings')}
            className="flex items-center cursor-pointer rounded-md p-2 hover:bg-accent"
          >
            <Settings className="mr-2 h-4 w-4" />
            <div className="flex flex-col">
              <span>Settings</span>
              <span className="text-xs text-muted-foreground">Manage your preferences</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={HandleEditButton}
            className="flex items-center cursor-pointer rounded-md p-2 hover:bg-accent"
          >
            <Pencil className="mr-2 h-4 w-4" />
            <div className="flex flex-col">
              <span>Edit</span>
              <span className="text-xs text-muted-foreground">Get assistance</span>
            </div>
          </DropdownMenuItem>


          <DropdownMenuItem
            onClick={() => router.push('/help')}
            className="flex items-center cursor-pointer rounded-md p-2 hover:bg-accent"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            <div className="flex flex-col">
              <span>Help & Support</span>
              <span className="text-xs text-muted-foreground">Get assistance</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center cursor-pointer rounded-md p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Profile;