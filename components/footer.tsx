import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Zap,
  CalendarDays,
  Award,
  DollarSign,
  Users,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#556492]/20 bg-gradient-to-b from-[#131943] to-[#0a0612] text-white">
      <div className="container mx-auto px-6 py-8 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo and Description */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#F7374F] to-[#B267FF] transition-all duration-300 group-hover:from-[#FF4D6D] group-hover:to-[#D285FF] shadow-lg group-hover:shadow-xl">
                <Zap className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-white">
                  ACC IT Carnival
                </span>
                <span className="text-sm text-[#B267FF] font-semibold tracking-wide group-hover:text-[#F7374F] transition-colors duration-300">
                  4.0
                </span>
              </div>
            </Link>
            <p className="text-sm text-[#D4D4D6] max-w-xs leading-relaxed">
              The premier technology event at Adamjee Cantonment College,
              bringing together the brightest minds in tech.
            </p>
            <div className="flex space-x-5 pt-4">
              <Link
                href="#"
                className="text-[#D4D4D6] hover:text-[#F7374F] transition-all hover:-translate-y-1 duration-300"
              >
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="#"
                className="text-[#D4D4D6] hover:text-[#B267FF] transition-all hover:-translate-y-1 duration-300"
              >
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="#"
                className="text-[#D4D4D6] hover:text-[#F7374F] transition-all hover:-translate-y-1 duration-300"
              >
                <Twitter className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#F7374F] to-[#B267FF]">
              Quick Links
            </h3>
            <ul className="space-y-3 text-base text-[#D4D4D6]">
              <li>
                <Link
                  href="/events"
                  className="hover:text-[#F7374F] transition-colors duration-200"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/schedule"
                  className="hover:text-[#F7374F] transition-colors duration-200"
                >
                  Schedule
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="hover:text-[#F7374F] transition-colors duration-200"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-[#F7374F] transition-colors duration-200"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/sponsors"
                  className="hover:text-[#F7374F] transition-colors duration-200"
                >
                  Sponsors
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#B267FF] to-[#F7374F]">
              Contact Info
            </h3>
            <ul className="space-y-4 text-base text-[#D4D4D6]">
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-transparent bg-clip-text bg-gradient-to-r from-[#F7374F] to-[#B267FF]" />
                <Link
                  href="mailto:itcarnival@acc.edu.bd"
                  className="hover:text-[#B267FF] transition-colors duration-200"
                >
                  itcarnival@acc.edu.bd
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-transparent bg-clip-text bg-gradient-to-r from-[#B267FF] to-[#F7374F]" />
                <Link
                  href="tel:+8801234567890"
                  className="hover:text-[#B267FF] transition-colors duration-200"
                >
                  +880 1234 567890
                </Link>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-transparent bg-clip-text bg-gradient-to-r from-[#F7374F] to-[#B267FF] mt-0.5" />
                <span>
                  Adamjee Cantonment College
                  <br />
                  Dhaka Cantonment, Dhaka
                </span>
              </li>
            </ul>
          </div>

          {/* Event Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#F7374F] to-[#B267FF]">
              Event Info
            </h3>
            <ul className="space-y-3 text-base text-[#D4D4D6]">
              <li className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-transparent bg-clip-text bg-gradient-to-r from-[#B267FF] to-[#F7374F]" />
                <span>August 15-17, 2025</span>
              </li>
              <li className="flex items-center gap-3">
                <Award className="h-5 w-5 text-transparent bg-clip-text bg-gradient-to-r from-[#F7374F] to-[#B267FF]" />
                <span>12+ Competitions</span>
              </li>
              <li className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-transparent bg-clip-text bg-gradient-to-r from-[#B267FF] to-[#F7374F]" />
                <span>৳1,00,000+ Prizes</span>
              </li>
              <li className="flex items-center gap-3">
                <Users className="h-5 w-5 text-transparent bg-clip-text bg-gradient-to-r from-[#F7374F] to-[#B267FF]" />
                <span>500+ Participants</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-[#556492]/30 pt-8 text-center text-sm text-[#A0A0A5]">
          <p>
            © {currentYear} Adamjee Cantonment College IT Carnival 4.0. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
