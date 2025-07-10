"use client";

import { useState, useEffect, useCallback } from "react"; // Added useCallback
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Bell, BellOff, Loader2, CheckCircle, XCircle } from "lucide-react"; // Added Loader2, CheckCircle, XCircle
import { Button } from "@/components/ui/button"; // Assuming you have a Button component

export function PushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false); // New state for denied permission
  const { toast } = useToast();

  // Memoize checkSubscriptionStatus to prevent unnecessary re-renders
  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      // Check current notification permission status
      if (Notification.permission === "denied") {
        setPermissionDenied(true);
      } else {
        setPermissionDenied(false);
      }
    } catch (error) {
      console.error("Error checking subscription status:", error);
      toast({
        title: "Error",
        description: "Could not verify notification status.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscriptionStatus();
    }
  }, [checkSubscriptionStatus]);

  async function subscribeToPush() {
    setIsLoading(true);
    setPermissionDenied(false); // Reset permission denied state on new attempt

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission === "denied") {
        setPermissionDenied(true);
        toast({
          title: "Permission Required",
          description:
            "Please allow notifications in your browser settings to enable them.",
          variant: "destructive",
          action: (
            <Button
              variant="outline"
              onClick={() => window.open("about:settings", "_blank")} // Opens browser settings (may vary by browser)
            >
              Open Settings
            </Button>
          ),
        });
        return;
      } else if (permission === "default") {
        // User closed the permission prompt without granting or denying
        toast({
          title: "Permission not granted",
          description:
            "Please click 'Allow' when prompted to enable notifications.",
          variant: "warning",
        });
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe on server.");
      }

      setIsSubscribed(true);
      toast({
        title: "Notifications Enabled!",
        description: "You'll now receive timely updates and invitations.",
        action: <CheckCircle className="text-green-500" />,
      });
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      toast({
        title: "Subscription Failed",
        description: `Something went wrong. Please try again. ${error instanceof Error ? error.message : ""}`,
        variant: "destructive",
        action: <XCircle className="text-red-500" />,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribeFromPush() {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      const response = await fetch("/api/push/unsubscribe", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to unsubscribe on server.");
      }

      setIsSubscribed(false);
      toast({
        title: "Notifications Disabled",
        description: "You won't receive push notifications anymore.",
        action: <BellOff className="text-gray-500" />,
      });
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      toast({
        title: "Unsubscription Failed",
        description: `Could not disable notifications. Please try again.  ${error instanceof Error ? error.message : ""}`,
        variant: "destructive",
        action: <XCircle className="text-red-500" />,
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) {
    return (
      <Card className="border-l-4 border-yellow-500">
        {" "}
        {/* Added border for emphasis */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <BellOff className="h-5 w-5" />
            Browser Support
          </CardTitle>
          <CardDescription>
            Push notifications aren't supported by your current browser.
            Consider using Chrome, Firefox, or Edge.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      {" "}
      {/* Enhanced styling */}
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          {" "}
          {/* Larger title, better gap */}
          {isSubscribed ? (
            <Bell className="h-6 w-6 text-blue-600 animate-pulse" /> // Animated bell when subscribed
          ) : (
            <BellOff className="h-6 w-6 text-gray-400" />
          )}
          Manage Push Notifications
        </CardTitle>
        <CardDescription>
          Stay informed with real-time alerts for team invitations and important
          updates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          {" "}
          {/* Styled inner div */}
          <div className="space-y-1">
            {" "}
            {/* Adjusted spacing */}
            <Label
              htmlFor="push-notifications"
              className="text-base font-medium flex items-center gap-2"
            >
              {" "}
              {/* Larger label, icon */}
              {isSubscribed ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <BellOff className="h-4 w-4 text-red-500" />
              )}
              {isSubscribed ? "Notifications Active" : "Enable Notifications"}
            </Label>
            <p className="text-sm text-muted-foreground">
              Get instant alerts for new team invites, critical announcements,
              and more.
            </p>
            {permissionDenied && ( // Display warning if permission is denied
              <p className="text-sm text-red-500 flex items-center gap-1 mt-2">
                <XCircle className="h-4 w-4" />
                Browser permission denied. Please enable in settings.
              </p>
            )}
          </div>
          <Switch
            id="push-notifications"
            checked={isSubscribed}
            onCheckedChange={
              isSubscribed ? unsubscribeFromPush : subscribeToPush
            }
            disabled={isLoading || permissionDenied} // Disable if loading or permission denied
          >
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            )}{" "}
            {/* Loading spinner */}
          </Switch>
        </div>
        {isLoading && (
          <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isSubscribed
              ? "Disabling notifications..."
              : "Enabling notifications..."}
          </p>
        )}
        {!isSupported && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            <p>
              Push notifications are not supported in your browser. Please use a
              modern browser like Chrome, Firefox, or Edge.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
