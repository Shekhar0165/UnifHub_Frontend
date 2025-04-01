import React, { useState, useEffect } from 'react';
import { 
  Trophy as TrophyIcon, 
  FileText as FileIcon, 
  BarChart2 as ChartBarIcon,
  Calendar as CalendarIcon,
  Sparkles as SparklesIcon,
  Activity,
  BarChart,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Chart } from 'react-google-charts';

// Component can receive organizationId, organization object, or direct activityData
const OrganizationActivity = ({ organizationId, organization, activityData: initialActivityData }) => {
    const [activityData, setActivityData] = useState(initialActivityData || null);
    const [loading, setLoading] = useState(!initialActivityData);
    const [error, setError] = useState(null);

    // Get the ID either directly or from the organization object
    const id = organizationId || organization?._id;
    const api = process.env.NEXT_PUBLIC_API;

    useEffect(() => {
        // If data is already provided, no need to fetch
        if (initialActivityData) {
            setActivityData(initialActivityData);
            setLoading(false);
            return;
        }

        const fetchOrganizationActivity = async () => {
            try {
                const response = await axios.get(`${api}/org-activity/${id}`, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true
                });
                
                setActivityData(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message || 'Failed to fetch organization activity');
                setLoading(false);
            }
        };

        if (id) {
            fetchOrganizationActivity();
        }
    }, [id, api, initialActivityData]);

    if (loading) return <div className="text-center py-4">Loading...</div>;
    if (error) return <div className="text-center text-destructive py-4">Error: {error}</div>;
    if (!activityData) return <div className="text-center py-4">No organization activity data available</div>;

    // Destructure organization and activity data from the response or direct props
    const { 
        organization: orgData = organization,
        activity = activityData.activity || {}
    } = activityData;

    const { 
        totalScore = 0,
        streak = { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
        contributionData = [],
        eventCreation = [],
        weeklyScores = [],
        monthlyScores = []
    } = activity;

    // Process contribution data for chart
    const processContributionData = () => {
        const flatData = contributionData.flat();
        const totalContributions = flatData.reduce((a, b) => a + b, 0);
        
        const contributionLevels = [
            { label: 'Beginner', threshold: 5, color: 'bg-accent text-accent-foreground' },
            { label: 'Active', threshold: 15, color: 'bg-primary/20 text-primary' },
            { label: 'Enthusiast', threshold: 30, color: 'bg-primary/40 text-primary' },
            { label: 'Pro', threshold: 50, color: 'bg-primary/70 text-primary-foreground' },
            { label: 'Legend', threshold: Infinity, color: 'bg-primary text-primary-foreground' }
        ];

        const currentLevel = contributionLevels.find(level => 
            totalContributions <= level.threshold
        ) || contributionLevels[contributionLevels.length - 1];

        return {
            total: totalContributions,
            level: currentLevel
        };
    };

    const contributionAnalysis = processContributionData();

    // Event Creation Analysis
    const getEventImpact = () => {
        const totalEventsCreated = eventCreation.length;
        const totalParticipants = eventCreation.reduce((sum, event) => 
            sum + (event.participantCount || 0), 0);

        return {
            eventsCreated: totalEventsCreated,
            totalParticipants
        };
    };

    const eventImpact = getEventImpact();

    // Monthly contribution data for chart
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Normalize weekly scores data for chart
    const normalizeWeeklyScores = () => {
        return (weeklyScores || []).map((week, index) => {
            const normalizedScore = Math.min(week.score / 100, 1); 
            const colorClass = normalizedScore > 0.7 
                ? 'bg-chart-1/80 text-primary' 
                : normalizedScore > 0.4 
                ? 'bg-chart-2/80 text-primary' 
                : 'bg-chart-3/80 text-primary-foreground';
            
            return {
                week: index + 1,
                score: week.score,
                colorClass
            };
        });
    };
    
    const normalizedWeeklyScores = normalizeWeeklyScores();

    // Monthly data for column chart
    const monthlyData = (monthlyScores || []).map((month, index) => [
        months[new Date(month.month).getMonth()], 
        month.score,
        "stroke-color: #2563eb; stroke-width: 1; fill-color: #2563eb; opacity: 0.9; border-radius: 10px"
    ]);

    const chartData = [
        ["Month", "Contributions", { role: "style" }],
        ...monthlyData
    ];

    const options = {
        legend: { position: "none" },
        chartArea: { width: "85%", height: "75%" },
        backgroundColor: "transparent",
        bar: { groupWidth: "40%" },
        colors: ["#2563eb"],
        hAxis: {
            title: "Months",
            textStyle: { color: "#6b7280", fontSize: 12, fontWeight: 500 },
            gridlines: { color: "rgba(107, 114, 128, 0.2)" },
        },
        vAxis: {
            minValue: 0,
            title: "Contributions",
            textStyle: { color: "#6b7280", fontSize: 12, fontWeight: 500 },
            gridlines: { color: "rgba(107, 114, 128, 0.2)" },
        },
        tooltip: {
            textStyle: { fontSize: 12, color: "#ffffff" },
            showColorCode: true
        },
    };

    return (
        <div className="container mx-auto">
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
                                        <p>Total number of contributions across all activities</p>
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

                        {/* Event Creation Impact */}
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="bg-accent/30 p-4 rounded-lg">
                                <h3 className="text-sm text-accent-foreground mb-2">
                                    Events Created
                                </h3>
                                <p className="text-2xl font-bold text-primary">
                                    {eventImpact.eventsCreated}
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
                <Card className="md:col-span-3 w-full">
    <CardHeader>
        <CardTitle className="flex items-center">
            <BarChart className="mr-2 text-primary" />
            Weekly Performance Breakdown
        </CardTitle>
    </CardHeader>
    <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
            {normalizedWeeklyScores.map((weekScore, index) => (
                <div 
                    key={index} 
                    className={`
                        p-3 rounded-lg text-center 
                        ${weekScore.colorClass} 
                        text-primary-foreground
                        hover:scale-105 transition-transform
                    `}
                >
                    <span className="text-xs font-medium block">
                        Week {weekScore.week}
                    </span>
                    <p className="text-sm font-bold">{weekScore.score}</p>
                </div>
            ))}
        </div>
    </CardContent>
</Card>

            </div>
        </div>
    );
};

export default OrganizationActivity;