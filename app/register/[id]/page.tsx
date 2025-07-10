"use client";

import type React from "react";

import { useState, useEffect, useCallback, use } from "react";
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
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Event } from "@/lib/supabase";
import { ExclamationTriangleIcon, PlusIcon } from "@radix-ui/react-icons";

export default function EventRegistrationPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState("");
  // const [driveLink, setDriveLink] = useState("")
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEvent = useCallback(async () => {
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
  }, [params.id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleAddTeamMember = () => {
    if (
      newMember.trim() &&
      event &&
      teamMembers.length < event.team_size_max - 1
    ) {
      setTeamMembers([...teamMembers, newMember.trim()]);
      setNewMember("");
    }
  };

  const handleRemoveTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignedIn || !user || !event) {
      toast.error("Please sign in to register for this event.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Register for event
      const { error: regError } = await supabase.from("registrations").insert({
        user_id: user.id,
        event_id: event.id,
        status: "pending",
      });

      if (regError) throw regError;

      // Send email notification
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "registration_confirmation",
          to: user.emailAddresses[0]?.emailAddress,
          data: {
            userName: user.fullName,
            eventName: event.name,
            eventDate: event.event_date,
          },
        }),
      });

      toast.success(
        "Registration successful! Check your email for confirmation."
      );
      router.push("/profile");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
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
        <Link href="/events" className="mt-4">
          <Button variant="outline">Back to Events</Button>
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
              Please sign in to register for {event.name}
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
              Register for {event.name}
            </h1>

            <Card className="bg-gradient-to-br from-[#556492]/10 to-[#7683A4]/10 border-[#556492]/30">
              <CardHeader>
                <CardTitle className="text-white">Registration Form</CardTitle>
                <CardDescription className="text-[#D4D4D6]">
                  Fill out the details below to register for this event
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

                  {event.is_team_based && (
                    <div className="space-y-2">
                      <Label className="text-[#D4D4D6]">
                        Team Members (Max {event.team_size_max - 1} additional
                        members)
                      </Label>
                      <div className="space-y-2">
                        {teamMembers.map((member, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={member}
                              disabled
                              className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveTeamMember(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}

                        {teamMembers.length < event.team_size_max - 1 && (
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Enter team member name"
                              value={newMember}
                              onChange={(e) => setNewMember(e.target.value)}
                              className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white placeholder:text-[#D4D4D6]/50"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={handleAddTeamMember}
                              className="border-[#F7374F] text-[#F7374F] hover:bg-[#F7374F]/20"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="comments" className="text-[#D4D4D6]">
                      Additional Comments (Optional)
                    </Label>
                    <Textarea
                      id="comments"
                      placeholder="Any additional information you'd like to share"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white placeholder:text-[#D4D4D6]/50"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#F7374F] hover:bg-[#6ba348] text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Registering..." : "Register"}
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
