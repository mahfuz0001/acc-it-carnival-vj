"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, Users, DollarSign, Zap } from "lucide-react";
import { memo } from "react";

interface EventCardProps {
  id: number;
  title: string;
  type: string;
  date: string;
  platform: string;
  isTeamBased: boolean;
  isPaid: boolean;
  price: number;
}

const getEventIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "programming":
      return "👨‍💻"; // Changed from 🖥
    case "design":
      return "🎨";
    case "video":
      return "🎬"; // Changed from 🎥
    case "photography":
      return "📸"; // Changed from 📷
    case "quiz":
      return "🧠"; // Changed from ❓ (assuming IQ Test implies a quiz)
    case "presentation":
      return "🎤"; // Changed from 📊
    case "google it": // Added for "Google It" event
      return "🔍";
    case "iq test": // Added for "IQ Test" event
      return "🧠"; // Using brain for IQ test
    case "meme con": // Added for "Meme Con" event
      return "😂";
    case "project non-mechanical": // Added for "Project non-mechanical" event
      return "💡";
    case "digital art": // Added for "Digital Art" event
      return "🖌️";
    case "it olympiad": // Added for "IT Olympiad" event
      return "🏅";
    case "competitive programming": // Added for "Competitive Programming" event
      return "👨‍💻"; // Using man coding
    default:
      return "💻";
  }
};

const eventTypes = [
  "programming",
  "design",
  "video",
  "photography",
  "quiz",
  "presentation",
  "google it", // Added
  "iq test", // Added
  "meme con", // Added
  "project non-mechanical", // Added
  "digital art", // Added
  "it olympiad", // Added
  "competitive programming", // Added
] as const;
type EventType = (typeof eventTypes)[number];

const getEventGradient = (type: string) => {
  const gradients: Record<EventType | "default", string> = {
    programming: "from-[#F7374F]/20 to-[#B267FF]/20",
    design: "from-[#B267FF]/20 to-[#F7374F]/20",
    video: "from-[#F7374F]/20 to-[#556492]/20",
    photography: "from-[#556492]/20 to-[#B267FF]/20",
    quiz: "from-[#F7374F]/20 to-[#B267FF]/20",
    presentation: "from-[#B267FF]/20 to-[#F7374F]/20",
    "google it": "from-[#F7374F]/20 to-[#B267FF]/20", // Can customize if needed
    "iq test": "from-[#B267FF]/20 to-[#F7374F]/20", // Can customize if needed
    "meme con": "from-[#F7374F]/20 to-[#556492]/20", // Can customize if needed
    "project non-mechanical": "from-[#556492]/20 to-[#B267FF]/20", // Can customize if needed
    "digital art": "from-[#B267FF]/20 to-[#F7374F]/20", // Can customize if needed
    "it olympiad": "from-[#F7374F]/20 to-[#B267FF]/20", // Can customize if needed
    "competitive programming": "from-[#B267FF]/20 to-[#F7374F]/20", // Can customize if needed
    default: "from-[#F7374F]/20 to-[#B267FF]/20",
  };
  const key = type.toLowerCase() as EventType;
  return gradients[key] ?? gradients.default;
};

export const EventCard = memo(function EventCard({
  id,
  title,
  type,
  date,
  platform,
  isTeamBased,
  isPaid,
  price,
}: EventCardProps) {
  const eventIcon = getEventIcon(title); // Use title to get specific emojis for listed events
  const cardGradient = getEventGradient(type);

  return (
    <Card
      className={`
        group relative overflow-hidden transition-all duration-500 ease-in-out transform
        hover:scale-[1.02] hover:shadow-2xl
        bg-gradient-to-br ${cardGradient}
        border border-[#556492]/24 hover:border-[#F7374F]/60
        backdrop-blur-sm
        rounded-xl
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0612]/50 via-transparent to-[#131943]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>

      <CardHeader className="p-0 relative z-10">
        <div
          className="flex items-center justify-center h-28 sm:h-36 relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(to top right, #0a0612, ${
              type.toLowerCase() === "programming"
                ? "#F7374F"
                : type.toLowerCase() === "design"
                  ? "#B267FF"
                  : "#88304E"
            }30)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent"></div>
          <span className="text-3xl sm:text-5xl relative z-10 group-hover:scale-110 transition-transform duration-300 text-white drop-shadow-lg">
            {eventIcon}
          </span>
          <div className="absolute top-3 right-3">
            {isPaid && (
              <Badge className="bg-gradient-to-r from-[#F7374F] to-[#B267FF] text-white text-xs px-2 py-1 rounded-full shadow-md">
                <DollarSign className="h-3 w-3 mr-1" />৳{price}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 bg-[#0a0612]/70 relative z-10">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#F7374F] transition-colors duration-300 line-clamp-2">
            {title}
          </h3>
          <Badge
            variant="outline"
            className="border-[#F7374F]/60 text-[#F7374F] text-xs px-2 py-1 ml-2 flex-shrink-0 rounded-full"
          >
            {type}
          </Badge>
        </div>
        <div className="space-y-2 text-sm sm:text-base text-[#D4D4D6]">
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-transparent bg-clip-text bg-gradient-to-r from-[#F7374F] to-[#B267FF] flex-shrink-0" />
            <span className="truncate">
              {new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-transparent bg-clip-text bg-gradient-to-r from-[#F7374F] to-[#B267FF] flex-shrink-0" />
            <span className="truncate">{platform}</span>
          </div>
          {isTeamBased ? (
            <div className="flex items-center">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-transparent bg-clip-text bg-gradient-to-r from-[#F7374F] to-[#B267FF] flex-shrink-0" />
              <span>Team Event</span>
            </div>
          ) : (
            <div className="flex items-center">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-transparent bg-clip-text bg-gradient-to-r from-[#F7374F] to-[#B267FF] flex-shrink-0" />
              <span>Solo Event</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 sm:p-6 pt-0 bg-[#0a0612]/70 relative z-10">
        <Link href={`/events/${id}`} className="w-full">
          <Button
            className="
              w-full text-white shadow-lg transition-all duration-300 ease-in-out cursor-pointer
              bg-gradient-to-r from-[#F7374F] to-[#B267FF]
              hover:from-[#FF4D6D] hover:to-[#D285FF]
              text-base px-6 py-3 rounded-md
              hover:shadow-2xl hover:scale-[1.01]
            "
          >
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
});
