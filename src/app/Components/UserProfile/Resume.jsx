import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Download, 
  Trophy, 
  Calendar, 
  Star, 
  Users, 
  MessageSquare, 
  Award, 
  GraduationCap,
  Building
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Resume = ({ User }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = process.env.NEXT_PUBLIC_API;
    const userId = User._id;

  useEffect(() => {
    const fetchUserResume = async () => {
      try {
        const response = await axios.get(`${api}/userresume/${userId}`);
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch user resume');
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserResume();
    }
  }, [userId]);

  // Function to get the icon component based on achievement type
  const getIconComponent = (achievementType, className = "h-3 w-3 text-white") => {
    switch (achievementType) {
      case 'users':
        return <Users className={className} />;
      case 'award':
        return <Award className={className} />;
      case 'communication':
        return <MessageSquare className={className} />;
      case 'event_participation':
        return <Trophy className={className} />;
      default:
        return <Star className={className} />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <p className="text-muted-foreground">Loading resume...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg text-center">
      <p className="text-red-600 dark:text-red-400">Error: {error}</p>
    </div>
  );

  // Sort Journey items by date (newest first)
  const sortedJourneyItems = user.Journey 
    ? user.Journey.sort((a, b) => new Date(b.Date) - new Date(a.Date))
    : [];

  return (
    <div className="space-y-8">
      {/* Professional Journey Section */}
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Professional Journey
          </h2>
          <Badge variant="outline" className="text-blue-600 dark:text-blue-400 px-3 py-1.5">
            <Trophy className="h-3.5 w-3.5 mr-1.5" />
            Achievements Timeline
          </Badge>
        </div>

        {User?.education && User?.education.length > 0 ? (
          <div className="space-y-4 mb-10">
            {User?.education.map((edu, index) => (
              <div 
                key={index} 
                className="border border-border rounded-lg px-5 py-4 hover:shadow-md hover:bg-secondary/10 transition-all duration-200"
              >
                <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800 mb-2">
                  {edu.duration}
                </Badge>
                <h3 className="text-lg font-bold text-foreground">
                  {edu.degree}
                </h3>
                <p className="text-green-700 dark:text-green-300 mt-1">
                  {edu.institution}
                </p>
                {edu.additionalInfo && (
                  <p className="text-muted-foreground mt-2">
                    {edu.additionalInfo}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-secondary/20 rounded-lg p-6 text-center border border-border/30">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              No Education Details
            </h3>
            <p className="text-muted-foreground mt-2 mb-4">
              Add your academic qualifications to showcase your educational background.
            </p>
          </div>
        )}

        
        {sortedJourneyItems.length > 0 ? (
          <div className="overflow-y-auto pr-2 h-full max-h-96 mt-6">
            <div className="relative border-l-2 border-blue-200 dark:border-blue-900 pl-8 ml-4 space-y-10 pb-6">
              {sortedJourneyItems.map((item, index) => (
                <div className="relative" key={item._id || index}>
                  <div className={`absolute -left-10 mt-1.5 h-6 w-6 rounded-full border-2 border-background bg-blue-500 dark:bg-blue-600 shadow flex items-center justify-center`}>
                    {getIconComponent(item.metrics?.achievementType)}
                  </div>
                  <div className={`bg-blue-50/40 dark:bg-blue-900/20 rounded-lg p-5 hover:shadow-md hover:bg-blue-50/60 dark:hover:bg-blue-900/30 transition-all duration-200`}>
                    <Badge variant="outline" className="text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800 mb-2">
                      {formatDate(item.Date)}
                    </Badge>
                    <h3 className="text-lg font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-foreground mt-2">
                      {item.description}
                    </p>
                    {item.metrics && (
                      <div className="mt-3 flex items-center space-x-3 text-sm text-muted-foreground">
                        {item.metrics.position && (
                          <span className="flex items-center">
                            <Trophy className="h-4 w-4 mr-1.5" />
                            Position: {item.metrics.position}
                          </span>
                        )}
                        {item.metrics.achievementType && (
                          <span className="flex items-center capitalize">
                            <Star className="h-4 w-4 mr-1.5" />
                            {item.metrics.achievementType.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-secondary/20 rounded-lg p-6 text-center border border-border/30">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              No Journey Achievements Yet
            </h3>
            <p className="text-muted-foreground mt-2 mb-4">
              Start creating achievements and milestones to build your professional journey.
            </p>
          </div>
        )}
      </div>

      {/* Education Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Education
          </h2>
          <Badge variant="outline" className="text-green-600 dark:text-green-400 px-3 py-1.5">
            <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
            Academic Journey
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default Resume;