'use client'
import React, { useState } from 'react';
import { Bell, ChevronDown, User, LogOut, Settings, HelpCircle, Moon, Sun } from 'lucide-react';
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
import { toast } from "@/hooks/use-toast"; // Import toast if available

const Profile = () => {
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  
  // Logout function
  const handleLogout = async () => {
    try {
      // Get refresh token from localStorage if available
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Call the logout API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important to include cookies
        body: JSON.stringify({ refreshToken }), // Send as fallback in request body
      });
      
      if (response.ok) {
        // Clear any local storage items
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Show success toast if available
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
  
  return (
    <div className="flex items-center gap-2">
      
      {/* Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 hover:bg-accent rounded-lg">
            <Avatar className="h-8 w-8 border-2 border-primary">
              <AvatarImage src="/About.jpeg" alt="Profile" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium">John Doe</span>
              <span className="text-xs text-muted-foreground">Student</span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64 p-2">
          <div className="flex items-center p-2 bg-accent/50 rounded-md mb-2">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage src="/About.jpeg" alt="Profile" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="ml-3 space-y-0.5">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">john.doe@example.com</p>
              <Badge variant="outline" className="text-xs px-1.5 py-0">Free Plan</Badge>
            </div>
          </div>
          
          <DropdownMenuItem 
            onClick={() => router.push('/user/2')}
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