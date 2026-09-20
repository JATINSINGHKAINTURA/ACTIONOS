import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  Tag, 
  CheckSquare, 
  GraduationCap, 
  Briefcase, 
  AlertCircle,
  X,
  Sparkles
} from "lucide-react";
import { CalendarEvent, Task, WorkspaceType } from "../types";

interface CalendarViewProps {
  events: CalendarEvent[];
  tasks: Task[];
  onAddEvent: (event: Omit<CalendarEvent, "id">) => void;
  onDeleteEvent: (id: number) => void;
  onToggleTask?: (id: number) => void;
  onOpenTimetableStudio?: () => void;
  activeWorkspace: WorkspaceType;
  workspaces: WorkspaceType[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  tasks,
  onAddEvent,
  onDeleteEvent,
  onToggleTask,
  onOpenTimetableStudio,
  activeWorkspace,
  workspaces
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().slice(0, 10));

  // New event form state
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"deadline" | "meeting" | "study" | "task" | "event">("event");
  const [newStartTime, setNewStartTime] = useState("10:00");
  const [newEndTime, setNewEndTime] = useState("11:00");
  const [newWorkspace, setNewWorkspace] = useState<WorkspaceType>(activeWorkspace);
  const [newNotes, setNewNotes] = useState("");

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === "week") {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 86400000));
    }
  };

  const nextPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === "week") {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 86400000));
    }
  };

  // Combine calendar events + tasks with due dates
  const taskEvents: CalendarEvent[] = tasks
    .filter((t) => t.dueDate && (activeWorkspace === "All" || t.workspace === activeWorkspace))
    .map((t) => ({
      id: 10000 + t.id,
      title: `Task: ${t.title}`,
      startDate: t.dueDate!,
      startTime: t.dueTime || "12:00",
      endDate: t.dueDate!,
      endTime: t.dueTime || "13:00",
      type: t.priority === "URGENT" ? "deadline" : "task",
      workspace: t.workspace,
      taskId: t.id,
      notes: t.description
    }));

  const allFilteredEvents = [
    ...events.filter((e) => activeWorkspace === "All" || e.workspace === activeWorkspace),
    ...taskEvents
  ];

  // Month calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddEvent({
      title: newTitle.trim(),
      startDate: selectedDateStr,
      startTime: newStartTime,
      endDate: selectedDateStr,
      endTime: newEndTime,
      type: newType,
      workspace: newWorkspace,
      notes: newNotes.trim()
    });

    setNewTitle("");
    setNewNotes("");
    setShowAddModal(false);
  };

  const openDateModal = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setShowAddModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header with Month / Week / Day toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-hairline">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary font-semibold mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Integrated Productivity Calendar</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            {monthNames[month]} {year}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Showing all synced tasks, deadlines, and events for {activeWorkspace}
          </p>
        </div>

        {/* View Mode Switcher & Controls */}
        <div className="flex items-center flex-wrap gap-2">
          
          <div className="flex items-center bg-surface-muted p-1 rounded-full border border-border-hairline text-xs font-medium text-text-secondary">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                viewMode === "month" ? "bg-surface text-text-primary font-semibold shadow-xs" : ""
              }`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                viewMode === "week" ? "bg-surface text-text-primary font-semibold shadow-xs" : ""
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                viewMode === "day" ? "bg-surface text-text-primary font-semibold shadow-xs" : ""
              }`}
            >
              Day
            </button>
          </div>

          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-full border border-border-hairline">
            <button
              type="button"
              onClick={prevPeriod}
              className="p-1.5 rounded-full hover:bg-surface text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentDate(new Date())}
              className="px-2.5 py-1 text-xs font-mono text-text-primary hover:bg-surface rounded-full cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={nextPeriod}
              className="p-1.5 rounded-full hover:bg-surface text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedDateStr(new Date().toISOString().slice(0, 10));
              setShowAddModal(true);
            }}
            className="apple-btn px-4 py-1.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Month Grid View */}
      {viewMode === "month" && (
        <div className="rounded-3xl bg-surface border border-border-hairline apple-shadow-float overflow-hidden p-4 sm:p-6 space-y-4">
          
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono text-text-secondary font-semibold uppercase tracking-wider pb-2 border-b border-border-hairline">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            
            {/* Empty prefix boxes for month offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-24 sm:h-32 rounded-2xl bg-surface-muted/20 border border-transparent" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNumber = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
              const isToday = new Date().toISOString().slice(0, 10) === dateStr;

              const dayEvents = allFilteredEvents.filter((e) => e.startDate === dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => openDateModal(dateStr)}
                  className={`h-24 sm:h-32 p-2 rounded-2xl border transition-all cursor-pointer overflow-hidden flex flex-col justify-between group ${
                    isToday
                      ? "bg-primary/5 border-primary/40 shadow-xs"
                      : "bg-surface-muted/50 border-border-hairline hover:border-primary/30 hover:bg-surface-muted"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded-full ${
                        isToday ? "bg-primary text-white" : "text-text-primary group-hover:text-primary"
                      }`}
                    >
                      {dayNumber}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-mono text-text-tertiary">
                        {dayEvents.length} item{dayEvents.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1 overflow-y-auto max-h-[70%]">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono truncate border ${
                          ev.type === "deadline"
                            ? "bg-red-500/10 border-red-500/30 text-red-700 font-bold"
                            : ev.type === "meeting"
                            ? "bg-purple-500/10 border-purple-500/30 text-purple-700"
                            : ev.type === "study"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700"
                            : "bg-primary/10 border-primary/30 text-primary font-medium"
                        }`}
                        title={`${ev.title} (${ev.startTime || ""})`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[9px] font-mono text-text-tertiary">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week / Day View */}
      {viewMode !== "month" && (
        <div className="rounded-3xl bg-surface border border-border-hairline apple-shadow-float p-6 space-y-4">
          <div className="text-xs font-mono text-text-secondary uppercase">
            {viewMode === "week" ? "Week Timeline" : "Day Schedule"}
          </div>

          <div className="space-y-3">
            {allFilteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-surface-muted/60 border border-border-hairline hover:border-primary/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    ev.type === "deadline" ? "bg-red-500" :
                    ev.type === "meeting" ? "bg-purple-500" :
                    ev.type === "study" ? "bg-emerald-500" : "bg-primary"
                  }`} />
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{ev.title}</div>
                    <div className="text-xs text-text-secondary font-mono mt-0.5">
                      {ev.startDate} • {ev.startTime || "All Day"} - {ev.endTime || ""} • {ev.workspace}
                    </div>
                    {ev.notes && <p className="text-xs text-text-tertiary mt-1">{ev.notes}</p>}
                  </div>
                </div>

                {ev.id < 10000 && (
                  <button
                    type="button"
                    onClick={() => onDeleteEvent(ev.id)}
                    className="text-text-tertiary hover:text-red-500 p-2 cursor-pointer"
                    title="Delete Event"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {allFilteredEvents.length === 0 && (
              <div className="text-center py-10 text-xs text-text-tertiary space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto text-text-tertiary" />
                <p>No events scheduled for this period.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-surface border border-border-hairline apple-shadow-float p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <h3 className="font-bold text-sm text-text-primary">Schedule New Event</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full hover:bg-surface-container flex items-center justify-center text-text-secondary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="text-xs text-text-secondary block mb-1">Event / Deadline Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. DBMS Midterm Exam or Sprint Review"
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border-hairline text-xs text-text-primary"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Event Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs"
                  >
                    <option value="event">General Event</option>
                    <option value="deadline">Critical Deadline</option>
                    <option value="meeting">Team Meeting</option>
                    <option value="study">Study Session</option>
                    <option value="task">Task Schedule</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-text-secondary block mb-1">Workspace</label>
                  <select
                    value={newWorkspace}
                    onChange={(e) => setNewWorkspace(e.target.value)}
                    className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs"
                  >
                    {workspaces.map((ws) => (
                      <option key={ws} value={ws}>{ws}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedDateStr}
                    onChange={(e) => setSelectedDateStr(e.target.value)}
                    className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1">End Time</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-text-secondary block mb-1">Notes / Location (Optional)</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  placeholder="Room number, agenda link, or prep notes..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border-hairline text-xs text-text-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border-hairline">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full border border-border-hairline hover:bg-surface-muted text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="apple-btn px-5 py-2 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
