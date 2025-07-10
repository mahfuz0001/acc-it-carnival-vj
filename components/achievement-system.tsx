"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Users, Calendar, Award, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "participation" | "performance" | "social" | "special";
  points: number;
  requirement: number;
  current_progress: number;
  is_unlocked: boolean;
  unlocked_at?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface UserStats {
  events_registered: number;
  events_completed: number;
  total_points: number;
  rank: number;
  achievements_unlocked: number;
  days_active: number;
}

export function AchievementSystem() {
  const { user } = useUser();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    if (user) {
      fetchAchievements();
      fetchUserStats();
    }
  }, [user]);

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_achievements")
        .select(
          `
          *,
          achievements (
            id,
            title,
            description,
            icon,
            category,
            points,
            requirement,
            rarity
          )
        `
        )
        .eq("user_id", user.id);

      if (error) throw error;

      const achievementList: Achievement[] =
        data?.map((item) => ({
          id: item.achievements.id,
          title: item.achievements.title,
          description: item.achievements.description,
          icon: item.achievements.icon,
          category: item.achievements.category,
          points: item.achievements.points,
          requirement: item.achievements.requirement,
          current_progress: item.current_progress,
          is_unlocked: item.is_unlocked,
          unlocked_at: item.unlocked_at,
          rarity: item.achievements.rarity,
        })) || [];

      setAchievements(achievementList);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      setUserStats(
        data || {
          events_registered: 0,
          events_completed: 0,
          total_points: 0,
          rank: 0,
          achievements_unlocked: 0,
          days_active: 1,
        }
      );
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const checkForNewAchievements = async () => {
    // This would be called after user actions to check for newly unlocked achievements
    const newlyUnlocked = achievements.filter(
      (achievement) =>
        !achievement.is_unlocked &&
        achievement.current_progress >= achievement.requirement
    );

    if (newlyUnlocked.length > 0) {
      setNewAchievements(newlyUnlocked);

      // Update achievements in database
      for (const achievement of newlyUnlocked) {
        await supabase
          .from("user_achievements")
          .update({
            is_unlocked: true,
            unlocked_at: new Date().toISOString(),
          })
          .eq("user_id", user?.id)
          .eq("achievement_id", achievement.id);
      }

      // Show celebration toast
      toast.success(`🎉 Achievement unlocked: ${newlyUnlocked[0].title}!`);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "from-gray-500/20 to-gray-600/20 border-gray-500/30";
      case "rare":
        return "from-blue-500/20 to-blue-600/20 border-blue-500/30";
      case "epic":
        return "from-purple-500/20 to-purple-600/20 border-purple-500/30";
      case "legendary":
        return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
      default:
        return "from-[#556492]/20 to-[#7683A4]/20 border-[#556492]/30";
    }
  };

  const getRarityBadge = (rarity: string) => {
    const colors = {
      common: "bg-gray-500",
      rare: "bg-blue-500",
      epic: "bg-purple-500",
      legendary: "bg-yellow-500",
    };
    return colors[rarity as keyof typeof colors] || "bg-gray-500";
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "participation":
        return <Calendar className="h-4 w-4" />;
      case "performance":
        return <Trophy className="h-4 w-4" />;
      case "social":
        return <Users className="h-4 w-4" />;
      case "special":
        return <Star className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const filteredAchievements =
    selectedCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const categories = [
    { id: "all", label: "All", icon: <Award className="h-4 w-4" /> },
    {
      id: "participation",
      label: "Participation",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      id: "performance",
      label: "Performance",
      icon: <Trophy className="h-4 w-4" />,
    },
    { id: "social", label: "Social", icon: <Users className="h-4 w-4" /> },
    { id: "special", label: "Special", icon: <Star className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* User Stats Overview */}
      {userStats && (
        <Card className="bg-gradient-to-r from-[#F7374F]/20 to-[#6ba348]/20 border-[#F7374F]/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#F7374F]" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#F7374F]">
                  {userStats.total_points}
                </div>
                <div className="text-sm text-[#D4D4D6]">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#F7374F]">
                  #{userStats.rank}
                </div>
                <div className="text-sm text-[#D4D4D6]">Global Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#F7374F]">
                  {userStats.achievements_unlocked}
                </div>
                <div className="text-sm text-[#D4D4D6]">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#F7374F]">
                  {userStats.events_completed}
                </div>
                <div className="text-sm text-[#D4D4D6]">Events Done</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? "bg-[#F7374F] text-white"
                : "bg-[#556492]/20 text-[#D4D4D6] hover:bg-[#556492]/30"
            }`}
          >
            {category.icon}
            {category.label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredAchievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={`bg-gradient-to-br ${getRarityColor(achievement.rarity)} border relative overflow-hidden ${
                  achievement.is_unlocked ? "" : "opacity-75"
                }`}
              >
                {!achievement.is_unlocked && (
                  <div className="absolute top-2 right-2">
                    <Lock className="h-4 w-4 text-[#D4D4D6]" />
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{achievement.icon}</span>
                      {getCategoryIcon(achievement.category)}
                    </div>
                    <div className="flex gap-1">
                      <Badge
                        className={`${getRarityBadge(achievement.rarity)} text-white text-xs`}
                      >
                        {achievement.rarity}
                      </Badge>
                      <Badge className="bg-[#F7374F] text-white text-xs">
                        {achievement.points} pts
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-white text-lg">
                    {achievement.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-[#D4D4D6] text-sm mb-3">
                    {achievement.description}
                  </p>

                  {!achievement.is_unlocked && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#D4D4D6]">Progress</span>
                        <span className="text-[#F7374F]">
                          {achievement.current_progress}/
                          {achievement.requirement}
                        </span>
                      </div>
                      <Progress
                        value={
                          (achievement.current_progress /
                            achievement.requirement) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  )}

                  {achievement.is_unlocked && achievement.unlocked_at && (
                    <div className="flex items-center gap-2 text-sm text-[#F7374F]">
                      <Trophy className="h-4 w-4" />
                      Unlocked{" "}
                      {new Date(achievement.unlocked_at).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* New Achievement Celebration */}
      <AnimatePresence>
        {newAchievements.map((achievement) => (
          <motion.div
            key={`celebration-${achievement.id}`}
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setNewAchievements([])}
          >
            <Card className="bg-gradient-to-br from-[#F7374F]/20 to-[#6ba348]/20 border-[#F7374F] max-w-md mx-4">
              <CardContent className="text-center p-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="text-6xl mb-4"
                >
                  🏆
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Achievement Unlocked!
                </h3>
                <h4 className="text-xl text-[#F7374F] mb-2">
                  {achievement.title}
                </h4>
                <p className="text-[#D4D4D6] mb-4">{achievement.description}</p>
                <Badge className="bg-[#F7374F] text-white">
                  +{achievement.points} points
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
