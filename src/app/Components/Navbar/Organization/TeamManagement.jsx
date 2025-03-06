'use client'
import { useState } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";

const TeamManagement = ({ user, setUser,  }) => {
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamHead, setNewTeamHead] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newMemberName, setNewMemberName] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to add a new team
  const handleAddTeam = async () => {
    if (!newTeamName.trim() || !newTeamHead.trim()) {
      return alert("Team name and head are required.");
    }

    setLoading(true);
    try {
      const response = await axios.post(`/api/organization/${organizationId}/teams`, {
        name: newTeamName.trim(),
        head: newTeamHead.trim(),
        members: [],
      });

      setUser({ ...user, teams: [...user.teams, response.data.team] });
      setNewTeamName("");
      setNewTeamHead("");
    } catch (error) {
      console.error("Error adding team:", error);
      alert("Failed to add team.");
    }
    setLoading(false);
  };

  // Function to add a member to a selected team
  const handleAddMember = async () => {
    if (!newMemberName.trim() || !selectedTeam) {
      return alert("Please select a team and enter a member name.");
    }

    setLoading(true);
    try {
      const response = await axios.put(`/api/organization/${organizationId}/teams/${selectedTeam.name}/add-member`, {
        member: { name: newMemberName.trim(), role: "Member" },
      });

      const updatedTeams = user.teams.map((team) =>
        team.name === selectedTeam.name ? response.data.updatedTeam : team
      );

      setUser({ ...user, teams: updatedTeams });
      setNewMemberName("");
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Failed to add member.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Teams Section */}
      <div className="flex flex-wrap gap-2 mb-4">
        {user.teams?.map((team, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-2 pl-3 pr-2 py-1.5 cursor-pointer"
            onClick={() => setSelectedTeam(team)}
          >
            <div className="flex flex-col">
              <span className="font-semibold">{team.name}</span>
              <span className="text-sm text-gray-500">({team.head})</span>
            </div>
          </Badge>
        ))}
      </div>

      {/* Add Team Section */}
      <div className="flex gap-2">
        <Input
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          placeholder="Enter team name..."
          className="flex-grow"
        />
        <Input
          value={newTeamHead}
          onChange={(e) => setNewTeamHead(e.target.value)}
          placeholder="Enter team head..."
          className="flex-grow"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={handleAddTeam}
          className="flex items-center gap-1"
          disabled={loading}
        >
          <Plus className="h-4 w-4" />
          Add Team
        </Button>
      </div>

      {/* Team Members Section */}
      {selectedTeam && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Members of {selectedTeam.name}</h3>

          {/* Add Member Section */}
          <div className="flex gap-2">
            <Input
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Search and add member..."
              className="flex-grow"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddMember}
              className="flex items-center gap-1"
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
