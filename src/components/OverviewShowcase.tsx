import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Sparkles, 
  Target, 
  Layers, 
  Headphones, 
  GraduationCap, 
  Briefcase, 
  Terminal, 
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Cpu,
  Orbit,
  Compass
} from "lucide-react";
import { WorkspaceType } from "../types";
import { 
  MotionConstellationCanvas, 
  MotionOrbitalRings, 
  Motion3DCard, 
  MotionSoundwaveGraphic, 
  MotionMetricRing 
} from "./MotionGraphics";

interface OverviewShowcaseProps {
  onEnterApp: (tab: string) => void;
  onSelectWorkspace: (ws: WorkspaceType) => void;
}

export const OverviewShowcase: React.FC<OverviewShowcaseProps> = ({
  onEnterApp,
  onSelectWorkspace
}) => {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -40]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.85]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-20 py-8 relative">
      
      {/* 1. Hero with Interactive Motion Graphics & Parallax */}
      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center space-y-8 max-w-4xl mx-auto pt-6 relative"
      >
        {/* Ambient Canvas Motion Backdrop */}
        <div className="absolute inset-0 -z-10 h-72 opacity-35 dark:opacity-25 overflow-hidden rounded-3xl pointer-events-none">
          <MotionConstellationCanvas density={28} />
        </div>

        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface/80 backdrop-blur-md border border-border-hairline text-xs font-mono tracking-widest text-primary uppercase shadow-xs">
          <motion.span
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </motion.span>
          <span>Aethel OS v2.0 • Sovereign Productivity Architecture</span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text-primary leading-[1.08]"
        >
          Clarity of Thought. <br />
          <motion.span 
            className="text-primary font-normal editorial-serif italic inline-block"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            Zero Friction.
          </motion.span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto font-sans"
        >
          One unified operating system for your Personal, Academic, Professional, and Engineering horizons. 
          Crafted with fluid Framer Motion choreography, deterministic AI synthesis, and acoustic masking.
        </motion.p>

        {/* Action CTAs */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onEnterApp("dashboard")}
            className="apple-btn px-7 py-3.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-lg shadow-primary/25 flex items-center gap-2 cursor-pointer"
          >
            <span>Launch Universal Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            type="button"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onEnterApp("tasks")}
            className="px-6 py-3.5 rounded-full bg-surface/80 hover:bg-surface border border-border-hairline text-xs font-semibold text-text-primary cursor-pointer transition-colors backdrop-blur-sm"
          >
            Explore Smart Tasks
          </motion.button>
        </motion.div>

        {/* Mini Motion Graphic Preview Bar */}
        <motion.div
          variants={itemVariants}
          className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-text-secondary border-t border-border-hairline/60 mt-8"
        >
          <div className="flex items-center gap-2">
            <MotionMetricRing progress={86} size={36} strokeWidth={3} />
            <div className="text-left">
              <span className="block text-[11px] font-bold text-text-primary">86% Velocity</span>
              <span className="text-[9px] text-text-tertiary">Weekly Target</span>
            </div>
          </div>

          <div className="h-6 w-px bg-border-hairline hidden sm:block" />

          <div className="flex items-center gap-2">
            <MotionSoundwaveGraphic active={true} barsCount={12} />
            <div className="text-left">
              <span className="block text-[11px] font-bold text-text-primary">432Hz Soundscape</span>
              <span className="text-[9px] text-text-tertiary">Binaural Synthesis</span>
            </div>
          </div>

          <div className="h-6 w-px bg-border-hairline hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
              ✓
            </div>
            <div className="text-left">
              <span className="block text-[11px] font-bold text-text-primary">Local-First</span>
              <span className="text-[9px] text-text-tertiary">Zero Telemetry Lock</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* 2. Interactive Workspace Matrix with 3D Motion Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
              Context Matrices
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
              Purpose-Engineered Horizons
            </h2>
          </div>
          <span className="text-xs font-mono text-text-tertiary hidden sm:inline-block">
            Hover for 3D perspective
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Personal */}
          <Motion3DCard
            onClick={() => {
              onSelectWorkspace("Personal");
              onEnterApp("dashboard");
            }}
            className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float hover:border-emerald-500/50 cursor-pointer space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm">
                P
              </div>
              <h3 className="text-base font-bold text-text-primary mt-3">Personal Horizon</h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Habits, wellness routines, finances, creative scratchpad, and long-term milestones.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-600 font-semibold flex items-center justify-between pt-2 border-t border-border-hairline/60">
              <span>Enter Horizon</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Motion3DCard>

          {/* College */}
          <Motion3DCard
            onClick={() => {
              onSelectWorkspace("College");
              onEnterApp("student");
            }}
            className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float hover:border-blue-500/50 cursor-pointer space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-text-primary mt-3">College & Academia</h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                75% attendance monitoring, exam pacing engines, timetable generator, and lecture notes.
              </p>
            </div>
            <div className="text-[11px] font-mono text-blue-600 font-semibold flex items-center justify-between pt-2 border-t border-border-hairline/60">
              <span>Enter Horizon</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Motion3DCard>

          {/* Work */}
          <Motion3DCard
            onClick={() => {
              onSelectWorkspace("Work");
              onEnterApp("work");
            }}
            className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float hover:border-purple-500/50 cursor-pointer space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-sm">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-text-primary mt-3">Enterprise Work</h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Client deliverables, meeting action extraction, sync agendas, and sprint reviews.
              </p>
            </div>
            <div className="text-[11px] font-mono text-purple-600 font-semibold flex items-center justify-between pt-2 border-t border-border-hairline/60">
              <span>Enter Horizon</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Motion3DCard>

          {/* Developer */}
          <Motion3DCard
            onClick={() => {
              onSelectWorkspace("Development");
              onEnterApp("developer");
            }}
            className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float hover:border-cyan-500/50 cursor-pointer space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold text-sm">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-text-primary mt-3">Developer Engineering</h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Git repository health, issue tracker, PR pipeline, and code architecture snippets.
              </p>
            </div>
            <div className="text-[11px] font-mono text-cyan-600 font-semibold flex items-center justify-between pt-2 border-t border-border-hairline/60">
              <span>Enter Horizon</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Motion3DCard>

        </div>
      </motion.div>

      {/* 3. Technology & Craft Pillars with Orbital Graphics */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="p-8 sm:p-12 rounded-3xl bg-surface border border-border-hairline apple-shadow-hero relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8 pb-8 border-b border-border-hairline">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-primary font-semibold">
              Motion Engine & Architecture
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
              Engineered for Cognitive Flow
            </h3>
            <p className="text-xs text-text-secondary mt-2 max-w-xl leading-relaxed">
              Every transition and gesture is calibrated using physical spring dynamics, ensuring an immediate, responsive feel without visual lag.
            </p>
          </div>

          <div className="flex-shrink-0">
            <MotionOrbitalRings size={120} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <motion.div
            whileHover={{ y: -3 }}
            className="space-y-3"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-base font-bold text-text-primary">Zero-Latency Quick Capture</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Universal natural language ingestion. Type arbitrary thoughts and let our semantic parser automatically extract dates, tags, priorities, and workspaces.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="space-y-3"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </div>
            <h4 className="text-base font-bold text-text-primary">Web Audio Acoustic Masking</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Real-time harmonic sine wave, pink noise, and rain synthesizers running natively in your browser via the Web Audio API without streaming buffers.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            className="space-y-3"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-base font-bold text-text-primary">Local-First Persistence</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              Total sovereignty over your data. Instant offline availability, zero telemetry locks, and frictionless multi-format JSON backups.
            </p>
          </motion.div>

        </div>
      </motion.div>

    </div>
  );
};
