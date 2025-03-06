'use client'
import React, { useState, useEffect } from 'react';
import { Calendar, Users, ExternalLink, Search, Filter, X } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useRouter } from 'next/navigation';
import Profile from '../Components/Profile/Profile';
import { ModeToggle } from '../Components/ModeToggle/ModeToggle';

const Page = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("events");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [org,setorg] = useState(null)
  const [Loading,setLoading] = useState(true)
  const[events,SetEvents] = useState(null);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);


  // Available filter options
  const categories = ["Academic", "Social", "Sports", "Workshop", "Hackathon"];
  const statuses = ["Open", "Closed", "Upcoming"];
  const tags = ["Engineering", "Business", "Arts", "Technology", "Research"];

  useEffect(() => {
      const fetchUserData = async () => {
        try {
          // Check if user is authenticated (has token)
          const accessToken = localStorage.getItem('accessToken');
  
          if (!accessToken) {
            setLoading(false);
            return; // User is not authenticated
          }
  
          const response = await fetch(`${process.env.NEXT_PUBLIC_API}/events/all`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            credentials: 'include',
          });
          console.log(response)
  
          if (response.ok) {
            const data = await response.json();
            SetEvents(data);
            console.log(data)
          } else {
            console.error('Failed to fetch user data');
            // Handle authentication error (e.g., token expired)
            if (response.status === 401) {
              // Clear tokens and redirect to login
              localStorage.removeItem('user');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
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
    }, [router]);


  useEffect(() => {
      const fetchUserData = async () => {
        try {
          // Check if user is authenticated (has token)
          const accessToken = localStorage.getItem('accessToken');
  
          if (!accessToken) {
            setLoading(false);
            return; // User is not authenticated
          }
  
          const response = await fetch(`${process.env.NEXT_PUBLIC_API}/org/all`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            credentials: 'include',
          });
  
          if (response.ok) {
            const data = await response.json();
            setorg(data);
          } else {
            console.error('Failed to fetch user data');
            // Handle authentication error (e.g., token expired)
            if (response.status === 401) {
              // Clear tokens and redirect to login
              localStorage.removeItem('user');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
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
    }, [router]);

    console.log(org)
    

  // Handle category filter toggle
  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(item => item !== category)
        : [...prev, category]
    );
  };

  // Handle status filter toggle
  const toggleStatus = (status) => {
    setSelectedStatuses(prev => 
      prev.includes(status)
        ? prev.filter(item => item !== status)
        : [...prev, status]
    );
  };

  // Handle tag filter toggle
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(item => item !== tag)
        : [...prev, tag]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setSelectedTags([]);
  };

  // Apply filters to events
  const filteredEvents = events?.filter(event => {
    // Search query filter
    const matchesSearch = 
      event?.eventName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event?.content?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategories?.length === 0 || selectedCategories?.includes(event.category);
    
    // Status filter
    const matchesStatus = selectedStatuses?.length === 0 || selectedStatuses?.includes(event?.status);
    
    // Tag filter (assuming events have tags property)
    const matchesTags = selectedTags.length === 0 || 
      (event.tags && selectedTags.some(tag => event.tags.includes(tag)));
    
    return matchesSearch && matchesCategory && matchesStatus && matchesTags;
  });

  // Apply filters to organizations
  const filteredOrganizations = org?.filter(org => {
    // Search query filter
    const matchesSearch = 
      org?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org?.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(org.category);
    
    // Tag filter (assuming orgs have tags property)
    const matchesTags = selectedTags.length === 0 || 
      (org.tags && selectedTags.some(tag => org.tags.includes(tag)));
    
    return matchesSearch && matchesCategory && matchesTags;
  });

  // Handle route navigation
  const handleOpenEvent = (id) => {
    router.push(`/events/${id}`);
  };

  const handleOpenOrganization = (id) => {
    router.push(`/organization/${id}`);
  };

  // Automatically hide filters on mobile when screen resizes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowFilters(true);
      } else {
        setShowFilters(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  

  // Count active filters
  const activeFilterCount = selectedCategories.length + selectedStatuses.length + selectedTags.length;

  // Filter sidebar component
  const FiltersComponent = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filters</h3>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs text-muted-foreground">
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-3 block">Categories</label>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center">
                <input 
                  type="checkbox" 
                  id={`category-${category}`} 
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="rounded text-primary focus:ring-primary mr-2" 
                />
                <label htmlFor={`category-${category}`} className="text-sm">{category}</label>
              </div>
            ))}
          </div>
        </div>

        {activeTab === "events" && (
          <div>
            <label className="text-sm font-medium mb-3 block">Status</label>
            <div className="space-y-2">
              {statuses.map((status) => (
                <div key={status} className="flex items-center">
                  <input 
                    type="checkbox"
                    id={`status-${status}`}
                    checked={selectedStatuses.includes(status)}
                    onChange={() => toggleStatus(status)}
                    className="rounded text-primary focus:ring-primary mr-2" 
                  />
                  <label htmlFor={`status-${status}`} className="text-sm">{status}</label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-3">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge 
              key={tag} 
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors",
                selectedTags.includes(tag) 
                  ? "hover:bg-primary/80" 
                  : "hover:bg-primary/10"
              )}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  // console.log()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Bar */}
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

      {/* Two-column layout for desktop */}
      <div className="flex-1 flex flex-col lg:flex-row container mx-auto px-4 py-6">
        {/* Sidebar for filters (desktop) */}
        <aside className={cn(
          "lg:block lg:w-64 lg:mr-8 lg:flex-shrink-0",
          showFilters ? "block mb-8" : "hidden"
        )}>
          <div className="lg:sticky lg:top-24">
            <FiltersComponent />
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1">
          {/* Mobile search */}
          <div className="lg:hidden mb-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 h-10 rounded-full bg-muted/50 border-0"
              />
            </div>
          </div>

          {/* Content header with controls */}
          <div className="mb-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Discover
              </h1>
              
              <div className="flex items-center gap-3">
                {/* Filter toggle for mobile/tablet */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="lg:hidden rounded-full gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                  {showFilters ? "Hide Filters" : "Filters"}
                  {activeFilterCount > 0 && (
                    <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
                
                {/* Mobile sheet filter for smaller screens */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="lg:hidden md:hidden rounded-full gap-2 sm:hidden"
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full sm:max-w-md">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="py-6">
                      <FiltersComponent />
                    </div>
                  </SheetContent>
                </Sheet>
                
                {/* View toggle */}
                <div className="bg-muted/50 rounded-full p-1 hidden md:flex">
                  <Button 
                    variant={viewType === "grid" ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setViewType("grid")}
                    className="rounded-full h-8 px-3"
                  >
                    Grid
                  </Button>
                  <Button 
                    variant={viewType === "list" ? "default" : "ghost"} 
                    size="sm" 
                    onClick={() => setViewType("list")}
                    className="rounded-full h-8 px-3"
                  >
                    List
                  </Button>
                </div>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full md:w-auto p-1 bg-muted/50 rounded-full">
                <TabsTrigger value="events" className="rounded-full px-6 py-1.5 data-[state=active]:bg-background">
                  Events {filteredEvents?.length > 0 && `(${filteredEvents?.length})`}
                </TabsTrigger>
                <TabsTrigger value="organizations" className="rounded-full px-6 py-1.5 data-[state=active]:bg-background">
                  Organizations {filteredOrganizations?.length > 0 && `(${filteredOrganizations?.length})`}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Active filters display */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {selectedCategories.map(category => (
                  <Badge 
                    key={`active-${category}`} 
                    variant="secondary"
                    className="px-2 py-1 gap-1 text-xs"
                  >
                    {category}
                    <button 
                      onClick={() => toggleCategory(category)}
                      className="ml-1 hover:text-primary"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {selectedStatuses.map(status => (
                  <Badge 
                    key={`active-${status}`} 
                    variant="secondary"
                    className="px-2 py-1 gap-1 text-xs"
                  >
                    {status}
                    <button 
                      onClick={() => toggleStatus(status)}
                      className="ml-1 hover:text-primary"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {selectedTags.map(tag => (
                  <Badge 
                    key={`active-${tag}`} 
                    variant="secondary"
                    className="px-2 py-1 gap-1 text-xs"
                  >
                    {tag}
                    <button 
                      onClick={() => toggleTag(tag)}
                      className="ml-1 hover:text-primary"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="h-7 px-2 text-xs rounded-full bg-muted/80 hover:bg-muted"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Events Grid/List View */}
          {activeTab === "events" && (
            <>
              {filteredEvents?.length > 0 ? (
                viewType === "grid" ? (
                  // Grid view
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredEvents?.map(event => (
                      <Card key={event.id} className="group bg-background border border-border/40 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <CardHeader className="p-0">
                          <div className="relative aspect-video overflow-hidden">
                            <img 
                              src={`${process.env.NEXT_PUBLIC_API}/events${event?.image_path}`} 
                              alt={`${event?.eventName }`}
                              
                              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                            <div className="absolute top-3 right-3 flex gap-2 flex-wrap justify-end">
                              <Badge variant="secondary" className="bg-background/95 backdrop-blur-md px-3 py-1 text-xs rounded-full">
                                {event?.category}
                              </Badge>
                              <Badge 
                                variant={event.status === "Open" ? "default" : "secondary"}
                                className="bg-background/95 backdrop-blur-md hover:bg-background/70 text-primary px-3 py-1 text-xs rounded-full"
                              >
                                {event?.status}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-5 space-y-3">
                          <CardTitle className="text-lg font-bold line-clamp-1">
                            {event.eventName}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5 text-primary" />
                              {/* <span>{event?.participants}</span> */}
                            </div>
                          </div>
                        </CardContent>

                        <CardFooter className="px-5 pb-5 pt-0">
                          <Button 
                            onClick={() => handleOpenEvent(event._id)} 
                            className="w-full gap-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm h-9"
                          >
                            View Details
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // List view
                  <div className="space-y-4">
                    {filteredEvents?.map(event => (
                      <Card key={event.id} className="group bg-background border border-border/40 rounded-xl overflow-hidden hover:shadow-md transition-all">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-64 shrink-0">
                            <div className="relative h-full aspect-video md:aspect-square overflow-hidden">
                              <img 
                                src={`${process.env.NEXT_PUBLIC_API}${event?.image_path}`} 
                                alt={event.title}
                                className="object-cover w-full h-full"
                              />
                              <div className="absolute top-2 left-2 flex gap-2">
                                <Badge variant="secondary" className="bg-background/95 backdrop-blur-md px-2 py-0.5 text-xs rounded-full">
                                  {event.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col flex-1 p-5">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-bold">{event.title}</h3>
                              <Badge 
                                variant={event.status === "Open" ? "default" : "secondary"}
                                className="ml-2 shrink-0"
                              >
                                {event.status}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-4">
                              {event.description}
                            </p>
                            
                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 text-primary" />
                                  <span>{new Date(event?.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Users className="h-3.5 w-3.5 text-primary" />
                                  {/* <span>{event?.participants} participants</span> */}
                                </div>
                              </div>
                              
                              <Button 
                                onClick={() => handleOpenEvent(event.id)} 
                                size="sm"
                                className="gap-1 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                              >
                                Details
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Search className="h-12 w-12 mb-4 text-muted-foreground/50" />
                  <p className="text-lg">No events found with your current filters.</p>
                  {activeFilterCount > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearFilters}
                      className="mt-4"
                    >
                      Clear all filters
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Organizations List/Grid View */}
          {activeTab === "organizations" && (
            <>
              {filteredOrganizations.length > 0 ? (
                viewType === "grid" ? (
                  // Grid view for organizations
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredOrganizations.map(org => (
                      <Card key={org.id} className="group bg-background border border-border/40 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <CardHeader className="p-0">
                          <div className="relative aspect-video overflow-hidden">
                            <img 
                              src={`${process.env.NEXT_PUBLIC_API}${org.profileImage}`} 
                              alt={org.name}
                              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                            <div className="absolute top-3 right-3">
                              <Badge variant="secondary" className="bg-background/95 backdrop-blur-md px-3 py-1 text-xs rounded-full">
                                {org.category}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-5 space-y-3">
                          <CardTitle className="text-lg font-bold line-clamp-1">
                            {org.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {org.description}
                          </p>
                          
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5 text-primary" />
                            <span>{org.members} members</span>
                          </div>
                        </CardContent>

                        <CardFooter className="px-5 pb-5 pt-0">
                          <Button 
                            onClick={() => handleOpenOrganization(org.id)} 
                            className="w-full gap-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm h-9"
                          >
                            View Organization
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // List view for organizations
                  <div className="space-y-4">
                    {filteredOrganizations.map(org => (
                      <Card key={org.id} className="group bg-background border border-border/40 rounded-xl overflow-hidden hover:shadow-md transition-all">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-64 shrink-0">
                            <div className="relative h-full aspect-video md:aspect-square overflow-hidden">
                              <img 
                                src={org.image} 
                                alt={org.name}
                                className="object-cover w-full h-full"
                              />
                              <div className="absolute top-2 left-2">
                                <Badge variant="secondary" className="bg-background/95 backdrop-blur-md px-2 py-0.5 text-xs rounded-full">
                                  {org.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col flex-1 p-5">
                            <h3 className="text-lg font-bold mb-2">{org.name}</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              {org.description}
                            </p>
                            
                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Users className="h-3.5 w-3.5 text-primary" />
                                <span>{org.members} members</span>
                              </div>
                              
                              <Button 
                                onClick={() => handleOpenOrganization(org.id)} 
                                size="sm"
                                className="gap-1 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                              >
                                View Details
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Search className="h-12 w-12 mb-4 text-muted-foreground/50" />
                  <p className="text-lg">No organizations found with your current filters.</p>
                  {activeFilterCount > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearFilters}
                      className="mt-4"
                    >
                      Clear all filters
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Page;