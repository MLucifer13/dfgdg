import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppTheme } from "@/components/dashboard/DashboardLayout";

interface TimeDisplayProps {
  className?: string;
  theme?: AppTheme;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({
  className = "",
  theme = "dark",
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const getGreeting = () => {
    const hours = currentTime.getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className={`flex items-center ${className}`}>
      <Clock
        className={cn(
          "h-5 w-5 mr-2",
          theme === "dark" ? "text-purple-400" : "text-purple-600",
        )}
      />
      <div>
        <motion.div
          key={formatTime(currentTime)}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "text-base sm:text-lg font-medium",
            theme === "dark" ? "text-white" : "text-gray-900",
          )}
        >
          {formatTime(currentTime)}
        </motion.div>
        <div
          className={cn(
            "text-xs",
            theme === "dark" ? "text-gray-400" : "text-gray-600",
          )}
        >
          {getGreeting()}
        </div>
      </div>
    </div>
  );
};

export default TimeDisplay;
