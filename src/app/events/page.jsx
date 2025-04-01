'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import FilterSidebar from '../Components/Events/FilterSidebar';
import Header from '../Components/Header/Header';
import TabsSection from '../Components/Events/TabsSection';
import NoResultsFound from '../Components/Events/NoResultsFound';
import EventsGrid from '../Components/Events/EventsGrid';
import OrganizationsGrid from '../Components/Events/OrganizationsGrid';
import { authenticatedFetch } from '@/utils/authUtils';
// This prevents this page from being pre-rendered statically
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const Page = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("events");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  // Available filter options
  const categories = ["Academic", "Social", "Sports", "Workshop", "Hackathon"];
  const statuses = ["Open", "Closed", "Upcoming"];
  const tags = ["Engineering", "Business", "Arts", "Technology", "Research"];

  // Ensure we only run client-side code after component mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run this effect on the client side after component is mounted
    if (!isMounted) return;

    const fetchEvents = async () => {
      try {
        const data = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_API}/events/all`,
          { method: 'GET' },
          router
        );
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [router, isMounted]);

  useEffect(() => {
    // Only run this effect on the client side after component is mounted
    if (!isMounted) return;

    const fetchOrganizations = async () => {
      try {
        const data = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_API}/org/all`,
          { method: 'GET' },
          router
        );
        setOrg(data);
      } catch (error) {
        console.error('Error fetching organization data:', error);
      }
    };

    fetchOrganizations();
  }, [router, isMounted]);

  // Only render content after component has mounted on the client
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading events..." />
      </div>
    );
  }

  // The rest of the component logic
  // ... existing code ...

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
    const matchesTags = selectedTags?.length === 0 ||
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

  // Calculate active filter count
  const activeFilterCount = selectedCategories.length + selectedStatuses.length + selectedTags.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Bar */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Two-column layout */}
      <div className="flex-1 flex flex-col lg:flex-row container mx-auto px-4 py-6">
        {/* Sidebar for filters */}
        <aside className={cn(
          "transition-all duration-300 transform",
          showFilters
            ? "translate-x-0 opacity-100 max-h-full overflow-visible w-full lg:w-64 lg:mr-8 lg:flex-shrink-0 mb-6 lg:mb-0"
            : "-translate-x-full opacity-0 max-h-0 overflow-hidden w-0 lg:w-0"
        )}>
          <div className="lg:sticky lg:top-24">
            <FilterSidebar
              selectedCategories={selectedCategories}
              selectedStatuses={selectedStatuses}
              selectedTags={selectedTags}
              toggleCategory={toggleCategory}
              toggleStatus={toggleStatus}
              toggleTag={toggleTag}
              clearFilters={clearFilters}
              activeFilterCount={activeFilterCount}
              categories={categories}
              statuses={statuses}
              tags={tags}
              activeTab={activeTab}
            />
          </div>
        </aside>

        {/* Main content area */}
        <main className={cn("flex-1", showFilters ? "lg:ml-0" : "ml-0")}>
          {/* Mobile search */}
          <div className="md:hidden mb-6">
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

              <div className="md:block hidden mb-6">
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

            </div>
            <div className='flex md:flex-row flex-col md:items-center md:justify-between'>


              <TabsSection
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                filteredEvents={filteredEvents}
                filteredOrganizations={filteredOrganizations}
              />

              <div className="flex items-center gap-3 md:mt-0 mt-8">
                {/* Filter toggle for all screen sizes */}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-2"
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
              </div>
            </div>

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

          {/* Events Grid View */}
          {activeTab === "events" && (
            <>
              {filteredEvents?.length > 0 ? (
                <EventsGrid
                  events={filteredEvents}
                  router={router}
                />
              ) : loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Search className="h-12 w-12 mb-4 text-muted-foreground/50" />
                  <div className="text-lg">
                    <LoadingSpinner />
                  </div>
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
              ) : (
                <NoResultsFound
                  activeFilterCount={activeFilterCount}
                  clearFilters={clearFilters}
                  type="events"
                />
              )}
            </>
          )}

          {/* Organizations Grid View */}
          {activeTab === "organizations" && (
            <>
              {filteredOrganizations?.length > 0 ? (
                <OrganizationsGrid
                  organizations={filteredOrganizations}
                  router={router}
                />
              ) : (
                <NoResultsFound
                  activeFilterCount={activeFilterCount}
                  clearFilters={clearFilters}
                  type="organizations"
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Page;