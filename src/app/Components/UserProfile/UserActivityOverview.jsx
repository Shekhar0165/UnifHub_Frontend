import React, { useState, useEffect } from 'react';
import { 
  Trophy as TrophyIcon, 
  FileText as FileIcon, 
  BarChart2 as ChartBarIcon,
  Calendar as CalendarIcon,
  Sparkles as SparklesIcon,
  BarChart
} from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const UserActivityOverview = ({ user }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userid = user?._id;

  const api = process.env.NEXT_PUBLIC_API;

  useEffect(() => {
    const fetchUserActivity = async () => {
      try {
        const authToken = localStorage.getItem('accessToken');
        
        const response = await axios.get(`${api}/user-activity/${userid}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        setUserData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch user activity');
        setLoading(false);
      }
    };

    if (userid) {
      fetchUserActivity();
    }
  }, [userid, api]);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center text-destructive py-4">Error: {error}</div>;
  if (!userData) return <div className="text-center py-4">No user activity data available</div>;

  const { 
    totalScore = 0,
    streak = { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
    contributionData = [],
    eventOrganization = [],
    weeklyScores = [],
  } = userData;

  // Contribution Data Processing
  const processContributionData = () => {
    const flatData = contributionData.flat();
    const totalContributions = flatData.reduce((a, b) => a + b, 0);
    
    // Create a more engaging visualization
    const contributionLevels = [
      { label: 'Beginner', threshold: 5, color: 'bg-accent text-accent-foreground' },
      { label: 'Active', threshold: 15, color: 'bg-primary/20 text-primary' },
      { label: 'Enthusiast', threshold: 30, color: 'bg-primary/40 text-primary' },
      { label: 'Pro', threshold: 50, color: 'bg-primary/70 text-primary-foreground' },
      { label: 'Legend', threshold: Infinity, color: 'bg-primary text-primary-foreground' }
    ];

    const currentLevel = contributionLevels.find(level => 
      totalContributions <= level.threshold
    );

    return {
      total: totalContributions,
      level: currentLevel
    };
  };

  const contributionAnalysis = processContributionData();

  // Event Organization Analysis
  const getEventImpact = () => {
    const totalEventsOrganized = eventOrganization.length;
    const totalParticipants = eventOrganization.reduce((sum, event) => 
      sum + (event.participantCount || 0), 0);

    return {
      eventsOrganized: totalEventsOrganized,
      totalParticipants
    };
  };

  const eventImpact = getEventImpact();

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary */}
       <Card className="md:col-span-1">
    <CardHeader className="pb-0">
      <CardTitle className="flex items-center text-base sm:text-lg">
        <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
        Profile Overview
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
      {/* Total Score */}
      <div className="grid grid-cols-2 sm:flex sm:flex-row sm:items-center sm:justify-between gap-2 p-2 rounded-lg hover:bg-accent/10 transition-colors">
        <div className="flex items-center col-span-1">
          <TrophyIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-chart-4" />
          <span className="text-xs sm:text-sm md:text-base">Total Score</span>
        </div>
        <div className="text-right sm:text-right col-span-1">
          <span className="font-bold text-sm sm:text-base md:text-lg">{totalScore}</span>
        </div>
      </div>

      {/* Current Streak */}
      <div className="grid grid-cols-2 sm:flex sm:flex-row sm:items-center sm:justify-between gap-2 p-2 rounded-lg hover:bg-accent/10 transition-colors">
        <div className="flex items-center col-span-1">
          <FileIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-chart-1" />
          <span className="text-xs sm:text-sm md:text-base">Current Streak</span>
        </div>
        <div className="text-right sm:text-right col-span-1">
          <span className="font-bold text-sm sm:text-base md:text-lg">
            {streak.currentStreak} days
          </span>
        </div>
      </div>

      {/* Longest Streak */}
      <div className="grid grid-cols-2 sm:flex sm:flex-row sm:items-center sm:justify-between gap-2 p-2 rounded-lg hover:bg-accent/10 transition-colors">
        <div className="flex items-center col-span-1">
          <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-chart-2" />
          <span className="text-xs sm:text-sm md:text-base">Longest Streak</span>
        </div>
        <div className="text-right sm:text-right col-span-1">
          <span className="font-bold text-sm sm:text-base md:text-lg">
            {streak.longestStreak} days
          </span>
        </div>
      </div>
    </CardContent>
  </Card>

        {/* Contribution Insights */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center">
              <ChartBarIcon className="mr-2 text-primary" />
              Contribution Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-muted p-4 rounded-lg text-center">
                      <h3 className="text-sm text-muted-foreground mb-2">Total Contributions</h3>
                      <p className="text-2xl font-bold text-primary">
                        {contributionAnalysis.total}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your total number of contributions across all activities</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`${contributionAnalysis.level.color} p-4 rounded-lg text-center`}>
                      <h3 className="text-sm mb-2">Contribution Level</h3>
                      <p className="text-2xl font-bold">
                        {contributionAnalysis.level.label}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your current contribution intensity level</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Event Organization Impact */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-accent/30 p-4 rounded-lg">
                <h3 className="text-sm text-accent-foreground mb-2">
                  Events Organized
                </h3>
                <p className="text-2xl font-bold text-primary">
                  {eventImpact.eventsOrganized}
                </p>
              </div>
              <div className="bg-secondary p-4 rounded-lg">
                <h3 className="text-sm text-secondary-foreground mb-2">
                  Total Participants
                </h3>
                <p className="text-2xl font-bold text-primary">
                  {eventImpact.totalParticipants}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Performance */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="mr-2 text-primary" />
              Weekly Performance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weeklyScores.map((weekScore, index) => {
                // Normalize the score to get a value between 0 and 1
                const normalizedScore = Math.min(weekScore.score / 100, 1);
                // Select color from chart colors
                const colorClass = normalizedScore > 0.7 
                  ? 'bg-chart-1/80 text-primary' 
                  : normalizedScore > 0.4 
                    ? 'bg-chart-2/80 text-primary' 
                    : 'bg-chart-3/80 text-primary-foreground';
                
                return (
                  <div 
                    key={index} 
                    className={`p-2 rounded text-center ${colorClass}`}
                  >
                    <span className="text-xs font-medium">
                      Week {index + 1}
                    </span>
                    <p className="text-sm font-bold">{weekScore.score}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserActivityOverview;