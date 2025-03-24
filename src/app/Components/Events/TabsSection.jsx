'use client';
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TabsSection = ({ activeTab, setActiveTab, filteredEvents, filteredOrganizations }) => {
  return (
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
  );
};

export default TabsSection;