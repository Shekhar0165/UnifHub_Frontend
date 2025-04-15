import React, { useState, useEffect } from 'react';
import {
  Trophy,
  FileText,
  BarChart2,
  Calendar,
  Sparkles,
  Activity,
  BarChart,
  Users
} from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  BarChart as RechartsBarChart,
  Bar, 
  CartesianGrid 
} from 'recharts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import UserActivityHeatmap from './Heatmap';


const UserActivityOverview = ({ user }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userid = user?._id;

  const api = process.env.NEXT_PUBLIC_API;

  useEffect(() => {
    const fetchUserActivity = async () => {
      try {
        const response = await axios.get(`${api}/user-activity/${userid}`, {
          headers: {
            'content-type': 'application/json',
          },
          withCredentials: true,
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
  console.log("user activity",userData)

  if (loading) return (
    <LoadingSpinner  fullScreen={false}/>
  );
  
  if (error) return (
    <div className="text-center text-destructive py-4 bg-destructive/10 rounded-lg border border-destructive/20">
      Error: {error}
    </div>
  );
  
  if (!userData) return (
    <div className="text-center py-8 bg-accent/10 rounded-lg border border-accent/20">
      <div className="text-muted-foreground">No user activity data available</div>
    </div>
  );

  const {
    totalScore = 0,
    streak = { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
    contributionData = [],
    eventOrganization = [],
    weeklyScores = [],
    user: userDetails = { name: "User" }
  } = userData;

  // Process contribution data
  const processContributionData = () => {
    const flatData = contributionData.flat();
    const totalContributions = flatData.reduce((a, b) => a + b, 0);

    // Using original color scheme
    const contributionLevels = [
      { label: 'Beginner', threshold: 5, color: 'bg-accent text-accent-foreground' },
      { label: 'Active', threshold: 15, color: 'bg-primary/20 text-primary' },
      { label: 'Enthusiast', threshold: 30, color: 'bg-primary/40 text-primary' },
      { label: 'Pro', threshold: 50, color: 'bg-primary/70 text-primary-foreground' },
      { label: 'Legend', threshold: Infinity, color: 'bg-primary text-primary-foreground' }
    ];

    const currentLevel = contributionLevels.find(level =>
      totalContributions <= level.threshold
    ) || contributionLevels[0];

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

  // Format data for weekly chart
  const formatWeeklyData = () => {
    if (!weeklyScores || weeklyScores.length === 0) {
      // If no data, create placeholder data
      return Array(7).fill().map((_, i) => ({
        name: `Week ${i+1}`,
        score: 0
      }));
    }
    
    return weeklyScores.map((item, index) => {
      // Format date if needed
      const weekNumber = `Week ${index + 1}`;
      
      return {
        name: weekNumber,
        score: item.score,
        // Using the original color scheme variables
        color: getColorForScore(item.score)
      };
    });
  };
  
  const getColorForScore = (score) => {
    if (score > 75) return "chart-1";
    if (score > 50) return "chart-2";
    if (score > 25) return "chart-3";
    return "chart-4";
  };

  const weeklyChartData = formatWeeklyData();
  
  // Create heat map colors - using original scheme
  const getHeatMapColor = (value) => {
    if (value === 0) return "bg-accent/10";
    if (value === 1) return "bg-primary/30";
    if (value === 2) return "bg-primary/50";
    if (value === 3) return "bg-primary/70";
    return "bg-primary";
  };

  return (
    <div className="bg-background rounded-xl shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Activity Dashboard</h2>
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Streak Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Activity Streaks
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="p-4 bg-accent/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Streak</span>
                    <div className="text-3xl font-bold text-primary">{streak.currentStreak}</div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">consecutive days of activity</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileIcon className="h-4 w-4 mr-2 text-chart-1" />
                    <span className="text-sm">Longest Streak</span>
                  </div>
                  <div className="text-lg font-bold">{streak.longestStreak} days</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-chart-2" />
                    <span className="text-sm">Last Activity</span>
                  </div>
                  <div className="text-sm">
                    {new Date(streak.lastActivityDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Score Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Trophy className="h-5 w-5 mr-2 text-primary" />
                Score Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="p-4 bg-accent/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Score</span>
                    <div className="text-3xl font-bold text-primary">{totalScore}</div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">across all activities</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Contribution Level</span>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${contributionAnalysis.level.color}`}>
                    {contributionAnalysis.level.label}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Contributions</span>
                  <div className="text-sm font-medium">{contributionAnalysis.total} activities</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Impact Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Event Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="p-4 bg-accent/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Events Organized</span>
                    <div className="text-3xl font-bold text-primary">{eventImpact.eventsOrganized}</div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">as organizer or vice-head</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Participants</span>
                  <div className="text-lg font-bold">{eventImpact.totalParticipants}</div>
                </div>
                
                <div>
                  <div className="text-sm mb-1">Recent Event</div>
                  {eventOrganization.length > 0 ? (
                    <div className="text-xs text-muted-foreground truncate max-w-full p-2 bg-accent/5 rounded">
                      {eventOrganization[0].eventName}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic">No recent events</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Performance Chart */}
        {/* <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-primary" />
              Weekly Performance
            </CardTitle>
            <CardDescription>
              Tracking your progress over time
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={weeklyChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--accent)" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <RechartsTooltip 
                    cursor={{ fill: 'var(--accent)', opacity: 0.1 }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className=" shadow rounded-lg p-3 border">
                            <p className="font-medium">{label}</p>
                            <p className="text-sm text-muted-foreground">Score: <span className="font-medium text-foreground">{payload[0].value}</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="score" 
                    radius={[4, 4, 0, 0]} 
                    barSize={35}
                    fill="hsl(var(--foreground))" 
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>      */}
        {/* Contribution Heatmap */}
        {/* <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-primary" />
              Activity Heatmap
            </CardTitle>
            <CardDescription>
              Your contribution patterns over time
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="overflow-x-auto">
              <div className="min-w-max">
                {contributionData.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-end pr-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="w-6 text-xs text-center text-muted-foreground">{day}</div>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-y-2">
                      {contributionData.slice(-12).map((week, weekIndex) => (
                        <div key={weekIndex} className="flex">
                          {week.map((day, dayIndex) => (
                            <div 
                              key={`${weekIndex}-${dayIndex}`} 
                              className={`w-6 h-6 m-px rounded-sm ${getHeatMapColor(day)}`}
                              title={`${day} contributions`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-end mt-2 space-x-2">
                      <div className="text-xs text-muted-foreground">Less</div>
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-accent/10 rounded-sm"></div>
                        <div className="w-3 h-3 bg-primary/30 rounded-sm"></div>
                        <div className="w-3 h-3 bg-primary/50 rounded-sm"></div>
                        <div className="w-3 h-3 bg-primary/70 rounded-sm"></div>
                        <div className="w-3 h-3 bg-primary rounded-sm"></div>
                      </div>
                      <div className="text-xs text-muted-foreground">More</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

// For compatibility with the original component
const FileIcon = FileText;

export default UserActivityOverview;