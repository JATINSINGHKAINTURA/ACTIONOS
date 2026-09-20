import React, { useState } from "react";
import { 
  FileText, 
  Plus, 
  Search, 
  Pin, 
  PinOff, 
  Trash2, 
  Edit3, 
  Sparkles, 
  ArrowRight, 
  CheckSquare, 
  Tag, 
  Eye, 
  Code,
  Layers,
  X
} from "lucide-react";
import { Note, Task, WorkspaceType } from "../types";

interface NotesViewProps {
  notes: Note[];
  onAddNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: number) => void;
  onConvertNoteToTask: (note: Note) => void;
  activeWorkspace: WorkspaceType;
  workspaces: WorkspaceType[];
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onConvertNoteToTask,
  activeWorkspace,
  workspaces
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(notes[0]?.id || null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Note State
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newWorkspace, setNewWorkspace] = useState<WorkspaceType>(activeWorkspace);
  const [newTagsStr, setNewTagsStr] = useState("");

  const filteredNotes = notes.filter((n) => {
    if (activeWorkspace !== "All" && n.workspace !== activeWorkspace) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchTag = n.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTag) return false;
    }
    return true;
  });

  // Sort notes: pinned first, then by updatedAt
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const activeNote = notes.find((n) => n.id === selectedNoteId) || sortedNotes[0];

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const tags = newTagsStr
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    onAddNote({
      title: newTitle.trim(),
      content: newContent.trim() || "# " + newTitle.trim() + "\n\nWrite your thoughts here...",
      workspace: newWorkspace,
      tags,
      isPinned: false
    });

    setNewTitle("");
    setNewContent("");
    setNewTagsStr("");
    setShowAddModal(false);
  };

  const handleTogglePin = (note: Note) => {
    onUpdateNote({
      ...note,
      isPinned: !note.isPinned,
      updatedAt: new Date().toISOString()
    });
  };

  const renderSimpleMarkdown = (text: string) => {
    // Clean, elegant fallback parser for headers, bold, bullets, code blocks
    return text.split("\n").map((line, idx) => {
      if (line.startsWith("# ")) {
        return <h1 key={idx} className="text-xl font-bold text-text-primary mt-3 mb-2">{line.replace("# ", "")}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="text-lg font-bold text-text-primary mt-3 mb-1">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="text-sm font-bold text-text-primary mt-2 mb-1">{line.replace("### ", "")}</h3>;
      }
      if (line.startsWith("- ")) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs sm:text-sm text-text-primary my-0.5">
            {line.replace("- ", "")}
          </li>
        );
      }
      if (line.startsWith("```")) {
        return null;
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="text-xs sm:text-sm text-text-secondary leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-hairline">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-600 font-semibold mb-1">
            <FileText className="w-4 h-4" />
            <span>Markdown Knowledge & Notes Vault</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Notes & Scratchpad • {activeWorkspace}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Capture thoughts, meeting briefs, and transform them into actionable tasks
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="apple-btn px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>
      </div>

      {/* 2-Column Note Interface (List + Detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        
        {/* Left: Notes Sidebar List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes or #tags..."
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-surface border border-border-hairline text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          {/* Notes list */}
          <div className="space-y-2 max-h-[540px] overflow-y-auto">
            {sortedNotes.map((note) => {
              const isSelected = activeNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNoteId(note.id);
                    setIsEditing(false);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? "bg-surface border-primary shadow-xs"
                      : "bg-surface/70 border-border-hairline hover:bg-surface hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary truncate">{note.title}</span>
                    {note.isPinned && (
                      <span className="text-[10px] text-amber-500" title="Pinned Note">📌</span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-secondary line-clamp-2 font-mono">
                    {note.content.replace(/[#*`]/g, "")}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-text-tertiary pt-1">
                    <span>{note.workspace}</span>
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}

            {sortedNotes.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-surface border border-border-hairline text-xs text-text-tertiary space-y-2">
                <FileText className="w-6 h-6 mx-auto text-text-tertiary" />
                <p>No notes found for {activeWorkspace}.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Note Reader & Markdown Editor (8 cols) */}
        <div className="lg:col-span-8">
          {activeNote ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border-hairline apple-shadow-float flex flex-col justify-between min-h-[580px] space-y-6">
              
              <div>
                {/* Note Top Action Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-border-hairline">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-muted text-text-secondary border border-border-hairline text-xs font-mono">
                      {activeNote.workspace}
                    </span>
                    {activeNote.tags.map((tg) => (
                      <span key={tg} className="text-xs font-mono text-primary">#{tg}</span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Convert to Task Button */}
                    <button
                      type="button"
                      onClick={() => onConvertNoteToTask(activeNote)}
                      className="px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      title="Convert Note into a Task"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Convert to Task</span>
                    </button>

                    {/* Toggle Pin */}
                    <button
                      type="button"
                      onClick={() => handleTogglePin(activeNote)}
                      className={`p-1.5 rounded-xl border text-xs cursor-pointer ${
                        activeNote.isPinned
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
                          : "border-border-hairline text-text-tertiary hover:text-text-primary"
                      }`}
                      title={activeNote.isPinned ? "Unpin Note" : "Pin Note"}
                    >
                      {activeNote.isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Edit / View Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className="p-1.5 rounded-xl bg-surface-muted hover:bg-surface-container border border-border-hairline text-text-secondary cursor-pointer"
                      title={isEditing ? "Preview Mode" : "Edit Markdown"}
                    >
                      {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                    </button>

                    {/* Delete Note */}
                    <button
                      type="button"
                      onClick={() => onDeleteNote(activeNote.id)}
                      className="p-1.5 rounded-xl hover:bg-red-500/10 text-text-tertiary hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Note Content (Viewer or Markdown Editor) */}
                <div className="pt-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={activeNote.title}
                        onChange={(e) =>
                          onUpdateNote({
                            ...activeNote,
                            title: e.target.value,
                            updatedAt: new Date().toISOString()
                          })
                        }
                        className="w-full text-xl font-bold text-text-primary bg-surface-muted px-3 py-2 rounded-xl border border-border-hairline"
                      />
                      <textarea
                        value={activeNote.content}
                        onChange={(e) =>
                          onUpdateNote({
                            ...activeNote,
                            content: e.target.value,
                            updatedAt: new Date().toISOString()
                          })
                        }
                        rows={16}
                        className="w-full font-mono text-xs sm:text-sm text-text-primary bg-surface-muted p-4 rounded-2xl border border-border-hairline resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-text-primary">{activeNote.title}</h2>
                      <div className="prose max-w-none text-text-primary space-y-2">
                        {renderSimpleMarkdown(activeNote.content)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Note Footer */}
              <div className="pt-4 border-t border-border-hairline flex items-center justify-between text-[11px] font-mono text-text-tertiary">
                <span>Last updated {new Date(activeNote.updatedAt).toLocaleString()}</span>
                <span>{activeNote.content.split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-surface border border-border-hairline text-xs text-text-tertiary flex items-center justify-center min-h-[580px]">
              Select a note or create a new one.
            </div>
          )}
        </div>
      </div>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-surface border border-border-hairline apple-shadow-float p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
              <h3 className="font-bold text-sm text-text-primary">Create New Note</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full hover:bg-surface-container flex items-center justify-center text-text-secondary cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-3">
              <div>
                <label className="text-xs text-text-secondary block mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Cognitive Bandwidth in System Design"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-muted border border-border-hairline text-sm text-text-primary"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Workspace</label>
                  <select
                    value={newWorkspace}
                    onChange={(e) => setNewWorkspace(e.target.value)}
                    className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs"
                  >
                    {workspaces.map((ws) => (
                      <option key={ws} value={ws}>{ws}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-text-secondary block mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newTagsStr}
                    onChange={(e) => setNewTagsStr(e.target.value)}
                    placeholder="e.g. design, ux, psychology"
                    className="w-full p-2 rounded-xl bg-surface-muted border border-border-hairline text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-text-secondary block mb-1">Initial Content (Markdown supported)</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={6}
                  placeholder="# Key Observations&#10;&#10;- Observation 1&#10;- Observation 2"
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
                  disabled={!newTitle.trim()}
                  className="apple-btn px-5 py-2 rounded-full bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-semibold cursor-pointer"
                >
                  Create Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
