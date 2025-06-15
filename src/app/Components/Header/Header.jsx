import React, { useState, useEffect, useRef } from 'react';
import { ModeToggle } from '../ModeToggle/ModeToggle';
import Profile from '../Profile/Profile';
import Link from 'next/link';
import { Search, X, Loader2, User, Home, CalendarDays, Menu, X as Close, MessageCircle, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import axios from 'axios';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounce search to prevent too many requests
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

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
        // Fixed: Use 'results' instead of 'members' and add fallback
        setSearchResults(response.data.results || []);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Function to truncate bio text
  const truncateBio = (bio, maxLength = 50) => {
    if (!bio) return "";
    return bio.length > maxLength ? bio.substring(0, maxLength) + "..." : bio;
  };

  // Check if the current route matches
  const isActive = (path) => {
    return pathname === path;
  };

  // Render search result item
  const renderSearchResult = (item) => {
    const isOrganization = item.type === 'organization';
    const displayName = item.name || 'Unknown';
    const displayBio = item.bio ? truncateBio(item.bio, 60) : (item.university || item.location || "");
    
    return (
      <li key={item._id} className="px-1">
        <Link
          href={`/${isOrganization ? 'organization' : 'user'}/${item.userid}`}
          className="flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors"
          onClick={() => {
            setShowResults(false);
            setShowMobileSearch(false);
          }}
        >
          <div className="relative flex-shrink-0 w-12 h-12">
            {item.profileImage ? (
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                <Image
                  src={item.profileImage}
                  alt={displayName}
                  fill
                  sizes="48px"
                  className="object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add('fallback-active');
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 fallback">
                  {isOrganization ? (
                    <Building className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <span className="text-lg font-medium text-muted-foreground">
                  {displayName?.charAt(0).toUpperCase() || 
                    (isOrganization ? <Building className="h-5 w-5" /> : <User className="h-5 w-5" />)
                  }
                </span>
              </div>
            )}
            {/* Type indicator */}
            {isOrganization && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <Building className="h-2.5 w-2.5 text-primary-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground truncate">{displayName}</p>
              {isOrganization && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Org
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {displayBio}
            </p>
          </div>
        </Link>
      </li>
    );
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mr-4 lg:mr-6">
              Unifhub
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:block mx-4 relative" ref={searchRef}>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users and organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowResults(true)}
                  className="w-full pl-10 pr-10 h-10 rounded-full bg-muted/50 border-0"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-primary"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute mt-2 w-full md:w-96 bg-background rounded-md shadow-lg border border-border z-40 max-h-80 overflow-y-auto">
                  <div className="p-2 border-b border-border">
                    <h3 className="text-sm font-medium text-muted-foreground">Search Results</h3>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center p-6">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      {searchResults && searchResults.length > 0 ? (
                        <ul className="py-1">
                          {searchResults.map((item) => renderSearchResult(item))}
                        </ul>
                      ) : (
                        searchQuery.trim() && (
                          <div className="flex flex-col items-center justify-center py-8 px-4">
                            <Search className="h-10 w-10 text-muted-foreground opacity-40 mb-2" />
                            <p className="text-center text-muted-foreground">No results found matching "{searchQuery}"</p>
                          </div>
                        )
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Side Items */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Search Button */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
            >
              <Search size={20} />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link href="/feed">
                <Button
                  variant="ghost"
                  className={`flex items-center gap-2 px-4 py-2 transition-all ${isActive('/feed')
                      ? "border-b-2 border-primary text-primary font-medium rounded-t-md rounded-b-none"
                      : "hover:bg-muted/40"
                    }`}
                >
                  <Home size={isActive('/feed') ? 22 : 20} strokeWidth={isActive('/feed') ? 2.5 : 2} />
                  <span>Home</span>
                </Button>
              </Link>
              <Link href="/events">
                <Button
                  variant="ghost"
                  className={`flex items-center gap-2 px-4 py-2 transition-all ${isActive('/events')
                      ? "border-b-2 border-primary text-primary font-medium rounded-t-md rounded-b-none"
                      : "hover:bg-muted/40"
                    }`}
                >
                  <CalendarDays size={isActive('/events') ? 22 : 20} strokeWidth={isActive('/events') ? 2.5 : 2} />
                  <span>Events</span>
                </Button>
              </Link>
              <Link href="/messages">
                <Button
                  variant="ghost"
                  className={`flex items-center gap-2 px-4 py-2 transition-all ${isActive('/messages')
                      ? "border-b-2 border-primary text-primary font-medium rounded-t-md rounded-b-none"
                      : "hover:bg-muted/40"
                    }`}
                >
                  <MessageCircle size={isActive('/messages') ? 22 : 20} strokeWidth={isActive('/messages') ? 2.5 : 2} />
                  <span>Message</span>
                </Button>
              </Link>
            </nav>

            {/* Dark Mode Toggle and Profile */}
            <ModeToggle />
            <Profile />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
            >
              {mobileMenuOpen ? <Close size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="md:hidden pt-2 pb-3 px-2" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users and organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowResults(true)}
                className="w-full pl-10 pr-10 h-10 rounded-full bg-muted/50 border-0"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-primary"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Mobile Search Results */}
            {showResults && (
              <div className="mt-2 w-full bg-background rounded-md shadow-lg border border-border z-40 max-h-80 overflow-y-auto">
                <div className="p-2 border-b border-border">
                  <h3 className="text-sm font-medium text-muted-foreground">Search Results</h3>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center p-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {searchResults && searchResults.length > 0 ? (
                      <ul className="py-1">
                        {searchResults.map((item) => renderSearchResult(item))}
                      </ul>
                    ) : (
                      searchQuery.trim() && (
                        <div className="flex flex-col items-center justify-center py-8 px-4">
                          <Search className="h-10 w-10 text-muted-foreground opacity-40 mb-2" />
                          <p className="text-center text-muted-foreground">No results found matching "{searchQuery}"</p>
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 px-2 border-t">
            <nav className="flex justify-around">
              <Link
                href="/"
                className={`flex flex-col items-center px-3 py-2 rounded-md transition-colors ${isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={20} />
                <span className="text-xs mt-1">Home</span>
              </Link>
              <Link
                href="/events"
                className={`flex flex-col items-center px-3 py-2 rounded-md transition-colors ${isActive('/events') ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <CalendarDays size={20} />
                <span className="text-xs mt-1">Events</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}