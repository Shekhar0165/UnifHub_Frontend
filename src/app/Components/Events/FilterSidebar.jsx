'use client';
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FilterSidebar = ({
  selectedCategories,
  selectedStatuses,
  selectedTags,
  toggleCategory,
  toggleStatus,
  toggleTag,
  clearFilters,
  activeFilterCount,
  categories,
  statuses,
  tags,
  activeTab
}) => {
  return (
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
};

export default FilterSidebar;