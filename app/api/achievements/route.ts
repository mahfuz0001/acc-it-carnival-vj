import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getUserAchievements,
  getUserStats,
  updateAchievementProgress,
  initializeUserAchievements,
} from "@/lib/achievements";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const achievements = await getUserAchievements(userId);
    const stats = await getUserStats(userId);

    return NextResponse.json({ achievements, stats });
  } catch (error) {
    console.error("Error in achievements API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { category, increment = 1 } = await request.json();

    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    const { newlyUnlocked } = await updateAchievementProgress(
      userId,
      category,
      increment
    );

    return NextResponse.json({ success: true, newlyUnlocked });
  } catch (error) {
    console.error("Error in achievements API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Initialize achievements for user
    await initializeUserAchievements(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in achievements API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
