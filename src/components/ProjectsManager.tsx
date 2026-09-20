import React, { useState } from "react";
import { 
  FolderKanban, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Sparkles, 
  Trash2, 
  ArrowRight,
  X,
  Layers,
  CheckSquare
} from "lucide-react";
import { Project, Task, WorkspaceType } from "../types";

interface ProjectsManagerProps {
  projects: Project[];
  tasks: Task[];
  onAddProject: (project: Omit<Project, "id">) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: number) => void;
  onToggleTask: (id: number) => void;
  onAddTask: (task: Omit<Task, "id" | "createdAt">) => void;
  activeWorkspace: WorkspaceType;
  workspaces: WorkspaceType[];
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  tasks,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onToggleTask,
  onAddTask,
  activeWorkspace,
  workspaces
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(projects[0]?.id || null);

  // New project state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workspace, setWorkspace] = useState<WorkspaceType>(activeWorkspace);
  const [deadline, setDeadline] = useState("End of Month");
  const [tagsStr, setTagsStr] = useState("");

  const filteredProjects = projects.filter((p) =>
    activeWorkspace === "All" ? true : p.workspace === activeWorkspace
  );

  const activeProject = projects.find((p) => p.id === selectedProjectId) || filteredProjects[0];
  const projectTasks = tasks.filter((t) => t.workspace === activeProject?.workspace);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);

    onAddProject({
      title: title.trim(),
      description: description.trim(),
      workspace,
      progress: 0,
      status: "active",
      deadline,
      tags: tags.length > 0 ? tags : ["General", workspace]
    });

    setTitle("");
    setDescription("");
    setTagsStr("");
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-hairline">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary font-semibold mb-1">
            <FolderKanban className="w-4 h-4" />
            <span>Projects & Deliverables Engine</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Active Projects • {activeWorkspace}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Coordinate multi-phase initiatives, track milestones, and manage project backlogs
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="apple-btn px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => setSelectedProjectId(project.id)}
            className={`p-6 rounded-3xl bg-surface border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
              activeProject?.id === project.id
                ? "border-primary apple-shadow-hero"
                : "border-border-hairline apple-shadow-float hover:border-primary/40"
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-surface-muted text-text-secondary border border-border-hairline text-xs font-mono">
                  {project.workspace}
                </span>
                <span className="text-lg font-bold font-mono text-primary">{project.progress}%</span>
              </div>

              <h3 className="text-base font-bold text-text-primary mt-3">{project.title}</h3>
              <p className="text-xs text-text-secondary mt-1 line-clamp-2">{project.description}</p>

              {/* Progress bar */}
              <div className="w-full bg-surface-container rounded-full h-1.5 mt-4 overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-3">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-mono text-text-tertiary">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border-hairline flex items-center justify-between text-xs font-mono text-text-tertiary">
              <span>Target: {project.deadline || "TBD"}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteProject(project.id);
                }}
                className="hover:text-red-500 cursor-pointer"
                title="Delete Project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-3xl bg-surface border border-border-hairline text-xs text-text-tertiary space-y-2">
            <FolderKanban className="w-8 h-8 mx-auto text-text-tertiary" />
            <p>No active projects found for {activeWorkspace}.</p>
          </div>
        )}
      </div>

      {/* Selected Project Tasks Backlog */}
      {activeProject && (
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4 mt-8">
          <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
            <div>
              <h3 className="font-bold text-base text-text-primary">
                Tasks for {activeProject.title}
              </h3>
              <p className="text-xs text-text-secondary">{activeProject.workspace} Workspace</p>
            </div>
            <span className="text-xs font-mono text-text-tertiary">
              {projectTasks.filter((t) => t.completed).length}/{projectTasks.length} Completed
            </span>
          </div>

          <div className="space-y-2">
            {projectTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-muted/50 border border-border-hairline text-xs"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleTask(t.id)}
                    className={`w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer ${
                      t.completed ? "bg-primary border-primary text-white" : "border-border-hairline hover:border-primary"
                    }`}
                  >
                    {t.completed && <span className="text-[10px]">✓</span>}
                  </button>
                  <div>
                    <span className={`font-semibold ${t.completed ? "line-through text-text-tertiary" : "text-text-primary"}`}>
                      {t.title}
                    </span>
                    <div className="text-[10px] font-mono text-text-tertiary">
                      {t.priority} • {t.deadline || "Upcoming"}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {projectTasks.length === 0 && (
              <div className="text-center py-6 text-xs text-text-tertiary">
                No tasks currently associated with this workspace.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-surface border border-border-hairline apple-shadow-float p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <h3 className="font-bold text-sm text-text-primary">Create New Project</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full hover:bg-surface-container flex items-center justify-center text-text-secondary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="text-xs text-text-secondary block mb-1">Project Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Database Kernel"
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
                  placeholder="Objective, scope, and key deliverables..."
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-muted border border-border-hairline text-xs text-text-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    placeholder="e.g. Nov 15"
                    className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-text-secondary block mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="e.g. engineering, react, systems"
                  className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs font-mono"
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
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
