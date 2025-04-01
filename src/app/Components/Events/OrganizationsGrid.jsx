'use client';
import React from 'react';
import { Users, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const OrganizationCard = ({ organization, onClick }) => {
  return (
    <Card className="group bg-background border border-border/40 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={organization.profileImage} 
            alt={organization.name || "Organization image"}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-background/95 backdrop-blur-md px-3 py-1 text-xs rounded-full">
              {organization.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 space-y-3">
        <CardTitle className="text-lg font-bold line-clamp-1">
          {organization.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {organization.bio || "No description available."}
        </p>
        
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5 text-primary" />
          <span>{organization.members} members</span>
        </div>
      </CardContent>

      <CardFooter className="px-5 pb-5 pt-0">
        <Button 
          onClick={onClick}
          className="w-full gap-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm h-9"
        >
          View Organization
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
};

const OrganizationsGrid = ({ organizations, router }) => {
  const handleOpenOrganization = (org) => {
    router.push(`/organization/${org.userid}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {organizations.map((org) => (
        <OrganizationCard 
          key={org.id || org.userid} 
          organization={org} 
          onClick={() => handleOpenOrganization(org)}
        />
      ))}
    </div>
  );
};

export default OrganizationsGrid;