import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Calendar, Loader2 } from "lucide-react";
import { plannerApi } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface Event {
  id: string;
  title: string;
  description: string;
  day: string;
  time: string;
  color: string;
  user_id?: string;
}

interface WeeklyPlannerProps {
  events?: Event[];
  onAddEvent?: (event: Omit<Event, "id">) => void;
  onEditEvent?: (event: Event) => void;
  onDeleteEvent?: (id: string) => void;
  theme?: "light" | "dark";
  colorBlindMode?:
    | "default"
    | "deuteranopia"
    | "protanopia"
    | "tritanopia"
    | "monochromacy";
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const TIME_SLOTS = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
];
const COLOR_OPTIONS = [
  { value: "purple", label: "Purple" },
  { value: "blue", label: "Blue" },
  { value: "pink", label: "Pink" },
  { value: "green", label: "Green" },
];

const DEFAULT_EVENTS: Event[] = [
  {
    id: "1",
    title: "Math Study Group",
    description: "Review calculus problems with study group",
    day: "Monday",
    time: "3:00 PM",
    color: "purple",
  },
  {
    id: "2",
    title: "Physics Lab",
    description: "Complete lab assignment for Physics 101",
    day: "Wednesday",
    time: "1:00 PM",
    color: "blue",
  },
  {
    id: "3",
    title: "Essay Writing",
    description: "Work on English literature essay",
    day: "Thursday",
    time: "4:00 PM",
    color: "pink",
  },
];

const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  theme = "dark",
  colorBlindMode = "default",
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newEvent, setNewEvent] = useState<Omit<Event, "id">>({
    title: "",
    description: "",
    day: DAYS_OF_WEEK[0],
    time: TIME_SLOTS[0],
    color: "purple",
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) {
        setEvents(DEFAULT_EVENTS);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7); 
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 14); 
        
        const response = await plannerApi.getEvents(startDate.toISOString(), endDate.toISOString());
        const data = response.data;

        if (data && data.length > 0) {
          setEvents(data);
        } else {
          setEvents(DEFAULT_EVENTS);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Using presentation mode",
          description: "Using sample events for demonstration.",
        });
        setEvents(DEFAULT_EVENTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();

    return () => {
    };
  }, [user]);

  const handleAddEvent = async () => {
    if (!newEvent.title.trim()) {
      toast({
        title: "Error",
        description: "Event title is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const eventToAdd = {
        ...newEvent,
        user_id: user?.id,
      };

      const tempId = Math.random().toString(36).substring(2, 11);
      
      try {
        const response = await plannerApi.createEvent(eventToAdd);
        const data = response.data;
        
        if (data) {
          setEvents([...events, data]);
        } else {
          const newEventWithId = { ...eventToAdd, id: tempId };
          setEvents([...events, newEventWithId]);
        }
      } catch (error) {
        console.error("Error adding event with API:", error);
        const newEventWithId = { ...eventToAdd, id: tempId };
        setEvents([...events, newEventWithId]);
      }

      toast({
        title: "Success",
        description: "Event added successfully.",
      });

      setNewEvent({
        title: "",
        description: "",
        day: DAYS_OF_WEEK[0],
        time: TIME_SLOTS[0],
        color: "purple",
      });
      setIsAddEventOpen(false);
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Error",
        description: "Failed to add event.",
        variant: "destructive",
      });
    }
  };

  const handleEditEvent = async () => {
    if (!selectedEvent) return;

    try {
      try {
        const response = await plannerApi.updateEvent(Number(selectedEvent.id), {
          title: selectedEvent.title,
          description: selectedEvent.description,
          day: selectedEvent.day,
          time: selectedEvent.time,
          color: selectedEvent.color,
        });
        
        if (response.data) {
          setEvents(
            events.map((event) =>
              event.id === selectedEvent.id ? selectedEvent : event,
            ),
          );
        } else {
          setEvents(
            events.map((event) =>
              event.id === selectedEvent.id ? selectedEvent : event,
            ),
          );
        }
      } catch (error) {
        console.error("Error updating event with API:", error);
        setEvents(
          events.map((event) =>
            event.id === selectedEvent.id ? selectedEvent : event,
          ),
        );
      }

      toast({
        title: "Success",
        description: "Event updated successfully.",
      });

      setSelectedEvent(null);
      setIsEditEventOpen(false);
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (id: string | number) => {
    try {
      try {
        await plannerApi.deleteEvent(Number(id));
      } catch (error) {
        console.error("Error deleting event with API:", error);
      }

      setEvents(events.filter((event) => event.id !== id.toString()));

      toast({
        title: "Success",
        description: "Event deleted successfully.",
      });

      setSelectedEvent(null);
      setIsEditEventOpen(false);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event.",
        variant: "destructive",
      });
    }
  };

  const getEventsByDay = (day: string) => {
    return events.filter((event) => event.day === day);
  };

  const getColorClass = (color: string) => {
    if (colorBlindMode !== "default") {
      return getColorBlindClass(color, colorBlindMode);
    }

    if (theme === "light") {
      switch (color) {
        case "purple":
          return "bg-purple-100 border-purple-500 text-purple-800 shadow-[0_0_10px_rgba(168,85,247,0.3)]";
        case "blue":
          return "bg-blue-100 border-blue-500 text-blue-800 shadow-[0_0_10px_rgba(59,130,246,0.3)]";
        case "pink":
          return "bg-pink-100 border-pink-500 text-pink-800 shadow-[0_0_10px_rgba(236,72,153,0.3)]";
        case "green":
          return "bg-green-100 border-green-500 text-green-800 shadow-[0_0_10px_rgba(34,197,94,0.3)]";
        default:
          return "bg-purple-100 border-purple-500 text-purple-800 shadow-[0_0_10px_rgba(168,85,247,0.3)]";
      }
    } else {
      switch (color) {
        case "purple":
          return "bg-purple-950 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]";
        case "blue":
          return "bg-blue-950 border-blue-500 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]";
        case "pink":
          return "bg-pink-950 border-pink-500 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.5)]";
        case "green":
          return "bg-green-950 border-green-500 text-green-300 shadow-[0_0_10px_rgba(34,197,94,0.5)]";
        default:
          return "bg-purple-950 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]";
      }
    }
  };

  const getColorBlindClass = (color: string, mode: string) => {
    switch (mode) {
      case "deuteranopia":
        switch (color) {
          case "purple":
            return theme === "light"
              ? "bg-blue-100 border-blue-400 text-blue-800 shadow-[0_0_10px_rgba(66,153,225,0.3)]"
              : "bg-blue-900 border-blue-400 text-blue-200 shadow-[0_0_10px_rgba(66,153,225,0.5)]";
          case "blue":
            return theme === "light"
              ? "bg-blue-100 border-blue-500 text-blue-800 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              : "bg-blue-900 border-blue-500 text-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.5)]";
          case "pink":
            return theme === "light"
              ? "bg-orange-100 border-orange-500 text-orange-800 shadow-[0_0_10px_rgba(237,137,54,0.3)]"
              : "bg-orange-900 border-orange-500 text-orange-200 shadow-[0_0_10px_rgba(237,137,54,0.5)]";
          case "green":
            return theme === "light"
              ? "bg-teal-100 border-teal-500 text-teal-800 shadow-[0_0_10px_rgba(56,178,172,0.3)]"
              : "bg-teal-900 border-teal-500 text-teal-200 shadow-[0_0_10px_rgba(56,178,172,0.5)]";
          default:
            return theme === "light"
              ? "bg-blue-100 border-blue-400 text-blue-800 shadow-[0_0_10px_rgba(66,153,225,0.3)]"
              : "bg-blue-900 border-blue-400 text-blue-200 shadow-[0_0_10px_rgba(66,153,225,0.5)]";
        }
      case "protanopia":
        switch (color) {
          case "purple":
            return theme === "light"
              ? "bg-purple-100 border-purple-500 text-purple-800 shadow-[0_0_10px_rgba(128,90,213,0.3)]"
              : "bg-purple-900 border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(128,90,213,0.5)]";
          case "blue":
            return theme === "light"
              ? "bg-blue-100 border-blue-600 text-blue-800 shadow-[0_0_10px_rgba(49,130,206,0.3)]"
              : "bg-blue-900 border-blue-600 text-blue-200 shadow-[0_0_10px_rgba(49,130,206,0.5)]";
          case "pink":
            return theme === "light"
              ? "bg-yellow-100 border-yellow-500 text-yellow-800 shadow-[0_0_10px_rgba(236,201,75,0.3)]"
              : "bg-yellow-900 border-yellow-500 text-yellow-200 shadow-[0_0_10px_rgba(236,201,75,0.5)]";
          case "green":
            return theme === "light"
              ? "bg-cyan-100 border-cyan-500 text-cyan-800 shadow-[0_0_10px_rgba(11,197,234,0.3)]"
              : "bg-cyan-900 border-cyan-500 text-cyan-200 shadow-[0_0_10px_rgba(11,197,234,0.5)]";
          default:
            return theme === "light"
              ? "bg-purple-100 border-purple-500 text-purple-800 shadow-[0_0_10px_rgba(128,90,213,0.3)]"
              : "bg-purple-900 border-purple-500 text-purple-200 shadow-[0_0_10px_rgba(128,90,213,0.5)]";
        }
      case "tritanopia":
        switch (color) {
          case "purple":
            return theme === "light"
              ? "bg-pink-100 border-pink-500 text-pink-800 shadow-[0_0_10px_rgba(237,100,166,0.3)]"
              : "bg-pink-900 border-pink-500 text-pink-200 shadow-[0_0_10px_rgba(237,100,166,0.5)]";
          case "blue":
            return theme === "light"
              ? "bg-red-100 border-red-500 text-red-800 shadow-[0_0_10px_rgba(229,62,62,0.3)]"
              : "bg-red-900 border-red-500 text-red-200 shadow-[0_0_10px_rgba(229,62,62,0.5)]";
          case "pink":
            return theme === "light"
              ? "bg-green-100 border-green-500 text-green-800 shadow-[0_0_10px_rgba(72,187,120,0.3)]"
              : "bg-green-900 border-green-500 text-green-200 shadow-[0_0_10px_rgba(72,187,120,0.5)]";
          case "green":
            return theme === "light"
              ? "bg-gray-100 border-gray-500 text-gray-800 shadow-[0_0_10px_rgba(113,128,150,0.3)]"
              : "bg-gray-800 border-gray-500 text-gray-200 shadow-[0_0_10px_rgba(113,128,150,0.5)]";
          default:
            return theme === "light"
              ? "bg-pink-100 border-pink-500 text-pink-800 shadow-[0_0_10px_rgba(237,100,166,0.3)]"
              : "bg-pink-900 border-pink-500 text-pink-200 shadow-[0_0_10px_rgba(237,100,166,0.5)]";
        }
      case "monochromacy":
        switch (color) {
          case "purple":
            return theme === "light"
              ? "bg-gray-100 border-gray-500 text-gray-800 shadow-[0_0_10px_rgba(160,174,192,0.3)]"
              : "bg-gray-800 border-gray-500 text-gray-200 shadow-[0_0_10px_rgba(160,174,192,0.5)]";
          case "blue":
            return theme === "light"
              ? "bg-gray-200 border-gray-600 text-gray-800 shadow-[0_0_10px_rgba(74,85,104,0.3)]"
              : "bg-gray-700 border-gray-600 text-gray-200 shadow-[0_0_10px_rgba(74,85,104,0.5)]";
          case "pink":
            return theme === "light"
              ? "bg-gray-50 border-gray-400 text-gray-800 shadow-[0_0_10px_rgba(226,232,240,0.3)]"
              : "bg-gray-900 border-gray-400 text-gray-200 shadow-[0_0_10px_rgba(226,232,240,0.5)]";
          case "green":
            return theme === "light"
              ? "bg-gray-300 border-gray-700 text-gray-800 shadow-[0_0_10px_rgba(26,32,44,0.3)]"
              : "bg-gray-600 border-gray-700 text-gray-200 shadow-[0_0_10px_rgba(26,32,44,0.5)]";
          default:
            return theme === "light"
              ? "bg-gray-100 border-gray-500 text-gray-800 shadow-[0_0_10px_rgba(160,174,192,0.3)]"
              : "bg-gray-800 border-gray-500 text-gray-200 shadow-[0_0_10px_rgba(160,174,192,0.5)]";
        }
      default:
        return theme === "light"
          ? "bg-purple-100 border-purple-500 text-purple-800 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
          : "bg-purple-950 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]";
    }
  };

  return (
    <Card
      className={`w-full h-full overflow-hidden ${theme === "light" ? "bg-white border-gray-200 text-gray-900" : "bg-gray-950 border-gray-800 text-white"}`}
    >
      <CardHeader
        className={`flex flex-row justify-between items-center border-b ${theme === "light" ? "bg-gray-50 border-gray-200" : "bg-gray-900 border-gray-800"}`}
      >
        <CardTitle className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400">
          Weekly Planner
        </CardTitle>
        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className={`border-purple-500 ${theme === "light" ? "text-purple-600 hover:bg-purple-50 hover:text-purple-700" : "text-purple-400 hover:bg-purple-950 hover:text-purple-300"}`}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent
            className={`${theme === "light" ? "bg-white border-gray-200 text-gray-900" : "bg-gray-900 border-gray-800 text-white"}`}
          >
            <DialogHeader>
              <DialogTitle
                className={`text-xl ${theme === "light" ? "text-purple-600" : "text-purple-400"}`}
              >
                Add New Event
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="title"
                  className={theme === "light" ? "text-gray-700" : "text-white"}
                >
                  Title
                </Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className={
                    theme === "light"
                      ? "bg-gray-50 border-gray-300 text-gray-900"
                      : "bg-gray-800 border-gray-700 text-white"
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="description"
                  className={theme === "light" ? "text-gray-700" : "text-white"}
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  className={
                    theme === "light"
                      ? "bg-gray-50 border-gray-300 text-gray-900"
                      : "bg-gray-800 border-gray-700 text-white"
                  }
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="day"
                    className={
                      theme === "light" ? "text-gray-700" : "text-white"
                    }
                  >
                    Day
                  </Label>
                  <Select
                    value={newEvent.day}
                    onValueChange={(value) =>
                      setNewEvent({ ...newEvent, day: value })
                    }
                  >
                    <SelectTrigger
                      className={
                        theme === "light"
                          ? "bg-gray-50 border-gray-300 text-gray-900"
                          : "bg-gray-800 border-gray-700 text-white"
                      }
                    >
                      <SelectValue>{newEvent.day}</SelectValue>
                    </SelectTrigger>
                    <SelectContent
                      className={
                        theme === "light"
                          ? "bg-white border-gray-300 text-gray-900"
                          : "bg-gray-800 border-gray-700 text-white"
                      }
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="time"
                    className={
                      theme === "light" ? "text-gray-700" : "text-white"
                    }
                  >
                    Time
                  </Label>
                  <Select
                    value={newEvent.time}
                    onValueChange={(value) =>
                      setNewEvent({ ...newEvent, time: value })
                    }
                  >
                    <SelectTrigger
                      className={
                        theme === "light"
                          ? "bg-gray-50 border-gray-300 text-gray-900"
                          : "bg-gray-800 border-gray-700 text-white"
                      }
                    >
                      <SelectValue>{newEvent.time}</SelectValue>
                    </SelectTrigger>
                    <SelectContent
                      className={
                        theme === "light"
                          ? "bg-white border-gray-300 text-gray-900"
                          : "bg-gray-800 border-gray-700 text-white"
                      }
                    >
                      {TIME_SLOTS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="color"
                  className={theme === "light" ? "text-gray-700" : "text-white"}
                >
                  Color
                </Label>
                <Select
                  value={newEvent.color}
                  onValueChange={(value) =>
                    setNewEvent({ ...newEvent, color: value })
                  }
                >
                  <SelectTrigger
                    className={
                      theme === "light"
                        ? "bg-gray-50 border-gray-300 text-gray-900"
                        : "bg-gray-800 border-gray-700 text-white"
                    }
                  >
                    <SelectValue>
                      {COLOR_OPTIONS.find((c) => c.value === newEvent.color)
                        ?.label || "Select color"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent
                    className={
                      theme === "light"
                        ? "bg-white border-gray-300 text-gray-900"
                        : "bg-gray-800 border-gray-700 text-white"
                    }
                  >
                    {COLOR_OPTIONS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className={
                    theme === "light"
                      ? "border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      : "border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                  }
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleAddEvent}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                Add Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0 overflow-auto max-h-[calc(100%-80px)]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-2 text-lg">Loading events...</span>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <div
                className={`grid grid-cols-7 sticky top-0 z-10 border-b ${theme === "light" ? "bg-gray-50 border-gray-200" : "bg-gray-900 border-gray-800"}`}
              >
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    className={`p-3 text-center font-medium ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div
                className={`grid grid-cols-7 gap-1 p-2 ${theme === "light" ? "bg-gray-50" : "bg-gray-950"}`}
              >
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    className={`min-h-[400px] border rounded-md p-2 ${theme === "light" ? "border-gray-200" : "border-gray-800"}`}
                  >
                    {getEventsByDay(day).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "mb-2 p-2 rounded-md border text-sm relative transition-all duration-300 hover:scale-[1.02] cursor-pointer",
                          getColorClass(event.color),
                        )}
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsEditEventOpen(true);
                        }}
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs opacity-80 flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {event.time}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="md:hidden">
              <div
                className={`flex justify-between items-center sticky top-0 z-10 border-b p-3 ${theme === "light" ? "bg-gray-50 border-gray-200" : "bg-gray-900 border-gray-800"}`}
              >
                <Select
                  value={newEvent.day}
                  onValueChange={(value) => {
                    setNewEvent({ ...newEvent, day: value });
                  }}
                >
                  <SelectTrigger
                    className={`w-full ${theme === "light" ? "bg-gray-50 border-gray-300" : "bg-gray-800 border-gray-700"}`}
                  >
                    <SelectValue>Select Day</SelectValue>
                  </SelectTrigger>
                  <SelectContent
                    className={theme === "light" ? "bg-white" : "bg-gray-800"}
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div
                className={`p-3 ${theme === "light" ? "bg-gray-50" : "bg-gray-950"}`}
              >
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    className={`${newEvent.day === day ? "block" : "hidden"} border rounded-md p-3 mb-3 ${theme === "light" ? "border-gray-200" : "border-gray-800"}`}
                  >
                    <h3
                      className={`text-lg font-medium mb-3 ${theme === "light" ? "text-gray-800" : "text-white"}`}
                    >
                      {day}
                    </h3>
                    {getEventsByDay(day).length > 0 ? (
                      getEventsByDay(day).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "mb-3 p-3 rounded-md border text-sm relative transition-all duration-300 active:scale-[0.98] cursor-pointer",
                            getColorClass(event.color),
                          )}
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsEditEventOpen(true);
                          }}
                        >
                          <div className="font-medium text-base">
                            {event.title}
                          </div>
                          <div className="text-sm opacity-80 flex items-center mt-2">
                            <Calendar className="h-4 w-4 mr-2" />
                            {event.time}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        No events for {day}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>

      <Dialog
        open={isEditEventOpen && selectedEvent !== null}
        onOpenChange={setIsEditEventOpen}
      >
        <DialogContent
          className={`${theme === "light" ? "bg-white border-gray-200 text-gray-900" : "bg-gray-900 border-gray-800 text-white"}`}
        >
          <DialogHeader>
            <DialogTitle
              className={`text-xl ${theme === "light" ? "text-blue-600" : "text-blue-400"}`}
            >
              Edit Event
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="edit-title"
                  className={theme === "light" ? "text-gray-700" : "text-white"}
                >
                  Title
                </Label>
                <Input
                  id="edit-title"
                  value={selectedEvent.title}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      title: e.target.value,
                    })
                  }
                  className={
                    theme === "light"
                      ? "bg-gray-50 border-gray-300 text-gray-900"
                      : "bg-gray-800 border-gray-700 text-white"
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="edit-description"
                  className={theme === "light" ? "text-gray-700" : "text-white"}
                >
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={selectedEvent.description}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      description: e.target.value,
                    })
                  }
                  className={
                    theme === "light"
                      ? "bg-gray-50 border-gray-300 text-gray-900"
                      : "bg-gray-800 border-gray-700 text-white"
                  }
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="edit-day"
                    className={
                      theme === "light" ? "text-gray-700" : "text-white"
                    }
                  >
                    Day
                  </Label>
                  <Select
                    value={selectedEvent.day}
                    onValueChange={(value) =>
                      setSelectedEvent({ ...selectedEvent, day: value })
                    }
                  >
                    <SelectTrigger
                      className={
                        theme === "light"
                          ? "bg-gray-50 border-gray-300 text-gray-900"
                          : "bg-gray-800 border-gray-700 text-white"
                      }
                    >
                      <SelectValue>{selectedEvent.day}</SelectValue>
                    </SelectTrigger>
                    <SelectContent
                      className={
                        theme === "light"
                          ? "bg-white border-gray-300 text-gray-900"
                          : "bg-gray-800 border-gray-700 text-white"
                      }
                    >
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={`edit-${day}`} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="edit-time"
                    className={
                      theme === "light" ? "text-gray-700" : "text-white"
                    }
                  >
                    Time
                  </Label>
                  <Select
                    value={selectedEvent.time}
                    onValueChange={(value) =>
                      setSelectedEvent({ ...selectedEvent, time: value })
                    }
                  >
                    <SelectTrigger
                      className={
                        theme === "light"
                          ? "bg-gray-50 border-gray-300 text-gray-900"
                          : "bg-gray-800 border-gray-700 text-white"
                      }
                    >
                      <SelectValue>{selectedEvent.time}</SelectValue>
                    </SelectTrigger>
                    <SelectContent
                      className={
                        theme === "light"
                          ? "bg-white border-gray-300 text-gray-900"
                          : "bg-gray-800 border-gray-700 text-white"
                      }
                    >
                      {TIME_SLOTS.map((time) => (
                        <SelectItem key={`edit-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="edit-color"
                  className={theme === "light" ? "text-gray-700" : "text-white"}
                >
                  Color
                </Label>
                <Select
                  value={selectedEvent.color}
                  onValueChange={(value) =>
                    setSelectedEvent({ ...selectedEvent, color: value })
                  }
                >
                  <SelectTrigger
                    className={
                      theme === "light"
                        ? "bg-gray-50 border-gray-300 text-gray-900"
                        : "bg-gray-800 border-gray-700 text-white"
                    }
                  >
                    <SelectValue>
                      {COLOR_OPTIONS.find(
                        (c) => c.value === selectedEvent.color,
                      )?.label || "Select color"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent
                    className={
                      theme === "light"
                        ? "bg-white border-gray-300 text-gray-900"
                        : "bg-gray-800 border-gray-700 text-white"
                    }
                  >
                    {COLOR_OPTIONS.map((color) => (
                      <SelectItem
                        key={`edit-${color.value}`}
                        value={color.value}
                      >
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={() =>
                selectedEvent && handleDeleteEvent(selectedEvent.id)
              }
              className="bg-red-900 hover:bg-red-800 text-white border-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className={
                    theme === "light"
                      ? "border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      : "border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                  }
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleEditEvent}
                className="bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white"
              >
                <Edit className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WeeklyPlanner;
