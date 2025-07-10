"use client";

import { useState, useEffect, useMemo } from "react"; // Added useMemo for optimization
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  Users,
  Clock,
  Award,
  MapPin,
  DollarSign,
  Trophy,
  Star,
  Zap,
  Target,
  Gift,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Timer,
  Crown,
  Info, // Added Info icon for general details
} from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { RegisterButton } from "@/components/register-button";

// --- Interfaces and Utility Types ---
interface EventData {
  id: number;
  name: string;
  description: string;
  event_type: string;
  platform: string;
  event_date: string;
  registration_deadline: string;
  event_time: string | null;
  is_team_based: boolean;
  team_size_min: number;
  team_size_max: number;
  rules: string | null; // Consider parsing this into a more structured object if its format is consistent
  image_url: string | null;
  is_paid: boolean;
  price: number;
  max_participants: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// --- Animation Variants ---
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
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    },
  },
};

// --- Helper Functions (can be moved to a separate utils file) ---

// Returns event icon based on type
const getEventIcon = (type: string): string => {
  switch (type.toLowerCase()) {
    case "programming":
      return "💻";
    case "design":
      return "🎨";
    case "video":
      return "🎬";
    case "photography":
      return "📸";
    case "quiz":
      return "🧠";
    case "presentation":
      return "📊";
    case "gaming": // Added a new type example
      return "🎮";
    default:
      return "✨"; // Default changed to a more general sparkle
  }
};

// Returns gradient based on event type
const getEventGradient = (type: string): string => {
  switch (type.toLowerCase()) {
    case "programming":
      return "from-blue-600/20 via-purple-600/20 to-pink-600/20";
    case "design":
      return "from-green-600/20 via-emerald-600/20 to-teal-600/20";
    case "video":
      return "from-red-600/20 via-orange-600/20 to-yellow-600/20";
    case "photography":
      return "from-purple-600/20 via-pink-600/20 to-rose-600/20";
    case "quiz":
      return "from-indigo-600/20 via-blue-600/20 to-cyan-600/20";
    case "gaming":
      return "from-red-600/20 via-purple-600/20 to-blue-600/20";
    default:
      return "from-[#556492]/20 via-[#68769c]/20 to-[#7683A4]/20"; // Adjusted for more distinct default
  }
};

// Formats date string
const formatDate = (dateString: string): string => {
  // Defensive check for invalid date strings
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Formats time string
const formatTime = (timeString: string | null): string => {
  if (!timeString) return "TBA";
  // Prepend a dummy date to handle time-only strings correctly
  const time = new Date(`2000-01-01T${timeString}`);
  if (isNaN(time.getTime())) {
    return "Invalid Time";
  }
  return time.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Parses requirements from rules string
const getParsedList = (rules: string | null, prefix: string): string[] => {
  if (!rules) return [];
  return rules
    .split("\n")
    .filter((line) => line.trim().startsWith(prefix))
    .map((line) => line.replace(prefix, "").trim())
    .filter(Boolean); // Filter out empty strings in case of just prefixes
};

// --- Main Component ---
export default function EventPageClient({ eventData }: { eventData: EventData }) {
  // State for countdown timer
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isEventLive, setIsEventLive] = useState(false);
  const [hasEventPassed, setHasEventPassed] = useState(false);

  // Framer Motion scroll hooks
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

  // Countdown timer logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const eventTargetDate = new Date(eventData.event_date).getTime();
      const registrationTargetDate = new Date(eventData.registration_deadline).getTime();

      const differenceToEvent = eventTargetDate - now;
      const differenceToRegistration = registrationTargetDate - now;

      if (differenceToEvent > 0) {
        setTimeLeft({
          days: Math.floor(differenceToEvent / (1000 * 60 * 60 * 24)),
          hours: Math.floor((differenceToEvent % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((differenceToEvent % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((differenceToEvent % (1000 * 60)) / 1000),
        });
        setIsEventLive(false);
        setHasEventPassed(false);
      } else if (now >= eventTargetDate && now < eventTargetDate + (24 * 60 * 60 * 1000)) { // Assuming event lasts for max 24 hours
        setIsEventLive(true);
        setHasEventPassed(false);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); // Reset timer if event is live
      }
       else {
        setIsEventLive(false);
        setHasEventPassed(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); // All zeros if event has passed
      }
    };

    // Call immediately and then set interval
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [eventData.event_date, eventData.registration_deadline]); // Added registration_deadline to dependencies

  // Memoize parsed requirements and prizes to prevent re-calculation on every render
  const requirements = useMemo(() => getParsedList(eventData.rules, "Requirement:"), [eventData.rules]);
  const prizes = useMemo(() => getParsedList(eventData.rules, "Prize:"), [eventData.rules]);

  // Determine if registration is open
  const isRegistrationOpen = new Date().getTime() < new Date(eventData.registration_deadline).getTime() && !hasEventPassed;


  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0612] to-[#131943] relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-[#556492]/10 to-[#7683A4]/10 rounded-full blur-xl"
        variants={floatingVariants}
        animate="animate"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-[#556492]/10 to-[#7683A4]/10 rounded-full blur-xl"
        variants={floatingVariants}
        animate="animate"
      />
      <motion.div
        style={{ y: y1 }}
        className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r from-[#7683A4]/5 to-[#556492]/5 rounded-full blur-2xl"
        variants={floatingVariants}
        animate="animate"
      />

      <div className="container px-4 py-8 md:px-6 relative z-10">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-sm text-[#D4D4D6] mb-8"
        >
          <Link
            href="/events"
            className="hover:text-[#F7374F] transition-colors duration-200"
          >
            Events
          </Link>
          <ArrowRight className="h-3 w-3" />
          <span className="text-white">{eventData.name}</span>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 lg:grid-cols-3"
        >
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <motion.div variants={itemVariants}>
              <Card
                className={`overflow-hidden bg-gradient-to-br ${getEventGradient(eventData.event_type)} border-[#556492]/30 backdrop-blur-sm`}
                style={{ borderRadius: "12px" }}
              >
                <div className="relative">
                  {eventData.image_url ? (
                    <div className="relative h-64 md:h-80 overflow-hidden">
                      <Image
                        src={eventData.image_url} // No need for || "/placeholder.svg" if you handle null upstream
                        alt={eventData.name}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                        priority // Add priority for LCP image
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-4xl">
                            {getEventIcon(eventData.event_type)}
                          </span>
                          <Badge className="bg-[#F7374F] text-white px-3 py-1">
                            {eventData.event_type}
                          </Badge>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                          {eventData.name}
                        </h1>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-64 md:h-80 bg-gradient-to-br from-[#556492]/20 to-[#7683A4]/20 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-6xl mb-4 block">
                          {getEventIcon(eventData.event_type)}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                          {eventData.name}
                        </h1>
                        <Badge className="bg-[#F7374F] text-white px-3 py-1">
                          {eventData.event_type}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  {/* Event Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 rounded-lg bg-[#556492]/20 border border-[#556492]/30">
                      <CalendarDays className="h-5 w-5 text-[#F7374F] mx-auto mb-1" />
                      <p className="text-xs text-[#D4D4D6]">Date</p>
                      <p className="text-sm font-medium text-white">
                        {formatDate(eventData.event_date)}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-[#556492]/20 border border-[#556492]/30">
                      <Clock className="h-5 w-5 text-[#F7374F] mx-auto mb-1" />
                      <p className="text-xs text-[#D4D4D6]">Time</p>
                      <p className="text-sm font-medium text-white">
                        {formatTime(eventData.event_time)}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-[#556492]/20 border border-[#556492]/30">
                      <MapPin className="h-5 w-5 text-[#F7374F] mx-auto mb-1" />
                      <p className="text-xs text-[#D4D4D6]">Platform</p>
                      <p className="text-sm font-medium text-white">
                        {eventData.platform}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-[#556492]/20 border border-[#556492]/30">
                      {eventData.is_team_based ? (
                        <>
                          <Users className="h-5 w-5 text-[#F7374F] mx-auto mb-1" />
                          <p className="text-xs text-[#D4D4D6]">Team Size</p>
                          <p className="text-sm font-medium text-white">
                            {eventData.team_size_min === eventData.team_size_max
                              ? eventData.team_size_min
                              : `${eventData.team_size_min}-${eventData.team_size_max}`}
                          </p>
                        </>
                      ) : (
                        <>
                          <Target className="h-5 w-5 text-[#F7374F] mx-auto mb-1" />
                          <p className="text-xs text-[#D4D4D6]">Type</p>
                          <p className="text-sm font-medium text-white">
                            Individual
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="prose prose-invert max-w-none">
                    <p className="text-[#D4D4D6] leading-relaxed">
                      {eventData.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Countdown Timer */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-r from-[#556492]/10 to-[#7683A4]/10 border-[#556492]/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Timer className="h-5 w-5 text-[#F7374F]" />
                      <h3 className="text-xl font-bold text-white">
                        {hasEventPassed ? "Event Concluded" : isEventLive ? "Event is Live!" : "Event Countdown"}
                      </h3>
                    </div>
                    {hasEventPassed || isEventLive ? (
                      <p className="text-lg text-[#D4D4D6]">
                        {hasEventPassed ? "This event has already taken place." : "The event is currently underway. Good luck to all participants!"}
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 gap-4">
                        {Object.entries(timeLeft).map(([unit, value]) => (
                          <div key={unit} className="text-center">
                            <div className="bg-[#131943]/50 rounded-lg p-4 border border-[#F7374F]/30">
                              <div className="text-2xl md:text-3xl font-bold text-[#F7374F]">
                                {value.toString().padStart(2, "0")}
                              </div>
                              <div className="text-xs text-[#D4D4D6] capitalize mt-1">
                                {unit}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Detailed Information Tabs */}
            <motion.div variants={itemVariants}>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-[#556492]/20 border border-[#556492]/30">
                  <TabsTrigger
                    value="details"
                    className="data-[state=active]:bg-[#F7374F] data-[state=active]:text-white cursor-pointer"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="requirements"
                    className="data-[state=active]:bg-[#F7374F] data-[state=active]:text-white cursor-pointer"
                  >
                    Requirements
                  </TabsTrigger>
                  <TabsTrigger
                    value="prizes"
                    className="data-[state=active]:bg-[#F7374F] data-[state=active]:text-white cursor-pointer"
                  >
                    Prizes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-6">
                  <Card className="bg-gradient-to-br from-[#556492]/10 to-[#7683A4]/10 border-[#556492]/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Info className="h-5 w-5 text-[#F7374F]" /> {/* Changed from Sparkles to Info */}
                        Event Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-[#D4D4D6]">Event Type:</span>
                            <span className="text-white font-medium">
                              {eventData.event_type}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#D4D4D6]">Platform:</span>
                            <span className="text-white font-medium">
                              {eventData.platform}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#D4D4D6]">
                              Registration Fee:
                            </span>
                            <span className="text-white font-medium">
                              {eventData.is_paid
                                ? `৳${eventData.price}`
                                : "Free"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-[#D4D4D6]">Team Based:</span>
                            <span className="text-white font-medium">
                              {eventData.is_team_based ? "Yes" : "No"}
                            </span>
                          </div>
                          {eventData.max_participants && (
                            <div className="flex justify-between">
                              <span className="text-[#D4D4D6]">
                                Max Participants:
                              </span>
                              <span className="text-white font-medium">
                                {eventData.max_participants}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-[#D4D4D6]">
                              Registration Deadline:
                            </span>
                            <span className="text-white font-medium">
                              {formatDate(eventData.registration_deadline)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="requirements" className="mt-6">
                  <Card className="bg-gradient-to-br from-[#556492]/10 to-[#7683A4]/10 border-[#556492]/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-[#F7374F]" />
                        Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {requirements.length > 0 ? (
                        <div className="space-y-3">
                          {requirements.map((requirement, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-3 p-3 rounded-lg bg-[#7683A4]/20"
                            >
                              <CheckCircle className="h-5 w-5 text-[#F7374F] mt-0.5 flex-shrink-0" />
                              <span className="text-[#D4D4D6]">
                                {requirement}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[#D4D4D6] text-center py-8">
                          No specific requirements listed yet. Please check back for updates!
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="prizes" className="mt-6">
                  <Card className="bg-gradient-to-br from-[#F7374F]/10 to-[#6ba348]/10 border-[#F7374F]/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-[#F7374F]" />
                        Prizes & Recognition
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {prizes.length > 0 ? (
                        <div className="space-y-4">
                          {prizes.map((prize, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-[#F7374F]/20 to-[#6ba348]/20 border border-[#F7374F]/30"
                            >
                              {index === 0 && (
                                <Crown className="h-6 w-6 text-yellow-400" aria-label="First place" />
                              )}
                              {index === 1 && (
                                <Award className="h-6 w-6 text-gray-400" aria-label="Second place" />
                              )}
                              {index === 2 && (
                                <Star className="h-6 w-6 text-orange-400" aria-label="Third place" />
                              )}
                              {index > 2 && (
                                <Gift className="h-6 w-6 text-[#F7374F]" aria-label="Prize" />
                              )}
                              <span className="text-white font-medium">
                                {prize}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Trophy className="h-12 w-12 text-[#F7374F] mx-auto mb-4" />
                          <p className="text-[#D4D4D6]">
                            Amazing prizes await! Details will be announced soon.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              variants={itemVariants}
              className="sticky top-24 space-y-6"
            >
              {/* Registration Card */}
              <Card className="bg-gradient-to-br from-[#F7374F]/20 to-[#6ba348]/20 border-[#F7374F]/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-[#F7374F]" />
                    Registration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#D4D4D6]">Registration Fee:</span>
                      <span className="text-white font-medium">
                        {eventData.is_paid ? (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />৳{eventData.price}
                          </span>
                        ) : (
                          "Free"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#D4D4D6]">Deadline:</span>
                      <span className="text-white font-medium">
                        {formatDate(eventData.registration_deadline)}
                      </span>
                    </div>
                    {eventData.max_participants && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#D4D4D6]">
                          Max Participants:
                        </span>
                        <span className="text-white font-medium">
                          {eventData.max_participants}
                        </span>
                      </div>
                    )}
                  </div>
                  <RegisterButton event={eventData} disabled={!isRegistrationOpen || hasEventPassed} /> {/* Pass disabled prop */}
                  {!isRegistrationOpen && !hasEventPassed && (
                    <p className="text-center text-sm text-yellow-300 mt-2">
                      Registration for this event has closed.
                    </p>
                  )}
                   {hasEventPassed && (
                    <p className="text-center text-sm text-red-400 mt-2">
                      This event has concluded.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card className="bg-gradient-to-br from-[#556492]/10 to-[#7683A4]/10 border-[#556492]/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-[#F7374F]" />
                    Event Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#F7374F] rounded-full" />
                    <span className="text-[#D4D4D6] text-sm">
                      Certificates for all participants
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#F7374F] rounded-full" />
                    <span className="text-[#D4D4D6] text-sm">
                      Exciting prizes for winners
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#F7374F] rounded-full" />
                    <span className="text-[#D4D4D6] text-sm">
                      Network with tech enthusiasts
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#F7374F] rounded-full" />
                    <span className="text-[#D4D4D6] text-sm">
                      Learn from industry experts
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card className="bg-gradient-to-br from-[#556492]/10 to-[#7683A4]/10 border-[#556492]/30">
                <CardHeader>
                  <CardTitle className="text-white">Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#D4D4D6] text-sm mb-4">
                    Have questions about this event? Our support team is here to
                    help!
                  </p>
                  <Button
                    variant="outline"
                    className="w-full border-[#F7374F] text-[#F7374F] hover:bg-[#F7374F]/20 cursor-pointer"
                  >
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
