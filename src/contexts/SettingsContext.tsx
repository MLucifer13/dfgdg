import React, { createContext, useContext, useState, useEffect } from "react";

export type ColorTheme = "purple" | "blue" | "pink";
export type AppTheme = "dark" | "light";
export type ColorBlindMode =
  | "default"
  | "deuteranopia"
  | "protanopia"
  | "tritanopia"
  | "monochromacy";

interface SettingsContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  appTheme: AppTheme;
  setAppTheme: (theme: AppTheme) => void;
  colorBlindMode: ColorBlindMode;
  setColorBlindMode: (mode: ColorBlindMode) => void;
  focusMode: boolean;
  setFocusMode: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  pomodoroLength: string;
  setPomodoroLength: (length: string) => void;
  shortBreakLength: string;
  setShortBreakLength: (length: string) => void;
  longBreakLength: string;
  setLongBreakLength: (length: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Theme settings
  const [colorTheme, setColorTheme] = useState<ColorTheme>("purple");
  const [appTheme, setAppTheme] = useState<AppTheme>("dark");
  const [colorBlindMode, setColorBlindMode] =
    useState<ColorBlindMode>("default");
  const [focusMode, setFocusMode] = useState(false);

  // Notification settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Timer settings
  const [pomodoroLength, setPomodoroLength] = useState("25");
  const [shortBreakLength, setShortBreakLength] = useState("5");
  const [longBreakLength, setLongBreakLength] = useState("15");

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    if (appTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }

    // Apply focus mode class
    if (focusMode) {
      root.classList.add("focus-mode");
    } else {
      root.classList.remove("focus-mode");
    }

    // Apply color blind mode as a data attribute
    root.setAttribute("data-color-blind-mode", colorBlindMode);
  }, [appTheme, focusMode, colorBlindMode]);

  const value = {
    colorTheme,
    setColorTheme,
    appTheme,
    setAppTheme,
    colorBlindMode,
    setColorBlindMode,
    focusMode,
    setFocusMode,
    soundEnabled,
    setSoundEnabled,
    notificationsEnabled,
    setNotificationsEnabled,
    pomodoroLength,
    setPomodoroLength,
    shortBreakLength,
    setShortBreakLength,
    longBreakLength,
    setLongBreakLength,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
