import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AIAssistantProps {
  enabled?: boolean;
  onToggle?: () => void;
  className?: string;
}

const productivityTips = [
  "Try breaking large tasks into smaller, manageable chunks.",
  "The Pomodoro technique can help maintain focus and prevent burnout.",
  "Schedule your most challenging tasks during your peak energy hours.",
  "Take short breaks between study sessions to refresh your mind.",
  "Stay hydrated! Drinking water helps maintain cognitive function.",
  "Review your notes within 24 hours to improve retention by up to 60%.",
  "Use color-coding in your planner to visually organize different subjects.",
  "Set specific, measurable goals for each study session.",
  "Try the 5-minute rule: commit to just 5 minutes of a task to overcome procrastination.",
  "Create a dedicated study environment free from distractions.",
];

const AIAssistant: React.FC<AIAssistantProps> = ({
  enabled = true,
  onToggle = () => {},
  className = "",
}) => {
  const [currentTip, setCurrentTip] = useState("");
  const [showTip, setShowTip] = useState(false);

  // Change tip every 30 seconds
  useEffect(() => {
    if (!enabled) {
      setShowTip(false);
      return;
    }

    // Initial tip
    const randomTip =
      productivityTips[Math.floor(Math.random() * productivityTips.length)];
    setCurrentTip(randomTip);
    setShowTip(true);

    const interval = setInterval(() => {
      setShowTip(false);

      // After exit animation completes, change the tip
      setTimeout(() => {
        const newTip =
          productivityTips[Math.floor(Math.random() * productivityTips.length)];
        setCurrentTip(newTip);
        setShowTip(true);
      }, 500); // Match this with exit animation duration
    }, 30000);

    return () => clearInterval(interval);
  }, [enabled]);

  return (
    <div className={className}>
      <Button
        variant="outline"
        size="icon"
        onClick={onToggle}
        className={`rounded-full w-8 h-8 border-2 ${enabled ? "border-purple-500 bg-purple-500/20 text-purple-400" : "border-gray-700 bg-gray-800 text-gray-400"}`}
      >
        <Sparkles className="h-4 w-4" />
      </Button>

      <AnimatePresence>
        {enabled && showTip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="absolute mt-2 z-50"
          >
            <Card className="p-3 bg-black/90 border border-purple-500/50 backdrop-blur-md shadow-[0_0_15px_rgba(139,92,246,0.3)] max-w-xs">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 text-purple-400 mr-2 animate-pulse" />
                  <span className="text-xs font-medium text-purple-400">
                    AI Suggestion
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-5 h-5 rounded-full -mt-1 -mr-1 text-gray-400 hover:text-white hover:bg-gray-800"
                  onClick={() => setShowTip(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm text-gray-300 mt-1">{currentTip}</p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAssistant;
