"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription, // Added CardDescription for team size info
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Event } from "@/lib/supabase";
import { motion } from "framer-motion";

interface RegisterButtonProps {
  event: Event;
  disabled?: boolean; // Optional prop to disable the button
}

export function RegisterButton({ event, disabled }: RegisterButtonProps) {
  const { user, isSignedIn } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(
    null
  );
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [formData, setFormData] = useState({
    institution: "",
    phone: "",
    tShirtSize: "",
    teamName: "",
    teamMembers: [""], // Initialize with one empty member input
  });

  // Load user profile data on sign-in
  useEffect(() => {
    if (isSignedIn && user) {
      const fetchUserProfile = async () => {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("institution, phone, t_shirt_size")
            .eq("id", user.id)
            .single();

          if (error && error.code !== "PGRST116") {
            throw error;
          }

          if (data) {
            setFormData((prev) => ({
              ...prev,
              institution: data.institution || "",
              phone: data.phone || "",
              tShirtSize: data.t_shirt_size || "",
            }));
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast.error("Failed to load your profile data.");
        }
      };

      fetchUserProfile();
      checkExistingRegistration();
    } else {
      setCheckingRegistration(false);
    }
  }, [isSignedIn, user, event.id]);

  const checkExistingRegistration = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("status")
        .eq("user_id", user.id)
        .eq("event_id", event.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 means "No rows found", which is expected if not registered
        throw error;
      }

      if (data) {
        setIsRegistered(true);
        setRegistrationStatus(data.status);
      }
    } catch (error) {
      console.error("Error checking registration:", error);
      // Do not show a toast for this as it's an internal check
    } finally {
      setCheckingRegistration(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTeamMember = () => {
    if (formData.teamMembers.length < event.team_size_max) {
      setFormData((prev) => ({
        ...prev,
        teamMembers: [...prev.teamMembers, ""],
      }));
    }
  };

  const removeTeamMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }));
  };

  const updateTeamMember = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) =>
        i === index ? value : member
      ),
    }));
  };

  const handleRegister = async () => {
    if (!isSignedIn || !user) {
      toast.error("Please sign in to register.");
      return;
    }

    if (isRegistered) {
      toast.error("You are already registered for this event.");
      return;
    }

    // Basic form validation
    if (!formData.institution.trim()) {
      toast.error("Please enter your institution.");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }
    // Only require T-Shirt size if it's not an empty string initially
    // if (!formData.tShirtSize && event.has_tshirt_option) { // Assuming an event property `has_tshirt_option`
    //   toast.error("Please select a T-Shirt size.");
    //   return;
    // }

    if (event.is_team_based) {
      if (!formData.teamName.trim()) {
        toast.error("Please enter a team name.");
        return;
      }
      const validMembers = formData.teamMembers.filter((member) =>
        member.trim()
      );
      if (validMembers.length < event.team_size_min) {
        toast.error(
          `Please add at least ${event.team_size_min} team member(s).`
        );
        return;
      }
    }

    setIsLoading(true);

    try {
      // First, create or update user profile with latest info
      const { error: userError } = await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          full_name: user.fullName || "",
          institution: formData.institution,
          phone: formData.phone,
          t_shirt_size: formData.tShirtSize,
        },
        { onConflict: "id" } // Specify conflict target for upsert
      );

      if (userError) {
        console.error("Supabase user upsert error:", userError);
        throw new Error("Failed to update user profile.");
      }

      let teamId: string | null = null;

      if (event.is_team_based) {
        // Create team
        const { data: team, error: teamError } = await supabase
          .from("teams")
          .insert({
            name: formData.teamName,
            leader_id: user.id, // The current user is the team leader
            event_id: event.id,
          })
          .select("id")
          .single();

        if (teamError) {
          console.error("Supabase team insert error:", teamError);
          throw new Error("Failed to create team.");
        }
        teamId = team.id;

        // Add team members (including the leader, if applicable, or just other members)
        const teamMemberData = formData.teamMembers
          .filter((member) => member.trim())
          .map((member) => ({
            team_id: teamId,
            name: member.trim(), // Storing member name as text
            // If you need to link to actual user IDs for members, you'd need a lookup mechanism here
          }));

        // Add the leader to the team_members if they are part of the team count
        // This logic might need adjustment based on how 'team_members' table is designed
        // and if the leader is implicitly a member or explicitly added.
        // For simplicity, let's assume teamMembers array only contains *other* members,
        // and the leader's registration implies their membership.
        // If the leader should also be in `team_members` table:
        // teamMemberData.push({ team_id: teamId, name: user.fullName || "Team Leader", user_id: user.id });

        if (teamMemberData.length > 0) {
          const { error: teamMembersError } = await supabase
            .from("team_members")
            .insert(teamMemberData);

          if (teamMembersError) {
            console.error(
              "Supabase team members insert error:",
              teamMembersError
            );
            throw new Error("Failed to add team members.");
          }
        }
      }

      // Register user for event (or link team to registration if applicable)
      const { error: regError } = await supabase.from("registrations").insert({
        user_id: user.id,
        event_id: event.id,
        status: "pending", // Default status
        team_id: teamId, // Link registration to team if team-based
      });

      if (regError) {
        console.error("Supabase registration insert error:", regError);
        throw new Error("Failed to create event registration.");
      }

      // Send email notification (consider making this non-blocking)
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "registration_confirmation",
            to: user.emailAddresses[0]?.emailAddress,
            data: {
              userName: user.fullName || "Valued Participant",
              eventName: event.name,
              eventDate: new Date(event.event_date).toLocaleDateString(),
            },
          }),
        });
      } catch (emailError) {
        console.warn(
          "Failed to send registration confirmation email:",
          emailError
        );
        // Do not block registration for email failure
      }

      // Create notification
      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            title: "Registration Submitted!", // Changed from Confirmed to Submitted
            message: `Your registration for ${event.name} has been submitted.`,
            type: "registration_submitted",
            data: { event_id: event.id },
          }),
        });
      } catch (notificationError) {
        console.warn(
          "Failed to create in-app notification:",
          notificationError
        );
        // Do not block registration for notification failure
      }

      setIsRegistered(true);
      setRegistrationStatus("pending"); // Set status to pending after successful submission
      toast.success(
        "Registration submitted successfully! Please check your email for details."
      );
      setIsOpen(false); // Close the dialog on successful registration
    } catch (error: any) {
      console.error("Registration process error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render states based on registration status
  if (checkingRegistration) {
    return (
      <Button disabled className="w-full bg-[#556492]/50 text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
        />
        Checking Registration...
      </Button>
    );
  }

  if (disabled) {
    return (
      <Button disabled className="w-full bg-[#556492]/50 text-white">
        Registration Closed
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          className="w-full bg-[#F7374F] hover:bg-[#6ba348] text-white"
          asChild
        >
          <a href="/sign-in">Sign In to Register</a>
        </Button>
      </motion.div>
    );
  }

  if (isRegistered) {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "confirmed":
          return "bg-green-600 hover:bg-green-700";
        case "pending":
          return "bg-yellow-600 hover:bg-yellow-700";
        case "submitted":
          return "bg-blue-600 hover:bg-blue-700";
        case "rejected": // Added rejected status
          return "bg-red-600 hover:bg-red-700";
        default:
          return "bg-gray-500 hover:bg-gray-600";
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "confirmed":
          return <CheckCircle className="h-4 w-4" />;
        case "pending":
          return <Clock className="h-4 w-4" />;
        case "submitted":
          return <CheckCircle className="h-4 w-4" />; // Or a different icon for submitted if preferred
        case "rejected":
          return <Trash2 className="h-4 w-4" />; // Icon for rejected
        default:
          return <Clock className="h-4 w-4" />;
      }
    };

    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          disabled
          className={`w-full ${getStatusColor(registrationStatus || "")} text-white cursor-not-allowed`}
        >
          {getStatusIcon(registrationStatus || "")}
          <span className="ml-2">
            {registrationStatus === "confirmed" && "Registered ✓"}
            {registrationStatus === "pending" && "Registration Pending"}
            {registrationStatus === "submitted" && "Registration Submitted"}
            {registrationStatus === "rejected" && "Registration Rejected"}
            {!registrationStatus && "Registered"}
          </span>
        </Button>
      </motion.div>
    );
  }

  // Render registration form
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button className="w-full bg-[#F7374F] hover:bg-[#FF4D6D] text-white cursor-pointer">
            {event.is_team_based ? (
              <>
                <Users className="mr-2 h-4 w-4" />
                Register Team
              </>
            ) : (
              "Register Now"
            )}
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#1E1E2F] border border-[#556492] rounded-lg p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            <DialogTitle className="text-white">
              Register for {event.name}
            </DialogTitle>
            <DialogDescription className="text-[#D4D4D6] mb-3">
              Fill out the form below to register for this event.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            {" "}
            {/* Added pr-2 for scrollbar */}
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-[#556492]/20 border-[#556492]/30">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {" "}
                    {/* Changed to responsive grid */}
                    <div>
                      <Label htmlFor="name" className="text-[#D4D4D6]">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={user?.fullName || ""}
                        disabled
                        className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-[#D4D4D6]">
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={user?.emailAddresses[0]?.emailAddress || ""}
                        disabled
                        className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white mt-2"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {" "}
                    {/* Changed to responsive grid */}
                    <div>
                      <Label htmlFor="institution" className="text-[#D4D4D6]">
                        Institution <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="institution"
                        value={formData.institution}
                        onChange={(e) =>
                          handleInputChange("institution", e.target.value)
                        }
                        placeholder="Your college/university"
                        className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white placeholder:text-[#D4D4D6]/50 mt-2"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-[#D4D4D6]">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="+880 1234 567890"
                        className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white placeholder:text-[#D4D4D6]/50 mt-2"
                        required
                      />
                    </div>
                  </div>
                  {/* Re-enabled T-Shirt size selection */}
                  {/* {event.has_tshirt_option && ( // Render only if event has a T-shirt option
                    <div>
                      <Label htmlFor="tshirt" className="text-[#D4D4D6]">
                        T-Shirt Size <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.tShirtSize}
                        onValueChange={(value) =>
                          handleInputChange("tShirtSize", value)
                        }
                      >
                        <SelectTrigger className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white mt-2">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#556492] border-[#7683A4]">
                          <SelectItem value="XS">XS</SelectItem>
                          <SelectItem value="S">S</SelectItem>
                          <SelectItem value="M">M</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="XL">XL</SelectItem>
                          <SelectItem value="XXL">XXL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )} */}
                </CardContent>
              </Card>
            </motion.div>
            {/* Team Information */}
            {event.is_team_based && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-[#F7374F]/20 border-[#F7374F]/30">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Team Information
                    </CardTitle>
                    <CardDescription className="text-[#D4D4D6]">
                      Team size: {event.team_size_min}-{event.team_size_max}{" "}
                      members. You need at least {event.team_size_min} members.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="teamName" className="text-[#D4D4D6]">
                        Team Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="teamName"
                        value={formData.teamName}
                        onChange={(e) =>
                          handleInputChange("teamName", e.target.value)
                        }
                        placeholder="Enter your team name"
                        className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white placeholder:text-[#D4D4D6]/50 mt-2"
                        required
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-[#D4D4D6]">
                          Team Members <span className="text-red-500">*</span>
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addTeamMember}
                          disabled={
                            formData.teamMembers.length >= event.team_size_max
                          }
                          className="border-[#F7374F] text-[#F7374F] hover:bg-[#F7374F]/20"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Member
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {formData.teamMembers.map((member, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }} // Adjusted delay for smoother animation
                            className="flex gap-2"
                          >
                            <Input
                              value={member}
                              onChange={(e) =>
                                updateTeamMember(index, e.target.value)
                              }
                              placeholder={`Team member ${index + 1} name`}
                              className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white placeholder:text-[#D4D4D6]/50"
                              required={index < event.team_size_min} // Require inputs up to minimum team size
                            />
                            {formData.teamMembers.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeTeamMember(index)}
                                className="border-red-500 text-red-500 hover:bg-red-500/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {/* Event Details (Re-enabled with minor styling) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-[#556492]/20 border-[#556492]/30">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    Event Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#D4D4D6]">Event:</span>
                    <span className="text-white font-medium">{event.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#D4D4D6]">Date:</span>
                    <span className="text-white font-medium">
                      {new Date(event.event_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#D4D4D6]">Registration Fee:</span>
                    <span className="text-white font-medium">
                      {event.is_paid ? `৳${event.price}` : "Free"}
                    </span>
                  </div>
                  {event.is_paid && (
                    <Badge className="bg-yellow-600 text-white">
                      Payment will be processed after registration
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-3 pt-4"
          >
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 border-[#7683A4] text-[#7683A4] hover:bg-[#7683A4]/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegister}
              disabled={isLoading}
              className="flex-1 bg-[#F7374F] hover:bg-[#FF4D6D] text-white disabled:bg-[#F7374F]/50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Registering...
                </>
              ) : (
                "Complete Registration"
              )}
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
