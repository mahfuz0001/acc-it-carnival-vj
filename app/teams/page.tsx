"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Plus, Crown, Search, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Link from "next/link";

interface Team {
  id: string;
  name: string;
  leader_id: string;
  event_id: number;
  created_at: string;
  events: {
    name: string;
    event_type: string;
    is_team_based: boolean;
  };
  team_members: {
    id: string;
    role: string;
    users: {
      full_name: string;
      institution: string;
    };
  }[];
}

interface Event {
  id: number;
  name: string;
  event_type: string;
  is_team_based: boolean;
  team_size_max: number;
}

export default function TeamsPage() {
  const { user, isSignedIn } = useUser();
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>("all");
  const [createForm, setCreateForm] = useState({
    name: "",
    event_id: "",
  });

  useEffect(() => {
    fetchTeams();
    fetchEvents();
    if (isSignedIn && user) {
      fetchMyTeams();
    }
  }, [isSignedIn, user]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select(
          `
          *,
          events (
            name,
            event_type,
            is_team_based
          ),
          team_members (
            id,
            role,
            users (
              full_name,
              institution
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to load teams");
    }
  };

  const fetchMyTeams = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("teams")
        .select(
          `
          *,
          events (
            name,
            event_type,
            is_team_based
          ),
          team_members (
            id,
            role,
            users (
              full_name,
              institution
            )
          )
        `
        )
        .eq("leader_id", user.id);

      if (error) throw error;
      setMyTeams(data || []);
    } catch (error) {
      console.error("Error fetching my teams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id, name, event_type, is_team_based, team_size_max")
        .eq("is_team_based", true)
        .eq("is_active", true);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleCreateTeam = async () => {
    if (!user || !createForm.name || !createForm.event_id) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("teams")
        .insert({
          name: createForm.name,
          leader_id: user.id,
          event_id: Number.parseInt(createForm.event_id),
        })
        .select()
        .single();

      if (error) throw error;

      // Add leader as team member
      await supabase.from("team_members").insert({
        team_id: data.id,
        user_id: user.id,
        role: "leader",
      });

      toast.success("Team created successfully!");
      setIsCreateDialogOpen(false);
      setCreateForm({ name: "", event_id: "" });
      fetchTeams();
      fetchMyTeams();
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Failed to create team");
    }
  };

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.events.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent =
      selectedEventFilter === "all" ||
      team.event_id.toString() === selectedEventFilter;
    return matchesSearch && matchesEvent;
  });

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#131943] to-[#1a1f4a] flex items-center justify-center">
        <Card className="max-w-md w-full bg-[#556492]/20 border-[#556492]/30">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Sign in required</CardTitle>
            <CardDescription className="text-[#D4D4D6]">
              Please sign in to view and manage teams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/sign-in">
              <Button className="w-full bg-[#F7374F] hover:bg-[#6ba348] text-white">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#131943] to-[#1a1f4a]">
      <div className="container px-4 py-12 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl">
              Team Management
            </h1>
            <p className="mx-auto max-w-[700px] text-[#D4D4D6] md:text-xl">
              Create teams, join existing ones, and collaborate with fellow
              participants for team-based events
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge className="bg-[#F7374F] text-white">
                <Users className="h-3 w-3 mr-1" />
                {teams.length} Teams
              </Badge>
              <Badge className="bg-[#7683A4] text-white">
                Team Events Available
              </Badge>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#D4D4D6]" />
              <Input
                placeholder="Search teams or events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#556492]/20 border-[#556492]/30 text-white placeholder:text-[#D4D4D6]/50"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedEventFilter}
              onValueChange={setSelectedEventFilter}
            >
              <SelectTrigger className="w-[200px] bg-[#556492]/20 border-[#556492]/30 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by event" />
              </SelectTrigger>
              <SelectContent className="bg-[#556492] border-[#7683A4]">
                <SelectItem value="all">All Events</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-[#F7374F] hover:bg-[#6ba348] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#131943] border-[#556492]">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Create New Team
                  </DialogTitle>
                  <DialogDescription className="text-[#D4D4D6]">
                    Create a team for team-based events and invite members to
                    join
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="teamName" className="text-[#D4D4D6]">
                      Team Name
                    </Label>
                    <Input
                      id="teamName"
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter team name"
                      className="bg-[#556492]/20 border-[#556492]/30 text-white placeholder:text-[#D4D4D6]/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="event" className="text-[#D4D4D6]">
                      Event
                    </Label>
                    <Select
                      value={createForm.event_id}
                      onValueChange={(value) =>
                        setCreateForm((prev) => ({ ...prev, event_id: value }))
                      }
                    >
                      <SelectTrigger className="bg-[#556492]/20 border-[#556492]/30 text-white">
                        <SelectValue placeholder="Select event" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#556492] border-[#7683A4]">
                        {events.map((event) => (
                          <SelectItem
                            key={event.id}
                            value={event.id.toString()}
                          >
                            {event.name} (Max {event.team_size_max} members)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="flex-1 border-[#7683A4] text-[#7683A4] hover:bg-[#7683A4]/20"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateTeam}
                      className="flex-1 bg-[#F7374F] hover:bg-[#6ba348] text-white"
                    >
                      Create Team
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* My Teams Section */}
        {myTeams.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">My Teams</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myTeams.map((team) => (
                <Card
                  key={team.id}
                  className="bg-gradient-to-br from-[#F7374F]/20 to-[#6ba348]/20 border-[#F7374F]/30"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Crown className="h-5 w-5 text-[#F7374F]" />
                        {team.name}
                      </CardTitle>
                      <Badge className="bg-[#F7374F] text-white">Leader</Badge>
                    </div>
                    <CardDescription className="text-[#D4D4D6]">
                      {team.events.name} • {team.team_members.length} members
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="text-[#D4D4D6]">Created:</span>
                        <span className="text-white ml-2">
                          {new Date(team.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm text-[#D4D4D6]">Members:</span>
                        {team.team_members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Users className="h-3 w-3 text-[#F7374F]" />
                            <span className="text-white">
                              {member.users.full_name}
                            </span>
                            {member.role === "leader" && (
                              <Crown className="h-3 w-3 text-[#F7374F]" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Teams Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">All Teams</h2>
          {filteredTeams.length === 0 ? (
            <Card className="bg-[#556492]/20 border-[#556492]/30">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-[#F7374F] mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No teams found
                </h3>
                <p className="text-[#D4D4D6] text-center max-w-md mb-4">
                  {searchTerm || selectedEventFilter !== "all"
                    ? "No teams match your search criteria. Try adjusting your filters."
                    : "Be the first to create a team for the upcoming events!"}
                </p>
                {!searchTerm && selectedEventFilter === "all" && (
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-[#F7374F] hover:bg-[#6ba348] text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Team
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTeams.map((team) => (
                <Card
                  key={team.id}
                  className="bg-gradient-to-br from-[#556492]/10 to-[#7683A4]/10 border-[#556492]/30 hover:border-[#F7374F]/50 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{team.name}</CardTitle>
                      <Badge
                        variant="outline"
                        className="border-[#7683A4] text-[#7683A4]"
                      >
                        {team.events.event_type}
                      </Badge>
                    </div>
                    <CardDescription className="text-[#D4D4D6]">
                      {team.events.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#D4D4D6]">Members:</span>
                        <span className="text-white">
                          {team.team_members.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#D4D4D6]">Created:</span>
                        <span className="text-white">
                          {new Date(team.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {team.team_members.slice(0, 3).map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <Users className="h-3 w-3 text-[#F7374F]" />
                            <span className="text-[#D4D4D6]">
                              {member.users.full_name}
                            </span>
                            {member.role === "leader" && (
                              <Crown className="h-3 w-3 text-[#F7374F]" />
                            )}
                          </div>
                        ))}
                        {team.team_members.length > 3 && (
                          <div className="text-xs text-[#D4D4D6]">
                            +{team.team_members.length - 3} more members
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
