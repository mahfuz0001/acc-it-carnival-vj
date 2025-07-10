"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveLeaderboard } from "@/components/live-leaderboard";
import { AchievementSystem } from "@/components/achievement-system";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Users,
  Trophy,
  Star,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LivePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const liveEvents = [
    {
      id: 1,
      name: "Programming Contest - Final Round",
      status: "live",
      viewers: 234,
      startTime: "2:00 PM",
      category: "Programming",
    },
    {
      id: 2,
      name: "UI/UX Design Challenge",
      status: "upcoming",
      viewers: 0,
      startTime: "4:00 PM",
      category: "Design",
    },
    {
      id: 3,
      name: "Quiz Competition - Semifinals",
      status: "ended",
      viewers: 189,
      startTime: "12:00 PM",
      category: "Quiz",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-500 animate-pulse";
      case "upcoming":
        return "bg-yellow-500";
      case "ended":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
            <h1 className="text-4xl font-bold text-white">Live Carnival</h1>
          </div>
          <p className="text-[#D4D4D6] text-lg">
            Watch live events, track leaderboards, and celebrate achievements in
            real-time
          </p>
        </div>

        <Tabs defaultValue="streams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-[#556492]/20">
            <TabsTrigger
              value="streams"
              className="data-[state=active]:bg-[#F7374F]"
            >
              <Play className="h-4 w-4 mr-2" />
              Live Streams
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-[#F7374F]"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="data-[state=active]:bg-[#F7374F]"
            >
              <Star className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="data-[state=active]:bg-[#F7374F]"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Live Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="streams" className="space-y-6">
            {/* Main Live Stream */}
            <Card className="bg-gradient-to-br from-[#556492]/20 to-[#7683A4]/20 border-[#556492]/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                    Programming Contest - Final Round
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-500 text-white">LIVE</Badge>
                    <Badge
                      variant="outline"
                      className="border-[#F7374F] text-[#F7374F]"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      234 viewers
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Player Placeholder */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#131943] to-[#556492]">
                    <div className="text-center space-y-4">
                      <div className="text-6xl">🎥</div>
                      <div className="text-white text-xl font-semibold">
                        Live Stream
                      </div>
                      <div className="text-[#D4D4D6]">
                        Programming Contest - Final Round
                      </div>
                    </div>
                  </div>

                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="text-white hover:bg-white/20"
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setIsMuted(!isMuted)}
                          className="text-white hover:bg-white/20"
                        >
                          {isMuted ? (
                            <VolumeX className="h-5 w-5" />
                          ) : (
                            <Volume2 className="h-5 w-5" />
                          )}
                        </Button>
                        <span className="text-white text-sm">2:34:12</span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                      >
                        <Maximize className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Stream Info */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-3 bg-[#F7374F]/20 rounded-lg border border-[#F7374F]/30">
                    <div className="text-lg font-bold text-[#F7374F]">12</div>
                    <div className="text-sm text-[#D4D4D6]">
                      Teams Competing
                    </div>
                  </div>
                  <div className="text-center p-3 bg-[#556492]/20 rounded-lg border border-[#556492]/30">
                    <div className="text-lg font-bold text-[#F7374F]">
                      2:34:12
                    </div>
                    <div className="text-sm text-[#D4D4D6]">Time Remaining</div>
                  </div>
                  <div className="text-center p-3 bg-[#556492]/20 rounded-lg border border-[#556492]/30">
                    <div className="text-lg font-bold text-[#F7374F]">234</div>
                    <div className="text-sm text-[#D4D4D6]">Live Viewers</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Other Streams */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {liveEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-[#556492]/20 border-[#556492]/30 hover:border-[#F7374F]/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge
                          className={`${getStatusColor(event.status)} text-white text-xs`}
                        >
                          {event.status.toUpperCase()}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-[#F7374F] text-[#F7374F] text-xs"
                        >
                          {event.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-white text-lg">
                        {event.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="aspect-video bg-[#131943] rounded-lg flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <div className="text-3xl">
                            {event.status === "live"
                              ? "🔴"
                              : event.status === "upcoming"
                                ? "⏰"
                                : "✅"}
                          </div>
                          <div className="text-[#D4D4D6] text-sm">
                            {event.startTime}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#D4D4D6]">
                          <Users className="h-3 w-3 inline mr-1" />
                          {event.viewers} viewers
                        </span>
                        <Button
                          size="sm"
                          variant={
                            event.status === "live" ? "default" : "outline"
                          }
                          className={
                            event.status === "live"
                              ? "bg-[#F7374F] hover:bg-[#6ba348] text-white"
                              : "border-[#556492] text-[#D4D4D6] hover:bg-[#556492]/20"
                          }
                          disabled={event.status === "ended"}
                        >
                          {event.status === "live"
                            ? "Watch"
                            : event.status === "upcoming"
                              ? "Notify Me"
                              : "Replay"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <LiveLeaderboard />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementSystem />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card className="bg-[#556492]/20 border-[#556492]/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#F7374F]" />
                  Today's Live Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      time: "10:00 AM",
                      event: "Opening Ceremony",
                      status: "completed",
                    },
                    {
                      time: "11:00 AM",
                      event: "Programming Contest - Preliminaries",
                      status: "completed",
                    },
                    {
                      time: "2:00 PM",
                      event: "Programming Contest - Finals",
                      status: "live",
                    },
                    {
                      time: "4:00 PM",
                      event: "UI/UX Design Challenge",
                      status: "upcoming",
                    },
                    {
                      time: "6:00 PM",
                      event: "Quiz Competition",
                      status: "upcoming",
                    },
                    {
                      time: "8:00 PM",
                      event: "Closing Ceremony",
                      status: "upcoming",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        item.status === "live"
                          ? "bg-red-500/20 border-red-500/30"
                          : item.status === "completed"
                            ? "bg-green-500/20 border-green-500/30"
                            : "bg-[#556492]/20 border-[#556492]/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            item.status === "live"
                              ? "bg-red-500 animate-pulse"
                              : item.status === "completed"
                                ? "bg-green-500"
                                : "bg-yellow-500"
                          }`}
                        ></div>
                        <div>
                          <div className="text-white font-medium">
                            {item.event}
                          </div>
                          <div className="text-[#D4D4D6] text-sm">
                            {item.time}
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={
                          item.status === "live"
                            ? "bg-red-500 text-white"
                            : item.status === "completed"
                              ? "bg-green-500 text-white"
                              : "bg-yellow-500 text-white"
                        }
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
