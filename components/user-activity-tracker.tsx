"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export function UserActivityTracker() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn || !user) return;

    // Track user activity on page load
    // const trackActivity = async () => {
    //   try {
    //     await fetch("/api/user-stats", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //     })
    //   } catch (error) {
    //     console.error("Error tracking user activity:", error)
    //   }
    // }

    // trackActivity()

    // Initialize achievements if not already done
    // const initializeAchievements = async () => {
    //   try {
    //     await fetch("/api/achievements", {
    //       method: "PUT",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //     });
    //   } catch (error) {
    //     console.error("Error initializing achievements:", error);
    //   }
    // };

    // initializeAchievements();
  }, [isSignedIn, user]);

  return null;
}
