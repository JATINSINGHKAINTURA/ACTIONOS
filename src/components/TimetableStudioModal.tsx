import React, { useState } from "react";
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  Plus, 
  Check, 
  X, 
  Layers, 
  Download, 
  Upload,
  ArrowRight
} from "lucide-react";
import { CalendarEvent, WorkspaceType } from "../types";

interface TimetableStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGeneratedEvents: (events: CalendarEvent[]) => void;
  activeWorkspace: WorkspaceType;
}

export const TimetableStudioModal: React.FC<TimetableStudioModalProps> = ({
  isOpen,
  onClose,
  onAddGeneratedEvents,
  activeWorkspace
}) => {
  const [prompt, setPrompt] = useState(
    "Create a balanced schedule for a CSE student with 4 hours of distributed systems & coding, 2 hours of gym/running, and core morning classes from 9 AM to 1 PM."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTimetable, setGeneratedTimetable] = useState<any[] | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/generate-timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, workspace: activeWorkspace })
      });
      const data = await res.json();
      if (data.schedule && Array.isArray(data.schedule)) {
        setGeneratedTimetable(data.schedule);
      } else {
        throw new Error("Invalid format");
      }
    } catch {
      // Offline fallback
      setGeneratedTimetable([
        { time: "09:00 - 11:00", title: "Core Lectures: Operating Systems & Algorithms", category: "College" },
        { time: "11:15 - 13:00", title: "Lab: Distributed Systems RPC Simulation", category: "College" },
        { time: "13:00 - 14:00", title: "Nutrition & Mindful Recharge", category: "Personal" },
        { time: "14:30 - 17:00", title: "Deep Work: Web Audio & SQLite Kernel Coding", category: "Development" },
        { time: "17:30 - 19:00", title: "Athletic Training / High-Intensity Workout", category: "Personal" },
        { time: "20:00 - 21:30", title: "Reading & Research Paper Review", category: "Personal" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToCalendar = () => {
    if (!generatedTimetable) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const eventsToCreate: CalendarEvent[] = generatedTimetable.map((slot, idx) => {
      const [start, end] = slot.time.split(" - ");
      return {
        id: Date.now() + idx,
        title: slot.title,
        startDate: todayStr,
        startTime: start,
        endTime: end,
        type: "task",
        workspace: (slot.category === "College" ? "College" : slot.category === "Development" ? "Development" : "Personal") as any
      };
    });

    onAddGeneratedEvents(eventsToCreate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-surface border border-border-hairline apple-shadow-float overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-border-hairline flex items-center justify-between bg-surface-muted/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-text-primary">AI Timetable & Routine Studio</h3>
              <p className="text-[11px] font-mono text-primary">Zero-friction daily and weekly routine architect</p>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {!generatedTimetable ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary block mb-1 font-semibold">
                  Describe Your Ideal Routine or Constraints
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  placeholder="e.g. Schedule 3 hours of study, 2 hours of gym, and 4 hours of coding..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border-hairline text-xs text-text-primary resize-none font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="apple-btn px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isLoading ? "Synthesizing Schedule..." : "Generate Optimized Timetable"}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-primary font-bold">
                Optimized Routine Generated with Paced Deep Work Blocks
              </div>

              <div className="space-y-2">
                {generatedTimetable.map((slot, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-surface-muted/60 border border-border-hairline flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-text-primary">{slot.title}</div>
                      <div className="text-[11px] font-mono text-text-tertiary mt-0.5">{slot.category}</div>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-surface border border-border-hairline font-mono font-bold text-text-primary text-xs">
                      {slot.time}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border-hairline">
                <button
                  type="button"
                  onClick={() => setGeneratedTimetable(null)}
                  className="px-4 py-2 rounded-full border border-border-hairline hover:bg-surface-muted text-xs font-medium cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleApplyToCalendar}
                  className="apple-btn px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Apply Schedule to Calendar</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
