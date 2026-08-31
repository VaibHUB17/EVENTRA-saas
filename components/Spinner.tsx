"use client";

import React from "react";
import { Ticket, Sparkles } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
  className?: string;
}

function Spinner({ size = "md", message, className = "" }: SpinnerProps) {
  const sizeMap = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const iconSizeMap = {
    sm: "w-2.5 h-2.5",
    md: "w-4 h-4",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 min-h-[160px] gap-3.5 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ambient pulse */}
        <div
          className={`${sizeMap[size]} absolute rounded-full bg-blue-500/20 animate-ping opacity-75`}
        />

        {/* Outer spinning gradient ring */}
        <div
          className={`${sizeMap[size]} rounded-full border-2 border-transparent border-t-blue-600 border-r-indigo-600 animate-spin`}
        />

        {/* Inner reverse spinner */}
        <div
          className={`absolute ${size === "xl" ? "w-10 h-10" : size === "lg" ? "w-7 h-7" : size === "md" ? "w-5 h-5" : "w-3 h-3"} rounded-full border-2 border-transparent border-b-cyan-500 border-l-blue-400 animate-[spin_1.5s_linear_infinite_reverse]`}
        />

        {/* Center ticket/sparkle icon for larger spinners */}
        {(size === "lg" || size === "xl") && (
          <div className="absolute text-blue-600 animate-pulse">
            <Ticket className={iconSizeMap[size]} />
          </div>
        )}
      </div>

      {message && (
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}

export default Spinner;
