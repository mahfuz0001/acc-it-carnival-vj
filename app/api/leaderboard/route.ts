import { type NextRequest, NextResponse } from "next/server"
import { getGlobalLeaderboard, getEventLeaderboard } from "@/lib/achievements"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10)

    if (eventId) {
      const leaderboard = await getEventLeaderboard(Number.parseInt(eventId, 10), limit)
      return NextResponse.json({ leaderboard })
    } else {
      const leaderboard = await getGlobalLeaderboard(limit)
      return NextResponse.json({ leaderboard })
    }
  } catch (error) {
    console.error("Error in leaderboard API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
