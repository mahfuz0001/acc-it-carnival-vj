"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventCard } from "@/components/event-card"; // Assuming this is your event card component
import { supabase } from "@/lib/supabase"; // Assuming your Supabase client
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, Sparkles, XCircle, ChevronDown } from "lucide-react"; // Added XCircle, ChevronDown
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence
import { debounce } from "lodash";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a Skeleton component for loading states
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // For filter dropdown

interface Event {
  id: number;
  name: string;
  event_type: string;
  event_date: string;
  platform: string;
  is_team_based: boolean;
  is_paid: boolean;
  price: number;
}

// Re-defining animation variants for cleaner component structure
const fadeSlideIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Slightly increased stagger
      delayChildren: 0.15,
    },
  },
};

const staggerItem = {
  hidden: { y: 30, opacity: 0 }, // More pronounced initial movement
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5, // Slightly longer duration for smoother reveal
      ease: "easeOut",
    },
  },
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all"); // New state for dropdown filter

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true); // Ensure loading is true when fetching
    try {
      const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("event_date", { ascending: true });

      if (error) {
        throw error;
      }

      setEvents(events || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      // Potentially show a toast/error message to the user
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 300), // Debounce for 300ms
    []
  );

  const handleClearSearch = () => {
    setSearchTerm("");
    // Manually clear the input field if it's controlled
    const searchInput = document.getElementById(
      "event-search"
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = "";
    }
  };

  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.event_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tab (main categories)
    if (activeTab === "online") {
      filtered = filtered.filter(
        (event) =>
          event.event_type.toLowerCase().includes("online") ||
          event.event_type.toLowerCase().includes("drive")
      );
    } else if (activeTab === "offline") {
      filtered = filtered.filter(
        (event) =>
          event.event_type.toLowerCase().includes("offline") ||
          event.event_type.toLowerCase().includes("site")
      );
    }

    // Apply additional dropdown filter
    if (filterType === "free") {
      filtered = filtered.filter(
        (event) => !event.is_paid || event.price === 0
      );
    } else if (filterType === "paid") {
      filtered = filtered.filter((event) => event.is_paid && event.price > 0);
    } else if (filterType === "team-based") {
      filtered = filtered.filter((event) => event.is_team_based);
    } else if (filterType === "individual") {
      filtered = filtered.filter((event) => !event.is_team_based);
    }

    return filtered;
  }, [events, searchTerm, activeTab, filterType]); // Added filterType dependency

  const onlineEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          event.event_type.toLowerCase().includes("online") ||
          event.event_type.toLowerCase().includes("drive")
      ),
    [events]
  );

  const offlineEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          event.event_type.toLowerCase().includes("offline") ||
          event.event_type.toLowerCase().includes("site")
      ),
    [events]
  );

  // Skeleton Card Component
  const SkeletonCard = () => (
    <div className="relative overflow-hidden rounded-xl border border-gray-700 bg-gray-800 p-4 shadow-lg animate-pulse">
      <Skeleton className="h-6 w-3/4 mb-2 bg-gray-700" />
      <Skeleton className="h-4 w-1/2 mb-4 bg-gray-700" />
      <div className="flex flex-wrap gap-2 mb-4">
        <Skeleton className="h-6 w-20 bg-gray-700 rounded-full" />
        <Skeleton className="h-6 w-24 bg-gray-700 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full bg-gray-700 rounded-md" />
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0612] to-[#131943] flex items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5, // Slower spin
            repeat: Infinity,
            ease: "easeInOut", // Smoother ease
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-[#F7374F]/30 border-t-[#F7374F] rounded-full"
        />
        <p className="ml-4 text-white text-lg font-medium">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0612] to-[#131943] relative overflow-hidden">
      {/* Dynamic, Subtle Background Gradients */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F7374F] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"
      ></motion.div>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{
          duration: 7,
          delay: 1,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#6ba348] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"
      ></motion.div>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{
          duration: 6,
          delay: 2,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#556492] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"
      ></motion.div>

      <div className="container px-4 py-8 sm:py-12 md:px-6 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeSlideIn}
          className="flex flex-col items-center justify-center space-y-5 text-center mb-10 sm:mb-16"
        >
          <motion.div
            variants={fadeSlideIn}
            className="inline-flex items-center rounded-full border border-[#F7374F]/30 bg-[#F7374F]/15 px-4 py-1.5 text-sm sm:text-base text-[#FFC0CB] font-medium tracking-wide animate-pulse-slow"
          >
            <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#F7374F]" />
            Discover Your Next Challenge
          </motion.div>
          <motion.h1
            variants={fadeSlideIn}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight"
          >
            Epic <span className="text-[#F7374F]">Events</span> &{" "}
            <span className="text-[#6ba348]">Competitions</span>
          </motion.h1>
          <motion.p
            variants={fadeSlideIn}
            className="mx-auto max-w-[800px] text-[#D4D4D6] text-base sm:text-lg md:text-xl leading-relaxed"
          >
            Dive into a world of thrilling competitions. Showcase your skills,
            join forces with teams, and dominate the leaderboards.
          </motion.p>
          <motion.div
            variants={fadeSlideIn}
            className="flex flex-wrap gap-3 justify-center pt-2"
          >
            <Badge className="bg-[#F7374F]/80 text-white px-4 py-1.5 text-sm font-semibold shadow-md hover:scale-105 transition-transform duration-300">
              <span className="text-lg font-bold mr-1">{events.length}</span>{" "}
              Total Events
            </Badge>
            <Badge className="bg-[#6ba348]/80 text-white px-4 py-1.5 text-sm font-semibold shadow-md hover:scale-105 transition-transform duration-300">
              <span className="text-lg font-bold mr-1">
                {onlineEvents.length}
              </span>{" "}
              Online Challenges
            </Badge>
            <Badge className="bg-[#556492]/80 text-white px-4 py-1.5 text-sm font-semibold shadow-md hover:scale-105 transition-transform duration-300">
              <span className="text-lg font-bold mr-1">
                {offlineEvents.length}
              </span>{" "}
              On-Site Battles
            </Badge>
          </motion.div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeSlideIn}
          className="mb-8 sm:mb-12 flex flex-col md:flex-row gap-4 items-center max-w-4xl mx-auto"
        >
          <div className="relative flex-grow w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#D4D4D6]/70" />
            <Input
              id="event-search"
              placeholder="Search by event name or type..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="pl-10 pr-8 bg-[#1a1f4a] border border-[#556492]/50 text-white placeholder:text-[#D4D4D6]/60 focus:border-[#F7374F] focus:ring-2 focus:ring-[#F7374F]/40 transition-all duration-300 rounded-xl shadow-lg focus:shadow-md focus:shadow-[#F7374F]/20 text-base h-12"
              value={searchTerm} // Controlled input
            />
            {searchTerm && (
              <XCircle
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#D4D4D6]/70 cursor-pointer hover:text-white transition-colors"
                onClick={handleClearSearch}
              />
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1f4a] border border-[#556492]/50 text-white rounded-xl shadow-lg hover:bg-[#F7374F]/20 hover:border-[#F7374F] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F7374F]/40"
              >
                <Filter className="h-5 w-5" />
                <span className="font-medium">
                  Filter (
                  {filterType === "all" ? "None" : filterType.replace("-", " ")}
                  )
                </span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-[#1a1f4a] border border-[#556492] text-white">
              <DropdownMenuItem
                className="hover:bg-[#556492]/30 cursor-pointer"
                onClick={() => setFilterType("all")}
              >
                All Events
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-[#556492]/30 cursor-pointer"
                onClick={() => setFilterType("free")}
              >
                Free Events
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-[#556492]/30 cursor-pointer"
                onClick={() => setFilterType("paid")}
              >
                Paid Events
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-[#556492]/30 cursor-pointer"
                onClick={() => setFilterType("team-based")}
              >
                Team-based
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-[#556492]/30 cursor="
                onClick={() => setFilterType("individual")}
              >
                Individual
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        {/* Tabs for Event Categories */}
        <motion.div initial="hidden" animate="visible" variants={fadeSlideIn}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-8 sm:mb-10 bg-[#1a1f4a] border border-[#556492]/50 rounded-xl shadow-lg p-1.5">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-[#F7374F] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-[#F7374F]/20 rounded-lg transition-all duration-300 text-sm sm:text-base font-medium text-[#D4D4D6] hover:text-white"
              >
                All ({events.length})
              </TabsTrigger>
              <TabsTrigger
                value="online"
                className="data-[state=active]:bg-[#F7374F] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-[#F7374F]/20 rounded-lg transition-all duration-300 text-sm sm:text-base font-medium text-[#D4D4D6] hover:text-white"
              >
                Online ({onlineEvents.length})
              </TabsTrigger>
              <TabsTrigger
                value="offline"
                className="data-[state=active]:bg-[#F7374F] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-[#F7374F]/20 rounded-lg transition-all duration-300 text-sm sm:text-base font-medium text-[#D4D4D6] hover:text-white"
              >
                Offline ({offlineEvents.length})
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {/* Added AnimatePresence for smooth transitions between tab contents */}
              <motion.div
                key={activeTab + searchTerm + filterType} // Key changes to re-animate when filters/tabs change
                initial="hidden"
                animate="visible"
                exit="hidden" // Define exit animation if needed
                variants={staggerContainer}
              >
                {filteredEvents.length > 0 ? (
                  <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredEvents.map((event) => (
                      <motion.div key={event.id} variants={staggerItem}>
                        <EventCard
                          id={event.id}
                          title={event.name}
                          type={event.event_type}
                          date={event.event_date}
                          platform={event.platform}
                          isTeamBased={event.is_team_based}
                          isPaid={event.is_paid}
                          price={event.price}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-16 sm:py-20 bg-[#1a1f4a] rounded-xl shadow-lg border border-[#556492]/50"
                  >
                    <XCircle className="h-16 w-16 sm:h-20 sm:w-20 text-[#F7374F] mx-auto mb-6 animate-bounce-slow" />
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                      No matching events found!
                    </h3>
                    <p className="text-[#D4D4D6] text-base sm:text-lg max-w-md mx-auto">
                      It seems there are no events matching your current search
                      and filter criteria. Try broadening your search or
                      selecting different filters.
                    </p>
                    {(searchTerm || filterType !== "all") && (
                      <div className="mt-6 flex justify-center gap-4">
                        {searchTerm && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-5 py-2 bg-[#F7374F] text-white rounded-lg shadow-md hover:bg-[#F7374F]/90 transition-colors duration-200"
                            onClick={handleClearSearch}
                          >
                            Clear Search
                          </motion.button>
                        )}
                        {filterType !== "all" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-5 py-2 bg-[#556492] text-white rounded-lg shadow-md hover:bg-[#556492]/90 transition-colors duration-200"
                            onClick={() => setFilterType("all")}
                          >
                            Reset Filters
                          </motion.button>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
