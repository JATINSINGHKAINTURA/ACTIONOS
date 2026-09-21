import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Task, 
  Project, 
  Goal, 
  CalendarEvent, 
  Note, 
  SubjectAttendance, 
  FocusSession, 
  DevRepository,
  WorkspaceType, 
  ProductivityTemplate 
} from "./types";
import { 
  initialTasks, 
  initialProjects, 
  initialGoals, 
  initialEvents, 
  initialNotes, 
  initialAttendance, 
  initialRepositories, 
  initialFocusSessions, 
  workspacesList 
} from "./utils/initialData";
import { soundscapeEngine } from "./utils/audio";

import { Navbar } from "./components/Navbar";
import { UniversalDashboard } from "./components/UniversalDashboard";
import { SmartTaskManager } from "./components/SmartTaskManager";
import { ProjectsManager } from "./components/ProjectsManager";
import { CalendarView } from "./components/CalendarView";
import { GoalsManager } from "./components/GoalsManager";
import { FocusModeView } from "./components/FocusModeView";
import { NotesView } from "./components/NotesView";
import { StudentWorkspaceView } from "./components/StudentWorkspaceView";
import { WorkWorkspaceView } from "./components/WorkWorkspaceView";
import { DeveloperWorkspaceView } from "./components/DeveloperWorkspaceView";
import { AnalyticsView } from "./components/AnalyticsView";
import { DeveloperProfile } from "./components/DeveloperProfile";
import { OverviewShowcase } from "./components/OverviewShowcase";
import { HomepageInfo } from "./components/HomepageInfo";
import { ScrollProgressBar, MotionBackToTopButton } from "./components/MotionGraphics";

// Modals & Drawers
import { QuickCaptureModal } from "./components/QuickCaptureModal";
import { CommandPalette } from "./components/CommandPalette";
import { ActionBotDrawer } from "./components/ActionBotDrawer";
import { StudyPlannerModal } from "./components/StudyPlannerModal";
import { MeetingActionsModal } from "./components/MeetingActionsModal";
import { TimetableStudioModal } from "./components/TimetableStudioModal";
import { TemplatesModal } from "./components/TemplatesModal";

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("aethel_theme") as "dark" | "light") || "light";
  });

  // Active Tab & Workspace
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem("aethel_active_tab") || "home";
  });

  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>(() => {
    return (localStorage.getItem("aethel_workspace") as WorkspaceType) || "All";
  });

  // Soundscape audio state
  const [audioMode, setAudioMode] = useState<"off" | "drone" | "pink" | "rain">("off");

  // Core Persistent State
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("aethel_tasks_v2");
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("aethel_projects_v2");
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("aethel_goals_v2");
    return saved ? JSON.parse(saved) : initialGoals;
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem("aethel_events_v2");
    return saved ? JSON.parse(saved) : initialEvents;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("aethel_notes_v2");
    return saved ? JSON.parse(saved) : initialNotes;
  });

  const [attendance, setAttendance] = useState<SubjectAttendance[]>(() => {
    const saved = localStorage.getItem("aethel_attendance_v2");
    return saved ? JSON.parse(saved) : initialAttendance;
  });

  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => {
    const saved = localStorage.getItem("aethel_sessions_v2");
    return saved ? JSON.parse(saved) : initialFocusSessions;
  });

  const [repositories, setRepositories] = useState<DevRepository[]>(initialRepositories);

  // Modals visibility
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isStudyPlannerOpen, setIsStudyPlannerOpen] = useState(false);
  const [isMeetingActionsOpen, setIsMeetingActionsOpen] = useState(false);
  const [isTimetableStudioOpen, setIsTimetableStudioOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem("aethel_theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("aethel_active_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("aethel_workspace", activeWorkspace);
  }, [activeWorkspace]);

  useEffect(() => {
    localStorage.setItem("aethel_tasks_v2", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("aethel_projects_v2", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("aethel_goals_v2", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("aethel_events_v2", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("aethel_notes_v2", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("aethel_attendance_v2", JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem("aethel_sessions_v2", JSON.stringify(focusSessions));
  }, [focusSessions]);

  // Global Keyboard Shortcuts (⌘K, Q, P, C, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === "q" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsQuickCaptureOpen(true);
      } else if (e.key.toLowerCase() === "p" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setActiveTab("focus");
      } else if (e.key.toLowerCase() === "c" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setActiveTab("calendar");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Task Handlers
  const handleAddTask = (newTask: Omit<Task, "id" | "createdAt">) => {
    const created: Task = {
      ...newTask,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [created, ...prev]);
  };

  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleToggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const completed = !t.completed;
          return {
            ...t,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Project Handlers
  const handleAddProject = (newProject: Omit<Project, "id">) => {
    setProjects((prev) => [{ ...newProject, id: Date.now() }, ...prev]);
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProject = (id: number) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Goal Handlers
  const handleAddGoal = (newGoal: Omit<Goal, "id">) => {
    setGoals((prev) => [{ ...newGoal, id: Date.now() }, ...prev]);
  };

  const handleUpdateGoal = (updated: Goal) => {
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  };

  const handleDeleteGoal = (id: number) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Event Handlers
  const handleAddEvent = (newEvent: Omit<CalendarEvent, "id">) => {
    setEvents((prev) => [{ ...newEvent, id: Date.now() }, ...prev]);
  };

  const handleDeleteEvent = (id: number) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Note Handlers
  const handleAddNote = (newNote: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    setNotes((prev) => [
      {
        ...newNote,
        id: Date.now(),
        createdAt: now,
        updatedAt: now
      },
      ...prev
    ]);
  };

  const handleUpdateNote = (updated: Note) => {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  const handleDeleteNote = (id: number) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleConvertNoteToTask = (note: Note) => {
    handleAddTask({
      title: `[From Note] ${note.title}`,
      description: note.content.slice(0, 200),
      deadline: "This week",
      dueDate: new Date().toISOString().slice(0, 10),
      priority: "MEDIUM",
      workspace: note.workspace,
      category: "Notes",
      tags: [...note.tags, "from-note"],
      subtasks: [],
      attachments: [],
      recurring: "none",
      status: "pending"
    });
    setActiveTab("tasks");
  };

  // Attendance Handlers
  const handleUpdateAttendance = (updated: SubjectAttendance) => {
    setAttendance((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleAddSubject = (newSubject: Omit<SubjectAttendance, "id">) => {
    setAttendance((prev) => [{ ...newSubject, id: Date.now() }, ...prev]);
  };

  const handleDeleteSubject = (id: number) => {
    setAttendance((prev) => prev.filter((a) => a.id !== id));
  };

  // Focus Session Handler
  const handleAddFocusSession = (session: Omit<FocusSession, "id">) => {
    setFocusSessions((prev) => [{ ...session, id: Date.now() }, ...prev]);
  };

  // Template Injection
  const handleApplyTemplate = (template: ProductivityTemplate, targetWorkspace: WorkspaceType) => {
    const createdTasks = template.tasks.map((t, idx) => ({
      id: Date.now() + idx,
      title: t.title,
      description: `Template generated: ${template.name}`,
      deadline: "Upcoming",
      dueDate: new Date().toISOString().slice(0, 10),
      priority: t.priority,
      workspace: targetWorkspace === "All" ? "Personal" : targetWorkspace,
      category: template.category,
      tags: ["template", template.category],
      subtasks: [],
      attachments: [],
      recurring: "none",
      status: "pending",
      createdAt: new Date().toISOString()
    })) as Task[];

    setTasks((prev) => [...createdTasks, ...prev]);

    if (template.goals) {
      const createdGoals = template.goals.map((g, idx) => ({
        id: Date.now() + 100 + idx,
        title: g.title,
        description: `Template: ${template.name}`,
        timeFrame: "monthly",
        progress: 0,
        workspace: targetWorkspace === "All" ? "Personal" : targetWorkspace,
        deadline: "Next Month",
        milestones: [
          { id: Date.now() + 1, title: "Kickoff & setup", completed: false },
          { id: Date.now() + 2, title: "Milestone completion", completed: false }
        ]
      })) as Goal[];

      setGoals((prev) => [...createdGoals, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col antialiased selection:bg-primary/20 selection:text-primary transition-colors duration-200 relative">
      
      {/* Scroll Progress Bar with Spring Physics */}
      <ScrollProgressBar />

      {/* 1. Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
        workspaces={workspacesList}
        theme={theme}
        toggleTheme={toggleTheme}
        audioMode={audioMode}
        setAudioMode={setAudioMode}
        onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
      />

      {/* 2. Main Workspace Stage with Framer Motion Page Transitions */}
      <main className="flex-1 px-4 sm:px-8 py-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {(activeTab === "home" || activeTab === "overview") && (
              <HomepageInfo
                onEnterApp={setActiveTab}
                onSelectWorkspace={setActiveWorkspace}
              />
            )}

            {activeTab === "showcase" && (
              <OverviewShowcase
                onEnterApp={setActiveTab}
                onSelectWorkspace={setActiveWorkspace}
              />
            )}

            {activeTab === "dashboard" && (
              <UniversalDashboard
                tasks={tasks}
                projects={projects}
                goals={goals}
                events={events}
                notes={notes}
                attendance={attendance}
                focusSessions={focusSessions}
                activeWorkspace={activeWorkspace}
                onToggleTask={handleToggleTask}
                onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
                onOpenFocusMode={() => setActiveTab("focus")}
                onOpenCalendar={() => setActiveTab("calendar")}
                onOpenCopilot={() => setIsCopilotOpen(true)}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === "tasks" && (
              <SmartTaskManager
                tasks={tasks}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                activeWorkspace={activeWorkspace}
                workspaces={workspacesList}
                onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
              />
            )}

            {activeTab === "projects" && (
              <ProjectsManager
                projects={projects}
                tasks={tasks}
                onAddProject={handleAddProject}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
                onToggleTask={handleToggleTask}
                onAddTask={handleAddTask}
                activeWorkspace={activeWorkspace}
                workspaces={workspacesList}
              />
            )}

            {activeTab === "calendar" && (
              <CalendarView
                events={events}
                tasks={tasks}
                onAddEvent={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
                onToggleTask={handleToggleTask}
                activeWorkspace={activeWorkspace}
                workspaces={workspacesList}
                onOpenTimetableStudio={() => setIsTimetableStudioOpen(true)}
              />
            )}

            {activeTab === "goals" && (
              <GoalsManager
                goals={goals}
                tasks={tasks}
                onAddGoal={handleAddGoal}
                onUpdateGoal={handleUpdateGoal}
                onDeleteGoal={handleDeleteGoal}
                activeWorkspace={activeWorkspace}
                workspaces={workspacesList}
                onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
              />
            )}

            {activeTab === "focus" && (
              <FocusModeView
                tasks={tasks}
                focusSessions={focusSessions}
                onAddFocusSession={handleAddFocusSession}
                activeWorkspace={activeWorkspace}
                audioMode={audioMode}
                setAudioMode={setAudioMode}
              />
            )}

            {activeTab === "notes" && (
              <NotesView
                notes={notes}
                onAddNote={handleAddNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
                onConvertNoteToTask={handleConvertNoteToTask}
                activeWorkspace={activeWorkspace}
                workspaces={workspacesList}
              />
            )}

            {activeTab === "student" && (
              <StudentWorkspaceView
                attendance={attendance}
                onUpdateAttendance={handleUpdateAttendance}
                onAddSubject={handleAddSubject}
                onDeleteSubject={handleDeleteSubject}
                tasks={tasks}
                notes={notes}
                events={events}
                onOpenStudyPlanner={() => setIsStudyPlannerOpen(true)}
                onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === "work" && (
              <WorkWorkspaceView
                tasks={tasks}
                projects={projects}
                notes={notes}
                events={events}
                onOpenMeetingActions={() => setIsMeetingActionsOpen(true)}
                onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
                onToggleTask={handleToggleTask}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === "developer" && (
              <DeveloperWorkspaceView
                repositories={repositories}
                tasks={tasks}
                onAddTask={handleAddTask}
                onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
                onToggleTask={handleToggleTask}
              />
            )}

            {activeTab === "analytics" && (
              <AnalyticsView
                tasks={tasks}
                focusSessions={focusSessions}
                goals={goals}
                activeWorkspace={activeWorkspace}
              />
            )}

            {activeTab === "creator" && (
              <DeveloperProfile />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Motion Controls */}
      <MotionBackToTopButton />

      {/* 3. Global Modal Components */}
      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onAddTask={handleAddTask}
        activeWorkspace={activeWorkspace}
        workspaces={workspacesList}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={tasks}
        projects={projects}
        goals={goals}
        events={events}
        notes={notes}
        workspaces={workspacesList}
        onSelectWorkspace={setActiveWorkspace}
        onNavigateTab={setActiveTab}
        onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      <ActionBotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        tasks={tasks}
        projects={projects}
        goals={goals}
        notes={notes}
        activeWorkspace={activeWorkspace}
        onAddTask={handleAddTask}
      />

      <StudyPlannerModal
        isOpen={isStudyPlannerOpen}
        onClose={() => setIsStudyPlannerOpen(false)}
        onAddGeneratedTasks={(newTasks) => {
          newTasks.forEach((t) => handleAddTask(t));
        }}
      />

      <MeetingActionsModal
        isOpen={isMeetingActionsOpen}
        onClose={() => setIsMeetingActionsOpen(false)}
        onAddGeneratedTasks={(newTasks) => {
          newTasks.forEach((t) => handleAddTask(t));
        }}
      />

      <TimetableStudioModal
        isOpen={isTimetableStudioOpen}
        onClose={() => setIsTimetableStudioOpen(false)}
        onAddGeneratedEvents={(newEvents) => {
          newEvents.forEach((e) => handleAddEvent(e));
        }}
        activeWorkspace={activeWorkspace}
      />

      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onApplyTemplate={handleApplyTemplate}
        activeWorkspace={activeWorkspace}
        workspaces={workspacesList}
      />

      {/* 4. Global Footer */}
      <footer className="mt-16 py-6 border-t border-border-hairline text-center text-xs font-mono text-text-tertiary">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span>Aethel OS v2.0 • Sovereign Local-First Productivity Architecture</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab("creator")}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Created by Jatin Singh Kaintura
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Press ⌘K
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
