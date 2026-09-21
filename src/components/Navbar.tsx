import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Search, 
  Plus, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Target, 
  Clock, 
  FileText, 
  GraduationCap, 
  Briefcase, 
  Code2, 
  BarChart3, 
  User, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  FolderPlus,
  Compass,
  Layers,
  Home,
  Info
} from "lucide-react";
import { WorkspaceType } from "../types";
import { soundscapeEngine } from "../utils/audio";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeWorkspace: WorkspaceType;
  setActiveWorkspace: (ws: WorkspaceType) => void;
  workspaces: WorkspaceType[];
  onAddWorkspace?: (name: string) => void;
  onOpenQuickCapture: () => void;
  onOpenCommandPalette: () => void;
  onOpenCopilot: () => void;
  onOpenTemplates: () => void;
  theme?: "dark" | "light";
  toggleTheme?: () => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (dark: boolean) => void;
  audioMode: "off" | "drone" | "pink" | "rain";
  setAudioMode: (mode: "off" | "drone" | "pink" | "rain") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeWorkspace,
  setActiveWorkspace,
  workspaces,
  onAddWorkspace,
  onOpenQuickCapture,
  onOpenCommandPalette,
  onOpenCopilot,
  onOpenTemplates,
  theme = "light",
  toggleTheme,
  isDarkMode = false,
  setIsDarkMode,
  audioMode,
  setAudioMode
}) => {
  const isDark = theme === "dark" || isDarkMode;
  const handleToggleTheme = () => {
    if (toggleTheme) toggleTheme();
    else if (setIsDarkMode) setIsDarkMode(!isDarkMode);
  };
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [showAddSpaceInput, setShowAddSpaceInput] = useState(false);

  const toggleSound = () => {
    if (audioMode === "off") {
      soundscapeEngine.play("drone");
      setAudioMode("drone");
    } else if (audioMode === "drone") {
      soundscapeEngine.play("pink");
      setAudioMode("pink");
    } else if (audioMode === "pink") {
      soundscapeEngine.play("rain");
      setAudioMode("rain");
    } else {
      soundscapeEngine.stop();
      setAudioMode("off");
    }
  };

  const handleCreateSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorkspaceName.trim()) {
      if (onAddWorkspace) onAddWorkspace(newWorkspaceName.trim());
      setActiveWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName("");
      setShowAddSpaceInput(false);
      setShowWorkspaceDropdown(false);
    }
  };

  const navItems = [
    { id: "home", label: "Home / Info", icon: Home },
    { id: "dashboard", label: "Dashboard", icon: Layers },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "calendar", label: "Calendar", icon: CalendarIcon },
    { id: "goals", label: "Goals", icon: Target },
    { id: "focus", label: "Focus", icon: Clock },
    { id: "notes", label: "Notes", icon: FileText },
    { id: "student", label: "College", icon: GraduationCap },
    { id: "work", label: "Work", icon: Briefcase },
    { id: "developer", label: "Dev Space", icon: Code2 },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "creator", label: "Dev Info", icon: User }
  ];

  return (
    <header className="sticky top-0 left-0 w-full z-40 bg-surface/85 backdrop-blur-xl border-b border-border-hairline transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand & Workspace Selector */}
        <div className="flex items-center gap-3">
          <motion.button 
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-text-primary text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:bg-primary transition-colors">
              Æ
            </div>
            <span className="font-bold text-sm tracking-tight text-text-primary hidden sm:inline">
              Aethel OS
            </span>
          </motion.button>

          {/* Workspace Selector Pill */}
          <div className="relative">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-muted hover:bg-surface-container border border-border-hairline text-xs font-medium text-text-primary transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="max-w-[90px] truncate">{activeWorkspace}</span>
              <span className="text-[10px] text-text-tertiary">▼</span>
            </motion.button>

            <AnimatePresence>
              {showWorkspaceDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.16 }}
                  className="absolute top-9 left-0 w-52 p-2 rounded-2xl bg-surface border border-border-hairline shadow-xl z-50 backdrop-blur-md"
                >
                  <div className="text-[10px] font-mono text-text-tertiary px-2.5 py-1 uppercase tracking-wider">
                    Workspaces / Spaces
                  </div>
                  <div className="space-y-0.5 mt-1 max-h-48 overflow-y-auto">
                    {workspaces.map((ws) => (
                      <button
                        key={ws}
                        type="button"
                        onClick={() => {
                          setActiveWorkspace(ws);
                          setShowWorkspaceDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          activeWorkspace === ws 
                            ? "bg-primary/10 text-primary font-semibold" 
                            : "hover:bg-surface-muted text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        <span>{ws}</span>
                        {activeWorkspace === ws && <span className="text-[10px]">✓</span>}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 mt-2 border-t border-border-hairline">
                    {showAddSpaceInput ? (
                      <form onSubmit={handleCreateSpace} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newWorkspaceName}
                          onChange={(e) => setNewWorkspaceName(e.target.value)}
                          placeholder="Space name..."
                          className="w-full px-2 py-1 text-xs rounded-lg bg-surface-muted border border-border-hairline focus:outline-none focus:ring-1 focus:ring-primary"
                          autoFocus
                        />
                        <button 
                          type="submit" 
                          className="px-2 py-1 text-xs bg-primary text-white rounded-lg cursor-pointer"
                        >
                          Add
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAddSpaceInput(true)}
                        className="w-full text-left px-2 py-1 text-xs text-primary hover:bg-primary/5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>New Custom Space</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Desktop Navigation Links with Framer Motion active pill */}
        <nav className="hidden xl:flex items-center gap-1 overflow-x-auto py-1 text-xs relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap z-10 ${
                  isActive
                    ? "text-white font-medium"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-muted/50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-bubble"
                    className="absolute inset-0 rounded-full bg-text-primary -z-10 shadow-xs"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : ""}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Actions, AI, Audio & Search Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Quick Add Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenQuickCapture}
            className="apple-btn inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-medium shadow-xs cursor-pointer"
            title="Quick Capture (Natural Language Task)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quick Add</span>
          </motion.button>

          {/* Universal Search / Command Bar Trigger */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-surface-muted hover:bg-surface-container border border-border-hairline text-xs font-mono text-text-secondary transition-colors cursor-pointer"
            title="Universal Search (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-text-tertiary" />
            <span className="hidden md:inline">⌘K</span>
          </motion.button>

          {/* AI Copilot Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-surface hover:bg-surface-muted border border-border-hairline text-xs font-medium text-text-primary shadow-xs transition-colors cursor-pointer"
            title="ActionBot AI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="hidden lg:inline">Copilot</span>
          </motion.button>

          {/* Acoustic Soundscape Synthesizer Toggle */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={toggleSound}
            className={`p-1.5 rounded-full border transition-all cursor-pointer ${
              audioMode !== "off"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-semibold shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                : "bg-surface-muted border-border-hairline text-text-secondary hover:text-text-primary"
            }`}
            title={`Soundscape: ${audioMode === "off" ? "Muted" : audioMode} (Click to cycle 432Hz / Pink / Rain)`}
          >
            {audioMode !== "off" ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </motion.button>

          {/* Templates Trigger */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenTemplates}
            className="hidden sm:inline-flex items-center px-2 py-1 rounded-full text-xs text-text-secondary hover:text-text-primary border border-border-hairline hover:bg-surface-muted transition-colors cursor-pointer"
            title="Ready-made Templates"
          >
            Templates
          </motion.button>

          {/* Dark / Light Mode Toggle */}
          <motion.button
            type="button"
            whileTap={{ rotate: 180, scale: 0.9 }}
            onClick={handleToggleTheme}
            className="p-1.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="xl:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 bg-surface/50 border-t border-border-hairline scrollbar-none text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? "bg-text-primary text-white font-medium shadow-xs"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
