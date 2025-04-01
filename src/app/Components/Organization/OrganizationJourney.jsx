import { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, CalendarX, ChevronRight, Clock, Building, Plus, Users, Award, MessageSquare, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';

// ... other imports

const OrganizationJourney = ({ organizationId }) => {
  const [journeyData, setJourneyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const api = process.env.NEXT_PUBLIC_API

  useEffect(() => {
    const fetchJourneyData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${api}/journey/${organizationId}`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true
        });
        // Extract the first item from the array
        setJourneyData(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching journey data:", err);
        if (err.response?.status === 401) {
          Cookies.remove('user');
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          router.push('/');
        }
        setError(err.message || 'Failed to fetch journey data');
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchJourneyData();
    }
  }, [organizationId, router]);
  console.log(journeyData)

  // Function to get the icon component based on achievement type
  const getIconComponent = (achievementType, className = "h-3 w-3 text-white") => {
    switch (achievementType) {
      case 'users':
        return <Users className={className} />;
      case 'award':
        return <Award className={className} />;
      case 'communication':
        return <MessageSquare className={className} />;
      case 'milestone':
        return <Award className={className} />;
      default:
        return <Star className={className} />;
    }
  };

  if (loading) return <div className="text-muted-foreground">Loading journey data...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">Error: {error}</div>;
  if (!journeyData) return <div className="text-muted-foreground">No journey data available</div>;

  // Create timeline items from Journey array
  const timelineItems = journeyData.Journey.map(item => ({
    type: 'achievement',
    date: new Date(item.Date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }),
    title: item.title,
    description: item.description,
    id: item._id,
    achievementType: item.achievementType,
    bgColor: 'bg-blue-500 dark:bg-blue-600',
    cardBg: 'bg-blue-50 dark:bg-blue-900/20',
    badgeColor: 'text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800'
  }));

 

  // Sort timeline items by date (newest first)
  timelineItems.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="flex flex-col h-full">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-foreground">Organization Journey</h2>
      <Badge variant="outline" className="text-blue-600 dark:text-blue-400 px-3 py-1.5">
        <Clock className="h-3.5 w-3.5 mr-1.5" />
        Timeline View
      </Badge>
    </div>
    
    {/* Timeline container with overflow handling */}
    <div className="overflow-y-auto pr-2 h-full max-h-96">
      <div className="relative border-l-2 border-blue-200 dark:border-blue-900 pl-8 ml-4 space-y-10 pb-6">
        {timelineItems.length > 0 ? (
          timelineItems.map((item, index) => (
            <div className="relative" key={index}>
              <div className={`absolute -left-10 mt-1.5 h-6 w-6 rounded-full border-2 border-background ${item.bgColor} shadow flex items-center justify-center`}>
                {item.icon === 'Building' ? (
                  <Building className="h-3 w-3 text-white" />
                ) : (
                  getIconComponent(item.achievementType)
                )}
              </div>
              <div className={`${item.cardBg} bg-blue-50/40 dark:bg-blue-900/20 rounded-lg p-5 hover:shadow-md hover:bg-blue-50/60 dark:hover:bg-blue-900/30 transition-all duration-200`}>
                <Badge variant="outline" className={`${item.badgeColor} mb-2`}>
                  {item.date}
                </Badge>
                <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                <p className="text-foreground mt-2">
                  {item.description}
                </p>
                {item.subtext && (
                  <p className="text-sm text-muted-foreground mt-4">
                    {item.subtext}
                  </p>
                )}
                {item.type === 'event' && (
                  <div className="mt-4">
                    <Button 
                      variant="ghost" 
                      className={`p-0 h-auto hover:bg-transparent ${item.buttonColor} hover:underline flex items-center gap-1`}
                      onClick={() => router.push(`/event/${item.id}`)}
                    >
                      View event details <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="relative">
            <div className="absolute -left-10 mt-1.5 h-6 w-6 rounded-full border-2 border-background bg-gray-300 dark:bg-gray-600 shadow flex items-center justify-center">
              <Calendar className="h-3 w-3 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="bg-secondary/20 rounded-lg p-6 border border-border/30">
              <div className="flex flex-col items-center text-center">
                <CalendarX className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium text-muted-foreground">No Journey Data Yet</h3>
                <p className="text-muted-foreground mt-2 mb-4 max-w-md">
                  This organization hasn't started its journey yet. Create events and achieve milestones to build your journey.
                </p>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-3.5 w-3.5" />
                  Create First Event
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default OrganizationJourney;