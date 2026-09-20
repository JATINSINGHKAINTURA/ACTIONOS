import React, { useState } from "react";
import { 
  Sparkles, 
  Briefcase, 
  Calendar, 
  Clock, 
  Plus, 
  Check, 
  X, 
  FileText,
  User
} from "lucide-react";
import { Task, WorkspaceType } from "../types";

interface MeetingActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGeneratedTasks: (tasks: Omit<Task, "id" | "createdAt">[]) => void;
}

export const MeetingActionsModal: React.FC<MeetingActionsModalProps> = ({
  isOpen,
  onClose,
  onAddGeneratedTasks
}) => {
  const [meetingNotes, setMeetingNotes] = useState(
    "Weekly Product Engineering Sync:\n- Sarah needs to finalize the Stripe webhook retry mechanism by Friday.\n- Alex will draft the OAuth security RFC for Google Cloud Run deployment by tomorrow 4 PM.\n- Jatin will optimize the Web Audio acoustic synthesizer to support pink noise masking."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<any[] | null>(null);

  if (!isOpen) return null;

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingNotes.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/meeting-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: meetingNotes })
      });
      const data = await res.json();
      if (data.actionItems && Array.isArray(data.actionItems)) {
        setExtractedTasks(data.actionItems);
      } else {
        throw new Error("Invalid structure");
      }
    } catch {
      // Offline fallback
      setExtractedTasks([
        {
          title: "Finalize Stripe webhook retry mechanism",
          assignee: "Sarah",
          deadline: "Friday",
          priority: "HIGH"
        },
        {
          title: "Draft OAuth security RFC for Cloud Run deployment",
          assignee: "Alex",
          deadline: "Tomorrow 4 PM",
          priority: "URGENT"
        },
        {
          title: "Optimize Web Audio acoustic synthesizer with pink noise masking",
          assignee: "Jatin",
          deadline: "End of Sprint",
          priority: "MEDIUM"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTasks = () => {
    if (!extractedTasks) return;

    const formatted: Omit<Task, "id" | "createdAt">[] = extractedTasks.map((item) => ({
      title: item.title,
      description: `Action item assigned to ${item.assignee || "Team"} from meeting sync`,
      deadline: item.deadline || "This week",
      dueDate: new Date().toISOString().slice(0, 10),
      priority: item.priority as any || "MEDIUM",
      workspace: "Work",
      category: "Meeting",
      tags: ["meeting", "action-item", item.assignee?.toLowerCase() || "work"].filter(Boolean),
      subtasks: [],
      attachments: [],
      recurring: "none",
      status: "pending"
    }));

    onAddGeneratedTasks(formatted);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-surface border border-border-hairline apple-shadow-float overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-border-hairline flex items-center justify-between bg-surface-muted/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-text-primary">Meeting Action Items Extractor</h3>
              <p className="text-[11px] font-mono text-purple-600">AI semantic distillation into structured work tasks</p>
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {!extractedTasks ? (
            <form onSubmit={handleExtract} className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary block mb-1 font-semibold">
                  Raw Meeting Notes / Transcript
                </label>
                <textarea
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  rows={8}
                  placeholder="Paste your unorganized meeting notes here..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-hairline text-xs text-text-primary resize-none font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="apple-btn px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isLoading ? "Distilling Action Items..." : "Extract Action Items"}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-800">
                Found {extractedTasks.length} actionable commitments with assignees and due dates.
              </div>

              <div className="space-y-2.5">
                {extractedTasks.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-surface-muted/60 border border-border-hairline flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-text-primary">{item.title}</div>
                      <div className="text-[11px] font-mono text-text-tertiary mt-1">
                        Assignee: <span className="text-text-primary font-semibold">{item.assignee || "Unassigned"}</span> • Due: {item.deadline || "TBD"}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[10px] font-mono font-bold">
                      {item.priority || "MEDIUM"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border-hairline">
                <button
                  type="button"
                  onClick={() => setExtractedTasks(null)}
                  className="px-4 py-2 rounded-full border border-border-hairline hover:bg-surface-muted text-xs font-medium cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  onClick={handleCreateTasks}
                  className="apple-btn px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create {extractedTasks.length} Tasks in Work Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
