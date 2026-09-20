import React, { useState } from "react";
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Trash2, 
  RotateCcw, 
  Edit3, 
  Sparkles, 
  Calendar, 
  Tag, 
  Repeat, 
  Paperclip, 
  CheckCircle2, 
  Circle, 
  GripVertical,
  ChevronDown,
  ChevronUp,
  X,
  FileText
} from "lucide-react";
import { Task, WorkspaceType, PriorityLevel, RecurringSchedule, TaskStatus } from "../types";

interface SmartTaskManagerProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id" | "createdAt">) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: number) => void;
  onToggleTask: (id: number) => void;
  onRestoreTask?: (id: number) => void;
  activeWorkspace: WorkspaceType;
  workspaces: WorkspaceType[];
  onOpenQuickCapture: () => void;
}

export const SmartTaskManager: React.FC<SmartTaskManagerProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
  onRestoreTask,
  activeWorkspace,
  workspaces,
  onOpenQuickCapture
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [tagFilter, setTagFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"order" | "deadline" | "priority" | "name">("order");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Editing state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [breakdownLoadingId, setBreakdownLoadingId] = useState<number | null>(null);
  const [expandedSubtasksId, setExpandedSubtasksId] = useState<number | null>(null);

  // All unique tags across tasks
  const allTags = Array.from(new Set(tasks.flatMap((t) => t.tags || [])));

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    // Workspace
    if (activeWorkspace !== "All" && t.workspace !== activeWorkspace) return false;
    // Status
    if (statusFilter === "pending" && t.completed) return false;
    if (statusFilter === "completed" && !t.completed) return false;
    // Priority
    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
    // Tag
    if (tagFilter !== "ALL" && !t.tags?.includes(tagFilter)) return false;
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchTag = t.tags?.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }
    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      const pMap: Record<PriorityLevel, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const diff = (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
      return sortDirection === "asc" ? diff : -diff;
    }
    if (sortBy === "name") {
      const diff = a.title.localeCompare(b.title);
      return sortDirection === "asc" ? diff : -diff;
    }
    if (sortBy === "deadline") {
      const diff = (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
      return sortDirection === "asc" ? diff : -diff;
    }
    // Default manual order
    const orderA = a.order ?? a.id;
    const orderB = b.order ?? b.id;
    return sortDirection === "asc" ? orderA - orderB : orderB - orderA;
  });

  // AI Task Breakdown Trigger
  const handleAIBreakdown = async (task: Task) => {
    setBreakdownLoadingId(task.id);
    try {
      const res = await fetch("/api/breakdown-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskTitle: task.title })
      });
      const data = await res.json();
      if (data.subtasks && Array.isArray(data.subtasks)) {
        const newSubtasks = data.subtasks.map((st: { title: string } | string, idx: number) => ({
          id: Date.now() + idx,
          title: typeof st === "string" ? st : st.title,
          completed: false
        }));
        onUpdateTask({
          ...task,
          subtasks: [...(task.subtasks || []), ...newSubtasks]
        });
        setExpandedSubtasksId(task.id);
      }
    } catch {
      // Local heuristic fallback
      const fallback = [
        { id: Date.now() + 1, title: `Step 1: Outline parameters for ${task.title}`, completed: false },
        { id: Date.now() + 2, title: `Step 2: Execute draft implementation`, completed: false },
        { id: Date.now() + 3, title: `Step 3: Verify and complete final checklist`, completed: false }
      ];
      onUpdateTask({
        ...task,
        subtasks: [...(task.subtasks || []), ...fallback]
      });
      setExpandedSubtasksId(task.id);
    } finally {
      setBreakdownLoadingId(null);
    }
  };

  const handleToggleSubtask = (task: Task, subtaskId: number) => {
    const updated = (task.subtasks || []).map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdateTask({ ...task, subtasks: updated });
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData("text/plain", String(id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (draggedTaskId === null || draggedTaskId === targetId) return;

    const sourceIndex = sortedTasks.findIndex((t) => t.id === draggedTaskId);
    const targetIndex = sortedTasks.findIndex((t) => t.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const reordered = [...sortedTasks];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    // Update order values
    reordered.forEach((t, idx) => {
      onUpdateTask({ ...t, order: idx });
    });
    setDraggedTaskId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-hairline">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary font-semibold mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Smart Task Engine</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Tasks & Objectives • {activeWorkspace}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {sortedTasks.filter((t) => !t.completed).length} active • {sortedTasks.filter((t) => t.completed).length} completed
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenQuickCapture}
            className="apple-btn px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Ribbon */}
      <div className="p-4 rounded-2xl bg-surface border border-border-hairline apple-shadow-float flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, or #tag..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-surface-muted border border-border-hairline text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center bg-surface-muted p-1 rounded-xl text-xs font-medium text-text-secondary">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              statusFilter === "all" ? "bg-surface text-text-primary font-semibold shadow-xs" : ""
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              statusFilter === "pending" ? "bg-surface text-text-primary font-semibold shadow-xs" : ""
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("completed")}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              statusFilter === "completed" ? "bg-surface text-text-primary font-semibold shadow-xs" : ""
            }`}
          >
            Done
          </button>
        </div>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-surface-muted border border-border-hairline text-xs font-mono text-text-secondary cursor-pointer"
        >
          <option value="ALL">All Priorities</option>
          <option value="URGENT">! Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface-muted border border-border-hairline text-xs font-mono text-text-secondary cursor-pointer"
          >
            <option value="ALL">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>#{tag}</option>
            ))}
          </select>
        )}

        {/* Sort Selector */}
        <div className="flex items-center gap-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "order" | "deadline" | "priority" | "name")}
            className="px-3 py-1.5 rounded-xl bg-surface-muted border border-border-hairline text-xs font-mono text-text-secondary cursor-pointer"
          >
            <option value="order">Custom Order</option>
            <option value="deadline">Deadline</option>
            <option value="priority">Priority</option>
            <option value="name">Alphabetical</option>
          </select>
          <button
            type="button"
            onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
            className="p-1.5 rounded-xl bg-surface-muted hover:bg-surface-container border border-border-hairline text-text-secondary cursor-pointer"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task List Container */}
      <div className="space-y-3">
        {sortedTasks.map((task) => {
          const isExpanded = expandedSubtasksId === task.id;
          const hasSubtasks = task.subtasks && task.subtasks.length > 0;
          const completedSubCount = task.subtasks ? task.subtasks.filter((s) => s.completed).length : 0;

          return (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, task.id)}
              className={`rounded-3xl border apple-shadow-float transition-all bg-surface overflow-hidden ${
                task.completed
                  ? "border-border-hairline opacity-70"
                  : task.priority === "URGENT"
                  ? "border-red-500/30 hover:border-red-500/50"
                  : "border-border-hairline hover:border-primary/40"
              }`}
            >
              <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
                
                {/* Drag Handle & Checkbox */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    className="mt-1 text-text-tertiary hover:text-text-secondary cursor-grab active:cursor-grabbing shrink-0"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 text-text-secondary hover:text-primary transition-colors cursor-pointer shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-text-tertiary hover:text-primary" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <span
                        className={`text-sm font-semibold tracking-tight ${
                          task.completed ? "line-through text-text-tertiary" : "text-text-primary"
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Priority Badge */}
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
                      {task.priority === "MEDIUM" && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-mono">
                          MED
                        </span>
                      )}
                      {task.priority === "LOW" && (
                        <span className="px-2 py-0.5 rounded-md bg-surface-muted text-text-tertiary border border-border-hairline text-[10px] font-mono">
                          LOW
                        </span>
                      )}

                      {/* Recurring Schedule badge */}
                      {task.recurring && task.recurring !== "none" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[10px] font-mono">
                          <Repeat className="w-3 h-3" />
                          <span>{task.recurring}</span>
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p className="text-xs text-text-secondary line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata & Tag Badges */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-text-tertiary font-mono">
                      {task.deadline && (
                        <span className="inline-flex items-center gap-1 text-text-secondary">
                          <Calendar className="w-3 h-3" />
                          <span>{task.deadline}</span>
                        </span>
                      )}

                      {task.category && (
                        <span className="px-2 py-0.5 rounded-md bg-surface-muted text-text-secondary border border-border-hairline">
                          {task.category}
                        </span>
                      )}

                      {task.tags && task.tags.map((tg) => (
                        <span key={tg} className="text-primary hover:underline cursor-pointer">
                          #{tg}
                        </span>
                      ))}

                      {task.attachments && task.attachments.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-text-secondary">
                          <Paperclip className="w-3 h-3" />
                          <span>{task.attachments.length} files</span>
                        </span>
                      )}

                      {hasSubtasks && (
                        <button
                          type="button"
                          onClick={() => setExpandedSubtasksId(isExpanded ? null : task.id)}
                          className="inline-flex items-center gap-1 text-primary hover:underline cursor-pointer font-semibold"
                        >
                          <span>{completedSubCount}/{task.subtasks.length} subtasks</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Tools: AI Breakdown, Edit, Delete */}
                <div className="flex items-center gap-1.5 shrink-0">
                  
                  {/* AI Task Breakdown */}
                  <button
                    type="button"
                    onClick={() => handleAIBreakdown(task)}
                    disabled={breakdownLoadingId === task.id}
                    className="p-1.5 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="AI Task Breakdown into 5 subtasks"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${breakdownLoadingId === task.id ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline text-[11px]">Break Down</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingTask(task)}
                    className="p-1.5 rounded-xl hover:bg-surface-muted text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    title="Edit Task"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 rounded-xl hover:bg-red-500/10 text-text-tertiary hover:text-red-500 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Collapsible Subtasks Checklist */}
              {isExpanded && hasSubtasks && (
                <div className="px-5 pb-4 pt-2 border-t border-border-hairline bg-surface-muted/40 space-y-2">
                  <div className="text-[11px] font-mono text-text-secondary uppercase tracking-wider">
                    Action Subtasks Checklist
                  </div>
                  <div className="space-y-1.5">
                    {task.subtasks.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => handleToggleSubtask(task, st.id)}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-surface border border-border-hairline text-xs cursor-pointer hover:border-primary/40 transition-colors"
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          st.completed ? "bg-primary border-primary text-white" : "border-border-hairline"
                        }`}>
                          {st.completed && <span className="text-[10px]">✓</span>}
                        </div>
                        <span className={`flex-1 ${st.completed ? "line-through text-text-tertiary" : "text-text-primary font-medium"}`}>
                          {st.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {sortedTasks.length === 0 && (
          <div className="p-12 text-center rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-3">
            <CheckSquare className="w-10 h-10 mx-auto text-text-tertiary" />
            <h4 className="font-bold text-sm text-text-primary">No tasks match your criteria</h4>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Clear your filters or capture a new task using the natural language Quick Add.
            </p>
            <button
              type="button"
              onClick={onOpenQuickCapture}
              className="apple-btn px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-surface border border-border-hairline apple-shadow-float p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <h3 className="font-bold text-sm text-text-primary">Edit Task Details</h3>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="w-7 h-7 rounded-full hover:bg-surface-container flex items-center justify-center text-text-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-text-secondary block mb-1">Title</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-muted border border-border-hairline text-sm text-text-primary"
                />
              </div>

              <div>
                <label className="text-xs text-text-secondary block mb-1">Description</label>
                <textarea
                  value={editingTask.description || ""}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-muted border border-border-hairline text-xs text-text-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Priority</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as PriorityLevel })}
                    className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs"
                  >
                    <option value="URGENT">URGENT</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Workspace</label>
                  <select
                    value={editingTask.workspace}
                    onChange={(e) => setEditingTask({ ...editingTask, workspace: e.target.value })}
                    className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs"
                  >
                    {workspaces.map((ws) => (
                      <option key={ws} value={ws}>{ws}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Deadline Text</label>
                  <input
                    type="text"
                    value={editingTask.deadline || ""}
                    onChange={(e) => setEditingTask({ ...editingTask, deadline: e.target.value })}
                    className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Recurring Rule</label>
                  <select
                    value={editingTask.recurring || "none"}
                    onChange={(e) => setEditingTask({ ...editingTask, recurring: e.target.value as RecurringSchedule })}
                    className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs"
                  >
                    <option value="none">No Repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border-hairline">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 rounded-full border border-border-hairline hover:bg-surface-muted text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateTask(editingTask);
                  setEditingTask(null);
                }}
                className="apple-btn px-5 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
