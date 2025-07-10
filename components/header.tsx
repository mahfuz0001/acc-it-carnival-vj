"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { Menu, X, Zap, Bell, MessageSquare } from "lucide-react"; // Added Bell and MessageSquare for icons
import { RealTimeNotifications } from "@/components/real-time-notifications";
import { AIChatbot } from "@/components/ai-chatbot"; // Keeping this for reference, assumed functional
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { isSignedIn } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -50, // Slide up slightly on close
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const linkVariants = {
    closed: { opacity: 0, x: -20 }, // Slide from left
    open: { opacity: 1, x: 0 },
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 py-2 bg-[#0a0612]/90 backdrop-blur-lg shadow-xl border-b border-[#556492]/30">
        <div className="container mx-auto flex h-14 items-center justify-between">
          {/* Logo and Brand Name */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <motion.div
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#F7374F] to-[#FBBF24] shadow-md group-hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </motion.div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                ACC IT Carnival
              </span>
              <span className="text-xs sm:text-sm text-[#F7374F] font-semibold">
                Version 4.0
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {[
              { href: "/events", label: "Events" },
              { href: "/live", label: "Live", isNew: true },
              { href: "/schedule", label: "Schedule" },
              { href: "/teams", label: "Teams" },
              { href: "/gallery", label: "Gallery" },
              { href: "/about", label: "About" },
            ].map((link) => (
              <motion.div
                key={link.href}
                whileHover={{ y: -3, color: "#F7374F" }} // Lift effect and color change
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={link.href}
                  className="text-base font-medium text-[#D4D4D6] hover:text-[#F7374F] transition-colors duration-200 relative"
                >
                  {link.label}
                  {link.isNew && (
                    <span className="absolute -top-1 right-[-2.5rem] text-xs font-bold text-[#F7374F] bg-[#F7374F]/10 rounded-md px-1 py-0.5 animate-pulse">
                      LIVE
                    </span>
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Auth & Utility Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-4 ml-6">
            {isSignedIn && (
              <>
                {/* Real-time notifications component */}
                {/* <RealTimeNotifications>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-[#D4D4D6] hover:bg-[#556492]/20 hover:text-white"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#F7374F] border border-[#0a0612]" />
                  </Button>
                </RealTimeNotifications> */}
                {/* AI Chatbot Button */}
                {/* <AIChatbot>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#D4D4D6] hover:bg-[#556492]/20 hover:text-white"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </AIChatbot> */}
                <Link href="/profile">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      className="border-[#556492] text-[#D4D4D6] hover:bg-[#556492]/20 hover:text-white transition-colors duration-200 px-4 py-2"
                    >
                      My Profile
                    </Button>
                  </motion.div>
                </Link>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9 ring-1 ring-[#F7374F]/50", // Added ring for emphasis
                    },
                  }}
                />
              </>
            )}
            {!isSignedIn && (
              <SignInButton mode="modal">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="bg-[#F7374F] hover:bg-[#F7374F]/90 text-white shadow-md hover:shadow-lg transition-all duration-200 px-5 py-2.5">
                    Sign In
                  </Button>
                </motion.div>
              </SignInButton>
            )}
          </div>

          {/* Mobile Menu Button & Auth/Utility Icons */}
          <div className="md:hidden flex items-center gap-2">
            {isSignedIn && (
              <>
                {/* <RealTimeNotifications>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-[#D4D4D6] hover:bg-[#556492]/20"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#F7374F] border border-[#0a0612]" />
                  </Button>
                </RealTimeNotifications> */}
                {/* <AIChatbot>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#D4D4D6] hover:bg-[#556492]/20"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </AIChatbot> */}
              </>
            )}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="text-white hover:bg-[#556492]/20"
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Menu Content */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="md:hidden border-t border-[#556492]/20 bg-[#131943]/95 backdrop-blur-md overflow-hidden pb-4"
            >
              <nav className="flex flex-col px-4 pt-4 space-y-2">
                {[
                  { href: "/", label: "Home" },
                  { href: "/events", label: "Events" },
                  { href: "/live", label: "Live", isNew: true },
                  { href: "/schedule", label: "Schedule" },
                  { href: "/teams", label: "Teams" },
                  { href: "/gallery", label: "Gallery" },
                  { href: "/about", label: "About" },
                ].map((link, index) => (
                  <motion.div
                    key={link.href}
                    variants={linkVariants}
                    initial="closed"
                    animate="open"
                    transition={{ delay: index * 0.08 }} // Slightly reduced delay
                  >
                    <Link
                      href={link.href}
                      className="text-base font-medium text-[#D4D4D6] hover:text-[#F7374F] transition-colors block py-2 px-3 rounded-md hover:bg-[#556492]/20 relative group"
                      onClick={toggleMenu} // Close menu on link click
                    >
                      {link.label}
                      {link.isNew && (
                        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-[#F7374F] bg-[#F7374F]/10 rounded-md px-1 py-0.5 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity">
                          LIVE
                        </span>
                      )}
                    </Link>
                  </motion.div>
                ))}
                {/* Mobile Auth/Profile Buttons */}
                {isSignedIn ? (
                  <motion.div
                    variants={linkVariants}
                    initial="closed"
                    animate="open"
                    transition={{ delay: 0.7 }}
                    className="pt-4 border-t border-[#556492]/20 mt-4 flex flex-col gap-3"
                  >
                    <Link href="/profile" onClick={toggleMenu}>
                      <Button
                        variant="outline"
                        className="w-full border-[#556492] text-[#D4D4D6] hover:bg-[#556492]/20 hover:text-white"
                      >
                        My Profile
                      </Button>
                    </Link>
                    <div className="flex items-center gap-3 px-3 py-2">
                      <UserButton afterSignOutUrl="/" />
                      <span className="text-[#D4D4D6] font-medium">
                        Account Options
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={linkVariants}
                    initial="closed"
                    animate="open"
                    transition={{ delay: 0.7 }}
                    className="pt-4 border-t border-[#556492]/20 mt-4"
                  >
                    <SignInButton mode="modal">
                      <Button
                        className="w-full bg-[#F7374F] hover:bg-[#F7374F]/90 text-white shadow-md"
                        onClick={toggleMenu}
                      >
                        Sign In
                      </Button>
                    </SignInButton>
                  </motion.div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* AI Chatbot - Available on all pages */}
      {/* <AIChatbot /> */}
    </>
  );
}
