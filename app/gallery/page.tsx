import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { Camera, Calendar } from "lucide-react";

async function getGalleryImages() {
  const { data: images } = await supabase
    .from("gallery")
    .select(
      `
      *,
      events (
        name,
        event_type
      )
    `
    )
    .order("uploaded_at", { ascending: false });

  return images || [];
}

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#131943] to-[#1a1f4a]">
      <div className="container px-4 py-12 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl">
              Event Gallery
            </h1>
            <p className="mx-auto max-w-[700px] text-[#D4D4D6] md:text-xl">
              Relive the moments from previous IT Carnival events and get
              excited for what's coming
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge className="bg-[#F7374F] text-white">
                <Camera className="h-3 w-3 mr-1" />
                {images.length} Photos
              </Badge>
              <Badge className="bg-[#7683A4] text-white">Previous Events</Badge>
            </div>
          </div>
        </div>

        {images.length === 0 ? (
          <Card className="bg-[#556492]/20 border-[#556492]/30">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Camera className="h-16 w-16 text-[#F7374F] mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Gallery Coming Soon
              </h3>
              <p className="text-[#D4D4D6] text-center max-w-md">
                Photos from ACC IT Carnival 4.0 will be uploaded here during and
                after the event. Stay tuned for amazing moments!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((image) => (
              <Card
                key={image.id}
                className="group overflow-hidden bg-[#556492]/20 border-[#556492]/30 hover:border-[#F7374F]/50 transition-all duration-300"
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={
                        image.image_url ||
                        "/placeholder.svg?height=300&width=300"
                      }
                      alt={image.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="font-semibold text-sm mb-1">
                        {image.title}
                      </h3>
                      {image.description && (
                        <p className="text-xs text-gray-200 line-clamp-2">
                          {image.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">
                          {new Date(image.uploaded_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Placeholder Gallery for Demo */}
        {images.length === 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Previous IT Carnival Highlights
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card
                  key={index}
                  className="group overflow-hidden bg-[#556492]/20 border-[#556492]/30"
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[#F7374F]/20 to-[#7683A4]/20">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="h-12 w-12 text-[#F7374F]/50" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-semibold text-sm text-white mb-1">
                          IT Carnival {3 - Math.floor(index / 3)}.0
                        </h3>
                        <p className="text-xs text-[#D4D4D6]">
                          {
                            [
                              "Programming Contest",
                              "Design Competition",
                              "Tech Talk",
                              "Award Ceremony",
                            ][index % 4]
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
