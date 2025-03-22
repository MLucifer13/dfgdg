import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { pomodoroApi } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface PomodoroTimerProps {
  initialFocusTime?: number;
  initialBreakTime?: number;
  initialLongBreakTime?: number;
  initialCycles?: number;
  onTimerComplete?: () => void;
  className?: string;
  theme?: "light" | "dark";
  colorBlindMode?:
    | "default"
    | "deuteranopia"
    | "protanopia"
    | "tritanopia"
    | "monochromacy";
}

const PomodoroTimer = ({
  initialFocusTime = 25,
  initialBreakTime = 5,
  initialLongBreakTime = 15,
  initialCycles = 4,
  onTimerComplete = () => {},
  className,
  theme = "dark",
  colorBlindMode = "default",
}: PomodoroTimerProps) => {
  // Timer states
  const [focusTime, setFocusTime] = useState(initialFocusTime);
  const [breakTime, setBreakTime] = useState(initialBreakTime);
  const [longBreakTime, setLongBreakTime] = useState(initialLongBreakTime);
  const [cycles, setCycles] = useState(initialCycles);

  const [timeLeft, setTimeLeft] = useState(focusTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break" | "longBreak">("focus");
  const [currentCycle, setCurrentCycle] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  // Added for API integration
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentSession, setCurrentSession] = useState<{ id: number } | null>(null);
  const sessionStartTimeRef = useRef<Date | null>(null);

  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3",
    );
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      // Start a new session when timer starts running
      if (!currentSession && mode === "focus") {
        startNewSession();
      }

      timerRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Timer completed
            clearInterval(timerRef.current!);
            if (audioRef.current) {
              audioRef.current.play();
            }
            onTimerComplete();

            // Determine next mode
            if (mode === "focus") {
              // Complete the current focus session
              if (currentSession) {
                completeSession(true);
              }

              if (currentCycle % cycles === 0) {
                setMode("longBreak");
                setTimeLeft(longBreakTime * 60);
              } else {
                setMode("break");
                setTimeLeft(breakTime * 60);
              }
              setCurrentCycle((prev) => prev + 1);
            } else {
              setMode("focus");
              setTimeLeft(focusTime * 60);
              // Start a new focus session
              startNewSession();
            }

            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);

      // If paused and we have an active focus session, update its data
      if (currentSession && mode === "focus") {
        updateSessionDuration();
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [
    isRunning,
    mode,
    currentCycle,
    cycles,
    focusTime,
    breakTime,
    longBreakTime,
    onTimerComplete,
    currentSession,
  ]);

  // Reset timer when mode changes
  useEffect(() => {
    if (mode === "focus") {
      setTimeLeft(focusTime * 60);
    } else if (mode === "break") {
      setTimeLeft(breakTime * 60);
    } else {
      setTimeLeft(longBreakTime * 60);
    }
  }, [focusTime, breakTime, longBreakTime, mode]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMode("focus");
    setCurrentCycle(1);
    setTimeLeft(focusTime * 60);

    // If we reset with an active session, mark it as incomplete
    if (currentSession) {
      completeSession(false);
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // Session API functions
  const startNewSession = async () => {
    if (!user) return;

    try {
      sessionStartTimeRef.current = new Date();
      const sessionData = {
        type: "focus",
        start_time: sessionStartTimeRef.current.toISOString(),
        duration: focusTime,
        completed: false,
        user_id: user.id,
      };

      const response = await pomodoroApi.createSession(sessionData);
      setCurrentSession(response.data);
    } catch (error) {
      console.error("Error starting pomodoro session:", error);
      toast({
        title: "Error",
        description: "Failed to start pomodoro session.",
        variant: "destructive",
      });
    }
  };

  const updateSessionDuration = async () => {
    if (!currentSession || !sessionStartTimeRef.current) return;

    const now = new Date();
    const elapsedMinutes = Math.floor((now.getTime() - sessionStartTimeRef.current.getTime()) / 60000);

    try {
      await pomodoroApi.updateSession(currentSession.id, {
        duration: elapsedMinutes,
      });
    } catch (error) {
      console.error("Error updating session duration:", error);
    }
  };

  const completeSession = async (completed: boolean) => {
    if (!currentSession) return;

    try {
      await pomodoroApi.updateSession(currentSession.id, {
        completed,
        end_time: new Date().toISOString(),
      });

      setCurrentSession(null);
      sessionStartTimeRef.current = null;
    } catch (error) {
      console.error("Error completing pomodoro session:", error);
      toast({
        title: "Error",
        description: "Failed to save pomodoro session.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const getProgress = () => {
    const totalSeconds =
      mode === "focus"
        ? focusTime * 60
        : mode === "break"
          ? breakTime * 60
          : longBreakTime * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  // Get color based on current mode and color blind mode
  const getModeColor = () => {
    if (colorBlindMode !== "default") {
      return getColorBlindModeColor(mode, colorBlindMode);
    }

    switch (mode) {
      case "focus":
        return "from-purple-500 to-blue-500";
      case "break":
        return "from-green-400 to-cyan-500";
      case "longBreak":
        return "from-pink-500 to-purple-500";
      default:
        return "from-purple-500 to-blue-500";
    }
  };

  // Get color for color blind modes
  const getColorBlindModeColor = (timerMode: string, blindMode: string) => {
    switch (blindMode) {
      case "deuteranopia":
        switch (timerMode) {
          case "focus":
            return "from-blue-500 to-blue-700";
          case "break":
            return "from-teal-400 to-teal-600";
          case "longBreak":
            return "from-orange-400 to-orange-600";
          default:
            return "from-blue-500 to-blue-700";
        }
      case "protanopia":
        switch (timerMode) {
          case "focus":
            return "from-blue-500 to-purple-600";
          case "break":
            return "from-cyan-400 to-cyan-600";
          case "longBreak":
            return "from-yellow-400 to-yellow-600";
          default:
            return "from-blue-500 to-purple-600";
        }
      case "tritanopia":
        switch (timerMode) {
          case "focus":
            return "from-pink-500 to-red-500";
          case "break":
            return "from-green-400 to-green-600";
          case "longBreak":
            return "from-red-400 to-red-600";
          default:
            return "from-pink-500 to-red-500";
        }
      case "monochromacy":
        switch (timerMode) {
          case "focus":
            return "from-gray-500 to-gray-700";
          case "break":
            return "from-gray-400 to-gray-600";
          case "longBreak":
            return "from-gray-300 to-gray-500";
          default:
            return "from-gray-500 to-gray-700";
        }
      default:
        switch (timerMode) {
          case "focus":
            return "from-purple-500 to-blue-500";
          case "break":
            return "from-green-400 to-cyan-500";
          case "longBreak":
            return "from-pink-500 to-purple-500";
          default:
            return "from-purple-500 to-blue-500";
        }
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 rounded-xl border",
        theme === "light"
          ? "bg-white/90 border-gray-200 text-gray-900"
          : "bg-black/90 border-gray-800 text-white",
        className,
      )}
    >
      {/* Timer Display */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 mb-6">
        {/* Background Circle */}
        <div
          className={`absolute inset-0 rounded-full border-4 opacity-30 ${theme === "light" ? "border-gray-300" : "border-gray-800"}`}
        />

        {/* Progress Circle */}
        <svg
          className="absolute inset-0 w-full h-full rotate-[-90deg]"
          viewBox="0 0 100 100"
        >
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            strokeWidth="4"
            stroke={`url(#${mode}Gradient)`}
            strokeDasharray="289.02652413026095"
            strokeDashoffset={
              289.02652413026095 - (289.02652413026095 * getProgress()) / 100
            }
            className="drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]"
            initial={{ strokeDashoffset: 289.02652413026095 }}
            animate={{
              strokeDashoffset:
                289.02652413026095 - (289.02652413026095 * getProgress()) / 100,
            }}
            transition={{ duration: 0.5 }}
          />
          <defs>
            <linearGradient
              id="focusGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient
              id="breakGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient
              id="longBreakGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Timer Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className={`text-4xl sm:text-5xl font-bold bg-gradient-to-r ${getModeColor()} bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]`}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {formatTime(timeLeft)}
          </motion.div>
          <div
            className={`mt-2 text-sm font-medium uppercase tracking-wider ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
          >
            {mode === "focus"
              ? "Focus Time"
              : mode === "break"
                ? "Short Break"
                : "Long Break"}
          </div>
          <div
            className={`mt-1 text-xs ${theme === "light" ? "text-gray-500" : "text-gray-500"}`}
          >
            Cycle {currentCycle} of {cycles}
          </div>
        </div>
      </div>
      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <Button
          onClick={toggleTimer}
          size="lg"
          className={`relative rounded-full w-9 h-9 ${isRunning ? "bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700" : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"} shadow-[0_0_20px_rgba(139,92,246,0.6)] transition-all duration-300 overflow-hidden group`}
        >
          <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full"></span>
          <span className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300 rounded-full animate-pulse">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Header 1
            </h1>
          </span>
          {isRunning ? (
            <Pause className="w-7 h-7 relative z-10" />
          ) : (
            <Play className="w-7 h-7 ml-0.5 relative z-10" />
          )}
        </Button>
        <Button
          onClick={resetTimer}
          size="icon"
          variant="outline"
          className={`rounded-full w-10 h-10 shadow-[0_0_10px_rgba(139,92,246,0.3)] ${theme === "light" ? "border-gray-300 bg-gray-100 hover:bg-gray-200" : "border-gray-700 bg-gray-900 hover:bg-gray-800"}`}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => setShowSettings(!showSettings)}
          size="icon"
          variant="outline"
          className={`rounded-full w-10 h-10 shadow-[0_0_10px_rgba(139,92,246,0.3)] ${theme === "light" ? "border-gray-300 bg-gray-100 hover:bg-gray-200" : "border-gray-700 bg-gray-900 hover:bg-gray-800"}`}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
      {/* Mode Selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <Button
          onClick={() => {
            setMode("focus");
            setIsRunning(false);
          }}
          variant={mode === "focus" ? "default" : "outline"}
          size="sm"
          className={`${mode === "focus" ? "bg-purple-600 hover:bg-purple-700 shadow-[0_0_10px_rgba(139,92,246,0.5)]" : theme === "light" ? "border-gray-300 bg-gray-100 hover:bg-gray-200" : "border-gray-700 bg-gray-900 hover:bg-gray-800"}`}
        >
          Focus
        </Button>
        <Button
          onClick={() => {
            setMode("break");
            setIsRunning(false);
          }}
          variant={mode === "break" ? "default" : "outline"}
          size="sm"
          className={`${mode === "break" ? "bg-cyan-600 hover:bg-cyan-700 shadow-[0_0_10px_rgba(6,182,212,0.5)]" : theme === "light" ? "border-gray-300 bg-gray-100 hover:bg-gray-200" : "border-gray-700 bg-gray-900 hover:bg-gray-800"}`}
        >
          Break
        </Button>
        <Button
          onClick={() => {
            setMode("longBreak");
            setIsRunning(false);
          }}
          variant={mode === "longBreak" ? "default" : "outline"}
          size="sm"
          className={`${mode === "longBreak" ? "bg-pink-600 hover:bg-pink-700 shadow-[0_0_10px_rgba(236,72,153,0.5)]" : theme === "light" ? "border-gray-300 bg-gray-100 hover:bg-gray-200" : "border-gray-700 bg-gray-900 hover:bg-gray-800"}`}
        >
          Long Break
        </Button>
      </div>
      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          className={`w-full p-4 rounded-lg backdrop-blur-sm ${theme === "light" ? "bg-gray-50/80 border border-gray-200" : "bg-gray-900/80 border border-gray-800"}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <h3
            className={`text-sm font-medium mb-4 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}
          >
            Timer Settings
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label
                className={`text-xs ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
              >
                Focus Time (minutes): {focusTime}
              </label>
              <Slider
                value={[focusTime]}
                min={5}
                max={60}
                step={5}
                onValueChange={(value) => setFocusTime(value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label
                className={`text-xs ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
              >
                Break Time (minutes): {breakTime}
              </label>
              <Slider
                value={[breakTime]}
                min={1}
                max={30}
                step={1}
                onValueChange={(value) => setBreakTime(value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label
                className={`text-xs ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
              >
                Long Break Time (minutes): {longBreakTime}
              </label>
              <Slider
                value={[longBreakTime]}
                min={5}
                max={60}
                step={5}
                onValueChange={(value) => setLongBreakTime(value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label
                className={`text-xs ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
              >
                Cycles before Long Break
              </label>
              <Select
                value={cycles.toString()}
                onValueChange={(value) => setCycles(parseInt(value))}
              >
                <SelectTrigger
                  className={`w-full ${theme === "light" ? "bg-gray-50 border-gray-300" : "bg-gray-800 border-gray-700"}`}
                >
                  <SelectValue placeholder="Select cycles" />
                </SelectTrigger>
                <SelectContent
                  className={
                    theme === "light"
                      ? "bg-white border-gray-300"
                      : "bg-gray-800 border-gray-700"
                  }
                >
                  {[2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} cycles
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PomodoroTimer;
