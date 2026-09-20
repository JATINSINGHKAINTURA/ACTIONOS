import React from "react";
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Target, 
  Flame, 
  PieChart,
  Calendar,
  Layers
} from "lucide-react";
import { Task, FocusSession, Goal, WorkspaceType } from "../types";

interface AnalyticsViewProps {
  tasks: Task[];
  focusSessions: FocusSession[];
  goals: Goal[];
  activeWorkspace: WorkspaceType;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  tasks,
  focusSessions,
  goals,
  activeWorkspace
}) => {
  const completedTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);
  const totalFocusMinutes = focusSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const focusHours = (totalFocusMinutes / 60).toFixed(1);

  // Group tasks by category
  const categoryCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    const cat = t.category || "General";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Group tasks by workspace
  const workspaceCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    workspaceCounts[t.workspace] = (workspaceCounts[t.workspace] || 0) + 1;
  });

  // Weekly dummy data for visual velocity chart
  const weeklyData = [
    { day: "Mon", count: 6, focus: 110 },
    { day: "Tue", count: 8, focus: 140 },
    { day: "Wed", count: 5, focus: 90 },
    { day: "Thu", count: 9, focus: 160 },
    { day: "Fri", count: 7, focus: 130 },
    { day: "Sat", count: 4, focus: 60 },
    { day: "Sun", count: 3, focus: 45 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="pb-6 border-b border-border-hairline">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary font-semibold mb-1">
          <BarChart3 className="w-4 h-4" />
          <span>Cognitive Velocity & Analytics</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Productivity Analytics & Velocity
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Comprehensive analysis of your deep work habits, completion rates, and focus output
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float">
          <div className="text-xs font-mono text-text-secondary uppercase">Tasks Completed</div>
          <div className="text-3xl font-bold text-emerald-600 mt-2">{completedTasks.length}</div>
          <div className="text-[11px] text-text-tertiary mt-1">{pendingTasks.length} in progress</div>
        </div>

        <div className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float">
          <div className="text-xs font-mono text-text-secondary uppercase">Total Deep Work</div>
          <div className="text-3xl font-bold text-primary mt-2">{focusHours} hrs</div>
          <div className="text-[11px] text-text-tertiary mt-1">{focusSessions.length} logged sprints</div>
        </div>

        <div className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float">
          <div className="text-xs font-mono text-text-secondary uppercase">Active Goals</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">{goals.length}</div>
          <div className="text-[11px] text-text-tertiary mt-1">Across all horizons</div>
        </div>

        <div className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float">
          <div className="text-xs font-mono text-text-secondary uppercase">Completion Efficiency</div>
          <div className="text-3xl font-bold text-amber-500 mt-2">
            {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 100}%
          </div>
          <div className="text-[11px] text-text-tertiary mt-1">High-focus trajectory</div>
        </div>
      </div>

      {/* Weekly Velocity Chart */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-text-primary">Weekly Deep Work & Task Velocity</h3>
            <p className="text-xs text-text-secondary mt-0.5">Tasks delivered and focus minutes per day</p>
          </div>
          <span className="text-xs font-mono text-primary font-bold">This Week</span>
        </div>

        {/* Minimal High-Craft CSS Bar Chart */}
        <div className="grid grid-cols-7 gap-3 sm:gap-6 items-end h-48 pt-6 pb-2 border-b border-border-hairline">
          {weeklyData.map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-2 h-full justify-end group">
              <div className="text-[10px] font-mono text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">
                {d.focus}m
              </div>
              <div className="w-full max-w-[36px] bg-surface-container rounded-t-xl overflow-hidden flex flex-col justify-end h-36">
                <div
                  className="w-full bg-primary group-hover:bg-primary-hover transition-all duration-300 rounded-t-xl"
                  style={{ height: `${(d.focus / 180) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono font-semibold text-text-secondary">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Workspace Task Distribution */}
        <div className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4">
          <h3 className="font-bold text-sm text-text-primary">Tasks by Space</h3>
          <div className="space-y-3">
            {Object.entries(workspaceCounts).map(([ws, count]) => {
              const pct = Math.round((count / tasks.length) * 100);
              return (
                <div key={ws} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text-primary font-semibold">{ws}</span>
                    <span className="text-text-tertiary">{count} tasks ({pct}%)</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4">
          <h3 className="font-bold text-sm text-text-primary">Category Distribution</h3>
          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / tasks.length) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text-primary font-semibold">{cat}</span>
                    <span className="text-text-tertiary">{count} tasks ({pct}%)</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
