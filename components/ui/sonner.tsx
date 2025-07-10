"use client";

import type React from "react";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#556492] group-[.toaster]:text-[#EBEBEB] group-[.toaster]:border-[#7683A4] group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-[#D4D4D6]",
          actionButton: "group-[.toast]:bg-[#F7374F] group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-[#7683A4] group-[.toast]:text-[#EBEBEB]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
