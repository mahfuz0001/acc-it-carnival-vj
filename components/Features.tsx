import { cn } from "@/lib/utils";
import {
  Brain, // For Skill Development
  Users, // For Community & Networking
  Trophy, // For Competition & Prizes
  Lightbulb, // For Innovation & Ideas
  Handshake, // For Collaboration
  Zap, // For Fast-paced challenges
  GraduationCap, // For Learning & Workshops
  Briefcase, // For Career Insights
} from "lucide-react"; // Import Lucide icons

export function Features() {
  const features = [
    {
      title: "Skill Development",
      description:
        "Enhance your technical prowess and soft skills through diverse competitions and engaging workshops.",
      icon: <Brain className="h-8 w-8" />,
    },
    {
      title: "Community & Networking",
      description:
        "Connect with like-minded tech enthusiasts, industry experts, and potential mentors from across the country.",
      icon: <Users className="h-8 w-8" />,
    },
    {
      title: "Exciting Competitions",
      description:
        "Challenge yourself in a variety of contests, from coding marathons to robotics battles.",
      icon: <Trophy className="h-8 w-8" />,
    },
    {
      title: "Innovation & Creativity",
      description:
        "Showcase your original ideas and innovative projects, pushing the boundaries of technology.",
      icon: <Lightbulb className="h-8 w-8" />,
    },
    {
      title: "Collaborative Spirit",
      description:
        "Work in teams, share knowledge, and build lasting connections with fellow participants.",
      icon: <Handshake className="h-8 w-8" />,
    },
    {
      title: "Hands-on Workshops",
      description:
        "Gain practical experience and learn new technologies from expert facilitators.",
      icon: <GraduationCap className="h-8 w-8" />,
    },
    {
      title: "Career & Future Insights",
      description:
        "Explore career paths in tech and gain insights into the latest industry trends.",
      icon: <Briefcase className="h-8 w-8" />,
    },
    {
      title: "Energetic Atmosphere",
      description:
        "Immerse yourself in a dynamic and inspiring environment filled with innovation and excitement.",
      icon: <Zap className="h-8 w-8" />,
    },
  ];

  return (
    <section className="relative py-12 sm:py-20 px-7 sm:px-10 lg:px-10 overflow-hidden">
      {/* Background glow matching other sections */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-[#F7374F]/5 blur-[100px] rounded-full -z-10"></div>
      <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[70%] h-[200px] bg-[#B267FF]/5 blur-[100px] rounded-full -z-10"></div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-5 text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-white animate-fade-in-up bg-clip-text text-transparent bg-gradient-to-r from-[#F7374F] to-[#B267FF]">
            Why Participate in IT Carnival 4.0?
          </h2>
          <p className="mx-auto max-w-[800px] text-[#D4D4D6] text-base sm:text-xl md:text-2xl leading-relaxed animate-fade-in-up animation-delay-200">
            Discover the unique advantages and exciting opportunities that await
            you at this year&apos;s carnival.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r relative group/feature transition-all duration-500 ease-in-out transform hover:-translate-y-1 hover:shadow-lg hover:border-transparent", // Reduced translate-y, added border-transparent on hover
        "border-[#556492]/20", // Consistent border color
        (index === 0 || index === 4) && "lg:border-l",
        index < 4 && "lg:border-b"
      )}
    >
      {/* Background hover gradient - adjusted colors to match theme */}
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition-opacity duration-500 absolute inset-0 h-full w-full bg-gradient-to-t from-[#131943] to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition-opacity duration-500 absolute inset-0 h-full w-full bg-gradient-to-b from-[#131943] to-transparent pointer-events-none" />
      )}

      {/* Icon */}
      <div className="mb-4 relative z-10 px-10 text-transparent bg-clip-text bg-gradient-to-r from-[#F7374F] to-[#B267FF] transition-all duration-500 group-hover/feature:scale-105">
        {" "}
        {/* Reduced scale */}
        {icon}
      </div>

      {/* Title */}
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        {/* Accent line - removed height change, simplified transition to color only */}
        <div className="absolute left-0 inset-y-0 h-6 w-1 rounded-tr-full rounded-br-full bg-[#556492] group-hover/feature:bg-gradient-to-t group-hover/feature:from-[#F7374F] group-hover/feature:to-[#B267FF] transition-colors duration-500 origin-center" />
        <span className="inline-block text-white transition-colors duration-500">
          {" "}
          {/* Removed translate-x, added color transition */}
          {title}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-[#D4D4D6] max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
