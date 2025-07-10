"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Users,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";

interface LiveStream {
  id: string;
  title: string;
  description: string;
  stream_url: string;
  is_live: boolean;
  viewer_count: number;
  event_id?: number;
  thumbnail_url?: string;
}

export function LiveStream() {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetchLiveStreams();

    // Simulate live viewer count updates
    const interval = setInterval(() => {
      setStreams((prev) =>
        prev.map((stream) => ({
          ...stream,
          viewer_count:
            stream.viewer_count + Math.floor(Math.random() * 10) - 5,
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchLiveStreams = async () => {
    // Mock data - replace with actual API call
    const mockStreams: LiveStream[] = [
      {
        id: "1",
        title: "Programming Contest - Live Finals",
        description: "Watch the best programmers compete in real-time",
        stream_url: "https://example.com/stream1",
        is_live: true,
        viewer_count: 1247,
        event_id: 1,
        thumbnail_url: "/placeholder.svg?height=200&width=350",
      },
      {
        id: "2",
        title: "Design Competition Showcase",
        description: "Live presentation of design submissions",
        stream_url: "https://example.com/stream2",
        is_live: true,
        viewer_count: 892,
        event_id: 2,
        thumbnail_url: "/placeholder.svg?height=200&width=350",
      },
      {
        id: "3",
        title: "Opening Ceremony Highlights",
        description: "Relive the best moments from the opening",
        stream_url: "https://example.com/stream3",
        is_live: false,
        viewer_count: 2156,
        thumbnail_url: "/placeholder.svg?height=200&width=350",
      },
    ];

    setStreams(mockStreams);
    if (mockStreams.length > 0) {
      setActiveStream(mockStreams[0]);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const liveStreams = streams.filter((stream) => stream.is_live);
  const recordedStreams = streams.filter((stream) => !stream.is_live);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Play className="h-6 w-6 text-[#F7374F]" />
          Live Streams
        </h2>
        <Badge className="bg-red-500 text-white animate-pulse">
          {liveStreams.length} LIVE
        </Badge>
      </div>

      {/* Main Stream Player */}
      {activeStream && (
        <Card className="bg-gradient-to-br from-[#556492]/10 to-[#7683A4]/10 border-[#556492]/30 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-video bg-black">
              {/* Video Player Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <div className="text-center">
                  <Play className="h-16 w-16 text-white mx-auto mb-4 opacity-50" />
                  <p className="text-white opacity-75">Video Player</p>
                  <p className="text-sm text-gray-400">
                    {activeStream.stream_url}
                  </p>
                </div>
              </div>

              {/* Live Badge */}
              {activeStream.is_live && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-500 text-white animate-pulse">
                    🔴 LIVE
                  </Badge>
                </div>
              )}

              {/* Viewer Count */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-black/50 text-white">
                  <Users className="h-3 w-3 mr-1" />
                  {activeStream.viewer_count.toLocaleString()}
                </Badge>
              </div>

              {/* Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={togglePlay}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stream Info */}
            <div className="p-4">
              <h3 className="text-xl font-bold text-white mb-2">
                {activeStream.title}
              </h3>
              <p className="text-[#D4D4D6] mb-3">{activeStream.description}</p>
              <div className="flex items-center gap-4">
                <Badge className="bg-[#F7374F] text-white">
                  <Users className="h-3 w-3 mr-1" />
                  {activeStream.viewer_count.toLocaleString()} viewers
                </Badge>
                {activeStream.is_live && (
                  <Badge className="bg-red-500 text-white">Live Now</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stream List */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Live Streams */}
        {liveStreams.length > 0 && (
          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                🔴 Live Now
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {liveStreams.map((stream) => (
                <motion.div
                  key={stream.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    activeStream?.id === stream.id
                      ? "bg-[#F7374F]/20 border-[#F7374F]"
                      : "bg-[#556492]/20 border-[#556492]/30 hover:border-[#F7374F]/50"
                  }`}
                  onClick={() => setActiveStream(stream)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 bg-black rounded overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                        <Play className="h-4 w-4 text-white opacity-50" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">
                        {stream.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-red-500 text-white text-xs">
                          LIVE
                        </Badge>
                        <span className="text-xs text-[#D4D4D6]">
                          {stream.viewer_count.toLocaleString()} viewers
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recorded Streams */}
        {recordedStreams.length > 0 && (
          <Card className="bg-gradient-to-br from-[#556492]/10 to-[#7683A4]/10 border-[#556492]/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                📹 Recordings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recordedStreams.map((stream) => (
                <motion.div
                  key={stream.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    activeStream?.id === stream.id
                      ? "bg-[#F7374F]/20 border-[#F7374F]"
                      : "bg-[#556492]/20 border-[#556492]/30 hover:border-[#F7374F]/50"
                  }`}
                  onClick={() => setActiveStream(stream)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-12 bg-black rounded overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                        <Play className="h-4 w-4 text-white opacity-50" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">
                        {stream.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-gray-500 text-white text-xs">
                          RECORDED
                        </Badge>
                        <span className="text-xs text-[#D4D4D6]">
                          {stream.viewer_count.toLocaleString()} views
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
