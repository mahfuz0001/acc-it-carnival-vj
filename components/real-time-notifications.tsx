"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

export function RealTimeNotifications() {
  const { user, isSignedIn } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !user) return;

    // Fetch initial notifications
    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Show toast notification
          toast(newNotification.title, {
            description: newNotification.message,
            action: {
              label: "View",
              onClick: () => handleNotificationClick(newNotification),
            },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSignedIn, user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Handle different notification types
    switch (notification.type) {
      case "event_reminder":
        window.location.href = `/events/${notification.data?.event_id}`;
        break;
      case "registration_confirmed":
        window.location.href = "/profile";
        break;
      case "submission_received":
        window.location.href = "/profile";
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "event_reminder":
        return "⏰";
      case "registration_confirmed":
        return "✅";
      case "submission_received":
        return "📤";
      case "announcement":
        return "📢";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "event_reminder":
        return "bg-yellow-500/20 border-yellow-500/30";
      case "registration_confirmed":
        return "bg-[#F7374F]/20 border-[#F7374F]/30";
      case "submission_received":
        return "bg-blue-500/20 border-blue-500/30";
      case "announcement":
        return "bg-purple-500/20 border-purple-500/30";
      default:
        return "bg-[#556492]/20 border-[#556492]/30";
    }
  };

  if (!isSignedIn) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[#D4D4D6] hover:text-[#F7374F]"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#F7374F] text-white text-xs flex items-center justify-center p-0">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 bg-[#131943] border-[#556492] max-h-96 overflow-y-auto"
      >
        <div className="p-4 border-b border-[#556492]/30">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-[#F7374F] hover:text-[#6ba348] text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="p-4 text-center">
            <Bell className="h-8 w-8 text-[#556492] mx-auto mb-2" />
            <p className="text-[#D4D4D6] text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="p-0 focus:bg-[#556492]/20"
                onClick={() => handleNotificationClick(notification)}
              >
                <Card
                  className={`w-full border-0 rounded-none ${getNotificationColor(notification.type)} ${
                    !notification.is_read ? "bg-opacity-100" : "bg-opacity-50"
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-white truncate">
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-[#F7374F] rounded-full flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-xs text-[#D4D4D6] mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-[#D4D4D6]/70 mt-1">
                          {new Date(
                            notification.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
