import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ChevronRight, 
  User, 
  Award, 
  Calendar, 
  TrendingUp, 
  Star,
  Clock,
  BarChart
} from 'lucide-react';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        
        console.log('Full User Data:', response.data);
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!userData) return <div>No user activity data available</div>;

  const { 
    user: userDetails,
    totalScore = 0,
    streak = { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
    contributionData = [],
    weeklyScores = [],
    monthlyScores = [],
    eventOrganization = [],
    eventParticipation = [],
    organizationMembership = []
  } = userData;

  // Process the weekly contribution data
  const weeklyContributions = contributionData.length > 0 
    ? contributionData[contributionData.length - 1] 
    : new Array(7).fill(0);

  // Days of the week for labeling
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate total events and memberships
  const totalEvents = eventOrganization.length + eventParticipation.length;
  const totalMemberships = organizationMembership.length;

  return (
    <div className="bg-background rounded-xl shadow-lg overflow-hidden mb-6 border border-border/40">
      <div className="p-6">
        {/* Activity Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg flex items-center">
            <TrendingUp className="mr-2 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xs text-muted-foreground">Total Score</p>
              <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                {totalScore}
              </p>
            </div>
          </div>
          <div className="p-3 bg-green-50/50 dark:bg-green-900/20 rounded-lg flex items-center">
            <Award className="mr-2 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-xs text-muted-foreground">Current Streak</p>
              <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                {streak.currentStreak} days
              </p>
            </div>
          </div>
          <div className="p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg flex items-center">
            <Star className="mr-2 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-xs text-muted-foreground">Longest Streak</p>
              <p className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                {streak.longestStreak} days
              </p>
            </div>
          </div>
          <Card className="p-0 overflow-hidden border-0">
            <CardContent className="p-3 bg-amber-50/50 dark:bg-amber-900/20 rounded-lg flex items-center space-y-0">
              <BarChart className="mr-2 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-xs text-muted-foreground">Weekly Score</p>
                {weeklyScores.length > 0 ? (
                  <p className="text-xl font-semibold text-amber-600 dark:text-amber-400">
                    {weeklyScores[weeklyScores.length - 1].score}
                  </p>
                ) : (
                  <p className="text-xl font-semibold text-amber-600 dark:text-amber-400">0</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Activity Graph */}
        <div className="mt-8">
          <h4 className="text-sm font-medium text-foreground mb-3">Weekly Activity</h4>
          <div className="flex items-end h-32 gap-2 relative">
            {weeklyContributions.map((count, index) => {
              const maxCount = Math.max(...weeklyContributions, 1); // Ensure we don't divide by zero
              const heightPercentage = (count / maxCount) * 100;
              
              // Generate a gradient color based on the activity level
              const intensity = Math.min(0.2 + (count / maxCount) * 0.8, 1);
              const bgColor = `rgba(59, 130, 246, ${intensity})`;
              
              return (
                <div key={index} className="relative group flex-1">
                  <div
                    style={{ 
                      height: `${heightPercentage}%`,
                      minHeight: count > 0 ? '4px' : '0',
                      backgroundColor: bgColor
                    }}
                    className="w-full rounded-t hover:opacity-90 transition-opacity"
                  ></div>
                  <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {count} activities
                  </div>
                  <div className="w-full h-1 bg-gray-100 dark:bg-gray-800"></div>
                </div>
              );
            })}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-border/30 w-full h-0"></div>
              <div className="border-t border-border/30 w-full h-0"></div>
              <div className="border-t border-border/30 w-full h-0"></div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            {daysOfWeek.map((day, index) => (
              <span key={index} className="font-medium">{day}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivityOverview;