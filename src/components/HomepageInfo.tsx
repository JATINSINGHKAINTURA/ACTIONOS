import React from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  Terminal, 
  Code2, 
  GraduationCap, 
  Briefcase, 
  Heart, 
  Compass, 
  Mail, 
  ExternalLink, 
  BookOpen, 
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Target,
  FileText,
  Headphones,
  FolderKanban,
  Github,
  Laptop,
  CheckSquare,
  Activity,
  Boxes,
  Database,
  Lock,
  Workflow
} from "lucide-react";
import { WorkspaceType } from "../types";
import { 
  MotionConstellationCanvas, 
  MotionOrbitalRings, 
  Motion3DCard, 
  MotionSoundwaveGraphic, 
  MotionMetricRing 
} from "./MotionGraphics";

interface HomepageInfoProps {
  onEnterApp: (tab: string) => void;
  onSelectWorkspace: (ws: WorkspaceType) => void;
}

export const HomepageInfo: React.FC<HomepageInfoProps> = ({
  onEnterApp,
  onSelectWorkspace
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-20 py-6">
      
      {/* 1. Hero / Project Identification Section with Interactive Canvas */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative text-center space-y-8 max-w-4xl mx-auto pt-6"
      >
        {/* Ambient Canvas Motion Backdrop */}
        <div className="absolute inset-0 -z-10 h-80 opacity-30 dark:opacity-20 overflow-hidden rounded-3xl pointer-events-none">
          <MotionConstellationCanvas density={30} />
        </div>

        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface/85 backdrop-blur-md border border-border-hairline text-xs font-mono tracking-widest text-primary uppercase shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Project Manifesto & Engineering Overview</span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary leading-[1.08]"
        >
          Aethel OS <br />
          <span className="text-primary font-normal editorial-serif italic">
            The Sovereign Cognitive Workspace
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto"
        >
          A mindful, local-first operating workspace engineered to eliminate tool fragmentation, 
          protect human attention, and unify academic, professional, engineering, and personal productivity.
        </motion.p>

        {/* Primary Interactive Navigation CTAs */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onEnterApp("dashboard")}
            className="apple-btn px-7 py-3.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-lg shadow-primary/25 flex items-center gap-2 cursor-pointer"
          >
            <span>Launch Universal Cockpit</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            type="button"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const el = document.getElementById("why-made");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-6 py-3.5 rounded-full bg-surface/80 hover:bg-surface border border-border-hairline text-xs font-semibold text-text-primary cursor-pointer transition-colors backdrop-blur-sm"
          >
            Read Genesis & Why It Was Made ↓
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const el = document.getElementById("dev-info");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-5 py-3.5 rounded-full bg-surface-muted hover:bg-surface-container border border-border-hairline text-xs font-mono text-text-secondary cursor-pointer"
          >
            Developer Profile & Specs
          </motion.button>
        </motion.div>

        {/* Quick Specs Pill Row */}
        <motion.div
          variants={itemVariants}
          className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-text-secondary border-t border-border-hairline/60 mt-8"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-text-primary font-bold">100% Local-First & Offline</span>
          </div>
          <div className="h-4 w-px bg-border-hairline hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold">4 Tailored Horizons</span>
          </div>
          <div className="h-4 w-px bg-border-hairline hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-purple-600 font-bold">Web Audio 432Hz Soundscapes</span>
          </div>
        </motion.div>
      </motion.section>

      {/* 2. WHY IS IT MADE? (The Problem Space & Crisis of Attention) */}
      <motion.section
        id="why-made"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="p-8 sm:p-12 rounded-3xl bg-surface border border-border-hairline apple-shadow-hero space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-hairline pb-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-red-500 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>The Problem Space</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary mt-1">
              Why Aethel OS Was Built
            </h2>
          </div>
          <p className="text-xs font-mono text-text-tertiary max-w-md">
            The modern software ecosystem is engineered for engagement rather than cognitive clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Problem 1 */}
          <div className="p-6 rounded-2xl bg-surface-muted/50 border border-border-hairline space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-sm font-mono">
              01
            </div>
            <h3 className="text-base font-bold text-text-primary">Tool Fragmentation & Tab Overload</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Knowledge workers and students juggle 5–8 disparate apps: Todoist for tasks, Notion for notes, Pomofocus for timers, Google Calendar for deadlines, and separate spreadsheets for attendance. 
              The cognitive cost of constant context switching drains up to 40% of productive mental capacity.
            </p>
          </div>

          {/* Problem 2 */}
          <div className="p-6 rounded-2xl bg-surface-muted/50 border border-border-hairline space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm font-mono">
              02
            </div>
            <h3 className="text-base font-bold text-text-primary">Engagement Algorithms & Distraction</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Mainstream productivity tools have become social feeds filled with badge counts, noisy multiplayer cursors, email digests, and complex subscription paywalls that interrupt deep thought instead of fostering it.
            </p>
          </div>

          {/* Problem 3 */}
          <div className="p-6 rounded-2xl bg-surface-muted/50 border border-border-hairline space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm font-mono">
              03
            </div>
            <h3 className="text-base font-bold text-text-primary">Lack of Domain-Tailored Contexts</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              A student needs 75% attendance calculations and exam roadmaps. A developer needs repository branches and issue tracking. An enterprise employee needs meeting minutes and sprint actions. Standard todo apps treat all tasks as flat text, failing to understand real-world workflows.
            </p>
          </div>

        </div>
      </motion.section>

      {/* 3. WHAT DOES IT SOLVE? (The Solutions & Core Capabilities) */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-mono uppercase font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>The Solution Architecture</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary">
            What Aethel OS Solves
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Four specialized horizons unified into a sovereign, single-page operating environment with acoustic soundscapes and zero telemetry.
          </p>
        </div>

        {/* Solution Bento Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Matrix 1: Academic */}
          <Motion3DCard
            onClick={() => {
              onSelectWorkspace("College");
              onEnterApp("student");
            }}
            className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float hover:border-blue-500/40 cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-text-primary">Academic Command</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Automated 75% attendance criteria safety tracker, exam countdown engines, lecture notes, and automated revision study planner generator.
              </p>
            </div>
            <div className="pt-3 border-t border-border-hairline text-[11px] font-mono text-blue-600 font-semibold flex items-center justify-between">
              <span>Open Student Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Motion3DCard>

          {/* Matrix 2: Work */}
          <Motion3DCard
            onClick={() => {
              onSelectWorkspace("Work");
              onEnterApp("work");
            }}
            className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float hover:border-purple-500/40 cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-text-primary">Work & Client Hub</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Client milestone tracking, sprint deliverable dashboards, and automated AI meeting minutes parser that turns raw notes into action items.
              </p>
            </div>
            <div className="pt-3 border-t border-border-hairline text-[11px] font-mono text-purple-600 font-semibold flex items-center justify-between">
              <span>Open Work Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Motion3DCard>

          {/* Matrix 3: Developer */}
          <Motion3DCard
            onClick={() => {
              onSelectWorkspace("Development");
              onEnterApp("developer");
            }}
            className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float hover:border-cyan-500/40 cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-text-primary">Developer Suite</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Repository health inspection, branch activity badges, commit log auditing, and priority issue tracking tied directly to code tasks.
              </p>
            </div>
            <div className="pt-3 border-t border-border-hairline text-[11px] font-mono text-cyan-600 font-semibold flex items-center justify-between">
              <span>Open Dev Space</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Motion3DCard>

          {/* Matrix 4: Focus & Soundscapes */}
          <Motion3DCard
            onClick={() => onEnterApp("focus")}
            className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float hover:border-emerald-500/40 cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-text-primary">Focus & Masking</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Calibrated Pomodoro timer paired with real-time Web Audio binaural 432Hz sine waves, pink noise, and rain acoustics.
              </p>
            </div>
            <div className="pt-3 border-t border-border-hairline text-[11px] font-mono text-emerald-600 font-semibold flex items-center justify-between">
              <span>Open Focus Room</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Motion3DCard>

        </div>
      </motion.section>

      {/* 4. WHO MADE IT & DEVELOPER PROFILE SECTION */}
      <motion.section
        id="dev-info"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="p-8 sm:p-12 rounded-3xl bg-surface border border-border-hairline apple-shadow-hero space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border-hairline pb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-text-primary text-white flex items-center justify-center font-bold text-2xl shadow-md font-mono">
              JK
            </div>
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary font-semibold">
                <span>Architect & Creator</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                Jatin Singh Kaintura
              </h3>
              <p className="text-xs text-text-secondary font-mono mt-0.5">
                2nd Year Computer Science & Engineering • Full-Stack & Systems Developer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="mailto:jatinskaintura@gmail.com"
              className="px-4 py-2 rounded-full bg-surface-muted hover:bg-surface-container border border-border-hairline text-xs font-mono text-text-primary flex items-center gap-1.5 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>jatinskaintura@gmail.com</span>
            </a>
          </div>
        </div>

        {/* Creator Statement & Cognitive Archetype */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-lg font-bold text-text-primary">
              Craft Philosophy: "Software is spatial architecture for human attention."
            </h4>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              As a Computer Science engineer, I observed a fundamental dissonance in modern productivity: 
              tools meant to help us focus were instead demanding more of our attention. Notifications, complex database setups, and endless nested menus created friction before work even began.
            </p>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Aethel OS was crafted as a rebellion against bloat. It is designed to be mathematically proportional, local-first, extremely fast, and visually tranquil. Every transition, sound frequency, and button is calibrated to restore the feeling of uninterrupted cognitive flow.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-muted/50 border border-border-hairline space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-xs font-mono text-purple-600 uppercase font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cognitive Profile</span>
              </div>
              <div className="text-3xl font-extrabold font-mono text-text-primary">INTJ-A</div>
              <p className="text-xs text-text-secondary">
                Strategic systems architect driven by aesthetic restraint, clean mathematical abstractions, and zero-telemetry software design.
              </p>
            </div>

            <div className="pt-3 border-t border-border-hairline text-[11px] font-mono text-text-tertiary">
              Location: Dehradun, India
            </div>
          </div>

        </div>
      </motion.section>

      {/* 5. TECHNICAL STACK & ARCHITECTURE SPECIFICATIONS */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="p-8 sm:p-12 rounded-3xl bg-surface border border-border-hairline apple-shadow-hero space-y-8"
      >
        <div className="flex items-center justify-between border-b border-border-hairline pb-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-primary font-bold flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              <span>Developer & Engineering Specifications</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
              Under the Hood: System Architecture
            </h3>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-surface-muted border border-border-hairline text-text-secondary">
            v2.0 Architecture
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <div className="p-5 rounded-2xl bg-surface-muted/50 border border-border-hairline space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
              <Code2 className="w-4 h-4 text-primary" />
              <span>React 18 + TypeScript</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Strict type safety across all entity schemas (Tasks, Goals, Projects, Events, Notes, Attendance). Zero loose `any` casts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-muted/50 border border-border-hairline space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
              <Workflow className="w-4 h-4 text-cyan-600" />
              <span>Framer Motion & Physics</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Spring-physics scroll progress, 3D cursor-reactive matrix tilt cards, shared layoutId tab glides, and dynamic SVG circular progress rings.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-muted/50 border border-border-hairline space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
              <Headphones className="w-4 h-4 text-emerald-600" />
              <span>Web Audio API Synthesizer</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Pure client-side acoustic generation. Generates harmonic 432Hz sine waves, pink noise filters, and white-noise rainfall without network streams.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-muted/50 border border-border-hairline space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
              <Database className="w-4 h-4 text-purple-600" />
              <span>Local-First Persistence Engine</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Deterministic localStorage synchronization with multi-format JSON export and import. Complete offline sovereignty.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-muted/50 border border-border-hairline space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Natural Language Quick Capture</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Deterministic regex and semantic parser extracting priority tags (`!urgent`), due dates (`🗓 Friday`), and target spaces (`#college`) in &lt;5ms.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-muted/50 border border-border-hairline space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>ActionBot AI Copilot</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Algorithmic day synthesizer, meeting action-item extractor, and timetable generator designed to remove planning friction.
            </p>
          </div>

        </div>
      </motion.section>

      {/* 6. Launch Workspace Direct Jump Hub */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-8 sm:p-10 rounded-3xl bg-gradient-to-tr from-primary/10 via-surface to-cyan-500/10 border border-primary/20 text-center space-y-5"
      >
        <h3 className="text-2xl font-bold tracking-tight text-text-primary">
          Ready to Reclaim Your Attention?
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto">
          Explore all tools inside Aethel OS. No account registration, no credit card, no cloud tracking.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onEnterApp("dashboard")}
            className="apple-btn px-6 py-3 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
          >
            <span>Launch Universal Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onEnterApp("tasks")}
            className="px-5 py-3 rounded-full bg-surface border border-border-hairline text-xs font-semibold text-text-primary hover:bg-surface-muted cursor-pointer"
          >
            Smart Tasks
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onEnterApp("focus")}
            className="px-5 py-3 rounded-full bg-surface border border-border-hairline text-xs font-semibold text-text-primary hover:bg-surface-muted cursor-pointer"
          >
            Focus Sanctuary
          </motion.button>
        </div>
      </motion.section>

    </div>
  );
};
