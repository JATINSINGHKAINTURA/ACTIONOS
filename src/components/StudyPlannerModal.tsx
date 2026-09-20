import React, { useState } from "react";
import { 
  Sparkles, 
  GraduationCap, 
  Calendar, 
  Clock, 
  Plus, 
  Check, 
  X, 
  BookOpen,
  ArrowRight
} from "lucide-react";
import { Task, WorkspaceType } from "../types";

interface StudyPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGeneratedTasks: (tasks: Omit<Task, "id" | "createdAt">[]) => void;
}

export const StudyPlannerModal: React.FC<StudyPlannerModalProps> = ({
  isOpen,
  onClose,
  onAddGeneratedTasks
}) => {
  const [examName, setExamName] = useState("Distributed Operating Systems End-Semester");
  const [examDate, setExamDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
  const [dailyHours, setDailyHours] = useState(3);
  const [syllabus, setSyllabus] = useState("Unit 1: IPC & RPC\nUnit 2: Mutual Exclusion & Election Algorithms\nUnit 3: Distributed File Systems (NFS/GFS)\nUnit 4: Fault Tolerance & Paxos Consensus");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any[] | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || !syllabus.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/study-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examName,
          examDate,
          dailyHours,
          syllabus
        })
      });
      const data = await res.json();
      if (data.plan && Array.isArray(data.plan)) {
        setGeneratedPlan(data.plan);
      } else {
        throw new Error("Invalid structure");
      }
    } catch {
      // Offline fallback
      setGeneratedPlan([
        {
          phase: "Phase 1: Foundation & Theory",
          durationDays: 4,
          tasks: [
            "Review Unit 1: IPC, Sockets, and RPC Semantics",
            "Synthesize Unit 2: Ricart-Agrawala & Bully Algorithms"
          ]
        },
        {
          phase: "Phase 2: Deep Dive & Architectures",
          durationDays: 5,
          tasks: [
            "Deconstruct NFS vs GFS file system architectures",
            "Study Paxos & Raft state machine replication protocols"
          ]
        },
        {
          phase: "Phase 3: Active Recall & Mock Tests",
          durationDays: 4,
          tasks: [
            "Solve past 5-year exam question papers",
            "Simulate 3-hour timed mock exam"
          ]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInjectTasks = () => {
    if (!generatedPlan) return;

    const tasksToCreate: Omit<Task, "id" | "createdAt">[] = [];
    generatedPlan.forEach((phase) => {
      phase.tasks.forEach((tStr: string, idx: number) => {
        tasksToCreate.push({
          title: `[Exam Prep] ${tStr}`,
          description: `Part of ${phase.phase} for ${examName}`,
          deadline: "Before Exam",
          dueDate: examDate,
          priority: idx === 0 ? "HIGH" : "MEDIUM",
          workspace: "College",
          category: "Exams",
          tags: ["study", "exam", "revision"],
          subtasks: [
            { id: Date.now() + Math.random(), title: "Active recall session", completed: false },
            { id: Date.now() + Math.random(), title: "Self-assessment quiz", completed: false }
          ],
          attachments: [],
          recurring: "none",
          status: "pending"
        });
      });
    });

    onAddGeneratedTasks(tasksToCreate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-surface border border-border-hairline apple-shadow-float overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-border-hairline flex items-center justify-between bg-surface-muted/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-text-primary">AI Exam Revision & Study Planner</h3>
              <p className="text-[11px] font-mono text-emerald-600">Cognitive pacing and milestone decomposition</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-text-secondary cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form or Generated Result */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {!generatedPlan ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary block mb-1 font-semibold">Course / Exam Title</label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-hairline text-sm text-text-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Target Exam Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Available Daily Study Hours</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-text-secondary block mb-1 font-semibold">Syllabus / Topics to Cover</label>
                <textarea
                  value={syllabus}
                  onChange={(e) => setSyllabus(e.target.value)}
                  rows={5}
                  placeholder="Paste syllabus modules or chapters here..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-hairline text-xs text-text-primary resize-none font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="apple-btn px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isLoading ? "Synthesizing Roadmap..." : "Generate AI Study Schedule"}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 space-y-1">
                <div className="font-bold">Personalized Revision Roadmap Created</div>
                <div>Targeting {examName} by {examDate} with {dailyHours}h daily deep work.</div>
              </div>

              <div className="space-y-3">
                {generatedPlan.map((phase, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-surface-muted/60 border border-border-hairline space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                      <span>{phase.phase}</span>
                      <span className="text-[11px] font-mono text-emerald-600">{phase.durationDays} days</span>
                    </div>
                    <ul className="space-y-1 pl-2">
                      {phase.tasks.map((t: string, tIdx: number) => (
                        <li key={tIdx} className="text-xs text-text-secondary flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border-hairline">
                <button
                  type="button"
                  onClick={() => setGeneratedPlan(null)}
                  className="px-4 py-2 rounded-full border border-border-hairline hover:bg-surface-muted text-xs font-medium cursor-pointer"
                >
                  Back to Form
                </button>
                <button
                  type="button"
                  onClick={handleInjectTasks}
                  className="apple-btn px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Inject Tasks into College Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
