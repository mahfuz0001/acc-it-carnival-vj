import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { updateUserActiveDay } from "@/lib/achievements";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update user active day
    await updateUserActiveDay(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in user stats API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
