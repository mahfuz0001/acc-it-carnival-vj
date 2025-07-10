"use client";

import { useState, useEffect, memo } from "react";

interface CountdownTimerProps {
  targetDate: string;
}

export const CountdownTimer = memo(function CountdownTimer({
  targetDate,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-2 sm:gap-4 justify-center lg:justify-start">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <div className="backdrop-blur-sm border border-[#F7374F]/30 rounded-lg p-2 sm:p-3 min-w-[40px] sm:min-w-[60px] transition-all duration-300 hover:shadow-lg hover:shadow-[#F7374F]/20 bg-gradient-to-br from-[#131943]/50 to-[#131943]/20">
            <span className="text-lg sm:text-2xl font-bold text-[#F7374F]">
              {value.toString().padStart(2, "0")}
            </span>
          </div>
          <span className="text-xs text-[#D4D4D6] mt-1 capitalize">{unit}</span>
        </div>
      ))}
    </div>
  );
});
