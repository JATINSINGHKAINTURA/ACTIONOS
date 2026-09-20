import React, { useState } from "react";
import { Sparkles, Check, X, Calendar, Tag, AlertCircle, Briefcase, Plus, Trash2 } from "lucide-react";
import { Task, WorkspaceType, PriorityLevel, RecurringSchedule } from "../types";

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, "id" | "createdAt">) => void;
  activeWorkspace: WorkspaceType;
  workspaces: WorkspaceType[];
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  activeWorkspace,
  workspaces
}) => {
  const [input, setInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [hasParsed, setHasParsed] = useState(false);

  // Editable parsed fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("Today 18:00");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueTime, setDueTime] = useState("18:00");
  const [priority, setPriority] = useState<PriorityLevel>("MEDIUM");
  const [workspace, setWorkspace] = useState<WorkspaceType>(activeWorkspace);
  const [category, setCategory] = useState("General");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<{ id: number; title: string; completed: boolean }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [recurring, setRecurring] = useState<RecurringSchedule>("none");

  if (!isOpen) return null;

  const handleParse = async (textToParse: string) => {
    const text = textToParse.trim();
    if (!text) return;

    setIsParsing(true);
    try {
      const res = await fetch("/api/quick-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text })
      });
      const data = await res.json();
      
      setTitle(data.title || text);
      setDeadline(data.deadline || "Today");
      setPriority((data.priority as PriorityLevel) || "MEDIUM");
      setCategory(data.category || "General");
      if (data.workspace && workspaces.includes(data.workspace)) {
        setWorkspace(data.workspace);
      } else {
        setWorkspace(activeWorkspace);
      }

      // Infer tags from words starting with #
      const extractedTags: string[] = [];
      const tagMatches = text.match(/#[a-z0-9_-]+/gi);
      if (tagMatches) {
        tagMatches.forEach((t) => extractedTags.push(t.replace("#", "").toLowerCase()));
      }
      if (data.category && !extractedTags.includes(data.category.toLowerCase())) {
        extractedTags.push(data.category.toLowerCase());
      }
      setTags(extractedTags);

      setHasParsed(true);
    } catch {
      // Offline heuristic fallback
      setTitle(text);
      setDeadline("Today 18:00");
      setPriority("MEDIUM");
      setWorkspace(activeWorkspace);
      setCategory("General");
      setHasParsed(true);
    } finally {
      setIsParsing(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      setSubtasks([
        ...subtasks,
        { id: Date.now(), title: newSubtaskTitle.trim(), completed: false }
      ]);
      setNewSubtaskTitle("");
    }
  };

  const handleRemoveSubtask = (id: number) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      deadline: deadline.trim() || `${dueDate} ${dueTime}`,
      dueDate,
      dueTime,
      priority,
      workspace,
      category,
      tags,
      subtasks,
      attachments: [],
      recurring,
      status: "pending",
      order: Date.now()
    });

    // Reset & close
    setInput("");
    setHasParsed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-surface border border-border-hairline apple-shadow-float overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-border-hairline flex items-center justify-between bg-surface-muted/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-text-primary">Universal Quick Capture</h3>
              <p className="text-[11px] text-text-secondary">Type natural thoughts — our smart engine identifies parameters</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-surface-container flex items-center justify-center text-text-secondary cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Natural Language Prompt Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary block">
              Natural Language Ingestion
            </label>
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleParse(input);
                  }
                }}
                rows={2}
                placeholder="e.g. Finish my resume before Monday. or DBMS study session tomorrow at 4pm !urgent #college"
                className="w-full p-3.5 rounded-2xl bg-surface-muted border border-border-hairline text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-text-tertiary resize-none font-mono"
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleParse(input)}
                disabled={!input.trim() || isParsing}
                className="absolute right-3 bottom-3 px-3 py-1 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                {isParsing ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>Detect</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-text-tertiary font-mono">
              <span>Try:</span>
              <button
                type="button"
                onClick={() => {
                  const text = "Finish my resume before Monday.";
                  setInput(text);
                  handleParse(text);
                }}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                "Finish my resume before Monday"
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  const text = "Prepare DBMS assignment Friday 17:00 !urgent";
                  setInput(text);
                  handleParse(text);
                }}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                "Prepare DBMS assignment Friday 17:00 !urgent"
              </button>
            </div>
          </div>

          {/* Editable Parsed Fields (Always visible for editing) */}
          <div className="pt-2 border-t border-border-hairline space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                {hasParsed ? "Verified Task Details" : "Manual / Refined Details"}
              </span>
              {hasParsed && (
                <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ready to save
                </span>
              )}
            </div>

            {/* Task Title */}
            <div>
              <label className="text-xs text-text-secondary block mb-1">Task Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-3.5 py-2 rounded-xl bg-surface-muted border border-border-hairline text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-text-secondary block mb-1">Description / Notes (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Key specifications, links, or context..."
                className="w-full px-3.5 py-2 rounded-xl bg-surface-muted border border-border-hairline text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* 3-Column Attributes: Workspace, Priority, Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-text-secondary block mb-1">Space / Workspace</label>
                <select
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value)}
                  className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs text-text-primary"
                >
                  {workspaces.map((ws) => (
                    <option key={ws} value={ws}>{ws}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-text-secondary block mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className={`w-full p-2 rounded-xl border text-xs font-semibold ${
                    priority === "URGENT"
                      ? "bg-red-500/10 border-red-500/30 text-red-600"
                      : priority === "HIGH"
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : priority === "MEDIUM"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
                      : "bg-surface-muted border-border-hairline text-text-secondary"
                  }`}
                >
                  <option value="URGENT">! URGENT</option>
                  <option value="HIGH">HIGH Priority</option>
                  <option value="MEDIUM">MEDIUM Priority</option>
                  <option value="LOW">LOW Priority</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-text-secondary block mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Academics, Work"
                  className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs text-text-primary"
                />
              </div>
            </div>

            {/* Deadline & Date / Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-text-secondary block mb-1">Natural Deadline</label>
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="e.g. Monday 5:00 PM"
                  className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs font-mono text-text-primary"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary block mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary block mb-1">Recurring Schedule</label>
                <select
                  value={recurring}
                  onChange={(e) => setRecurring(e.target.value as RecurringSchedule)}
                  className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs"
                >
                  <option value="none">No Repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            {/* Subtasks Section */}
            <div className="space-y-2">
              <label className="text-xs text-text-secondary block">Actionable Subtasks</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  placeholder="Add a step..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-surface-muted border border-border-hairline text-xs text-text-primary"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-container border border-border-hairline text-xs font-medium cursor-pointer"
                >
                  Add Step
                </button>
              </div>

              {subtasks.length > 0 && (
                <div className="space-y-1 mt-2">
                  {subtasks.map((st) => (
                    <div key={st.id} className="flex items-center justify-between p-2 rounded-lg bg-surface-muted text-xs">
                      <span className="text-text-primary font-mono">• {st.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(st.id)}
                        className="text-text-tertiary hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-xs text-text-secondary block">Tags</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tag and press Enter..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-surface-muted border border-border-hairline text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-container border border-border-hairline text-xs cursor-pointer"
                >
                  Tag
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-mono border border-primary/20"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-hairline bg-surface-muted/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-border-hairline hover:bg-surface text-xs font-medium text-text-secondary cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim()}
            className="apple-btn px-6 py-2 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-semibold shadow-sm cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirm & Add Task</span>
          </button>
        </div>

      </div>
    </div>
  );
};
