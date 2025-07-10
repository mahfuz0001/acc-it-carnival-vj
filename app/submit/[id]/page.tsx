"use client";

import type React from "react";

import { useState, useEffect, use } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Event } from "@/lib/supabase";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export default function SubmitEntryPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  const [driveLink, setDriveLink] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", Number.parseInt(params.id))
        .eq("is_active", true)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error("Event not found");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignedIn || !user || !event) {
      toast.error("Please sign in to submit your entry.");
      return;
    }

    if (!driveLink) {
      toast.error("Please provide a Google Drive link for your submission.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Find user's registration for this event
      const { data: registration, error: regError } = await supabase
        .from("registrations")
        .select("id")
        .eq("user_id", user.id)
        .eq("event_id", event.id)
        .single();

      if (regError) throw regError;

      // Create submission
      const { error: subError } = await supabase.from("submissions").insert({
        registration_id: registration.id,
        drive_link: driveLink,
        description: description,
      });

      if (subError) throw subError;

      // Update registration status
      await supabase
        .from("registrations")
        .update({ status: "submitted" })
        .eq("id", registration.id);

      // Send email notification
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "submission_confirmation",
          to: user.emailAddresses[0]?.emailAddress,
          data: {
            userName: user.fullName,
            eventName: event.name,
            submissionLink: driveLink,
          },
        }),
      });

      toast.success(
        "Submission successful! Check your email for confirmation."
      );
      router.push("/profile");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container px-4 py-12 md:px-6 flex justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-64 bg-[#556492]/20 rounded"></div>
          <div className="h-64 w-full max-w-md bg-[#556492]/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container px-4 py-12 md:px-6 flex flex-col items-center">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Event not found. Please check the URL and try again.
          </AlertDescription>
        </Alert>
        <Link href="/profile" className="mt-4">
          <Button variant="outline">Back to Profile</Button>
        </Link>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="container px-4 py-12 md:px-6 flex justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-64 bg-[#556492]/20 rounded"></div>
          <div className="h-64 w-full max-w-md bg-[#556492]/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="container px-4 py-12 md:px-6 flex flex-col items-center">
        <Card className="max-w-md w-full bg-[#556492]/20 border-[#556492]/30">
          <CardHeader>
            <CardTitle className="text-white">Sign in required</CardTitle>
            <CardDescription className="text-[#D4D4D6]">
              Please sign in to submit your entry for {event.name}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/sign-in" className="w-full">
              <Button className="w-full bg-[#F7374F] hover:bg-[#6ba348] text-white">
                Sign In
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#131943] to-[#1a1f4a]">
      <div className="container px-4 py-12 md:px-6">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-white">
              Submit Entry for {event.name}
            </h1>

            <Card className="bg-gradient-to-br from-[#556492]/10 to-[#7683A4]/10 border-[#556492]/30">
              <CardHeader>
                <CardTitle className="text-white">Submission Form</CardTitle>
                <CardDescription className="text-[#D4D4D6]">
                  Submit your entry for this event by providing a Google Drive
                  link
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[#D4D4D6]">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      value={user?.fullName || ""}
                      disabled
                      className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#D4D4D6]">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.primaryEmailAddress?.emailAddress || ""}
                      disabled
                      className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driveLink" className="text-[#D4D4D6]">
                      Google Drive Link
                    </Label>
                    <Input
                      id="driveLink"
                      placeholder="https://drive.google.com/..."
                      value={driveLink}
                      onChange={(e) => setDriveLink(e.target.value)}
                      required
                      className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white placeholder:text-[#D4D4D6]/50"
                    />
                    <p className="text-sm text-[#D4D4D6]">
                      Please provide a Google Drive link to your submission
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-[#D4D4D6]">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Briefly describe your submission"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white placeholder:text-[#D4D4D6]/50"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#F7374F] hover:bg-[#6ba348] text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Entry"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
