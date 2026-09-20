import React, { useState } from "react";
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Calendar, 
  Layers, 
  Trash2, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  TrendingUp
} from "lucide-react";
import { Goal, Task, WorkspaceType } from "../types";

interface GoalsManagerProps {
  goals: Goal[];
  tasks: Task[];
  onAddGoal: (goal: Omit<Goal, "id">) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (id: number) => void;
  activeWorkspace: WorkspaceType;
  workspaces: WorkspaceType[];
  onOpenQuickCapture: () => void;
}

export const GoalsManager: React.FC<GoalsManagerProps> = ({
  goals,
  tasks,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  activeWorkspace,
  workspaces,
  onOpenQuickCapture
}) => {
  const [timeFrameFilter, setTimeFrameFilter] = useState<"all" | "daily" | "weekly" | "monthly" | "long_term">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [aiDecomposingId, setAiDecomposingId] = useState<number | null>(null);

  // New goal state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeFrame, setTimeFrame] = useState<"daily" | "weekly" | "monthly" | "long_term">("monthly");
  const [workspace, setWorkspace] = useState<WorkspaceType>(activeWorkspace);
  const [deadline, setDeadline] = useState("End of Month");
  const [milestonesText, setMilestonesText] = useState("");

  const filteredGoals = goals.filter((g) => {
    if (activeWorkspace !== "All" && g.workspace !== activeWorkspace) return false;
    if (timeFrameFilter !== "all" && g.timeFrame !== timeFrameFilter) return false;
    return true;
  });

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedMilestones = milestonesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((m, idx) => ({ id: Date.now() + idx, title: m, completed: false }));

    onAddGoal({
      title: title.trim(),
      description: description.trim(),
      timeFrame,
      progress: 0,
      workspace,
      deadline,
      milestones: parsedMilestones.length > 0 ? parsedMilestones : [
        { id: Date.now() + 1, title: "Initial research and setup", completed: false },
        { id: Date.now() + 2, title: "Execute core milestone", completed: false },
        { id: Date.now() + 3, title: "Review results and complete", completed: false }
      ]
    });

    setTitle("");
    setDescription("");
    setMilestonesText("");
    setShowAddModal(false);
  };

  const handleToggleMilestone = (goal: Goal, milestoneId: number) => {
    const updatedMilestones = goal.milestones.map((ms) =>
      ms.id === milestoneId ? { ...ms, completed: !ms.completed } : ms
    );
    const completedCount = updatedMilestones.filter((ms) => ms.completed).length;
    const progress = Math.round((completedCount / updatedMilestones.length) * 100);

    onUpdateGoal({
      ...goal,
      milestones: updatedMilestones,
      progress
    });
  };

  const handleAIDecomposeGoal = async (goal: Goal) => {
    setAiDecomposingId(goal.id);
    try {
      const res = await fetch("/api/breakdown-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskTitle: `Goal: ${goal.title}` })
      });
      const data = await res.json();
      if (data.subtasks && Array.isArray(data.subtasks)) {
        const newMs = data.subtasks.map((st: { title: string } | string, idx: number) => ({
          id: Date.now() + idx,
          title: typeof st === "string" ? st : st.title,
          completed: false
        }));
        const combined = [...goal.milestones, ...newMs];
        const completedCount = combined.filter((ms) => ms.completed).length;
        const progress = Math.round((completedCount / combined.length) * 100);
        onUpdateGoal({ ...goal, milestones: combined, progress });
      }
    } catch {
      // Fallback
      const fallbackMs = [
        { id: Date.now() + 1, title: "Phase 1: Architecture blueprint", completed: false },
        { id: Date.now() + 2, title: "Phase 2: Core feature delivery", completed: false },
        { id: Date.now() + 3, title: "Phase 3: Validation and launch", completed: false }
      ];
      const combined = [...goal.milestones, ...fallbackMs];
      onUpdateGoal({ ...goal, milestones: combined });
    } finally {
      setAiDecomposingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-hairline">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-600 font-semibold mb-1">
            <Target className="w-4 h-4" />
            <span>Strategic Goals & Progress Engine</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Goals & Milestones • {activeWorkspace}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Track daily, weekly, monthly, and long-term milestones with calculated progress
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="apple-btn px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Strategic Goal</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center bg-surface-muted p-1 rounded-2xl border border-border-hairline text-xs font-medium text-text-secondary w-fit">
        <button
          type="button"
          onClick={() => setTimeFrameFilter("all")}
          className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
            timeFrameFilter === "all" ? "bg-surface text-text-primary font-semibold shadow-xs" : ""
          }`}
        >
          All Horizons
        </button>
        <button
          type="button"
          onClick={() => setTimeFrameFilter("daily")}
          className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
            timeFrameFilter === "daily" ? "bg-surface text-text-primary font-semibold shadow-xs" : ""
          }`}
        >
          Daily
        </button>
        <button
          type="button"
          onClick={() => setTimeFrameFilter("weekly")}
          className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
            timeFrameFilter === "weekly" ? "bg-surface text-text-primary font-semibold shadow-xs" : ""
          }`}
        >
          Weekly
        </button>
        <button
          type="button"
          onClick={() => setTimeFrameFilter("monthly")}
          className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
            timeFrameFilter === "monthly" ? "bg-surface text-text-primary font-semibold shadow-xs" : ""
          }`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setTimeFrameFilter("long_term")}
          className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
            timeFrameFilter === "long_term" ? "bg-surface text-text-primary font-semibold shadow-xs" : ""
          }`}
        >
          Long-Term
        </button>
      </div>

      {/* Goals Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGoals.map((goal) => (
          <div
            key={goal.id}
            className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-mono uppercase">
                      {goal.timeFrame.replace("_", " ")}
                    </span>
                    <span className="text-xs font-mono text-text-tertiary">{goal.workspace}</span>
                  </div>
                  <h3 className="text-base font-bold text-text-primary mt-1.5">{goal.title}</h3>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-emerald-600">{goal.progress}%</div>
                  <div className="text-[10px] font-mono text-text-tertiary">
                    {goal.milestones.filter((m) => m.completed).length}/{goal.milestones.length} milestones
                  </div>
                </div>
              </div>

              {goal.description && (
                <p className="text-xs text-text-secondary mt-2">{goal.description}</p>
              )}

              {/* Progress Bar */}
              <div className="w-full bg-surface-container rounded-full h-2 mt-4 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>

              {/* Milestones Checklist */}
              <div className="mt-5 space-y-2">
                <div className="text-[11px] font-mono text-text-secondary uppercase tracking-wider flex items-center justify-between">
                  <span>Key Milestones</span>
                  <button
                    type="button"
                    onClick={() => handleAIDecomposeGoal(goal)}
                    disabled={aiDecomposingId === goal.id}
                    className="text-primary hover:underline flex items-center gap-1 cursor-pointer normal-case text-xs font-medium"
                  >
                    <Sparkles className={`w-3 h-3 ${aiDecomposingId === goal.id ? "animate-spin" : ""}`} />
                    <span>AI Decompose</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {goal.milestones.map((ms) => (
                    <div
                      key={ms.id}
                      onClick={() => handleToggleMilestone(goal, ms.id)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-muted/60 border border-border-hairline hover:border-primary/30 transition-colors cursor-pointer text-xs"
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                        ms.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-border-hairline"
                      }`}>
                        {ms.completed && <span className="text-[10px]">✓</span>}
                      </div>
                      <span className={`flex-1 ${ms.completed ? "line-through text-text-tertiary" : "text-text-primary"}`}>
                        {ms.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border-hairline flex items-center justify-between text-xs text-text-tertiary font-mono">
              <span>Target: {goal.deadline || "Continuous"}</span>
              <button
                type="button"
                onClick={() => onDeleteGoal(goal.id)}
                className="hover:text-red-500 cursor-pointer"
                title="Delete Goal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-surface border border-border-hairline apple-shadow-float p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <h3 className="font-bold text-sm text-text-primary">Create Strategic Goal</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full hover:bg-surface-container flex items-center justify-center text-text-secondary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="text-xs text-text-secondary block mb-1">Goal Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Distributed Systems or Score 95%+ in Finals"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-muted border border-border-hairline text-sm text-text-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-text-secondary block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Why this goal matters and what success looks like..."
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-muted border border-border-hairline text-xs text-text-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Time Horizon</label>
                  <select
                    value={timeFrame}
                    onChange={(e) => setTimeFrame(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs"
                  >
                    <option value="daily">Daily Goal</option>
                    <option value="weekly">Weekly Goal</option>
                    <option value="monthly">Monthly Goal</option>
                    <option value="long_term">Long-Term Goal</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-text-secondary block mb-1">Workspace</label>
                  <select
                    value={workspace}
                    onChange={(e) => setWorkspace(e.target.value)}
                    className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs"
                  >
                    {workspaces.map((ws) => (
                      <option key={ws} value={ws}>{ws}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-text-secondary block mb-1">Target Deadline</label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    placeholder="e.g. Oct 25"
                    className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-text-secondary block mb-1">
                  Milestones (1 per line)
                </label>
                <textarea
                  value={milestonesText}
                  onChange={(e) => setMilestonesText(e.target.value)}
                  rows={3}
                  placeholder="Complete theoretical notes&#10;Solve past questions&#10;Simulate timed mock exam"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-muted border border-border-hairline text-xs text-text-primary resize-none font-mono"
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
                  disabled={!title.trim()}
                  className="apple-btn px-5 py-2 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
