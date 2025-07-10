import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "@/components/notifications/notification-item";
import { markAllNotificationsAsRead } from "@/lib/actions/notifications";

export default async function NotificationsPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login?returnUrl=/notifications");
  }

  // Get all notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "All notifications read"}
          </p>
        </div>
        {unreadCount > 0 && (
          <form
            action={async (formData: FormData) => {
              await markAllNotificationsAsRead();
            }}
          >
            <Button variant="outline">Mark all as read</Button>
          </form>
        )}
      </div>

      <div className="space-y-4">
        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`${!notification.read ? "border-blue-200 bg-blue-50/50" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {notification.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <Badge variant="secondary">New</Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <CardDescription>{notification.message}</CardDescription>
              </CardHeader>
              {notification.type === "team_invitation" && (
                <CardContent>
                  <NotificationItem
                    notification={notification}
                    onAction={() => window.location.reload()}
                  />
                </CardContent>
              )}
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-10">
              <p className="text-muted-foreground">No notifications yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
