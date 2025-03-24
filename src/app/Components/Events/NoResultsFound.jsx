'use client';
import React from 'react';
import { Search } from 'lucide-react';
import { Button } from "@/components/ui/button";

const NoResultsFound = ({ activeFilterCount, clearFilters, type }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Search className="h-12 w-12 mb-4 text-muted-foreground/50" />
      <p className="text-lg">No {type} found with your current filters.</p>
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
  );
};

export default NoResultsFound;