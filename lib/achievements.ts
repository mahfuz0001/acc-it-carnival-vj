import { supabase } from "@/lib/supabase";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "participation" | "performance" | "social" | "special";
  points: number;
  requirement: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface UserAchievement extends Achievement {
  current_progress: number;
  is_unlocked: boolean;
  unlocked_at?: string;
}

export interface UserStats {
  events_registered: number;
  events_completed: number;
  total_points: number;
  rank: number;
  achievements_unlocked: number;
  days_active: number;
}

/**
 * Fetches all achievements for a user
 */
export async function getUserAchievements(
  userId: string
): Promise<UserAchievement[]> {
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
      .eq("user_id", userId);

    if (error) throw error;

    return (
      data?.map((item) => ({
        id: item.achievements.id,
        title: item.achievements.title,
        description: item.achievements.description,
        icon: item.achievements.icon,
        category: item.achievements.category,
        points: item.achievements.points,
        requirement: item.achievements.requirement,
        rarity: item.achievements.rarity,
        current_progress: item.current_progress,
        is_unlocked: item.is_unlocked,
        unlocked_at: item.unlocked_at,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    throw error;
  }
}

/**
 * Fetches user stats
 */
export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return data || null;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw error;
  }
}

/**
 * Initializes achievements for a new user
 */
export async function initializeUserAchievements(userId: string) {
  try {
    // Get all achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from("achievements")
      .select("*");

    if (achievementsError) throw achievementsError;

    // Check if user already has achievements initialized
    const { data: existingAchievements, error: existingError } = await supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", userId);

    if (existingError) throw existingError;

    const existingIds = new Set(
      existingAchievements?.map((a) => a.achievement_id) || []
    );

    // Insert missing achievements
    const newAchievements =
      achievements
        ?.filter((a) => !existingIds.has(a.id))
        .map((achievement) => ({
          user_id: userId,
          achievement_id: achievement.id,
          current_progress: 0,
          is_unlocked: false,
        })) || [];

    if (newAchievements.length > 0) {
      const { error: insertError } = await supabase
        .from("user_achievements")
        .insert(newAchievements);

      if (insertError) throw insertError;
    }

    // Initialize user stats if not exists
    const { error: statsError } = await supabase.from("user_stats").upsert(
      {
        user_id: userId,
        events_registered: 0,
        events_completed: 0,
        total_points: 0,
        rank: 0,
        achievements_unlocked: 0,
        days_active: 1,
      },
      { onConflict: "user_id" }
    );

    if (statsError) throw statsError;

    return { success: true };
  } catch (error) {
    console.error("Error initializing user achievements:", error);
    throw error;
  }
}

/**
 * Updates achievement progress for a user
 */
export async function updateAchievementProgress(
  userId: string,
  category: string,
  increment = 1
): Promise<{ newlyUnlocked: UserAchievement[] }> {
  try {
    // Get achievements in this category that aren't unlocked yet
    const { data: achievements, error: achievementsError } = await supabase
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
      .eq("user_id", userId)
      .eq("achievements.category", category)
      .eq("is_unlocked", false);

    if (achievementsError) throw achievementsError;

    const newlyUnlocked: UserAchievement[] = [];

    for (const achievement of achievements || []) {
      const newProgress = achievement.current_progress + increment;
      const isNowUnlocked = newProgress >= achievement.achievements.requirement;

      // Update progress
      const { error: updateError } = await supabase
        .from("user_achievements")
        .update({
          current_progress: newProgress,
          is_unlocked: isNowUnlocked,
          unlocked_at: isNowUnlocked ? new Date().toISOString() : null,
        })
        .eq("user_id", userId)
        .eq("achievement_id", achievement.achievement_id);

      if (updateError) throw updateError;

      if (isNowUnlocked) {
        newlyUnlocked.push({
          id: achievement.achievements.id,
          title: achievement.achievements.title,
          description: achievement.achievements.description,
          icon: achievement.achievements.icon,
          category: achievement.achievements.category,
          points: achievement.achievements.points,
          requirement: achievement.achievements.requirement,
          rarity: achievement.achievements.rarity,
          current_progress: newProgress,
          is_unlocked: true,
          unlocked_at: new Date().toISOString(),
        });

        // Update user stats
        await updateUserPoints(userId, achievement.achievements.points);
      }
    }

    return { newlyUnlocked };
  } catch (error) {
    console.error("Error updating achievement progress:", error);
    throw error;
  }
}

/**
 * Updates user points
 */
export async function updateUserPoints(userId: string, points: number) {
  try {
    const { error } = await supabase.rpc("update_user_points", {
      user_id: userId,
      points_to_add: points,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error updating user points:", error);
    throw error;
  }
}

/**
 * Updates user stats when they register for an event
 */
export async function updateStatsForEventRegistration(
  userId: string,
  eventId: number
): Promise<void> {
  try {
    // Update user stats
    const { error: statsError } = await supabase.rpc(
      "increment_events_registered",
      {
        user_id: userId,
      }
    );

    if (statsError) throw statsError;

    // Update achievement progress
    await updateAchievementProgress(userId, "participation", 1);

    // Update leaderboard
    await updateLeaderboard(userId);
  } catch (error) {
    console.error("Error updating stats for event registration:", error);
    throw error;
  }
}

/**
 * Updates user stats when they complete an event
 */
export async function updateStatsForEventCompletion(
  userId: string,
  eventId: number,
  points: number
): Promise<void> {
  try {
    // Increment `events_completed` and `total_points` in `user_stats`
    const { error: statsError } = await supabase.rpc(
      "update_user_stats_after_completion",
      {
        user_id: userId,
        points_to_add: points,
      }
    );

    if (statsError) throw statsError;

    // Increment points in `event_leaderboard`
    const { error: eventLeaderboardError } = await supabase.rpc(
      "increment_event_leaderboard_points",
      {
        user_id: userId,
        event_id: eventId,
        points_to_add: points,
      }
    );

    if (eventLeaderboardError) throw eventLeaderboardError;

    // Increment points in `leaderboard`
    const { error: leaderboardError } = await supabase.rpc(
      "increment_global_leaderboard_points",
      {
        user_id: userId,
        points_to_add: points,
      }
    );

    if (leaderboardError) throw leaderboardError;

    // Update achievement progress
    await updateAchievementProgress(userId, "performance");
  } catch (error) {
    console.error("Error updating stats for event completion:", error);
    throw error;
  }
}

/**
 * Updates user stats when they win an event
 */
export async function updateStatsForEventWin(userId: string): Promise<void> {
  try {
    // Update leaderboard
    const { error: leaderboardError } = await supabase
      .from("leaderboard")
      .update({
        events_won: supabase.rpc("increment", { inc: 1 }),
      })
      .eq("user_id", userId);

    if (leaderboardError) throw leaderboardError;

    // Update achievement progress
    await updateAchievementProgress(userId, "performance");
  } catch (error) {
    console.error("Error updating stats for event win:", error);
    throw error;
  }
}

/**
 * Updates user active days
 */
export async function updateUserActiveDay(userId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc("update_user_active_day", {
      user_id: userId,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error updating user active day:", error);
    throw error;
  }
}

/**
 * Updates leaderboard
 */
export async function updateLeaderboard(userId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc("update_leaderboard", {
      user_id: userId,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    throw error;
  }
}

/**
 * Gets global leaderboard
 */
export async function getGlobalLeaderboard(limit = 50): Promise<any[]> {
  try {
    const { data, error } = await supabase
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
      .limit(limit);

    if (error) throw error;

    return (
      data?.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching global leaderboard:", error);
    throw error;
  }
}

/**
 * Gets event leaderboard
 */
export async function getEventLeaderboard(
  eventId: number,
  limit = 50
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("event_leaderboard")
      .select(
        `
        *,
        users (
          full_name,
          institution
        )
      `
      )
      .eq("event_id", eventId)
      .order("points", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (
      data?.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching event leaderboard:", error);
    throw error;
  }
}
