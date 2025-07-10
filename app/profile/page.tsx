"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Trophy,
  Edit,
  Save,
  CheckCircle,
  Clock,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PersonIcon } from "@radix-ui/react-icons";
import { QRCodeCard } from "@/components/profile/QRCodeCard";
import { motion, AnimatePresence } from "framer-motion";
import { PushNotifications } from "@/components/push-notifications";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  institution: string;
  phone: string;
  profile_picture: string | null;
  gender: string | null;
  date_of_birth: string | null;
  t_shirt_size: string | null;
  bio: string | null;
}

interface Registration {
  id: string;
  event_id: number;
  registration_date: string;
  status: string;
  events: {
    id: number;
    name: string;
    event_type: string;
    event_date: string;
    platform: string;
    is_paid: boolean;
    price: number;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    institution: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    t_shirt_size: "",
    bio: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      redirect("/sign-in");
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (isSignedIn && user) {
      fetchProfile();
      fetchRegistrations();
    }
  }, [isSignedIn, user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error && error.code !== "PGRST116") {
        throw error;
      }
      if (data) {
        setProfile(data);
        setEditForm({
          institution: data.institution || "",
          phone: data.phone || "",
          gender: data.gender || "",
          date_of_birth: data.date_of_birth || "",
          t_shirt_size: data.t_shirt_size || "",
          bio: data.bio || "",
        });
      } else {
        const newProfile = {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          full_name: user.fullName || "",
          institution: "",
          phone: "",
        };
        const { data: created, error: createError } = await supabase
          .from("users")
          .insert(newProfile)
          .select()
          .single();
        if (createError) throw createError;
        setProfile(created);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select(
          `
          *,
          events (
            id,
            name,
            event_type,
            event_date,
            platform,
            is_paid,
            price
          )
          `
        )
        .eq("user_id", user.id)
        .order("registration_date", { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("Failed to load registrations");
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update(editForm)
        .eq("id", user.id);
      if (error) throw error;
      setProfile({ ...profile, ...editForm });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-600";
      case "pending":
        return "bg-yellow-600";
      case "submitted":
        return "bg-blue-600";
      case "checked_in":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "submitted":
        return <Upload className="h-4 w-4" />;
      case "checked_in":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "pending":
        return "Pending";
      case "submitted":
        return "Submitted";
      case "checked_in":
        return "Checked In";
      default:
        return "Unknown";
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#131943] to-[#1a1f4a] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-[#F7374F]/5 blur-[100px] rounded-full -z-10"></div>
        <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[70%] h-[200px] bg-[#B267FF]/5 blur-[100px] rounded-full -z-10"></div>
        <div className="animate-pulse flex flex-col items-center gap-4 relative z-10">
          <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-[#556492]/20"></div>
          <div className="h-6 sm:h-8 w-48 sm:w-64 bg-[#556492]/20 rounded"></div>
          <div className="h-48 sm:h-64 w-full max-w-md bg-[#556492]/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#131943] to-[#1a1f4a] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-[#F7374F]/5 blur-[100px] rounded-full -z-10"></div>
      <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[70%] h-[200px] bg-[#B267FF]/5 blur-[100px] rounded-full -z-10"></div>
      <div className="container px-4 py-8 sm:py-12 md:px-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 lg:grid-cols-4"
        >
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-[#556492]/20 to-[#7683A4]/20 border-[#556492]/30 text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#F7374F]/20">
              <CardHeader className="text-center">
                <Avatar className="h-16 w-16 sm:h-24 sm:w-24 mx-auto mb-4 border-2 border-[#B267FF]">
                  <AvatarImage
                    src={user?.imageUrl || profile?.profile_picture || ""}
                    alt={user?.fullName || ""}
                  />
                  <AvatarFallback className="bg-gradient-to-r from-[#F7374F] to-[#B267FF] text-white text-lg sm:text-2xl">
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-white text-lg sm:text-xl">
                  {user?.fullName}
                </CardTitle>
                <CardDescription className="text-[#D4D4D6] text-sm">
                  {user?.emailAddresses[0]?.emailAddress}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-[#D4D4D6]">
                  <PersonIcon className="h-4 w-4 text-[#F7374F]" />
                  <span>Participant</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#D4D4D6]">
                  <CalendarDays className="h-4 w-4 text-[#F7374F]" />
                  <span>Joined {new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#D4D4D6]">
                  <Trophy className="h-4 w-4 text-[#F7374F]" />
                  <span>{registrations.length} Events Registered</span>
                </div>
                <div className="flex items-center justify-center pt-4">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="cursor-pointer"
                  >
                    <QRCodeCard uid={user.id} />
                  </motion.div>
                </div>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white transition-all duration-300 cursor-pointer"
                >
                  Show Poop App QR
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          {/* <PushNotifications /> */}

          <motion.div variants={itemVariants} className="lg:col-span-3">
            <Tabs defaultValue="registrations" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#556492]/20 border border-[#556492]/30">
                <TabsTrigger
                  value="registrations"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F7374F] data-[state=active]:to-[#B267FF] data-[state=active]:text-white text-xs sm:text-sm text-[#D4D4D6] hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  My Events
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F7374F] data-[state=active]:to-[#B267FF] data-[state=active]:text-white text-xs sm:text-sm text-[#D4D4D6] hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  Profile Settings
                </TabsTrigger>
                <TabsTrigger
                  value="certificates"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F7374F] data-[state=active]:to-[#B267FF] data-[state=active]:text-white text-xs sm:text-sm text-[#D4D4D6] hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  Certificates
                </TabsTrigger>
              </TabsList>

              <TabsContent value="registrations" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-white bg-clip-text bg-gradient-to-r from-[#F7374F] to-[#B267FF]">
                    Your Registered Events
                  </h2>
                  {registrations.length === 0 ? (
                    <Card className="bg-gradient-to-br from-[#556492]/10 to-[#7683A4]/10 border-[#556492]/30 text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#F7374F]/20">
                      <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                        <Trophy className="h-8 w-8 sm:h-12 sm:w-12 text-[#F7374F] mb-4" />
                        <p className="text-[#D4D4D6] mb-4 text-center text-sm sm:text-base">
                          You haven't registered for any events yet.
                        </p>
                        <Link href="/events">
                          <Button className="bg-gradient-to-r from-[#F7374F] to-[#B267FF] hover:from-[#B267FF] hover:to-[#F7374F] text-white transition-all duration-300 cursor-pointer">
                            Browse Events
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {registrations.map((registration) => (
                        <motion.div
                          key={registration.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ scale: 1.01, x: 5 }}
                          className="origin-left"
                        >
                          <Card className="bg-gradient-to-br from-[#556492]/10 to-[#7683A4]/10 border-[#556492]/30 text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#F7374F]/20">
                            <CardHeader className="pb-2">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <CardTitle className="text-white text-lg">
                                  {registration.events.name}
                                </CardTitle>
                                <Badge
                                  className={`${getStatusColor(registration.status)} text-white w-fit px-3 py-1 rounded-full flex items-center gap-1 text-xs font-semibold`}
                                >
                                  {getStatusIcon(registration.status)}
                                  <span className="ml-1">
                                    {getStatusText(registration.status)}
                                  </span>
                                </Badge>
                              </div>
                              <CardDescription className="text-[#D4D4D6] text-sm">
                                {registration.events.event_type} •{" "}
                                {new Date(
                                  registration.events.event_date
                                ).toLocaleDateString()}{" "}
                                • {registration.events.platform}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="text-xs sm:text-sm text-[#D4D4D6]">
                                  Registered on:{" "}
                                  {new Date(
                                    registration.registration_date
                                  ).toLocaleDateString()}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Link
                                    href={`/events/${registration.event_id}`}
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full sm:w-auto border-[#B267FF] text-[#B267FF] hover:bg-[#B267FF]/20 text-xs transition-colors duration-300 cursor-pointer"
                                    >
                                      View Event
                                    </Button>
                                  </Link>
                                  {registration.events.is_paid &&
                                    registration.status === "pending" && (
                                      <Button
                                        size="sm"
                                        className="w-full sm:w-auto bg-gradient-to-r from-[#F7374F] to-[#B267FF] hover:from-[#B267FF] hover:to-[#F7374F] text-white text-xs transition-all duration-300 cursor-pointer"
                                      >
                                        Pay Now (৳{registration.events.price})
                                      </Button>
                                    )}
                                  {registration.status === "confirmed" && (
                                    <Link
                                      href={`/submit/${registration.event_id}`}
                                    >
                                      <Button
                                        size="sm"
                                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-cyan-600 hover:to-blue-600 text-white text-xs transition-all duration-300 cursor-pointer"
                                      >
                                        Submit Entry
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="profile" className="mt-6">
                <Card className="bg-gradient-to-br from-[#556492]/10 to-[#7683A4]/10 border-[#556492]/30 text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#F7374F]/20">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-white">
                          Profile Information
                        </CardTitle>
                        <CardDescription className="text-[#D4D4D6]">
                          Update your personal information and preferences
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (isEditing) {
                            setIsEditing(false);
                            setEditForm({
                              institution: profile?.institution || "",
                              phone: profile?.phone || "",
                              gender: profile?.gender || "",
                              date_of_birth: profile?.date_of_birth || "",
                              t_shirt_size: profile?.t_shirt_size || "",
                              bio: profile?.bio || "",
                            });
                          } else {
                            setIsEditing(true);
                          }
                        }}
                        className="border-[#F7374F] text-[#F7374F] hover:bg-[#F7374F]/20 w-full sm:w-auto transition-colors duration-300 cursor-pointer"
                      >
                        {isEditing ? (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[#D4D4D6]">Full Name</Label>
                        <Input
                          value={user?.fullName || ""}
                          disabled
                          className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white placeholder:text-[#D4D4D6]/50"
                        />
                      </div>
                      <div>
                        <Label className="text-[#D4D4D6]">Email</Label>
                        <Input
                          value={user?.emailAddresses[0]?.emailAddress || ""}
                          disabled
                          className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white placeholder:text-[#D4D4D6]/50"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[#D4D4D6]">Institution</Label>
                        <Input
                          value={
                            isEditing
                              ? editForm.institution
                              : profile?.institution || ""
                          }
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              institution: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          placeholder="Your college/university"
                          className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white placeholder:text-[#D4D4D6]/50 focus:border-[#F7374F]"
                        />
                      </div>
                      <div>
                        <Label className="text-[#D4D4D6]">Phone Number</Label>
                        <Input
                          value={
                            isEditing ? editForm.phone : profile?.phone || ""
                          }
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          placeholder="+880 1234 567890"
                          className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white placeholder:text-[#D4D4D6]/50 focus:border-[#F7374F]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-[#D4D4D6]">Gender</Label>
                        <Select
                          value={
                            isEditing ? editForm.gender : profile?.gender || ""
                          }
                          onValueChange={(value) =>
                            setEditForm((prev) => ({ ...prev, gender: value }))
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white [&>span]:text-white data-[placeholder]:text-[#D4D4D6]/50 focus:border-[#F7374F] cursor-pointer">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#131943] border-[#556492] text-white">
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[#D4D4D6]">Date of Birth</Label>
                        <Input
                          type="date"
                          value={
                            isEditing
                              ? editForm.date_of_birth
                              : profile?.date_of_birth || ""
                          }
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              date_of_birth: e.target.value,
                            }))
                          }
                          disabled={!isEditing}
                          className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white placeholder:text-[#D4D4D6]/50 focus:border-[#F7374F]"
                        />
                      </div>
                      <div>
                        <Label className="text-[#D4D4D6]">T-Shirt Size</Label>
                        <Select
                          value={
                            isEditing
                              ? editForm.t_shirt_size
                              : profile?.t_shirt_size || ""
                          }
                          onValueChange={(value) =>
                            setEditForm((prev) => ({
                              ...prev,
                              t_shirt_size: value,
                            }))
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white [&>span]:text-white data-[placeholder]:text-[#D4D4D6]/50 focus:border-[#F7374F] cursor-pointer">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#131943] border-[#556492] text-white">
                            <SelectItem value="XS">XS</SelectItem>
                            <SelectItem value="S">S</SelectItem>
                            <SelectItem value="M">M</SelectItem>
                            <SelectItem value="L">L</SelectItem>
                            <SelectItem value="XL">XL</SelectItem>
                            <SelectItem value="XXL">XXL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[#D4D4D6]">Bio</Label>
                      <Textarea
                        value={isEditing ? editForm.bio : profile?.bio || ""}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            bio: e.target.value,
                          }))
                        }
                        disabled={!isEditing}
                        placeholder="Tell us about yourself..."
                        className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white placeholder:text-[#D4D4D6]/50 focus:border-[#F7374F]"
                        rows={4}
                      />
                    </div>
                    {isEditing && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-[#F7374F] to-[#B267FF] hover:from-[#B267FF] hover:to-[#F7374F] text-white transition-all duration-300 cursor-pointer"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="certificates" className="mt-6">
                <Card className="bg-gradient-to-br from-[#556492]/10 to-[#7683A4]/10 border-[#556492]/30 text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#F7374F]/20">
                  <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                    <Trophy className="h-8 w-8 sm:h-12 sm:w-12 text-[#F7374F] mb-4" />
                    <p className="text-[#D4D4D6] text-center text-sm sm:text-base">
                      Certificates will be available after the event completion.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            ></div>
            <motion.div
              className="relative bg-gradient-to-br from-[#1a1f4a] to-[#131943] border border-[#556492]/50 rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md text-white text-center"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-3 right-3 text-[#D4D4D6] hover:text-[#F7374F] transition-colors duration-200 cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#F7374F] to-[#B267FF]">
                Welcome to Holyshit!
              </h3>
              <p className="text-[#D4D4D6] mb-6 text-sm sm:text-base">
                Scan this QR code to access the Holyshi app.
              </p>
              <div className="flex justify-center mb-6">
                <QRCodeCard uid="holyshit-app-link" />
              </div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText("holyshit-app-link");
                  toast.success("App link copied to clipboard!");
                  setIsModalOpen(false);
                }}
                className="w-full bg-gradient-to-r from-[#B267FF] to-[#F7374F] hover:from-[#F7374F] hover:to-[#B267FF] text-white transition-all duration-300 cursor-pointer"
              >
                Copy App Link
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
