"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wifi, WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showIndicator && isOnline) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card
        className={`${
          isOnline
            ? "bg-[#F7374F]/20 border-[#F7374F]/30"
            : "bg-red-500/20 border-red-500/30"
        } transition-all duration-300`}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-[#F7374F]" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-400" />
            )}
            <div>
              <p className="text-sm font-medium text-white">
                {isOnline ? "Back online!" : "You're offline"}
              </p>
              <p className="text-xs text-[#D4D4D6]">
                {isOnline
                  ? "All features are available"
                  : "Some features may be limited"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
