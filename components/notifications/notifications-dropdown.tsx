"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "./notification-item";
import { createClient } from "@/lib/supabase/client";

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  // Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.read).length);
      }
    }

    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${supabase.auth.getSession().then(({ data }) => data.session?.user.id)}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Mark notifications as read when dropdown is opened
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      async function markAsRead() {
        const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);

        if (unreadIds.length === 0) return;

        await supabase
          .from("notifications")
          .update({ read: true })
          .in("id", unreadIds);

        setNotifications((prev) =>
          prev.map((n) => (unreadIds.includes(n.id) ? { ...n, read: true } : n))
        );

        setUnreadCount(0);
      }

      markAsRead();
    }
  }, [isOpen, unreadCount, notifications, supabase]);

  async function handleAction() {
    // Refresh notifications
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) {
          setNotifications(data);
          setUnreadCount(data.filter((n: any) => !n.read).length);
        }
      });
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          <DropdownMenuGroup className="p-2">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="p-0 focus:bg-transparent"
                >
                  <NotificationItem
                    notification={notification}
                    onAction={handleAction}
                  />
                </DropdownMenuItem>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No notifications</p>
              </div>
            )}
          </DropdownMenuGroup>
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="justify-center">
          <a
            href="/notifications"
            className="w-full text-center cursor-pointer"
          >
            View all notifications
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
