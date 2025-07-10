import { type NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const supabase = supabaseServer;
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase client not initialized" },
      { status: 500 }
    );
  }

  try {
    // Get events happening tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .eq("event_date", tomorrowStr)
      .eq("is_active", true);

    if (eventsError) throw eventsError;

    for (const event of events || []) {
      // Get all registered users for this event
      const { data: registrations, error: regError } = await supabase
        .from("registrations")
        .select(
          `
          *,
          users (
            email,
            full_name
          )
        `
        )
        .eq("event_id", event.id)
        .in("status", ["confirmed", "pending"]);

      if (regError) throw regError;

      // Send reminder emails and notifications
      for (const registration of registrations || []) {
        // Send email reminder
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "event_reminder",
            to: registration.users.email,
            data: {
              userName: registration.users.full_name,
              eventName: event.name,
              eventDate: event.event_date,
              eventTime: event.event_time || "TBA",
              platform: event.platform,
            },
          }),
        });

        // Create notification
        await supabase.from("notifications").insert({
          user_id: registration.user_id,
          title: `Reminder: ${event.name} Tomorrow!`,
          message: `Don't forget about ${event.name} happening tomorrow at ${event.event_time || "TBA"}.`,
          type: "event_reminder",
          data: { event_id: event.id },
          is_read: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent reminders for ${events?.length || 0} events`,
    });
  } catch (error) {
    console.error("Reminder cron job error:", error);
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}
