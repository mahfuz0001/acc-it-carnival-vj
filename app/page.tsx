import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trophy, Sparkles, Zap } from "lucide-react"
import { EventCard } from "@/components/event-card"
import { supabase } from "@/lib/supabase"
import { CountdownTimer } from "@/components/countdown-timer"
import { Suspense } from "react"
import Image from "next/image"
import DotPattern from "@/components/ui/dot-pattern-1"
import { Features } from "@/components/Features"
import { getCurrentTenant, getTenantCustomizations } from "@/lib/tenant"

async function getFeaturedEvents(tenantId?: string) {
  let query = supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .limit(6)
    .order("event_date", { ascending: true })

  if (tenantId) {
    query = query.eq("tenant_id", tenantId)
  }

  const { data: events } = await query
  return events || []
}

function EventsGrid({ events }: { events: any[] }) {
  return (
    <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {events.slice(0, 6).map((event, index) => (
        <div
          key={event.id}
          className="relative group rounded-xl overflow-hidden animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--tenant-primary)]/20 to-[var(--tenant-background)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
          <DotPattern
            width={5}
            height={5}
            className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
          />
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
  )
}

export default async function Home() {
  const tenant = await getCurrentTenant()
  const customizations = tenant ? await getTenantCustomizations(tenant.id) : {}
  const featuredEvents = await getFeaturedEvents(tenant?.id)

  // Get customized content or fallback to defaults
  const heroTitle = customizations?.hero?.title || `${tenant?.name || "Event Platform"} Presents`
  const heroSubtitle = customizations?.hero?.subtitle || tenant?.name || "Amazing Events"
  const heroDescription =
    customizations?.hero?.description || tenant?.description || "Join us for an unforgettable experience."
  const logoUrl = tenant?.logo_url || "/acc-itc-logo.png"

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        className="relative py-10 sm:py-16 md:py-24 overflow-hidden px-7 sm:px-10 lg:px-10"
        style={{ backgroundColor: tenant?.background_color || "#0a0612" }}
      >
        <div
          className="absolute top-20 left-4 sm:left-10 w-16 sm:w-32 h-16 sm:h-32 rounded-full blur-xl animate-bounce"
          style={{
            background: `linear-gradient(to right, ${tenant?.primary_color || "#F7374F"}10, ${tenant?.secondary_color || "#B267FF"}10)`,
          }}
        ></div>
        <div
          className="absolute top-40 right-4 sm:right-20 w-12 sm:w-24 h-12 sm:h-24 rounded-full blur-xl animate-bounce animation-delay-200"
          style={{
            background: `linear-gradient(to right, ${tenant?.accent_color || "#6ba348"}10, ${tenant?.primary_color || "#F7374F"}10)`,
          }}
        ></div>
        <div
          className="absolute bottom-20 left-10 w-20 sm:w-40 h-20 sm:h-40 rounded-full blur-xl animate-bounce animation-delay-400"
          style={{
            background: `linear-gradient(to right, ${tenant?.primary_color || "#F7374F"}10, ${tenant?.secondary_color || "#B267FF"}10)`,
          }}
        ></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-8 sm:gap-12">
            <div className="flex flex-col justify-center space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <div
                  className="inline-flex items-center rounded-full border px-3 py-1 text-xs sm:text-sm animate-pulse"
                  style={{
                    borderColor: `${tenant?.primary_color || "#F7374F"}20`,
                    backgroundColor: `${tenant?.primary_color || "#F7374F"}10`,
                    color: tenant?.primary_color || "#F7374F",
                  }}
                >
                  <Sparkles className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Latest Edition • Bigger & Better
                </div>
                <h1
                  className="text-2xl sm:text-4xl md:text-3xl lg:text-4xl xl:text-7xl font-bold tracking-tighter animate-fade-in-up"
                  style={{ color: tenant?.text_color || "#FFFFFF" }}
                >
                  {heroTitle}
                </h1>
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-8xl font-bold tracking-tighter animate-fade-in-up animation-delay-200"
                  style={{ color: tenant?.primary_color || "#F7374F" }}
                >
                  {heroSubtitle}
                </h2>
                <p
                  className="max-w-[600px] text-sm sm:text-lg md:text-xl leading-relaxed animate-fade-in-up animation-delay-400"
                  style={{ color: `${tenant?.text_color || "#EAEAEA"}CC` }}
                >
                  {heroDescription}
                </p>
              </div>

              <div className="animate-fade-in-up animation-delay-600">
                <CountdownTimer targetDate="2025-08-15T00:00:00" />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row animate-fade-in-up animation-delay-800 cursor-pointer">
                <Link href="/events">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto text-white shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                    style={{
                      background: `linear-gradient(to right, ${tenant?.primary_color || "#F7374F"}, ${tenant?.secondary_color || "#B267FF"})`,
                    }}
                  >
                    <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Explore Events
                  </Button>
                </Link>
                <Link href="/events">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto transition-all duration-300 cursor-pointer shadow-lg bg-transparent"
                    style={{
                      borderColor: `${tenant?.primary_color || "#F7374F"}20`,
                      color: tenant?.primary_color || "#F7374F",
                    }}
                  >
                    Register Now
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center animate-fade-in-up animation-delay-1000">
              <Image
                src={logoUrl || "/placeholder.svg"}
                alt="Event Logo"
                width={560}
                height={400}
                className="object-contain drop-shadow-2xl rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="relative py-16 sm:py-24 md:py-32 px-7 sm:px-10 lg:px-10 overflow-hidden"
        style={{
          background: `linear-gradient(to top, ${tenant?.background_color || "#131943"}, ${tenant?.background_color || "#0a0612"})`,
        }}
      >
        <Features />
      </section>

      {/* Featured Events */}
      <section
        className="relative sm:py-20 border-t px-7 sm:px-10 lg:px-10 overflow-hidden"
        style={{
          background: `linear-gradient(to bottom, ${tenant?.background_color || "#131943"}, ${tenant?.background_color || "#0a0612"})`,
          borderColor: `${tenant?.primary_color || "#556492"}20`,
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] blur-[100px] rounded-full -z-10"
          style={{ backgroundColor: `${tenant?.primary_color || "#F7374F"}05` }}
        ></div>
        <div
          className="absolute bottom-0 right-1/2 translate-x-1/2 w-[70%] h-[200px] blur-[100px] rounded-full -z-10"
          style={{ backgroundColor: `${tenant?.secondary_color || "#B267FF"}05` }}
        ></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-5 text-center mb-10 sm:mb-16">
            <div className="space-y-3 sm:space-y-4">
              <h2
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter animate-fade-in-up bg-clip-text text-transparent"
                style={{
                  background: `linear-gradient(to right, ${tenant?.primary_color || "#F7374F"}, ${tenant?.secondary_color || "#B267FF"})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Explore Our Featured Events
              </h2>
              <p
                className="mx-auto max-w-[800px] text-base sm:text-xl md:text-2xl leading-relaxed animate-fade-in-up animation-delay-200"
                style={{ color: `${tenant?.text_color || "#D4D4D6"}CC` }}
              >
                Dive into a world of innovation, challenge your limits, and connect with fellow enthusiasts.
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-72 rounded-xl animate-pulse"
                    style={{ backgroundColor: `${tenant?.primary_color || "#556492"}20` }}
                  />
                ))}
              </div>
            }
          >
            <EventsGrid events={featuredEvents} />
          </Suspense>

          <div className="mt-10 sm:mt-16 flex justify-center animate-fade-in-up animation-delay-800">
            <Link href="/events">
              <Button
                size="lg"
                className="text-white shadow-lg transition-all duration-300 cursor-pointer text-base sm:text-lg px-8 py-3 rounded-full hover:scale-105"
                style={{
                  background: `linear-gradient(to right, ${tenant?.primary_color || "#F7374F"}, ${tenant?.secondary_color || "#B267FF"})`,
                  boxShadow: `0 6px 30px ${tenant?.primary_color || "#F7374F"}30, 0 2px 10px ${tenant?.secondary_color || "#B267FF"}15`,
                }}
              >
                View All Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section
        className="relative py-16 sm:py-24 md:py-40 px-7 sm:px-10 lg:px-10 overflow-hidden"
        style={{
          background: `linear-gradient(to top, ${tenant?.background_color || "#131943"}, ${tenant?.background_color || "#0a0612"})`,
        }}
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 rotate-45 scale-150"></div>
        <div
          className="absolute top-1/2 left-0 w-64 h-64 blur-3xl rounded-full -translate-y-1/2 -translate-x-1/2 animate-blob-pulse"
          style={{ backgroundColor: `${tenant?.primary_color || "#F7374F"}10` }}
        ></div>
        <div
          className="absolute bottom-1/2 right-0 w-72 h-72 blur-3xl rounded-full translate-y-1/2 translate-x-1/2 animate-blob-pulse animation-delay-300"
          style={{ backgroundColor: `${tenant?.secondary_color || "#B267FF"}10` }}
        ></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8 text-center">
            <div className="space-y-4 sm:space-y-6">
              <h2
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter animate-fade-in-up bg-clip-text text-transparent"
                style={{
                  background: `linear-gradient(to right, ${tenant?.primary_color || "#F7374F"}, ${tenant?.secondary_color || "#B267FF"})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Ready to Join Us?
              </h2>
              <p
                className="mx-auto max-w-[800px] text-base sm:text-xl md:text-2xl leading-relaxed animate-fade-in-up animation-delay-200"
                style={{ color: tenant?.text_color || "#EBEBEB" }}
              >
                Join us for an unforgettable experience. Connect, compete, and create your future!
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row animate-fade-in-up animation-delay-400">
              <Link href="/events">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-white shadow-lg transition-all duration-300 cursor-pointer text-base sm:text-lg px-8 py-3 rounded-full hover:scale-105"
                  style={{
                    background: `linear-gradient(to right, ${tenant?.primary_color || "#F7374F"}, ${tenant?.secondary_color || "#B267FF"})`,
                    boxShadow: `0 6px 30px ${tenant?.primary_color || "#F7374F"}30, 0 2px 10px ${tenant?.secondary_color || "#B267FF"}15`,
                  }}
                >
                  <Trophy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Register Now
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto shadow-lg transition-all duration-300 cursor-pointer text-base sm:text-lg px-8 py-3 rounded-full hover:scale-105 bg-transparent"
                  style={{
                    borderColor: `${tenant?.primary_color || "#F7374F"}40`,
                    color: tenant?.primary_color || "#F7374F",
                    boxShadow: `0 6px 30px ${tenant?.primary_color || "#F7374F"}15`,
                  }}
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
