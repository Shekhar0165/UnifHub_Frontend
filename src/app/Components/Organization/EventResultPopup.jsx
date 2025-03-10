import React, { useState, useEffect } from 'react';
import { Award, ArrowUp, Search, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Toaster } from '@/components/ui/toaster';


const EventResultPopup = ({ selectedResult, closeResultPopup }) => {
    const [participants, setParticipants] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [newPosition, setNewPosition] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
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
                            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                            "Content-Type": "application/json",
                        },
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

    // Position update handler
    console.log(selectedTeam?._id)
    const handleUpdatePosition = async () => {
        if (!selectedTeam || newPosition === "") return;

        setIsLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API}/Participants/addresult/${selectedTeam._id}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ position: Number(newPosition) }),
                }
            );

            if (!response.ok) throw new Error('Failed to update position');
            
            // Update position in local state
            setParticipants(prevParticipants =>
                prevParticipants.map(team =>
                    team._id === selectedTeam._id ? { ...team, position: Number(newPosition) } : team
                )
            );
            
            toast({
                title: "Position Updated",
                description: `${selectedTeam.teamName} is now in position ${newPosition}`,
            });
            
            setNewPosition("");
            setSelectedTeam(null);
            setShowUpdateDialog(false);
        } catch (error) {
            console.error("Error updating position:", error);
            toast({
                title: "Update Failed",
                description: "Could not update team position. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const openUpdateDialog = (team) => {
        setSelectedTeam(team);
        setNewPosition(team.position || "");
        setShowUpdateDialog(true);
    };


    const renderTable = (teams) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-20">Rank</TableHead>
                    <TableHead>Team Name</TableHead>
                    <TableHead className="text-right">Action</TableHead>
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
                        <TableRow key={team._id}>
                            <TableCell>
                                {team.position || "-"}
                            </TableCell>
                            <TableCell>{team.teamName}</TableCell>
                            <TableCell className="text-right">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => openUpdateDialog(team)}
                                >
                                    <Award className="h-4 w-4 mr-1" />
                                    Rank
                                </Button>
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
                        <Tabs defaultValue="ranked" className="mt-4">
                            <TabsList className="mb-4">
                                <TabsTrigger value="ranked">
                                    Ranked Teams ({rankedTeams.length})
                                </TabsTrigger>
                                <TabsTrigger value="unranked">
                                    Unranked Teams ({unrankedTeams.length})
                                </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="ranked">
                                {renderTable(rankedTeams)}
                            </TabsContent>
                            
                            <TabsContent value="unranked">
                                {renderTable(unrankedTeams)}
                            </TabsContent>
                        </Tabs>
                    )}
                    
                    <Separator className="my-6" />
                    
                    <div className="flex justify-end">
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
            
            {/* Update Position Dialog */}
            <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Team Ranking</DialogTitle>
                    </DialogHeader>
                    
                    {selectedTeam && (
                        <div className="space-y-4 py-2">
                            <div className="bg-accent/30 p-3 rounded-md">
                                <p className="text-sm font-medium">Team: <span className="text-primary">{selectedTeam.teamName}</span></p>
                                <p className="text-sm text-muted-foreground">
                                    Current position: {selectedTeam.position || "Not ranked"}
                                </p>
                            </div>
                            
                            <div className="flex flex-col space-y-2">
                                <label htmlFor="position" className="text-sm font-medium">
                                    New Position
                                </label>
                                <Input
                                    id="position"
                                    type="number"
                                    min="1"
                                    placeholder="Enter position number"
                                    value={newPosition}
                                    onChange={(e) => setNewPosition(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleUpdatePosition} 
                            disabled={isLoading || newPosition === ""}
                            className="gap-1"
                        >
                            <Check className="h-4 w-4" />
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EventResultPopup;