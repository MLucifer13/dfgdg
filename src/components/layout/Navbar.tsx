import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Calendar,
  CheckSquare,
  Clock,
  Moon,
  Sun,
  LogIn,
  LogOut,
  User,
  UserPlus,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface NavbarProps {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  activeItem?: string;
}

const Navbar = ({
  isDarkMode = true,
  onToggleTheme = () => {},
  activeItem = "dashboard",
}: NavbarProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: "planner",
      label: "Planner",
      icon: <Calendar className="h-5 w-5" />,
      path: "/planner",
    },
    {
      id: "todo",
      label: "To-Do List",
      icon: <CheckSquare className="h-5 w-5" />,
      path: "/todo",
    },
    {
      id: "pomodoro",
      label: "Pomodoro",
      icon: <Clock className="h-5 w-5" />,
      path: "/pomodoro",
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-purple-900/50 h-[70px] px-3 md:px-6 flex items-center justify-between">
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 bg-clip-text text-transparent"
        >
          <span className="mr-1">Study</span>
          <span className="relative">
            Blitz
            <motion.span
              className="absolute -top-1 -right-3 text-xs text-pink-500"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚡
            </motion.span>
          </span>
        </motion.div>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-1">
        {navItems.map((item) => (
          <Link key={item.id} to={item.path}>
            <Button
              variant="ghost"
              className={cn(
                "relative group px-3 py-2 rounded-md transition-all duration-300",
                activeItem === item.id
                  ? "text-white bg-gradient-to-r from-purple-900/20 to-pink-900/20"
                  : "text-gray-400 hover:text-white hover:bg-purple-900/10",
              )}
            >
              <div className="flex items-center space-x-2">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {activeItem === item.id && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              <div className="absolute -inset-0.5 rounded-lg opacity-0 group-hover:opacity-100 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 blur-sm group-hover:blur transition duration-500" />
            </Button>
          </Link>
        ))}

        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          onClick={onToggleTheme}
          className="relative group p-2 rounded-full transition-all duration-300 text-gray-400 hover:text-white hover:bg-purple-900/10"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <div className="absolute -inset-0.5 rounded-full opacity-0 group-hover:opacity-100 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 blur-sm group-hover:blur transition duration-500" />
        </Button>

        {/* Login/User Profile Button */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative group ml-2 px-3 py-2 rounded-md transition-all duration-300 text-gray-300 hover:text-white hover:bg-purple-900/10"
              >
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>{user?.name || "My Profile"}</span>
                </div>
                <div className="absolute -inset-0.5 rounded-lg opacity-0 group-hover:opacity-100 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 blur-sm group-hover:blur transition duration-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-black/90 border border-purple-900/50 backdrop-blur-md"
            >
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-900/20 cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-900/20 cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSignUp}
              className="relative group px-4 py-2 bg-transparent border border-purple-600 hover:bg-purple-900/20 rounded-md transition-all duration-300 text-purple-400 hover:text-purple-300"
            >
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Sign Up</span>
              </div>
            </Button>
            <Button
              onClick={handleLogin}
              className="relative group px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-md transition-all duration-300 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              <div className="flex items-center space-x-2">
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </div>
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center">
        {/* Mobile Login Button */}
        {!isAuthenticated ? (
          <Button
            onClick={handleLogin}
            variant="ghost"
            className="relative group p-1.5 mr-1.5 rounded-full transition-all duration-300 text-purple-400 hover:text-white hover:bg-purple-900/10"
          >
            <LogIn className="h-4 w-4" />
            <div className="absolute -inset-0.5 rounded-full opacity-0 group-hover:opacity-100 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 blur-sm group-hover:blur transition duration-500" />
          </Button>
        ) : (
          <Button
            onClick={() => navigate("/profile")}
            variant="ghost"
            className="relative group p-1.5 mr-1.5 rounded-full transition-all duration-300 text-purple-400 hover:text-white hover:bg-purple-900/10"
          >
            <User className="h-4 w-4" />
            <div className="absolute -inset-0.5 rounded-full opacity-0 group-hover:opacity-100 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 blur-sm group-hover:blur transition duration-500" />
          </Button>
        )}

        <Button
          variant="ghost"
          className="relative group p-1.5 rounded-full transition-all duration-300 text-gray-400 hover:text-white hover:bg-purple-900/10"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
          <div className="absolute -inset-0.5 rounded-full opacity-0 group-hover:opacity-100 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 blur-sm group-hover:blur transition duration-500" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="absolute top-[70px] left-0 right-0 bg-black/95 border-b border-purple-900/50 backdrop-blur-md py-4 px-4 md:hidden"
        >
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link key={item.id} to={item.path} onClick={toggleMobileMenu}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start relative group px-3 py-2 rounded-md transition-all duration-300",
                    activeItem === item.id
                      ? "text-white bg-gradient-to-r from-purple-900/20 to-pink-900/20"
                      : "text-gray-400 hover:text-white hover:bg-purple-900/10",
                  )}
                >
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {activeItem === item.id && (
                    <motion.div
                      layoutId="navbar-mobile-indicator"
                      className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-pink-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Button>
              </Link>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-purple-900/10 px-3 py-2"
              onClick={() => {
                onToggleTheme();
                toggleMobileMenu();
              }}
            >
              <div className="flex items-center space-x-2">
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
              </div>
            </Button>
            {!isAuthenticated ? (
              <>
                <Link to="/signup" onClick={toggleMobileMenu}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-purple-400 hover:text-purple-300 hover:bg-purple-900/10 px-3 py-2"
                  >
                    <div className="flex items-center space-x-2">
                      <UserPlus className="h-5 w-5" />
                      <span>Sign Up</span>
                    </div>
                  </Button>
                </Link>
                <Link to="/login" onClick={toggleMobileMenu}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-blue-400 hover:text-blue-300 hover:bg-blue-900/10 px-3 py-2"
                  >
                    <div className="flex items-center space-x-2">
                      <LogIn className="h-5 w-5" />
                      <span>Login</span>
                    </div>
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-400 hover:text-white hover:bg-purple-900/10 px-3 py-2"
                  onClick={() => {
                    navigate("/profile");
                    toggleMobileMenu();
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-400 hover:text-white hover:bg-purple-900/10 px-3 py-2"
                  onClick={() => {
                    navigate("/settings");
                    toggleMobileMenu();
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/10 px-3 py-2"
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </div>
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
