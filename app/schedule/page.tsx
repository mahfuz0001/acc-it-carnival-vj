import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";

const scheduleData = {
  day1: [
    {
      time: "9:00 AM - 10:00 AM",
      event: "Opening Ceremony",
      location: "Main Auditorium",
      type: "Ceremony",
    },
    {
      time: "10:30 AM - 12:30 PM",
      event: "Project Display Setup",
      location: "Exhibition Hall",
      type: "Setup",
    },
    {
      time: "12:30 PM - 1:30 PM",
      event: "Lunch Break",
      location: "Cafeteria",
      type: "Break",
    },
    {
      time: "1:30 PM - 4:30 PM",
      event: "Project Display & Wall Magazine",
      location: "Exhibition Hall",
      type: "Competition",
    },
    {
      time: "4:30 PM - 5:30 PM",
      event: "Photography & MemeCon Showcase",
      location: "Gallery",
      type: "Exhibition",
    },
    {
      time: "5:30 PM - 6:00 PM",
      event: "Day 1 Closing",
      location: "Main Auditorium",
      type: "Ceremony",
    },
  ],
  day2: [
    {
      time: "9:00 AM - 10:00 AM",
      event: "Day 2 Opening",
      location: "Main Auditorium",
      type: "Ceremony",
    },
    {
      time: "10:00 AM - 12:00 PM",
      event: "PowerPoint Presentation",
      location: "Conference Room A",
      type: "Competition",
    },
    {
      time: "10:00 AM - 12:00 PM",
      event: "Google IT Challenge",
      location: "Computer Lab",
      type: "Competition",
    },
    {
      time: "12:00 PM - 1:00 PM",
      event: "Lunch Break",
      location: "Cafeteria",
      type: "Break",
    },
    {
      time: "1:00 PM - 3:00 PM",
      event: "Extempore Speech",
      location: "Conference Room B",
      type: "Competition",
    },
    {
      time: "3:00 PM - 5:00 PM",
      event: "IT Olympiad",
      location: "Main Hall",
      type: "Competition",
    },
    {
      time: "5:00 PM - 6:00 PM",
      event: "Day 2 Results & Closing",
      location: "Main Auditorium",
      type: "Ceremony",
    },
  ],
  day3: [
    {
      time: "9:00 AM - 10:00 AM",
      event: "Final Day Opening",
      location: "Main Auditorium",
      type: "Ceremony",
    },
    {
      time: "10:00 AM - 1:00 PM",
      event: "Competitive Programming",
      location: "Computer Lab",
      type: "Competition",
    },
    {
      time: "1:00 PM - 2:00 PM",
      event: "Lunch Break",
      location: "Cafeteria",
      type: "Break",
    },
    {
      time: "2:00 PM - 4:00 PM",
      event: "Team Quiz (Final)",
      location: "Main Hall",
      type: "Competition",
    },
    {
      time: "4:00 PM - 5:00 PM",
      event: "Prize Distribution",
      location: "Main Auditorium",
      type: "Ceremony",
    },
    {
      time: "5:00 PM - 6:00 PM",
      event: "Closing Ceremony",
      location: "Main Auditorium",
      type: "Ceremony",
    },
  ],
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "Competition":
      return "bg-[#F7374F] text-white";
    case "Ceremony":
      return "bg-[#556492] text-white";
    case "Exhibition":
      return "bg-[#7683A4] text-white";
    case "Break":
      return "bg-[#D4D4D6] text-gray-800";
    case "Setup":
      return "bg-[#EBEBEB] text-gray-800";
    default:
      return "bg-gray-200 text-gray-800";
  }
};

export default function SchedulePage() {
  return (
    <div className="container px-4 py-12 md:px-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter text-[#131943] sm:text-4xl md:text-5xl">
            Event Schedule
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Complete schedule for ACC IT Carnival 4.0 - August 15-17, 2025
          </p>
        </div>
      </div>

      <Tabs defaultValue="day1" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="day1">Day 1 - Aug 15</TabsTrigger>
          <TabsTrigger value="day2">Day 2 - Aug 16</TabsTrigger>
          <TabsTrigger value="day3">Day 3 - Aug 17</TabsTrigger>
        </TabsList>

        <TabsContent value="day1">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#131943] mb-4">
              Day 1 - August 15, 2025
            </h2>
            <div className="grid gap-4">
              {scheduleData.day1.map((item, index) => (
                <Card key={index} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{item.event}</CardTitle>
                      <Badge className={getTypeColor(item.type)}>
                        {item.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{item.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="day2">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#131943] mb-4">
              Day 2 - August 16, 2025
            </h2>
            <div className="grid gap-4">
              {scheduleData.day2.map((item, index) => (
                <Card key={index} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{item.event}</CardTitle>
                      <Badge className={getTypeColor(item.type)}>
                        {item.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{item.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="day3">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#131943] mb-4">
              Day 3 - August 17, 2025
            </h2>
            <div className="grid gap-4">
              {scheduleData.day3.map((item, index) => (
                <Card key={index} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{item.event}</CardTitle>
                      <Badge className={getTypeColor(item.type)}>
                        {item.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{item.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12 bg-[#EBEBEB] rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Important Notes</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            • Online submissions for Graphics Design, Video Editing, MemeCon,
            and Photography are due by August 15, 2025, 11:59 PM
          </li>
          <li>
            • Participants must arrive 30 minutes before their scheduled events
          </li>
          <li>• Lunch will be provided for all registered participants</li>
          <li>• Bring your student ID and registration confirmation</li>
          <li>• For team events, all team members must be present</li>
        </ul>
      </div>
    </div>
  );
}
