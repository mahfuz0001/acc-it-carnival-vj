import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Trophy,
  Users,
  Sparkles,
  Zap,
} from "lucide-react";
import { EventCard } from "@/components/event-card"; // Assuming this component is styled separately
import { supabase } from "@/lib/supabase";
import { CountdownTimer } from "@/components/countdown-timer";
import { Suspense } from "react";
import Image from "next/image";
import DotPattern from "@/components/ui/dot-pattern-1";
import { Features } from "@/components/Features";

async function getFeaturedEvents() {
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .limit(6)
    .order("event_date", { ascending: true });

  return events || [];
}

function EventsGrid({ events }: { events: any[] }) {
  return (
    <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {" "}
      {/* Increased gap */}
      {events.slice(0, 6).map((event, index) => (
        <div
          key={event.id}
          className="relative group rounded-xl overflow-hidden animate-fade-in-up" // Added overflow-hidden for card effects
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Subtle gradient overlay for each card */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#131943]/20 to-[#0a0612]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
          {/* Dot pattern as a subtle background for the card */}
          <DotPattern
            width={5}
            height={5}
            className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
          />
          {/* The actual EventCard component */}
          <div className="relative z-20">
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
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function Home() {
  const featuredEvents = await getFeaturedEvents();

  return (
    <div className="flex flex-col">
      {/* Hero Section - NO CHANGES HERE as per instruction */}
      <section className="relative bg-[#0a0612] py-10 sm:py-16 md:py-24 overflow-hidden px-7 sm:px-10 lg:px-10">
        {/* <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div> */}

        <div className="absolute top-20 left-4 sm:left-10 w-16 sm:w-32 h-16 sm:h-32 bg-gradient-to-r from-[#6A0EFF]/10 to-[#B267FF]/10 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute top-40 right-4 sm:right-20 w-12 sm:w-24 h-12 sm:h-24 bg-gradient-to-r from-[#F7374F]/10 to-[#FF4D6D]/10 rounded-full blur-xl animate-bounce animation-delay-200"></div>
        <div className="absolute bottom-20 left-10 w-20 sm:w-40 h-20 sm:h-40 bg-gradient-to-r from-[#6A0EFF]/10 to-[#B267FF]/10 rounded-full blur-xl animate-bounce animation-delay-400"></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-8 sm:gap-12">
            <div className="flex flex-col justify-center space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="inline-flex items-center rounded-full border border-[#F7374F]/20 bg-[#F7374F]/10 px-3 py-1 text-xs sm:text-sm text-[#F7374F] animate-pulse">
                  <Sparkles className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  4th Edition • Bigger & Bolder
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-3xl lg:text-4xl xl:text-7xl font-bold tracking-tighter text-white animate-fade-in-up">
                  ACC IT Club Presents
                </h1>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-8xl font-bold tracking-tighter text-[#F7374F] animate-fade-in-up animation-delay-200">
                  IT Carnival 4.0
                </h2>
                <p className="max-w-[600px] text-[#EAEAEA] text-sm sm:text-lg md:text-xl leading-relaxed animate-fade-in-up animation-delay-400">
                  Join us for a next-level celebration of technology,
                  creativity, and connection.
                </p>
              </div>

              <div className="animate-fade-in-up animation-delay-600">
                <CountdownTimer targetDate="2025-08-15T00:00:00" />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row animate-fade-in-up animation-delay-800 cursor-pointer">
                <Link href="/events">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-white shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-r from-[#F7374F] to-[#B267FF] hover:from-[#FF4D6D] hover:to-[#D285FF]"
                  >
                    <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Explore Events
                  </Button>
                </Link>
                <Link href="/events">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto transition-all duration-300 cursor-pointer border-[#F7374F]/20 text-[#F7374F] hover:bg-[#F7374F]/10 hover:text-white shadow-lg hover:shadow-[#F7374F]/20"
                  >
                    Register Now
                  </Button>
                </Link>
              </div>
            </div>

            {/* New Banner Image Instead of 4.0 Orb */}
            <div className="flex items-center justify-center animate-fade-in-up animation-delay-1000">
              <Image
                src="/acc-itc-logo.png"
                alt="IT Carnival Banner"
                width={560}
                height={400}
                className="object-contain drop-shadow-2xl rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-gradient-to-t from-[#131943] to-[#0a0612] py-16 sm:py-24 md:py-32 px-7 sm:px-10 lg:px-10 overflow-hidden">
        <Features />
      </section>
      {/* Featured Events */}
      <section className="relative sm:py-20 bg-gradient-to-b from-[#131943] to-[#0a0612] border-t border-[#556492]/20 px-7 sm:px-10 lg:px-10 overflow-hidden">
        {" "}
        {/* Added relative & overflow-hidden */}
        {/* Background glow for the section */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-[#F7374F]/5 blur-[100px] rounded-full -z-10"></div>
        <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[70%] h-[200px] bg-[#B267FF]/5 blur-[100px] rounded-full -z-10"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-5 text-center mb-10 sm:mb-16">
            {" "}
            {/* Increased margins */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-white animate-fade-in-up bg-clip-text text-transparent bg-gradient-to-r from-[#F7374F] to-[#B267FF]">
                {" "}
                {/* Larger, bolder, gradient title */}
                Explore Our Featured Events
              </h2>
              <p className="mx-auto max-w-[800px] text-[#D4D4D6] text-base sm:text-xl md:text-2xl leading-relaxed animate-fade-in-up animation-delay-200">
                {" "}
                {/* Larger, more relaxed description */}
                Dive into a world of innovation, challenge your limits, and
                connect with fellow tech enthusiasts.
              </p>
            </div>
          </div>
          <Suspense
            fallback={
              <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {" "}
                {/* Increased gap */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-72 bg-[#556492]/20 rounded-xl animate-pulse" // Slightly taller, rounded corners
                  />
                ))}
              </div>
            }
          >
            <EventsGrid events={featuredEvents} />
          </Suspense>
          <div className="mt-10 sm:mt-16 flex justify-center animate-fade-in-up animation-delay-800">
            {" "}
            {/* Increased margin */}
            <Link href="/events">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#F7374F] to-[#B267FF] hover:from-[#FF4D6D] hover:to-[#D285FF] text-white shadow-lg transition-all duration-300 cursor-pointer text-base sm:text-lg px-8 py-3 rounded-full hover:scale-105" // Larger text, rounded full, hover scale
                style={{
                  boxShadow:
                    "0 6px 30px rgba(247, 55, 79, 0.3), 0 2px 10px rgba(178, 103, 255, 0.15)",
                }} // Deeper, dual-color shadow
              >
                View All Events
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Call to Action */}
      <section className="relative bg-gradient-to-t from-[#131943] to-[#0a0612] py-16 sm:py-24 md:py-40 px-7 sm:px-10 lg:px-10 overflow-hidden">
        {" "}
        {/* Increased padding, added relative & overflow-hidden */}
        {/* Background grid/pattern matching hero */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 rotate-45 scale-150"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#F7374F]/10 blur-3xl rounded-full -translate-y-1/2 -translate-x-1/2 animate-blob-pulse"></div>
        <div className="absolute bottom-1/2 right-0 w-72 h-72 bg-[#B267FF]/10 blur-3xl rounded-full translate-y-1/2 translate-x-1/2 animate-blob-pulse animation-delay-300"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8 text-center">
            {" "}
            {/* Increased spacing */}
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-white animate-fade-in-up bg-clip-text text-transparent bg-gradient-to-r from-[#F7374F] to-[#B267FF]">
                {" "}
                {/* Larger, bolder, gradient title */}
                Ready to Ignite Your Passion?
              </h2>
              <p className="mx-auto max-w-[800px] text-[#EBEBEB] text-base sm:text-xl md:text-2xl leading-relaxed animate-fade-in-up animation-delay-200">
                {" "}
                {/* Larger, more relaxed description */}
                Join us for an unforgettable experience at ACC IT Carnival 4.0.
                Connect, compete, and create your future in tech!
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row animate-fade-in-up animation-delay-400">
              <Link href="/events">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-[#F7374F] to-[#B267FF] hover:from-[#FF4D6D] hover:to-[#D285FF] text-white shadow-lg transition-all duration-300 cursor-pointer text-base sm:text-lg px-8 py-3 rounded-full hover:scale-105" // Consistent button style
                  style={{
                    boxShadow:
                      "0 6px 30px rgba(247, 55, 79, 0.3), 0 2px 10px rgba(178, 103, 255, 0.15)",
                  }} // Consistent shadow
                >
                  <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Register Now
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-[#F7374F]/40 text-[#F7374F] hover:bg-[#F7374F]/15 hover:text-white shadow-lg transition-all duration-300 cursor-pointer text-base sm:text-lg px-8 py-3 rounded-full hover:scale-105" // Stronger border, slightly more vibrant hover
                  style={{ boxShadow: "0 6px 30px rgba(247, 55, 79, 0.15)" }} // Consistent shadow
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
