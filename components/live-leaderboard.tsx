"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp, Users, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface LeaderboardEntry {
  id: string;
  user_id: string;
  total_points: number;
  events_participated: number;
  events_won: number;
  rank: number;
  users: {
    full_name: string;
    institution: string;
    profile_picture: string | null;
  };
}

interface EventLeaderboard {
  event_id: number;
  event_name: string;
  participants: {
    user_id: string;
    points: number;
    rank: number;
    users: {
      full_name: string;
      institution: string;
    };
  }[];
}

export function LiveLeaderboard() {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<
    LeaderboardEntry[]
  >([]);
  const [eventLeaderboards, setEventLeaderboards] = useState<
    EventLeaderboard[]
  >([]);
  const [activeTab, setActiveTab] = useState<"global" | "events">("global");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();

    // Set up real-time subscription
    const channel = supabase
      .channel("leaderboard_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leaderboard",
        },
        () => {
          fetchLeaderboards();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLeaderboards = async () => {
    try {
      // Fetch global leaderboard
      const { data: globalData, error: globalError } = await supabase
        .from("leaderboard")
        .select(
          `
          *,
          users (
            full_name,
            institution,
            profile_picture
          )
        `
        )
        .order("total_points", { ascending: false })
        .limit(50);

      if (globalError) throw globalError;

      // Add ranks
      const rankedGlobal =
        globalData?.map((entry, index) => ({
          ...entry,
          rank: index + 1,
        })) || [];

      setGlobalLeaderboard(rankedGlobal);

      // Fetch event-specific leaderboards
      const { data: eventsData, error: eventsError } = await supabase
        .from("event_leaderboard")
        .select(
          `
          *,
          events (name),
          users (full_name, institution)
        `
        )
        .order("points", { ascending: false });

      if (eventsError) throw eventsError;

      // Group by event
      const groupedEvents =
        eventsData?.reduce(
          (acc, entry) => {
            const eventId = entry.event_id;
            if (!acc[eventId]) {
              acc[eventId] = {
                event_id: eventId,
                event_name: entry.events.name,
                participants: [],
              };
            }
            acc[eventId].participants.push({
              user_id: entry.user_id,
              points: entry.points,
              rank: acc[eventId].participants.length + 1,
              users: entry.users,
            });
            return acc;
          },
          {} as Record<number, EventLeaderboard>
        ) || {};

      setEventLeaderboards(Object.values(groupedEvents));
    } catch (error) {
      console.error("Error fetching leaderboards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-[#F7374F] font-bold">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
      case 2:
        return "from-gray-400/20 to-gray-500/20 border-gray-400/30";
      case 3:
        return "from-amber-600/20 to-amber-700/20 border-amber-600/30";
      default:
        return "from-[#556492]/10 to-[#7683A4]/10 border-[#556492]/30";
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-[#556492]/20 border-[#556492]/30">
        <CardContent className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="w-8 h-8 border-4 border-[#F7374F] border-t-transparent rounded-full"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-[#F7374F]" />
          Live Leaderboard
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("global")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "global"
                ? "bg-[#F7374F] text-white"
                : "bg-[#556492]/20 text-[#D4D4D6] hover:bg-[#556492]/30"
            }`}
          >
            Global
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "events"
                ? "bg-[#F7374F] text-white"
                : "bg-[#556492]/20 text-[#D4D4D6] hover:bg-[#556492]/30"
            }`}
          >
            Events
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "global" && (
          <motion.div
            key="global"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-[#556492]/10 to-[#7683A4]/10 border-[#556492]/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-[#F7374F]" />
                  Global Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {globalLeaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-[#F7374F] mx-auto mb-4" />
                    <p className="text-[#D4D4D6]">No rankings available yet</p>
                  </div>
                ) : (
                  globalLeaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg bg-gradient-to-r ${getRankColor(entry.rank)} border`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8">
                            {getRankIcon(entry.rank)}
                          </div>
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={entry.users.profile_picture || ""}
                            />
                            <AvatarFallback className="bg-[#F7374F] text-white">
                              {entry.users.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-white">
                              {entry.users.full_name}
                            </h3>
                            <p className="text-sm text-[#D4D4D6]">
                              {entry.users.institution}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-[#F7374F]">
                            {entry.total_points} pts
                          </div>
                          <div className="text-sm text-[#D4D4D6]">
                            {entry.events_participated} events •{" "}
                            {entry.events_won} wins
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "events" && (
          <motion.div
            key="events"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {eventLeaderboards.length === 0 ? (
              <Card className="bg-[#556492]/20 border-[#556492]/30">
                <CardContent className="text-center py-8">
                  <Trophy className="h-12 w-12 text-[#F7374F] mx-auto mb-4" />
                  <p className="text-[#D4D4D6]">
                    No event rankings available yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              eventLeaderboards.map((eventBoard) => (
                <Card
                  key={eventBoard.event_id}
                  className="bg-gradient-to-br from-[#556492]/10 to-[#7683A4]/10 border-[#556492]/30"
                >
                  <CardHeader>
                    <CardTitle className="text-white">
                      {eventBoard.event_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {eventBoard.participants
                      .slice(0, 5)
                      .map((participant, index) => (
                        <div
                          key={participant.user_id}
                          className={`p-3 rounded-lg ${getRankColor(participant.rank)} border flex items-center justify-between`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6">
                              {getRankIcon(participant.rank)}
                            </div>
                            <div>
                              <h4 className="font-medium text-white">
                                {participant.users.full_name}
                              </h4>
                              <p className="text-xs text-[#D4D4D6]">
                                {participant.users.institution}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-[#F7374F] text-white">
                            {participant.points} pts
                          </Badge>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
