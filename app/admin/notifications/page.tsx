"use client";

import type React from "react";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Send, Bell, Users } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";

export default function AdminNotifications() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    url: "",
    image: "",
    sendToAll: true,
    userIds: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.body) {
      toast.error("Title and message are required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/send-push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          body: formData.body,
          url: formData.url || "/",
          image: formData.image,
          sendToAll: formData.sendToAll,
          userIds: formData.sendToAll
            ? []
            : formData.userIds
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Notification sent to ${result.sent} users`);
        setFormData({
          title: "",
          body: "",
          url: "",
          image: "",
          sendToAll: true,
          userIds: "",
        });
      } else {
        throw new Error(result.error || "Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is admin (you should implement proper admin check)
  if (!user?.publicMetadata?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#131943] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#556492]/20 border-[#556492]/30">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-[#D4D4D6]">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#131943] py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Send Push Notifications
            </h1>
            <p className="text-[#D4D4D6]">
              Send notifications to all users or specific users
            </p>
          </div>

          <Card className="bg-[#556492]/20 border-[#556492]/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Create Notification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Notification title"
                    className="bg-[#131943] border-[#556492] text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body" className="text-white">
                    Message *
                  </Label>
                  <Textarea
                    id="body"
                    value={formData.body}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, body: e.target.value }))
                    }
                    placeholder="Notification message"
                    className="bg-[#131943] border-[#556492] text-white min-h-[100px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url" className="text-white">
                    Action URL (optional)
                  </Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, url: e.target.value }))
                    }
                    placeholder="/events or https://example.com"
                    className="bg-[#131943] border-[#556492] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-white">
                    Image URL (optional)
                  </Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        image: e.target.value,
                      }))
                    }
                    placeholder="https://example.com/image.jpg"
                    className="bg-[#131943] border-[#556492] text-white"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="sendToAll"
                    checked={formData.sendToAll}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, sendToAll: checked }))
                    }
                  />
                  <Label
                    htmlFor="sendToAll"
                    className="text-white flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Send to all users
                  </Label>
                </div>

                {!formData.sendToAll && (
                  <div className="space-y-2">
                    <Label htmlFor="userIds" className="text-white">
                      User IDs (comma-separated)
                    </Label>
                    <Input
                      id="userIds"
                      value={formData.userIds}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          userIds: e.target.value,
                        }))
                      }
                      placeholder="user1, user2, user3"
                      className="bg-[#131943] border-[#556492] text-white"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#F7374F] hover:bg-[#6ba348] text-white"
                >
                  {isLoading ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Notification
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}
