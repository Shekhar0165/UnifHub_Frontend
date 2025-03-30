'use client';
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import Profile from '../../Components/Profile/Profile';
import { ModeToggle } from '../Components/ModeToggle/ModeToggle';

const Header = ({ searchQuery, setSearchQuery }) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Unifhub
            </div>
            <div className="hidden md:flex relative max-w-md w-full">
              <div className="relative group w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  type="search"
                  placeholder="Search events, organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 h-9 rounded-full bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Profile />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;