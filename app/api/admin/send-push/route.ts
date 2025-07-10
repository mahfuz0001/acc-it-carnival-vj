import { type NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import webpush from "web-push";

// Configure web-push
webpush.setVapidDetails(
  `mailto:${process.env.NEXT_PUBLIC_VAPID_EMAIL || ""}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  const supabase = supabaseServer;
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase client not initialized" },
      { status: 500 }
    );
  }

  try {
    const { title, body, url, image, userIds, sendToAll } =
      await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      );
    }

    // Get push subscriptions
    let query = supabase.from("push_subscriptions").select("*");

    if (!sendToAll && userIds?.length > 0) {
      query = query.in("user_id", userIds);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      console.error("Error fetching subscriptions:", error);
      return NextResponse.json(
        { error: "Failed to fetch subscriptions" },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No subscriptions found" },
        { status: 404 }
      );
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-96x96.png",
      image,
      data: { url },
      actions: [
        {
          action: "view",
          title: "View",
          icon: "/icons/icon-96x96.png",
        },
      ],
      tag: "admin-notification",
      requireInteraction: true,
    });

    // Send notifications
    const promises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        );
        return { success: true, userId: sub.user_id };
      } catch (error) {
        console.error(`Failed to send notification to ${sub.user_id}:`, error);

        // Remove invalid subscriptions
        if (
          typeof error === "object" &&
          error !== null &&
          "statusCode" in error &&
          (error as any).statusCode === 410
        ) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("user_id", sub.user_id);
        }

        return {
          success: false,
          userId: sub.user_id,
          error:
            typeof error === "object" && error !== null && "message" in error
              ? (error as { message: string }).message
              : String(error),
        };
      }
    });

    const results = await Promise.all(promises);
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      results,
    });
  } catch (error) {
    console.error("Send push notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
