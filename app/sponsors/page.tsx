import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { ExternalLink, Star, Award, Crown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

async function getSponsors() {
  const { data: sponsors } = await supabase
    .from("sponsors")
    .select("*")
    .order("tier", { ascending: true });

  return sponsors || [];
}

const getTierIcon = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case "platinum":
      return <Crown className="h-5 w-5" />;
    case "gold":
      return <Award className="h-5 w-5" />;
    case "silver":
      return <Star className="h-5 w-5" />;
    default:
      return <Star className="h-5 w-5" />;
  }
};

const getTierColor = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case "platinum":
      return "bg-gradient-to-r from-[#F7374F] to-[#6ba348]";
    case "gold":
      return "bg-gradient-to-r from-yellow-500 to-yellow-600";
    case "silver":
      return "bg-gradient-to-r from-gray-400 to-gray-500";
    default:
      return "bg-[#7683A4]";
  }
};

export default async function SponsorsPage() {
  const sponsors = await getSponsors();

  const platinumSponsors = sponsors.filter(
    (s) => s.tier?.toLowerCase() === "platinum"
  );
  const goldSponsors = sponsors.filter((s) => s.tier?.toLowerCase() === "gold");
  const silverSponsors = sponsors.filter(
    (s) => s.tier?.toLowerCase() === "silver"
  );
  const otherSponsors = sponsors.filter(
    (s) => !["platinum", "gold", "silver"].includes(s.tier?.toLowerCase() || "")
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#131943] to-[#1a1f4a]">
      <div className="container px-4 py-12 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl">
              Our Sponsors
            </h1>
            <p className="mx-auto max-w-[700px] text-[#D4D4D6] md:text-xl">
              We're grateful to our amazing sponsors who make ACC IT Carnival
              4.0 possible
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge className="bg-[#F7374F] text-white">
                {sponsors.length} Partners
              </Badge>
              <Badge className="bg-[#7683A4] text-white">
                Supporting Innovation
              </Badge>
            </div>
          </div>
        </div>

        {sponsors.length === 0 ? (
          <Card className="bg-[#556492]/20 border-[#556492]/30">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Award className="h-16 w-16 text-[#F7374F] mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Sponsors Coming Soon
              </h3>
              <p className="text-[#D4D4D6] text-center max-w-md mb-6">
                We're actively seeking sponsors for ACC IT Carnival 4.0. Join us
                in supporting the next generation of tech talent!
              </p>
              <Button className="bg-[#F7374F] hover:bg-[#6ba348] text-white">
                Become a Sponsor
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {/* Platinum Sponsors */}
            {platinumSponsors.length > 0 && (
              <div>
                <div className="text-center mb-8">
                  <Badge className="bg-gradient-to-r from-[#F7374F] to-[#6ba348] text-white px-4 py-2 text-lg">
                    <Crown className="h-5 w-5 mr-2" />
                    Platinum Sponsors
                  </Badge>
                </div>
                <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2">
                  {platinumSponsors.map((sponsor) => (
                    <Card
                      key={sponsor.id}
                      className="bg-gradient-to-br from-[#F7374F]/20 to-[#6ba348]/20 border-[#F7374F]/30"
                    >
                      <CardHeader className="text-center">
                        <div className="mx-auto mb-4 h-24 w-48 relative">
                          <Image
                            src={
                              sponsor.logo_url ||
                              "/placeholder.svg?height=96&width=192"
                            }
                            alt={sponsor.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <CardTitle className="text-white text-2xl">
                          {sponsor.name}
                        </CardTitle>
                        {sponsor.description && (
                          <CardDescription className="text-[#D4D4D6]">
                            {sponsor.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      {sponsor.website_url && (
                        <CardContent className="text-center">
                          <Link href={sponsor.website_url} target="_blank">
                            <Button
                              variant="outline"
                              className="border-[#F7374F] text-[#F7374F] hover:bg-[#F7374F]/20"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Visit Website
                            </Button>
                          </Link>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Gold Sponsors */}
            {goldSponsors.length > 0 && (
              <div>
                <div className="text-center mb-8">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-2 text-lg">
                    <Award className="h-5 w-5 mr-2" />
                    Gold Sponsors
                  </Badge>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {goldSponsors.map((sponsor) => (
                    <Card
                      key={sponsor.id}
                      className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30"
                    >
                      <CardHeader className="text-center">
                        <div className="mx-auto mb-4 h-16 w-32 relative">
                          <Image
                            src={
                              sponsor.logo_url ||
                              "/placeholder.svg?height=64&width=128"
                            }
                            alt={sponsor.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <CardTitle className="text-white">
                          {sponsor.name}
                        </CardTitle>
                        {sponsor.description && (
                          <CardDescription className="text-[#D4D4D6] text-sm">
                            {sponsor.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      {sponsor.website_url && (
                        <CardContent className="text-center">
                          <Link href={sponsor.website_url} target="_blank">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/20"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Website
                            </Button>
                          </Link>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Silver Sponsors */}
            {silverSponsors.length > 0 && (
              <div>
                <div className="text-center mb-8">
                  <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-4 py-2">
                    <Star className="h-4 w-4 mr-2" />
                    Silver Sponsors
                  </Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {silverSponsors.map((sponsor) => (
                    <Card
                      key={sponsor.id}
                      className="bg-gradient-to-br from-gray-400/20 to-gray-500/20 border-gray-400/30"
                    >
                      <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-2 h-12 w-24 relative">
                          <Image
                            src={
                              sponsor.logo_url ||
                              "/placeholder.svg?height=48&width=96"
                            }
                            alt={sponsor.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <CardTitle className="text-white text-sm">
                          {sponsor.name}
                        </CardTitle>
                      </CardHeader>
                      {sponsor.website_url && (
                        <CardContent className="text-center pt-0">
                          <Link href={sponsor.website_url} target="_blank">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-400 text-gray-400 hover:bg-gray-400/20 text-xs"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Visit
                            </Button>
                          </Link>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Other Sponsors */}
            {otherSponsors.length > 0 && (
              <div>
                <div className="text-center mb-8">
                  <Badge className="bg-[#7683A4] text-white px-4 py-2">
                    Supporting Partners
                  </Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-4 lg:grid-cols-6">
                  {otherSponsors.map((sponsor) => (
                    <Card
                      key={sponsor.id}
                      className="bg-[#556492]/20 border-[#556492]/30"
                    >
                      <CardContent className="p-4 text-center">
                        <div className="mx-auto mb-2 h-8 w-16 relative">
                          <Image
                            src={
                              sponsor.logo_url ||
                              "/placeholder.svg?height=32&width=64"
                            }
                            alt={sponsor.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <p className="text-white text-xs">{sponsor.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Become a Sponsor CTA */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-[#556492] to-[#7683A4] border-[#F7374F]/30">
            <CardContent className="text-center py-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Become a Sponsor
              </h2>
              <p className="text-[#EBEBEB] mb-6 max-w-2xl mx-auto">
                Partner with us to support the next generation of tech
                innovators. Gain visibility among 500+ participants and showcase
                your commitment to technology education.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-[#F7374F] hover:bg-[#6ba348] text-white">
                  <Award className="h-4 w-4 mr-2" />
                  Sponsorship Packages
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#556492]"
                >
                  Contact Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
