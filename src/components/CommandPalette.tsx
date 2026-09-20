import React, { useState, useEffect } from "react";
import { 
  Search, 
  CheckSquare, 
  Target, 
  Calendar, 
  FileText, 
  Clock, 
  FolderKanban, 
  Sparkles, 
  ArrowRight, 
  X,
  Plus,
  Compass,
  Command
} from "lucide-react";
import { Task, Project, Goal, CalendarEvent, Note, WorkspaceType } from "../types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  projects: Project[];
  goals: Goal[];
  events: CalendarEvent[];
  notes: Note[];
  workspaces: WorkspaceType[];
  onSelectWorkspace: (ws: WorkspaceType) => void;
  onNavigateTab: (tab: string) => void;
  onOpenQuickCapture: () => void;
  onOpenCopilot: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tasks,
  projects,
  goals,
  events,
  notes,
  workspaces,
  onSelectWorkspace,
  onNavigateTab,
  onOpenQuickCapture,
  onOpenCopilot
}) => {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "tasks" | "projects" | "notes" | "goals" | "events">("all");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search Results
  const matchedTasks = tasks.filter((t) =>
    (filterType === "all" || filterType === "tasks") &&
    (!q || t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.tags?.some((tg) => tg.toLowerCase().includes(q)))
  ).slice(0, 5);

  const matchedProjects = projects.filter((p) =>
    (filterType === "all" || filterType === "projects") &&
    (!q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
  ).slice(0, 3);

  const matchedNotes = notes.filter((n) =>
    (filterType === "all" || filterType === "notes") &&
    (!q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
  ).slice(0, 4);

  const matchedGoals = goals.filter((g) =>
    (filterType === "all" || filterType === "goals") &&
    (!q || g.title.toLowerCase().includes(q))
  ).slice(0, 3);

  const matchedEvents = events.filter((e) =>
    (filterType === "all" || filterType === "events") &&
    (!q || e.title.toLowerCase().includes(q))
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-3xl bg-surface border border-border-hairline apple-shadow-dark overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Header Input */}
        <div className="p-4 sm:p-5 border-b border-border-hairline flex items-center gap-3 bg-surface">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search tasks, notes, goals, spaces..."
            className="w-full text-base bg-transparent border-none text-text-primary focus:outline-none placeholder:text-text-tertiary"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-text-tertiary hover:text-text-primary cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[11px] font-mono text-text-tertiary px-2 py-0.5 rounded-md bg-surface-muted border border-border-hairline">
            ESC
          </span>
        </div>

        {/* Quick Filter Ribbon */}
        <div className="px-5 py-2 border-b border-border-hairline bg-surface-muted/50 flex items-center gap-1.5 overflow-x-auto text-xs font-mono text-text-secondary">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-2.5 py-1 rounded-lg cursor-pointer ${filterType === "all" ? "bg-surface text-primary font-bold shadow-xs" : ""}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterType("tasks")}
            className={`px-2.5 py-1 rounded-lg cursor-pointer ${filterType === "tasks" ? "bg-surface text-primary font-bold shadow-xs" : ""}`}
          >
            Tasks
          </button>
          <button
            type="button"
            onClick={() => setFilterType("notes")}
            className={`px-2.5 py-1 rounded-lg cursor-pointer ${filterType === "notes" ? "bg-surface text-primary font-bold shadow-xs" : ""}`}
          >
            Notes
          </button>
          <button
            type="button"
            onClick={() => setFilterType("goals")}
            className={`px-2.5 py-1 rounded-lg cursor-pointer ${filterType === "goals" ? "bg-surface text-primary font-bold shadow-xs" : ""}`}
          >
            Goals
          </button>
          <button
            type="button"
            onClick={() => setFilterType("projects")}
            className={`px-2.5 py-1 rounded-lg cursor-pointer ${filterType === "projects" ? "bg-surface text-primary font-bold shadow-xs" : ""}`}
          >
            Spaces
          </button>
        </div>

        {/* Results Stream */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Quick Command Actions */}
          {!query && (
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary px-2">
                Fast Commands
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenQuickCapture();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-muted/60 hover:bg-surface-container border border-border-hairline text-left transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-primary" />
                  <div>
                    <div className="font-semibold text-text-primary">Quick Capture Task</div>
                    <div className="text-[10px] text-text-tertiary">Natural language parser</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCopilot();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-muted/60 hover:bg-surface-container border border-border-hairline text-left transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                  <div>
                    <div className="font-semibold text-text-primary">ActionBot Copilot</div>
                    <div className="text-[10px] text-text-tertiary">Synthesize day & schedule</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTab("focus");
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-muted/60 hover:bg-surface-container border border-border-hairline text-left transition-colors cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="font-semibold text-text-primary">Start Focus Mode</div>
                    <div className="text-[10px] text-text-tertiary">Pomodoro + soundscapes</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTab("calendar");
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-muted/60 hover:bg-surface-container border border-border-hairline text-left transition-colors cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="font-semibold text-text-primary">Open Calendar</div>
                    <div className="text-[10px] text-text-tertiary">Month & week schedule</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Matched Tasks */}
          {matchedTasks.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary px-2">
                Tasks ({matchedTasks.length})
              </div>
              {matchedTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    onClose();
                    onNavigateTab("tasks");
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-muted/40 hover:bg-surface-container border border-border-hairline cursor-pointer text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <CheckSquare className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-text-primary font-medium truncate">{t.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-text-tertiary shrink-0 ml-2">{t.workspace}</span>
                </div>
              ))}
            </div>
          )}

          {/* Matched Notes */}
          {matchedNotes.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary px-2">
                Notes ({matchedNotes.length})
              </div>
              {matchedNotes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    onClose();
                    onNavigateTab("notes");
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-muted/40 hover:bg-surface-container border border-border-hairline cursor-pointer text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-text-primary font-medium truncate">{n.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-text-tertiary shrink-0 ml-2">{n.workspace}</span>
                </div>
              ))}
            </div>
          )}

          {/* Matched Goals */}
          {matchedGoals.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary px-2">
                Goals ({matchedGoals.length})
              </div>
              {matchedGoals.map((g) => (
                <div
                  key={g.id}
                  onClick={() => {
                    onClose();
                    onNavigateTab("goals");
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-muted/40 hover:bg-surface-container border border-border-hairline cursor-pointer text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Target className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-text-primary font-medium truncate">{g.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold shrink-0 ml-2">{g.progress}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Switch Spaces */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary px-2">
              Jump to Space
            </div>
            <div className="flex flex-wrap gap-1.5 px-2">
              {workspaces.map((ws) => (
                <button
                  key={ws}
                  type="button"
                  onClick={() => {
                    onSelectWorkspace(ws);
                    onClose();
                    onNavigateTab("dashboard");
                  }}
                  className="px-2.5 py-1 rounded-lg bg-surface-muted hover:bg-surface-container border border-border-hairline text-xs font-mono text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
                >
                  {ws}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border-hairline bg-surface-muted/50 flex items-center justify-between text-[11px] font-mono text-text-tertiary px-5">
          <span>Use ⌘K anytime to open</span>
          <span>Aethel Command Engine</span>
        </div>

      </div>
    </div>
  );
};
