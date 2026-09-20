import React, { useState } from "react";
import { 
  Code2, 
  GitBranch, 
  GitPullRequest, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  Plus, 
  Terminal, 
  Layers, 
  Sparkles, 
  CheckSquare, 
  Play, 
  FolderGit2, 
  Server,
  FileCode
} from "lucide-react";
import { DevRepository, Task, WorkspaceType } from "../types";

interface DeveloperWorkspaceViewProps {
  repositories: DevRepository[];
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id" | "createdAt">) => void;
  onOpenQuickCapture: () => void;
  onToggleTask: (id: number) => void;
}

export const DeveloperWorkspaceView: React.FC<DeveloperWorkspaceViewProps> = ({
  repositories,
  tasks,
  onAddTask,
  onOpenQuickCapture,
  onToggleTask
}) => {
  const [selectedRepoId, setSelectedRepoId] = useState<number>(repositories[0]?.id || 1);
  const [activeTab, setActiveTab] = useState<"overview" | "issues" | "commits" | "snippets">("overview");

  const activeRepo = repositories.find((r) => r.id === selectedRepoId) || repositories[0];
  const devTasks = tasks.filter((t) => t.workspace === "Development");

  const handleConvertIssueToTask = (issue: { title: string; priority: any }) => {
    onAddTask({
      title: `[Issue] ${issue.title}`,
      description: `Imported from repo: ${activeRepo?.name}`,
      deadline: "This sprint",
      dueDate: new Date().toISOString().slice(0, 10),
      priority: issue.priority,
      workspace: "Development",
      category: "Engineering",
      tags: ["git", "issue", activeRepo?.name || "dev"],
      subtasks: [
        { id: Date.now() + 1, title: "Investigate root cause", completed: false },
        { id: Date.now() + 2, title: "Implement fix & write regression test", completed: false },
        { id: Date.now() + 3, title: "Create Pull Request", completed: false }
      ],
      attachments: [],
      recurring: "none",
      status: "pending"
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-hairline">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary font-semibold mb-1">
            <Terminal className="w-4 h-4" />
            <span>Engineering & Repository Suite</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Developer Workspace
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage Git repositories, bugs backlog, Pull Requests, and technical architecture
          </p>
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={onOpenQuickCapture}
          className="apple-btn px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Dev Task</span>
        </button>
      </div>

      {/* Repo Selector & Status Ribbon */}
      <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-border-hairline apple-shadow-float flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FolderGit2 className="w-5 h-5 text-primary" />
          <select
            value={selectedRepoId}
            onChange={(e) => setSelectedRepoId(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl bg-surface-muted border border-border-hairline text-xs font-bold font-mono text-text-primary cursor-pointer"
          >
            {repositories.map((repo) => (
              <option key={repo.id} value={repo.id}>
                {repo.name} ({repo.branch})
              </option>
            ))}
          </select>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{activeRepo?.deploymentStatus.toUpperCase()}</span>
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-surface-muted p-1 rounded-xl text-xs font-mono text-text-secondary">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
              activeTab === "overview" ? "bg-surface text-text-primary font-bold shadow-xs" : ""
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("issues")}
            className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
              activeTab === "issues" ? "bg-surface text-text-primary font-bold shadow-xs" : ""
            }`}
          >
            Issues ({activeRepo?.issues.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("commits")}
            className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
              activeTab === "commits" ? "bg-surface text-text-primary font-bold shadow-xs" : ""
            }`}
          >
            Commits ({activeRepo?.commits.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("snippets")}
            className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
              activeTab === "snippets" ? "bg-surface text-text-primary font-bold shadow-xs" : ""
            }`}
          >
            Code Snippets
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Engineering Tasks (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-sm text-text-primary">Sprint & Backlog Tasks</h3>
                </div>
                <span className="text-xs font-mono text-text-tertiary">{devTasks.length} items</span>
              </div>

              <div className="space-y-2.5">
                {devTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-muted/50 border border-border-hairline text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onToggleTask(t.id)}
                        className="w-4 h-4 rounded-full border border-border-hairline hover:border-primary cursor-pointer"
                      />
                      <div>
                        <div className={`font-semibold ${t.completed ? "line-through text-text-tertiary" : "text-text-primary"}`}>
                          {t.title}
                        </div>
                        <div className="text-[11px] font-mono text-text-tertiary mt-0.5">
                          {t.priority} • {t.tags?.map((tg) => `#${tg}`).join(" ")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commit Activity Stream */}
            <div className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-purple-600" />
                  <h3 className="font-bold text-sm text-text-primary">Recent Commit Stream</h3>
                </div>
                <span className="text-xs font-mono text-text-tertiary">branch: {activeRepo?.branch}</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {activeRepo?.commits.map((c) => (
                  <div key={c.hash} className="p-3 rounded-2xl bg-surface-muted/50 border border-border-hairline flex items-start justify-between">
                    <div>
                      <span className="text-primary font-bold">{c.hash}</span>
                      <p className="text-text-primary mt-1 font-sans text-xs">{c.msg}</p>
                      <span className="text-[10px] text-text-tertiary">{c.author} • {c.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Repository Metrics & Issue Quick Convert (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Repo Status Card */}
            <div className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
                <h3 className="font-bold text-sm text-text-primary">Repository Health</h3>
                <span className="text-xs font-mono text-emerald-600">Active Pipeline</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-surface-muted/50 border border-border-hairline text-center">
                  <div className="text-xs font-mono text-text-secondary">Open Issues</div>
                  <div className="text-2xl font-bold font-mono text-amber-500 mt-1">{activeRepo?.openIssues}</div>
                </div>
                <div className="p-3 rounded-2xl bg-surface-muted/50 border border-border-hairline text-center">
                  <div className="text-xs font-mono text-text-secondary">Pull Requests</div>
                  <div className="text-2xl font-bold font-mono text-purple-600 mt-1">{activeRepo?.openPRs}</div>
                </div>
              </div>

              <p className="text-xs text-text-secondary">{activeRepo?.description}</p>
            </div>

            {/* Open Issues -> Convert to Task */}
            <div className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-sm text-text-primary">Issues Backlog</h3>
                </div>
              </div>

              <div className="space-y-2">
                {activeRepo?.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-2xl bg-surface-muted/50 border border-border-hairline flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-text-primary">{issue.title}</div>
                      <span className="text-[10px] font-mono text-text-tertiary">#{issue.id} • {issue.tag}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConvertIssueToTask(issue)}
                      className="px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-medium cursor-pointer transition-colors"
                      title="Convert to actionable task"
                    >
                      + Track
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Issues Tab */}
      {activeTab === "issues" && (
        <div className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4">
          <h3 className="font-bold text-sm text-text-primary">All Issues for {activeRepo?.name}</h3>
          <div className="space-y-2">
            {activeRepo?.issues.map((issue) => (
              <div key={issue.id} className="p-4 rounded-2xl bg-surface-muted/50 border border-border-hairline flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-text-primary">{issue.title}</div>
                  <div className="text-xs font-mono text-text-tertiary mt-1">Issue #{issue.id} • Priority: {issue.priority}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleConvertIssueToTask(issue)}
                  className="apple-btn px-3 py-1.5 rounded-full bg-primary text-white text-xs font-semibold cursor-pointer"
                >
                  Create Task from Issue
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commits Tab */}
      {activeTab === "commits" && (
        <div className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4 font-mono">
          <h3 className="font-bold text-sm text-text-primary font-sans">Full Git History</h3>
          <div className="space-y-2">
            {activeRepo?.commits.map((c) => (
              <div key={c.hash} className="p-3.5 rounded-2xl bg-surface-muted/50 border border-border-hairline flex items-center justify-between text-xs">
                <div>
                  <span className="text-primary font-bold">{c.hash}</span>
                  <span className="ml-3 text-text-primary">{c.msg}</span>
                </div>
                <span className="text-text-tertiary text-[11px]">{c.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Snippets Tab */}
      {activeTab === "snippets" && (
        <div className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-text-primary">Architecture & Code Snippets Vault</h3>
            <span className="text-xs font-mono text-text-tertiary">TypeScript & WebAssembly</span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-surface-muted/70 border border-border-hairline space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-text-primary">432Hz Binaural Carrier Generator</span>
                <span className="text-[10px] font-mono text-text-tertiary">audio.ts</span>
              </div>
              <pre className="p-3 rounded-xl bg-dark-bg text-emerald-400 font-mono text-xs overflow-x-auto">
{`const osc = ctx.createOscillator();
const filter = ctx.createBiquadFilter();
filter.type = "lowpass";
filter.frequency.value = 520;
osc.type = "sine";
osc.frequency.value = 432;
osc.connect(filter);
filter.connect(gainNode);
osc.start();`}
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
