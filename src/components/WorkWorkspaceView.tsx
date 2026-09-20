import React from "react";
import { 
  Briefcase, 
  Users, 
  Calendar, 
  CheckSquare, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  Plus, 
  TrendingUp, 
  Clock,
  CheckCircle2
} from "lucide-react";
import { Task, Project, Note, CalendarEvent } from "../types";

interface WorkWorkspaceViewProps {
  tasks: Task[];
  projects: Project[];
  notes: Note[];
  events: CalendarEvent[];
  onOpenMeetingActions: () => void;
  onOpenQuickCapture: () => void;
  onToggleTask: (id: number) => void;
  onNavigateTab: (tab: string) => void;
}

export const WorkWorkspaceView: React.FC<WorkWorkspaceViewProps> = ({
  tasks,
  projects,
  notes,
  events,
  onOpenMeetingActions,
  onOpenQuickCapture,
  onToggleTask,
  onNavigateTab
}) => {
  const workTasks = tasks.filter((t) => t.workspace === "Work");
  const workProjects = projects.filter((p) => p.workspace === "Work");
  const workNotes = notes.filter((n) => n.workspace === "Work");
  const workEvents = events.filter((e) => e.workspace === "Work");

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-hairline">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-purple-600 font-semibold mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Enterprise & Client Operations</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Professional Work Workspace
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage client deliverables, meeting agendas, and team action items
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMeetingActions}
            className="apple-btn px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Extract Meeting Action Items</span>
          </button>
          <button
            type="button"
            onClick={onOpenQuickCapture}
            className="px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold cursor-pointer"
          >
            + New Work Task
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Work Tasks & Projects (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Work Deliverables */}
          <div className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-text-primary">Active Work Deliverables</h3>
              </div>
              <span className="text-xs font-mono text-text-tertiary">{workTasks.length} tasks</span>
            </div>

            <div className="space-y-2.5">
              {workTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-muted/50 border border-border-hairline text-xs"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      className="w-4 h-4 rounded-full border border-border-hairline hover:border-purple-600 cursor-pointer"
                    />
                    <div>
                      <div className={`font-semibold ${task.completed ? "line-through text-text-tertiary" : "text-text-primary"}`}>
                        {task.title}
                      </div>
                      <div className="text-[11px] font-mono text-text-tertiary mt-0.5">
                        Due: {task.deadline || "This sprint"} • {task.priority}
                      </div>
                    </div>
                  </div>
                  {task.priority === "URGENT" && (
                    <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 border border-red-500/20 text-[10px] font-mono font-bold">
                      URGENT
                    </span>
                  )}
                </div>
              ))}

              {workTasks.length === 0 && (
                <div className="text-center py-6 text-xs text-text-tertiary">
                  No work tasks found. Capture tasks from meeting notes!
                </div>
              )}
            </div>
          </div>

          {/* Work Projects */}
          <div className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <h3 className="font-bold text-sm text-text-primary">Corporate Projects</h3>
              <span className="text-xs font-mono text-text-tertiary">{workProjects.length} projects</span>
            </div>

            <div className="space-y-3">
              {workProjects.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-surface-muted/50 border border-border-hairline space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">{p.title}</span>
                    <span className="text-xs font-mono font-bold text-purple-600">{p.progress}%</span>
                  </div>
                  <p className="text-[11px] text-text-secondary">{p.description}</p>
                  <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                    <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Upcoming Meetings & Meeting Notes (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Upcoming Meetings & Syncs */}
          <div className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-text-primary">Upcoming Syncs & Meetings</h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {workEvents.map((ev) => (
                <div key={ev.id} className="p-3 rounded-2xl bg-surface-muted/50 border border-border-hairline text-xs space-y-1">
                  <div className="font-semibold text-text-primary">{ev.title}</div>
                  <div className="text-[11px] font-mono text-text-secondary">
                    {ev.startDate} at {ev.startTime || "09:30"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meeting Notes */}
          <div className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-text-primary">Meeting Summaries</h3>
              </div>
              <button
                type="button"
                onClick={onOpenMeetingActions}
                className="text-xs text-purple-600 hover:underline cursor-pointer"
              >
                AI Extract
              </button>
            </div>

            <div className="space-y-2">
              {workNotes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => onNavigateTab("notes")}
                  className="p-3.5 rounded-2xl bg-surface-muted/50 border border-border-hairline hover:border-purple-500/40 transition-all cursor-pointer space-y-1"
                >
                  <div className="text-xs font-bold text-text-primary">{n.title}</div>
                  <p className="text-[11px] text-text-secondary font-mono line-clamp-2">
                    {n.content.replace(/[#*`]/g, "")}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
