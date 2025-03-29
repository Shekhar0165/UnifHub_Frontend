import React, { useState, useEffect } from 'react';
import { Award, ArrowUp, Search, Check, X, Save, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Toaster } from '@/components/ui/toaster';

const EventResultPopup = ({ selectedResult, closeResultPopup }) => {
    const [participants, setParticipants] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [duplicatePositions, setDuplicatePositions] = useState([]);
    const { toast } = useToast();

    useEffect(() => {
        const fetchParticipants = async () => {
            if (!selectedResult?._id) return;
            
            setIsLoading(true);
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API}/Participants/for-events/${selectedResult._id}`, 
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        withCredentials: true
                    }
                );
                
                if (!response.ok) throw new Error('Failed to fetch participants');
                
                const data = await response.json();
                setParticipants(data.participants || []);
            } catch (error) {
                console.error("Error fetching participants:", error);
                toast({
                    title: "Error",
                    description: "Could not load participants. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchParticipants();    
    }, [selectedResult?._id, toast]);

    // Check for duplicate positions whenever participants change
    useEffect(() => {
        // Find duplicate positions
        const positionCounts = {};
        const duplicates = [];
        
        participants.forEach(team => {
            if (team.position) {
                if (positionCounts[team.position]) {
                    duplicates.push(team.position);
                } else {
                    positionCounts[team.position] = true;
                }
            }
        });
        
        setDuplicatePositions([...new Set(duplicates)]);
    }, [participants]);

    if (!selectedResult) return null;

    const sortedParticipants = [...participants].sort((a, b) => (a.position || 999) - (b.position || 999));

    const rankedTeams = sortedParticipants.filter(team => team.position);
    const unrankedTeams = sortedParticipants.filter(team => !team.position);

    // Filter teams based on search query
    const filteredTeams = searchQuery
        ? sortedParticipants.filter(team =>
            team.teamName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : sortedParticipants;

    // Check if a position is already taken by another team
    const isPositionTaken = (position, currentTeamId) => {
        return participants.some(team => 
            team.position === Number(position) && team._id !== currentTeamId
        );
    };

    // Handle position change for individual team
    const handlePositionChange = (teamId, newPosition) => {
        // If position is already taken by another team, show toast warning
        if (newPosition && isPositionTaken(newPosition, teamId)) {
            toast({
                title: "Position Already Taken",
                description: `Position ${newPosition} is already assigned to another team. Each position must be unique.`,
                variant: "destructive",
            });
            return;
        }

        setParticipants(prevParticipants =>
            prevParticipants.map(team =>
                team._id === teamId ? { ...team, position: newPosition ? Number(newPosition) : null } : team
            )
        );
        setHasUnsavedChanges(true);
    };

    // Save all positions at once
    const saveAllPositions = async () => {
        // Check for duplicate positions first
        if (duplicatePositions.length > 0) {
            toast({
                title: "Duplicate Positions",
                description: `Positions must be unique. Please fix duplicate positions: ${duplicatePositions.join(', ')}`,
                variant: "destructive",
            });
            return;
        }
        
        // Prepare data in the format expected by backend
        const validTeams = participants.filter(team => team.position !== null && team.position !== undefined);
        
        // Format data according to the backend API
        const results = validTeams.map(team => ({
            teamName: team.teamName,
            position: team.position
        }));
        
        const requestData = {
            eventid: selectedResult._id,
            results: results
        };
        
        console.log("Saving positions data:", requestData);
        
        if (results.length === 0) {
            toast({
                title: "Warning",
                description: "No positions have been assigned to any teams",
                variant: "destructive",
            });
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API}/Participants/declareResult`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                    body: JSON.stringify(requestData),
                }
            );
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update positions');
            }
            
            toast({
                title: "Positions Saved",
                description: `Updated positions for ${results.length} teams`,
            });
            
            setHasUnsavedChanges(false);
            
            // Close the popup after successful save
            closeResultPopup();
        } catch (error) {
            console.error("Error saving positions:", error);
            toast({
                title: "Save Failed",
                description: error.message || "Could not update team positions. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderTable = (teams) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-20">Rank</TableHead>
                    <TableHead>Team Name</TableHead>
                    <TableHead className="text-right">Position</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {teams.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                            {isLoading ? "Loading teams..." : "No teams found"}
                        </TableCell>
                    </TableRow>
                ) : (
                    teams.map((team) => (
                        <TableRow key={team._id} className={duplicatePositions.includes(team.position) ? "bg-red-50" : ""}>
                            <TableCell>
                                {team.position || "-"}
                            </TableCell>
                            <TableCell>{team.teamName}</TableCell>
                            <TableCell className="text-right">
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="Position"
                                    value={team.position || ""}
                                    onChange={(e) => handlePositionChange(team._id, e.target.value)}
                                    className={`w-24 inline-block ${duplicatePositions.includes(team.position) ? "border-red-500" : ""}`}
                                />
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Toaster/>
            <Card className="w-full max-w-4xl shadow-xl">
                <CardHeader className="pb-2 border-b">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Team Rankings
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={closeResultPopup}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>
                
                <CardContent className="p-6">
                    {duplicatePositions.length > 0 && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Duplicate positions detected: {duplicatePositions.join(', ')}. Each position must be unique.
                            </AlertDescription>
                        </Alert>
                    )}
                
                    <div className="flex items-center mb-4">
                        <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                        <Input
                            placeholder="Search teams..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                    
                    {searchQuery ? (
                        <div className="mt-4">
                            <h3 className="font-medium mb-2">Search Results</h3>
                            {renderTable(filteredTeams)}
                        </div>
                    ) : (
                        <Tabs defaultValue="all" className="mt-4">
                            <TabsList className="mb-4">
                                <TabsTrigger value="all">
                                    All Teams ({sortedParticipants.length})
                                </TabsTrigger>
                                <TabsTrigger value="ranked">
                                    Ranked Teams ({rankedTeams.length})
                                </TabsTrigger>
                                <TabsTrigger value="unranked">
                                    Unranked Teams ({unrankedTeams.length})
                                </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="all">
                                {renderTable(sortedParticipants)}
                            </TabsContent>
                            
                            <TabsContent value="ranked">
                                {renderTable(rankedTeams)}
                            </TabsContent>
                            
                            <TabsContent value="unranked">
                                {renderTable(unrankedTeams)}
                            </TabsContent>
                        </Tabs>
                    )}
                    
                    <Separator className="my-6" />
                    
                    <div className="flex justify-between">
                        <Button 
                            variant="default" 
                            onClick={saveAllPositions} 
                            disabled={isLoading || !hasUnsavedChanges || duplicatePositions.length > 0}
                            className="px-6 gap-2"
                        >
                            <Save className="h-4 w-4" />
                            Save All Positions
                        </Button>
                        
                        <Button 
                            variant="outline" 
                            onClick={closeResultPopup} 
                            className="px-6"
                        >
                            Close
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EventResultPopup;