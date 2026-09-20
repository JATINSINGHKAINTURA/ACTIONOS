import React, { useState } from "react";
import { 
  Sparkles, 
  Layers, 
  GraduationCap, 
  Briefcase, 
  Code2, 
  User, 
  Check, 
  X, 
  ArrowRight,
  Plus
} from "lucide-react";
import { ProductivityTemplate, Task, Goal, WorkspaceType } from "../types";
import { readyTemplates } from "../utils/initialData";

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: ProductivityTemplate, targetWorkspace: WorkspaceType) => void;
  activeWorkspace: WorkspaceType;
  workspaces: WorkspaceType[];
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  activeWorkspace,
  workspaces
}) => {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "student" | "employee" | "developer" | "personal">("all");
  const [targetSpace, setTargetSpace] = useState<WorkspaceType>(activeWorkspace);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = readyTemplates.filter((t) =>
    selectedCategory === "all" ? true : t.category === selectedCategory
  );

  const handleApply = (template: ProductivityTemplate) => {
    onApplyTemplate(template, targetSpace);
    setAppliedId(template.id);
    setTimeout(() => {
      setAppliedId(null);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-3xl bg-surface border border-border-hairline apple-shadow-float overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-border-hairline flex items-center justify-between bg-surface-muted/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Workflow & Template Gallery</span>
            </div>
            <h3 className="text-xl font-bold text-text-primary mt-1">Ready-Made Productivity Blueprints</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-text-secondary cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs & Target Workspace Selector */}
        <div className="px-6 py-3 border-b border-border-hairline flex flex-wrap items-center justify-between gap-3 bg-surface">
          <div className="flex items-center bg-surface-muted p-1 rounded-xl text-xs font-medium text-text-secondary">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedCategory === "all" ? "bg-surface text-text-primary font-semibold shadow-xs" : ""
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("student")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedCategory === "student" ? "bg-surface text-text-primary font-semibold shadow-xs" : ""
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("employee")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedCategory === "employee" ? "bg-surface text-text-primary font-semibold shadow-xs" : ""
              }`}
            >
              Employee
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("developer")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedCategory === "developer" ? "bg-surface text-text-primary font-semibold shadow-xs" : ""
              }`}
            >
              Developer
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("personal")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedCategory === "personal" ? "bg-surface text-text-primary font-semibold shadow-xs" : ""
              }`}
            >
              Personal
            </button>
          </div>

          {/* Target space */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-text-secondary">Inject into:</span>
            <select
              value={targetSpace}
              onChange={(e) => setTargetSpace(e.target.value)}
              className="p-1.5 rounded-xl bg-surface-muted border border-border-hairline text-xs font-bold"
            >
              {workspaces.map((ws) => (
                <option key={ws} value={ws}>{ws}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Template List Cards */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 rounded-2xl bg-surface-muted/50 border border-border-hairline hover:border-primary/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-surface border border-border-hairline text-text-secondary">
                      {tpl.category}
                    </span>
                    <span className="text-[11px] font-mono text-primary font-semibold">
                      {tpl.tasks.length} tasks {tpl.goals ? `+ ${tpl.goals.length} goal` : ""}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-text-primary mt-2">{tpl.name}</h4>
                  <p className="text-xs text-text-secondary mt-1">{tpl.description}</p>

                  <div className="mt-3 space-y-1">
                    {tpl.tasks.slice(0, 3).map((t, idx) => (
                      <div key={idx} className="text-[11px] font-mono text-text-tertiary truncate">
                        • {t.title}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApply(tpl)}
                  disabled={appliedId === tpl.id}
                  className="apple-btn w-full py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all mt-2"
                >
                  {appliedId === tpl.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Blueprint Injected!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Apply into {targetSpace}</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-hairline bg-surface-muted/60 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full border border-border-hairline hover:bg-surface text-xs font-medium text-text-secondary cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
