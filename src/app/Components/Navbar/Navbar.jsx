'use client';
import React, { useState } from 'react';
import { ModeToggle } from '../ModeToggle/ModeToggle';
import { Menu, X, LogIn, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="z-10">
      <div className="px-4 md:px-14 py-4">
        {/* Main navbar container */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="text-2xl font-bold">
            Unifhub
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <a href="https://www.google.com" className="relative font-semibold transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Home</a>
            <a href="#" className="relative font-semibold transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">About</a>
            <a href="#" className="relative font-semibold transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Events</a>
            <a href="#" className="relative font-semibold transition-colors after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-primary after:scale-x-0 after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300">Clubs</a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-primary text-background hover:bg-primary/90">
                  Get Started
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40" align="end">
                <DropdownMenuItem
                  onClick={() => router.push('/login')}
                  className="cursor-pointer flex items-center gap-2 focus:bg-primary focus:text-background"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push('/register')}
                  className="cursor-pointer flex items-center gap-2 focus:bg-primary focus:text-background"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className={`flex justify-center gap-3 md:hidden`}>
            <div className="w-fit">
              <ModeToggle />
            </div>
            <button
              onClick={toggleMenu}
              className="block md:hidden"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`${isOpen ? 'block' : 'hidden'} md:hidden pt-4 pb-2`}>
          <div className="flex flex-col gap-4">
            <a href="#" className="font-semibold py-2 hover:text-primary transition-all focus:bg-primary focus:text-background focus:rounded-lg focus:px-4 duration-300 ease-in-out">Home</a>
            <a href="#" className="font-semibold py-2 hover:text-primary transition-all focus:bg-primary focus:text-background focus:rounded-lg focus:px-4 duration-300 ease-in-out">About</a>
            <a href="#" className="font-semibold py-2 hover:text-primary transition-all focus:bg-primary focus:text-background focus:rounded-lg focus:px-4 duration-300 ease-in-out">Events</a>
            <a href="#" className="font-semibold py-2 hover:text-primary transition-all focus:bg-primary focus:text-background focus:rounded-lg focus:px-4 duration-300 ease-in-out">Clubs</a>
          </div>

          <div className="flex flex-col gap-4 pt-4 mt-4 border-t">
            <Button className="w-full bg-primary text-background hover:bg-primary/90" onClick={() => router.push('/login')}>
              Login
            </Button>
            <Button className="w-full bg-primary text-background hover:bg-primary/90" onClick={() => router.push('/register')}>
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
