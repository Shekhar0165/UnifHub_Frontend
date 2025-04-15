import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import axios from 'axios';

const UserActivityHeatmap = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const api = process.env.NEXT_PUBLIC_API;

  useEffect(() => {
    const fetchUserActivity = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${api}/user-activity/${userId}`, {
          headers: {
            'content-type': 'application/json',
          },
          withCredentials: true,
        });
        setUserData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load user activity data');
        setLoading(false);
        console.error('Error fetching user activity:', err);
      }
    };

    if (userId) {
      fetchUserActivity();
    }
  }, [userId]);

  // Function to transform contribution data into a flattened array
  const getContributionData = () => {
    if (!userData || !userData.contributionData) return [];
    
    // Flatten the 2D array
    return userData.contributionData.flat();
  };

  // Function to determine color intensity based on contribution value
  const getColorIntensity = (value) => {
    if (value >= 90) return 'bg-indigo-900';
    if (value >= 80) return 'bg-indigo-800';
    if (value >= 70) return 'bg-indigo-700';
    if (value >= 60) return 'bg-indigo-600';
    if (value >= 50) return 'bg-indigo-500';
    if (value >= 40) return 'bg-indigo-400';
    if (value >= 30) return 'bg-indigo-300';
    if (value >= 20) return 'bg-indigo-200';
    if (value > 0) return 'bg-indigo-100';
    return 'bg-gray-100';
  };

  if (loading) {
    return (
      <Card className="w-64">
        <CardContent className="p-3 flex items-center justify-center h-32">
          <div className="text-sm">Loading activity data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !userData) {
    return (
      <Card className="w-64">
        <CardContent className="p-3 flex items-center justify-center h-32">
          <div className="text-sm text-red-500">{error || 'No data available'}</div>
        </CardContent>
      </Card>
    );
  }

  const contributionData = getContributionData();

  return (
    <Card className="w-64">
      <CardHeader className="p-3">
        <CardTitle className="text-sm flex items-center">
          <Calendar className="h-3 w-3 mr-1 text-primary" />
          Daily Points
        </CardTitle>
        <CardDescription className="text-xs">
          Streak: {userData.streak?.currentStreak || 0} days
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="grid grid-cols-7 gap-0.5">
          {['M','T','W','T','F','S','S'].map((day, i) => (
            <div key={i} className="text-xs text-center opacity-70">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-0.5 mt-1">
          {contributionData.map((value, index) => (
            <div 
              key={index} 
              className={`w-6 h-6 rounded-sm ${getColorIntensity(value)}`}
              title={`Day ${index + 1}: ${value} points`}
            />
          ))}
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs">Low</div>
          <div className="flex space-x-0.5">
            <div className="w-2 h-2 bg-indigo-100 rounded-sm"></div>
            <div className="w-2 h-2 bg-indigo-300 rounded-sm"></div>
            <div className="w-2 h-2 bg-indigo-500 rounded-sm"></div>
            <div className="w-2 h-2 bg-indigo-700 rounded-sm"></div>
            <div className="w-2 h-2 bg-indigo-900 rounded-sm"></div>
          </div>
          <div className="text-xs">High</div>
        </div>

        <div className="mt-3 border-t pt-2">
          <div className="flex justify-between text-xs">
            <div>Total Score: {userData.totalScore}</div>
            <div>Best Streak: {userData.streak?.longestStreak || 0}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserActivityHeatmap;