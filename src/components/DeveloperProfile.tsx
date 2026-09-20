import React from "react";
import { 
  Sparkles, 
  Terminal, 
  Code2, 
  GraduationCap, 
  Heart, 
  Compass, 
  Mail, 
  ExternalLink, 
  BookOpen, 
  Cpu,
  Layers,
  ArrowRight
} from "lucide-react";

export const DeveloperProfile: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-300 py-6">
      
      {/* 1. Editorial Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface border border-border-hairline text-[11px] font-mono tracking-widest text-primary uppercase shadow-xs">
          <span>Architect & Creator</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-text-primary">
          Jatin Singh Kaintura
        </h1>
        
        <p className="text-base sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed editorial-serif italic font-normal">
          "Software is not merely utility; it is the spatial architecture of human attention."
        </p>

        <div className="flex items-center justify-center gap-3 pt-2 text-xs font-mono text-text-tertiary">
          <span>2nd Year Computer Science & Engineering</span>
          <span>•</span>
          <span>Full-Stack & Systems Architect</span>
        </div>
      </div>

      {/* 2. Core Profile Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Genesis & Mission */}
        <div className="md:col-span-2 p-8 rounded-3xl bg-surface border border-border-hairline apple-shadow-hero space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-primary uppercase font-bold">
            <Compass className="w-4 h-4" />
            <span>The Genesis: Made Differently</span>
          </div>
          <h3 className="text-2xl font-bold text-text-primary tracking-tight">
            Order in chaos. Crafted for sovereign minds.
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            In an era dominated by hyperactive notification badges and engagement-maximizing algorithms, 
            Aethel OS was conceived as a local-first sanctuary for thinkers, researchers, and engineers. 
            By fusing mathematical UI typography, Web Audio acoustic masking, and deterministic AI synthesis, 
            we return total ownership of focus back to the human.
          </p>
        </div>

        {/* Card 2: Personal Archetype */}
        <div className="p-8 rounded-3xl bg-surface border border-border-hairline apple-shadow-hero space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-purple-600 uppercase font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Cognitive Profile</span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-text-primary">INTJ-A</div>
            <p className="text-xs text-text-secondary">
              Strategic architect driven by systems design, aesthetic restraint, and clean mathematical abstractions.
            </p>
          </div>
          
          <div className="pt-4 border-t border-border-hairline text-[11px] font-mono text-text-tertiary">
            Sovereign Local-First Advocate
          </div>
        </div>

      </div>

      {/* 3. Research & Engineering Interests Bento */}
      <div className="p-8 rounded-3xl bg-surface border border-border-hairline apple-shadow-hero space-y-6">
        <div className="flex items-center justify-between border-b border-border-hairline pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-text-secondary uppercase font-semibold">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>Active Engineering & Research Vectors</span>
          </div>
          <span className="text-xs font-mono text-text-tertiary">2026 Focus</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-surface-muted/50 border border-border-hairline space-y-1.5">
            <div className="text-xs font-bold text-text-primary">Local-First WASM Kernels</div>
            <p className="text-[11px] text-text-secondary">
              Zero-latency client-side SQLite execution with OPFS origin private filesystem storage.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-muted/50 border border-border-hairline space-y-1.5">
            <div className="text-xs font-bold text-text-primary">Acoustic Masking Physics</div>
            <p className="text-[11px] text-text-secondary">
              Harmonic 432Hz sine wave and pink noise spectral filtering to optimize alpha brainwave states.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-muted/50 border border-border-hairline space-y-1.5">
            <div className="text-xs font-bold text-text-primary">Deterministic AI Orchestration</div>
            <p className="text-[11px] text-text-secondary">
              Combining Gemini LLM semantic reasoning with offline heuristic fallbacks for absolute reliability.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Connect & Social Links */}
      <div className="p-8 rounded-3xl bg-surface border border-border-hairline apple-shadow-hero flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h4 className="text-lg font-bold text-text-primary">Collaborate or Connect</h4>
          <p className="text-xs text-text-secondary">Open to high-impact software engineering opportunities and research dialogues.</p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="mailto:jatin@aethel.internal"
            className="apple-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Send Email</span>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-full bg-surface-muted hover:bg-surface-container border border-border-hairline text-xs font-mono text-text-primary inline-flex items-center gap-1.5"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

    </div>
  );
};
