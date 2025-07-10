import webpush from "web-push";

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  `mailto:${process.env.NEXT_PUBLIC_VAPID_EMAIL || ""}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  actions?: Array<{
    action: string;
    title: string;
  }>;
  primaryKey?: string;
}

export async function sendPushNotification(
  subscription: any,
  payload: PushNotificationPayload
) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { error: "Failed to send push notification" };
  }
}

export async function sendTeamInvitationPushNotification(
  subscription: any,
  teamName: string,
  eventName: string,
  invitationId: string
) {
  const payload: PushNotificationPayload = {
    title: "Team Invitation",
    body: `You've been invited to join team "${teamName}" for ${eventName}`,
    url: `/teams/invitation/${invitationId}`,
    actions: [
      {
        action: "accept",
        title: "Accept",
      },
      {
        action: "decline",
        title: "Decline",
      },
    ],
    primaryKey: invitationId,
  };

  return sendPushNotification(subscription, payload);
}
