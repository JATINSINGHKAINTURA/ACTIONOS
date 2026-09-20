import React, { useState } from "react";
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  Sparkles, 
  Plus, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  FileText, 
  Trash2,
  CheckCircle2,
  Percent
} from "lucide-react";
import { SubjectAttendance, Task, Note, CalendarEvent } from "../types";

interface StudentWorkspaceViewProps {
  attendance: SubjectAttendance[];
  onUpdateAttendance: (item: SubjectAttendance) => void;
  onAddSubject: (item: Omit<SubjectAttendance, "id">) => void;
  onDeleteSubject: (id: number) => void;
  tasks: Task[];
  notes: Note[];
  events: CalendarEvent[];
  onOpenStudyPlanner: () => void;
  onOpenQuickCapture: () => void;
  onNavigateTab: (tab: string) => void;
}

export const StudentWorkspaceView: React.FC<StudentWorkspaceViewProps> = ({
  attendance,
  onUpdateAttendance,
  onAddSubject,
  onDeleteSubject,
  tasks,
  notes,
  events,
  onOpenStudyPlanner,
  onOpenQuickCapture,
  onNavigateTab
}) => {
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [subName, setSubName] = useState("");
  const [subCode, setSubCode] = useState("");
  const [subAttended, setSubAttended] = useState(20);
  const [subTotal, setSubTotal] = useState(25);
  const [subTarget, setSubTarget] = useState(75);

  const collegeTasks = tasks.filter((t) => t.workspace === "College");
  const collegeNotes = notes.filter((n) => n.workspace === "College");
  const collegeEvents = events.filter((e) => e.workspace === "College");

  const handleMarkClass = (subject: SubjectAttendance, attended: boolean) => {
    onUpdateAttendance({
      ...subject,
      attended: attended ? subject.attended + 1 : subject.attended,
      total: subject.total + 1
    });
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;

    onAddSubject({
      name: subName.trim(),
      code: subCode.trim() || "CS" + Math.floor(100 + Math.random() * 900),
      attended: Number(subAttended),
      total: Number(subTotal),
      targetPercentage: Number(subTarget)
    });

    setSubName("");
    setSubCode("");
    setShowAddSubjectModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-hairline">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-600 font-semibold mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Academic Command Center</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Student & College Workspace
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Track courses, attendance thresholds, exam revisions, and assignments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenStudyPlanner}
            className="apple-btn px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Exam Study Planner</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddSubjectModal(true)}
            className="px-3.5 py-2 rounded-full bg-surface-muted hover:bg-surface-container border border-border-hairline text-xs font-medium text-text-secondary cursor-pointer"
          >
            + Add Course
          </button>
        </div>
      </div>

      {/* Attendance KPI Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-text-primary">Subject Attendance Calculator</h3>
          </div>
          <span className="text-xs font-mono text-text-tertiary">Minimum Target: 75%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attendance.map((sub) => {
            const percentage = sub.total > 0 ? Math.round((sub.attended / sub.total) * 100) : 0;
            const isDeficit = percentage < sub.targetPercentage;
            
            // Classes needed to reach target if below, or classes you can safely skip
            let statusMessage = "";
            if (isDeficit) {
              const needed = Math.ceil((sub.targetPercentage * sub.total - 100 * sub.attended) / (100 - sub.targetPercentage));
              statusMessage = `Attend next ${Math.max(1, needed)} class${needed > 1 ? "es" : ""} to recover 75%`;
            } else {
              const skippable = Math.floor((100 * sub.attended - sub.targetPercentage * sub.total) / sub.targetPercentage);
              statusMessage = skippable > 0 ? `Can safely miss ${skippable} class${skippable > 1 ? "es" : ""}` : "On track";
            }

            return (
              <div
                key={sub.id}
                className={`p-5 rounded-3xl bg-surface border apple-shadow-float space-y-3 transition-all ${
                  isDeficit ? "border-red-500/30 bg-red-500/[0.02]" : "border-border-hairline"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-text-tertiary uppercase">{sub.code}</span>
                    <h4 className="text-sm font-bold text-text-primary leading-tight mt-0.5">{sub.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-mono font-bold ${isDeficit ? "text-red-500" : "text-emerald-600"}`}>
                      {percentage}%
                    </span>
                    <div className="text-[10px] font-mono text-text-tertiary">
                      {sub.attended}/{sub.total} held
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isDeficit ? "bg-red-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>

                <div className="text-[11px] font-mono text-text-secondary">
                  {statusMessage}
                </div>

                {/* Fast attendance logger buttons */}
                <div className="pt-2 border-t border-border-hairline flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleMarkClass(sub, true)}
                    className="flex-1 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    + Present
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkClass(sub, false)}
                    className="flex-1 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    + Absent
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSubject(sub.id)}
                    className="p-1 rounded-xl text-text-tertiary hover:text-red-500 cursor-pointer"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column Grid: Academic Tasks & Exam Countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Academic Tasks & Assignments */}
        <div className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-text-primary">College Assignments & Lab Records</h3>
            </div>
            <button
              type="button"
              onClick={onOpenQuickCapture}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              + Quick Add
            </button>
          </div>

          <div className="space-y-2">
            {collegeTasks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-surface-muted/50 border border-border-hairline flex items-center justify-between text-xs"
              >
                <div>
                  <div className={`font-semibold ${t.completed ? "line-through text-text-tertiary" : "text-text-primary"}`}>
                    {t.title}
                  </div>
                  <div className="text-[11px] font-mono text-text-tertiary mt-0.5">
                    Deadline: {t.deadline || "This week"} • {t.priority}
                  </div>
                </div>
                {t.priority === "URGENT" && (
                  <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 border border-red-500/20 text-[10px] font-mono font-bold">
                    URGENT
                  </span>
                )}
              </div>
            ))}

            {collegeTasks.length === 0 && (
              <div className="text-center py-6 text-xs text-text-tertiary">
                No active college assignments. All caught up!
              </div>
            )}
          </div>
        </div>

        {/* Academic Notes & Revision Cheatsheets */}
        <div className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-text-primary">Course Revision Notes</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("notes")}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              View Notes
            </button>
          </div>

          <div className="space-y-2">
            {collegeNotes.map((n) => (
              <div
                key={n.id}
                onClick={() => onNavigateTab("notes")}
                className="p-3.5 rounded-2xl bg-surface-muted/50 border border-border-hairline hover:border-primary/30 transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary">{n.title}</span>
                  {n.isPinned && <span className="text-[10px] text-amber-500">📌</span>}
                </div>
                <p className="text-[11px] text-text-secondary font-mono line-clamp-2">
                  {n.content.replace(/[#*`]/g, "")}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-surface border border-border-hairline apple-shadow-float p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <h3 className="font-bold text-sm text-text-primary">Add New Course</h3>
              <button
                type="button"
                onClick={() => setShowAddSubjectModal(false)}
                className="w-7 h-7 rounded-full hover:bg-surface-container flex items-center justify-center text-text-secondary cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-3">
              <div>
                <label className="text-xs text-text-secondary block mb-1">Subject Name</label>
                <input
                  type="text"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Distributed Operating Systems"
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border-hairline text-xs text-text-primary"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Course Code</label>
                  <input
                    type="text"
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    placeholder="e.g. CS401"
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border-hairline text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Target %</label>
                  <input
                    type="number"
                    value={subTarget}
                    onChange={(e) => setSubTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border-hairline text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Classes Attended</label>
                  <input
                    type="number"
                    value={subAttended}
                    onChange={(e) => setSubAttended(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border-hairline text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Total Classes Held</label>
                  <input
                    type="number"
                    value={subTotal}
                    onChange={(e) => setSubTotal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border-hairline text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border-hairline">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 rounded-full border border-border-hairline hover:bg-surface-muted text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!subName.trim()}
                  className="apple-btn px-5 py-2 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
