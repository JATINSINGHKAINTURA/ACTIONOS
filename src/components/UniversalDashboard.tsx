import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckSquare, 
  Clock, 
  Calendar as CalendarIcon, 
  Target, 
  FileText, 
  Play, 
  Pause, 
  Plus, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  FolderKanban, 
  Layers,
  GraduationCap,
  Briefcase,
  Code2,
  ListTodo,
  Activity,
  Zap
} from "lucide-react";
import { Task, Project, Goal, CalendarEvent, Note, WorkspaceType, SubjectAttendance, FocusSession } from "../types";
import { soundscapeEngine } from "../utils/audio";
import { MotionSoundwaveGraphic, MotionMetricRing } from "./MotionGraphics";

interface UniversalDashboardProps {
  tasks: Task[];
  onToggleTask: (id: number) => void;
  projects: Project[];
  goals: Goal[];
  events: CalendarEvent[];
  notes: Note[];
  attendance?: SubjectAttendance[];
  focusSessions?: FocusSession[];
  activeWorkspace: WorkspaceType;
  setActiveWorkspace?: (ws: WorkspaceType) => void;
  workspaces?: WorkspaceType[];
  onOpenQuickCapture: () => void;
  onOpenFocusMode?: () => void;
  onOpenCalendar?: () => void;
  onOpenCopilot: () => void;
  onOpenStudyPlanner?: () => void;
  onOpenMeetingActions?: () => void;
  onOpenTimetableStudio?: () => void;
  onNavigateTab: (tab: string) => void;
}

export const UniversalDashboard: React.FC<UniversalDashboardProps> = ({
  tasks,
  onToggleTask,
  projects,
  goals,
  events,
  notes,
  attendance = [],
  focusSessions = [],
  activeWorkspace,
  setActiveWorkspace,
  workspaces = [],
  onOpenQuickCapture,
  onOpenFocusMode,
  onOpenCalendar,
  onOpenCopilot,
  onOpenStudyPlanner,
  onOpenMeetingActions,
  onOpenTimetableStudio,
  onNavigateTab
}) => {
  // Mini Focus Timer State
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<"pomodoro" | "short" | "long">("pomodoro");

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const setTimerPreset = (type: "pomodoro" | "short" | "long") => {
    setTimerMode(type);
    setIsTimerRunning(false);
    if (type === "pomodoro") setTimerSeconds(25 * 60);
    else if (type === "short") setTimerSeconds(5 * 60);
    else if (type === "long") setTimerSeconds(15 * 60);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Filter items by selected workspace or all
  const filteredTasks = tasks.filter((t) => t.workspace === activeWorkspace || activeWorkspace === "All");
  const todayTasks = filteredTasks.filter((t) => !t.completed);
  const completedToday = filteredTasks.filter((t) => t.completed);
  const urgentTasks = filteredTasks.filter((t) => t.priority === "URGENT" && !t.completed);

  const filteredProjects = projects.filter((p) => p.workspace === activeWorkspace || activeWorkspace === "All");
  const filteredGoals = goals.filter((g) => g.workspace === activeWorkspace || activeWorkspace === "All");
  const filteredNotes = notes.filter((n) => n.workspace === activeWorkspace || activeWorkspace === "All");
  const filteredEvents = events.filter((e) => e.workspace === activeWorkspace || activeWorkspace === "All");

  const completionRate = filteredTasks.length > 0 
    ? Math.round((completedToday.length / filteredTasks.length) * 100) 
    : 100;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.06,
        duration: 0.45,
        ease: "easeOut" as const
      }
    })
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* 1. Header Strip with Adaptive Workspace Switcher & Quick Summary */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-hairline"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Universal Productivity Cockpit</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
            {activeWorkspace === "College" ? "Student Academic Command" :
             activeWorkspace === "Work" ? "Work & Enterprise Hub" :
             activeWorkspace === "Development" ? "Developer Engineering Suite" :
             activeWorkspace === "Side Projects" ? "Projects & Innovation Lab" :
             "Personal Productivity Overview"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {todayTasks.length} active tasks • {urgentTasks.length} urgent • {filteredProjects.length} active spaces
          </p>
        </div>

        {/* Space Selector Pills */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center bg-surface p-1 rounded-full border border-border-hairline text-xs font-medium text-text-secondary shadow-xs">
            {workspaces.slice(0, 5).map((ws) => (
              <motion.button
                key={ws}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveWorkspace && setActiveWorkspace(ws)}
                className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                  activeWorkspace === ws
                    ? "bg-text-primary text-white font-semibold shadow-xs"
                    : "hover:text-text-primary text-text-secondary"
                }`}
              >
                {ws}
              </motion.button>
            ))}
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenQuickCapture}
            className="apple-btn px-4 py-1.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Add</span>
          </motion.button>
        </div>
      </motion.div>

      {/* 2. Top Metric KPI Strip with Framer Motion Stagger */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -3, scale: 1.01 }}
          className="p-5 rounded-3xl bg-surface border border-border-hairline apple-shadow-float flex items-center justify-between transition-shadow"
        >
          <div>
            <div className="text-xs font-mono text-text-secondary uppercase">Tasks Today</div>
            <div className="text-2xl sm:text-3xl font-bold text-text-primary mt-1">{todayTasks.length}</div>
            <div className="text-[11px] text-text-tertiary mt-0.5">{completedToday.length} completed</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
        </motion.div>

        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -3, scale: 1.01 }}
          className="p-5 rounded-3xl bg-surface border border-border-hairline apple-shadow-float flex items-center justify-between transition-shadow"
        >
          <div>
            <div className="text-xs font-mono text-text-secondary uppercase">Completion Rate</div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">{completionRate}%</div>
            <div className="text-[11px] text-text-tertiary mt-0.5">Velocity score</div>
          </div>
          <MotionMetricRing progress={completionRate} size={42} strokeWidth={4} />
        </motion.div>

        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -3, scale: 1.01 }}
          className="p-5 rounded-3xl bg-surface border border-border-hairline apple-shadow-float flex items-center justify-between transition-shadow"
        >
          <div>
            <div className="text-xs font-mono text-text-secondary uppercase">Active Goals</div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 mt-1">{filteredGoals.length}</div>
            <div className="text-[11px] text-text-tertiary mt-0.5">Tracked progress</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
        </motion.div>

        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -3, scale: 1.01 }}
          className="p-5 rounded-3xl bg-surface border border-border-hairline apple-shadow-float flex items-center justify-between transition-shadow"
        >
          <div>
            <div className="text-xs font-mono text-text-secondary uppercase">Urgent Deadlines</div>
            <div className="text-2xl sm:text-3xl font-bold text-red-500 mt-1">{urgentTasks.length}</div>
            <div className="text-[11px] text-text-tertiary mt-0.5">Action required</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </motion.div>
      </div>

      {/* 3. Main Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Today's Tasks & Projects (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Today's Tasks Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-text-primary">Today's Focus Tasks</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-surface-muted text-text-secondary border border-border-hairline">
                  {todayTasks.length} pending
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("tasks")}
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              <AnimatePresence>
                {todayTasks.slice(0, 5).map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.008 }}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-muted/60 border border-border-hairline hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.8 }}
                        onClick={() => onToggleTask(task.id)}
                        className="w-4 h-4 rounded-full border border-border-hairline hover:border-primary flex items-center justify-center transition-colors cursor-pointer"
                      />
                      <div className="truncate">
                        <div className="text-xs font-medium text-text-primary truncate">{task.title}</div>
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="text-[11px] font-mono text-text-tertiary">
                            {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length} subtasks
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      {task.priority === "URGENT" && (
                        <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 border border-red-500/20 text-[10px] font-mono font-bold">
                          URGENT
                        </span>
                      )}
                      {task.priority === "HIGH" && (
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono">
                          HIGH
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-text-secondary">{task.deadline || "Today"}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {todayTasks.length === 0 && (
                <div className="text-center py-8 text-xs text-text-tertiary space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                  <p>All tasks cleared for {activeWorkspace}! Relax or capture new work.</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border-hairline flex items-center justify-between text-xs">
              <motion.button
                type="button"
                whileHover={{ x: 2 }}
                onClick={onOpenQuickCapture}
                className="text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add new task to {activeWorkspace}</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Active Projects Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-text-primary">Active Projects & Workspaces</h3>
              </div>
              <span className="text-xs font-mono text-text-tertiary">{filteredProjects.length} spaces</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ y: -2 }}
                  className="p-4 rounded-2xl bg-surface-muted/60 border border-border-hairline hover:border-primary/30 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary truncate">{project.title}</span>
                    <span className="text-xs font-mono text-primary font-bold">{project.progress}%</span>
                  </div>
                  <p className="text-[11px] text-text-secondary line-clamp-2">{project.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="bg-primary h-1.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-text-tertiary">
                    <span>{project.workspace}</span>
                    <span>Due {project.deadline || "Continuous"}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Goals & Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-text-primary">Goals & Key Milestones</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("goals")}
                className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Manage</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {filteredGoals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="p-4 rounded-2xl bg-surface-muted/40 border border-border-hairline space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">{goal.title}</span>
                    <span className="text-xs font-mono font-bold text-emerald-600">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-text-secondary">
                    {goal.milestones.slice(0, 3).map((ms) => (
                      <span
                        key={ms.id}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-mono ${
                          ms.completed
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700"
                            : "bg-surface border-border-hairline text-text-tertiary"
                        }`}
                      >
                        {ms.completed ? "☑" : "☐"} {ms.title}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Focus Timer, Calendar Timeline, Recent Notes & AI Quick Tools (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Focus Mode Pomodoro Card with Motion Graphics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-5 text-center relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-left">
              <div>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                  Focus Sprint
                </span>
                <span className="text-[11px] font-mono text-emerald-600">● 432Hz Soundscape Ready</span>
              </div>
              <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-xl text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setTimerPreset("pomodoro")}
                  className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                    timerMode === "pomodoro" ? "bg-surface text-text-primary font-bold shadow-xs" : "text-text-tertiary"
                  }`}
                >
                  25m
                </button>
                <button
                  type="button"
                  onClick={() => setTimerPreset("short")}
                  className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                    timerMode === "short" ? "bg-surface text-text-primary font-bold shadow-xs" : "text-text-tertiary"
                  }`}
                >
                  5m
                </button>
                <button
                  type="button"
                  onClick={() => setTimerPreset("long")}
                  className={`px-2 py-0.5 rounded-lg cursor-pointer transition-colors ${
                    timerMode === "long" ? "bg-surface text-text-primary font-bold shadow-xs" : "text-text-tertiary"
                  }`}
                >
                  15m
                </button>
              </div>
            </div>

            {/* Display & Soundwave Motion Graphic */}
            <div className="py-2 flex flex-col items-center justify-center">
              <motion.div
                key={timerSeconds}
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
                className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-text-primary"
              >
                {formatTimer(timerSeconds)}
              </motion.div>
              
              <div className="my-2">
                <MotionSoundwaveGraphic active={isTimerRunning} barsCount={16} />
              </div>

              <div className="text-xs text-text-secondary font-mono">
                {isTimerRunning ? "Deep Focus Protocol Active" : "Paused • Ready when you are"}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="apple-btn px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isTimerRunning ? "Pause Sprint" : "Start Focus"}</span>
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimerSeconds((prev) => prev + 5 * 60)}
                className="px-3.5 py-2.5 rounded-full bg-surface-muted hover:bg-surface-container border border-border-hairline text-xs font-mono text-text-secondary cursor-pointer"
              >
                +5m
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigateTab("focus")}
                className="px-3.5 py-2.5 rounded-full bg-surface-muted hover:bg-surface-container border border-border-hairline text-xs font-medium text-text-secondary cursor-pointer"
              >
                Full Mode
              </motion.button>
            </div>
          </motion.div>

          {/* Calendar & Upcoming Deadlines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-text-primary">Upcoming Schedule & Events</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("calendar")}
                className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Calendar</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {filteredEvents.slice(0, 4).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-surface-muted/60 border border-border-hairline text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        event.type === "deadline" ? "bg-red-500" :
                        event.type === "meeting" ? "bg-purple-500" :
                        event.type === "study" ? "bg-emerald-500" : "bg-primary"
                      }`}
                    />
                    <div>
                      <div className="font-semibold text-text-primary">{event.title}</div>
                      <div className="text-[11px] text-text-tertiary font-mono">
                        {event.startDate} {event.startTime ? `at ${event.startTime}` : ""}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface border border-border-hairline text-text-secondary">
                    {event.workspace}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Notes Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-text-primary">Recent Notes</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("notes")}
                className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>All Notes</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {filteredNotes.slice(0, 2).map((note) => (
                <motion.div
                  key={note.id}
                  whileHover={{ y: -2 }}
                  onClick={() => onNavigateTab("notes")}
                  className="p-3.5 rounded-2xl bg-surface-muted/60 border border-border-hairline hover:border-primary/30 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">{note.title}</span>
                    {note.isPinned && <span className="text-[10px] text-amber-500">📌</span>}
                  </div>
                  <p className="text-[11px] text-text-secondary line-clamp-2 font-mono">{note.content.replace(/[#*`]/g, "")}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick AI & Executive Studio Launchers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Executive Action Tools
              </span>
              <span className="text-[11px] font-mono text-primary flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Powered
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenTimetableStudio}
                className="p-3 rounded-2xl bg-surface-muted hover:bg-surface-container border border-border-hairline text-left transition-all cursor-pointer group"
              >
                <div className="font-semibold text-text-primary group-hover:text-primary transition-colors flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>Timetable Studio</span>
                </div>
                <div className="text-text-secondary text-[11px] mt-0.5">Plan continuous day blocks</div>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenStudyPlanner}
                className="p-3 rounded-2xl bg-surface-muted hover:bg-surface-container border border-border-hairline text-left transition-all cursor-pointer group"
              >
                <div className="font-semibold text-text-primary group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Study Planner</span>
                </div>
                <div className="text-text-secondary text-[11px] mt-0.5">Exam revision roadmaps</div>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenMeetingActions}
                className="p-3 rounded-2xl bg-surface-muted hover:bg-surface-container border border-border-hairline text-left transition-all cursor-pointer group"
              >
                <div className="font-semibold text-text-primary group-hover:text-purple-600 transition-colors flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                  <span>Meeting Actions</span>
                </div>
                <div className="text-text-secondary text-[11px] mt-0.5">Extract tasks from notes</div>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenCopilot}
                className="p-3 rounded-2xl bg-surface-muted hover:bg-surface-container border border-border-hairline text-left transition-all cursor-pointer group"
              >
                <div className="font-semibold text-text-primary group-hover:text-primary transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Plan My Day</span>
                </div>
                <div className="text-text-secondary text-[11px] mt-0.5">ActionBot Day Synthesizer</div>
              </motion.button>
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
};
