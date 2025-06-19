import React, { useState, useEffect } from 'react';
import { Award, ArrowUp, Search, Check, X, Save, AlertTriangle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Custom confirmation dialog component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, description, confirmText = "Confirm", cancelText = "Cancel" }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <Card className="w-full max-w-md mx-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-6">{description}</p>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose}>
                            {cancelText}
                        </Button>
                        <Button onClick={onConfirm}>
                            {confirmText}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const EventResultPopup = ({ selectedResult, closeResultPopup }) => {
    const [participants, setParticipants] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [duplicatePositions, setDuplicatePositions] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [error, setError] = useState("");
    const [hasExistingResults, setHasExistingResults] = useState(false);

    // Toast function - replace with your actual toast implementation
    const toast = ({ title, description, variant }) => {
        console.log(`Toast: ${title} - ${description} (${variant})`);
        // For demo purposes, using alert - replace with your actual toast
        if (variant === "destructive") {
            alert(`Error: ${description}`);
        } else {
            alert(`${title}: ${description}`);
        }
    };

    useEffect(() => {
        const fetchParticipants = async () => {
            if (!selectedResult?._id) return;

            setIsLoading(true);
            setError("");
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API}/Participants/for-events/${selectedResult._id}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        includes: true
                    }
                );

                if (!response.ok) throw new Error('Failed to fetch participants');

                const data = await response.json();
                const participantsList = data.participants || [];
                setParticipants(participantsList);

                // Check if results are already declared
                const hasResults = participantsList.some(participant => participant.position && participant.position > 0);
                setHasExistingResults(hasResults);

            } catch (error) {
                console.error("Error fetching participants:", error);
                const errorMsg = "Could not load participants. Please try again.";
                setError(errorMsg);
                toast({
                    title: "Error",
                    description: errorMsg,
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchParticipants();
    }, [selectedResult?._id]);

    // Check for duplicate positions whenever participants change
    useEffect(() => {
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
        setError(""); // Clear any existing errors

        // If position is already taken by another team, show toast warning
        if (newPosition && isPositionTaken(newPosition, teamId)) {
            const errorMsg = `Position ${newPosition} is already assigned to another team. Each position must be unique.`;
            setError(errorMsg);
            toast({
                title: "Position Already Taken",
                description: errorMsg,
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

    // Handle save button click - show confirmation first
    const handleSaveClick = () => {
        setError(""); // Clear any existing errors

        // Check for duplicate positions first
        if (duplicatePositions.length > 0) {
            const errorMsg = `Positions must be unique. Please fix duplicate positions: ${duplicatePositions.join(', ')}`;
            setError(errorMsg);
            toast({
                title: "Duplicate Positions",
                description: errorMsg,
                variant: "destructive",
            });
            return;
        }

        const validTeams = participants.filter(team => team.position !== null && team.position !== undefined);

        if (validTeams.length === 0) {
            const errorMsg = "No positions have been assigned to any teams";
            setError(errorMsg);
            toast({
                title: "Warning",
                description: errorMsg,
                variant: "destructive",
            });
            return;
        }

        // Show confirmation dialog
        setShowConfirmation(true);
    };

    // Save all positions at once
    const saveAllPositions = async () => {
        setShowConfirmation(false);
        setIsSaving(true);
        setError("");

        try {
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

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API}/Participants/declareResult`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(requestData)
                }
            );

            const responseData = await response.json();

            // Handle backend errors
            if (!response.ok || responseData.success === false) {
                throw new Error(responseData.message || "Failed to save positions");
            }

            // Show success message
            const successMsg = responseData.message || `Updated positions for ${results.length} teams`;
            toast({
                title: "Positions Saved",
                description: successMsg,
            });

            setHasUnsavedChanges(false);

            // Close the popup after successful save
            setTimeout(() => {
                closeResultPopup();
            }, 1500);

        } catch (error) {
            console.error("Error saving positions:", error);
            
            // Extract and show the actual backend error message
            let errorMessage = "Could not update team positions. Please try again.";
            if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
            toast({
                title: "Save Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    console.log('hasExistingResults',hasExistingResults)

    // Handle close with unsaved changes check
    const handleClosePopup = () => {
        if (hasUnsavedChanges) {
            const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to close without saving?");
            if (!confirmClose) return;
        }
        closeResultPopup();
    };

    const renderTable = (teams) => (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="text-left p-2 w-20">Rank</th>
                        <th className="text-left p-2">Team Name</th>
                        <th className="text-right p-2">Position</th>
                    </tr>
                </thead>
                <tbody>
                    {teams.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="text-center text-muted-foreground py-6">
                                {isLoading ? "Loading teams..." : "No teams found"}
                            </td>
                        </tr>
                    ) : (
                        teams.map((team) => (
                            <tr key={team._id} className={`border-b ${duplicatePositions.includes(team.position) ? "bg-red-50" : ""}`}>
                                <td className="p-2">
                                    {team.position || "-"}
                                </td>
                                <td className="p-2">{team.teamName}</td>
                                <td className="p-2 text-right">
                                    <Input
                                        type="number"
                                        min="1"
                                        placeholder="Position"
                                        value={team.position || ""}
                                        onChange={(e) => handlePositionChange(team._id, e.target.value)}
                                        className={`w-24 inline-block ${duplicatePositions.includes(team.position) ? "border-red-500" : ""}`}
                                        disabled={isSaving}
                                    />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    // Get confirmation dialog configuration
    const getConfirmationConfig = () => {
        if (hasExistingResults) {
            return {
                title: "Update Results",
                description: "Are you sure you want to update the results? This will modify the existing rankings for this event.",
                confirmText: "Update Results"
            };
        } else {
            return {
                title: "Declare Results",
                description: "Are you sure you want to declare results for this event? Once declared, the event will be marked as completed and achievements will be awarded to participants. After then you are not able change it",
                confirmText: "Declare Results"
            };
        }
    };

    const confirmationConfig = getConfirmationConfig();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl shadow-xl">
                <CardHeader className="pb-2 border-b">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Team Rankings
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={handleClosePopup} disabled={isSaving}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    {hasExistingResults && (
                        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded mt-2">
                            ℹ️ Results are already declared for this event. You can update the positions.
                        </div>
                    )}
                </CardHeader>

                <CardContent className="p-6">
                    {/* Error Alert - Show backend errors */}
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Duplicate Positions Alert */}
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
                            disabled={isSaving}
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
                            onClick={handleSaveClick}
                            disabled={isLoading || !hasUnsavedChanges || duplicatePositions.length > 0 || isSaving || hasExistingResults}
                            className="px-6 gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Save All Positions
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleClosePopup}
                            className="px-6"
                            disabled={isSaving}
                        >
                            Close
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={saveAllPositions}
                title={confirmationConfig.title}
                description={confirmationConfig.description}
                confirmText={confirmationConfig.confirmText}
                cancelText="Cancel"
            />
        </div>
    );
};

export default EventResultPopup;