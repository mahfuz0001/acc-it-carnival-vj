"use client";

import { useState } from "react";
import { Scanner, useDevices, centerText } from "@yudiel/react-qr-scanner";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  institution: string;
  // Add other fields as needed
};

export default function QRCheckinPage() {
  const [deviceId, setDeviceId] = useState<string | undefined>();
  const [pause, setPause] = useState(false);
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const devices = useDevices();

  const handleScan = async (code: string) => {
    if (!code || code === scannedId) return;
    setPause(true);
    setLoading(true);
    setScannedId(code);

    try {
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", code)
        .single();

      if (error || !userData) {
        toast.error("User not found");
        setProfile(null);
        return;
      }

      setProfile(userData);
      toast.success("User found");

      await supabase
        .from("registrations")
        .update({ status: "checked_in" })
        .eq("user_id", code);
    } catch (err) {
      console.error(err);
      toast.error("Failed to scan QR");
    } finally {
      setLoading(false);
      setPause(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white px-4 py-8">
      <div className="max-w-xl mx-auto">
        <Card className="bg-[#1a1f2e] border border-[#2b3246]">
          <CardHeader>
            <CardTitle className="text-white">QR Code Check-in</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-2">
              <select
                onChange={(e) => setDeviceId(e.target.value)}
                className="bg-[#0d1117] border border-[#2b3246] text-white px-2 py-1 rounded"
              >
                <option value={undefined}>Select camera</option>
                {devices.map((device, i) => (
                  <option key={i} value={device.deviceId}>
                    {device.label || `Camera ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>

            <Scanner
              formats={["qr_code"]}
              constraints={{ deviceId }}
              onScan={(codes) =>
                codes[0]?.rawValue && handleScan(codes[0].rawValue)
              }
              onError={(err) => console.error("Scanner Error:", err)}
              paused={pause}
              scanDelay={1500}
              styles={{ container: { height: "350px", width: "100%" } }}
              components={{
                tracker: centerText,
                torch: true,
              }}
            />

            {loading && <Loader2 className="animate-spin mx-auto mt-4" />}

            {profile && (
              <div className="mt-6 space-y-3">
                <p>
                  <strong>Name:</strong> {profile.full_name}
                </p>
                <p>
                  <strong>Email:</strong> {profile.email}
                </p>
                <p>
                  <strong>Institution:</strong> {profile.institution}
                </p>
                <Badge className="bg-[#F7374F] text-white">Checked in</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
