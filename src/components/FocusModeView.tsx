import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Headphones, 
  Coffee, 
  Flame,
  CheckSquare
} from "lucide-react";
import { Task, FocusSession, WorkspaceType } from "../types";
import { soundscapeEngine } from "../utils/audio";
import { MotionSoundwaveGraphic } from "./MotionGraphics";

interface FocusModeViewProps {
  tasks: Task[];
  focusSessions: FocusSession[];
  onAddFocusSession: (session: Omit<FocusSession, "id">) => void;
  activeWorkspace: WorkspaceType;
  audioMode: "off" | "drone" | "pink" | "rain";
  setAudioMode: (mode: "off" | "drone" | "pink" | "rain") => void;
}

export const FocusModeView: React.FC<FocusModeViewProps> = ({
  tasks,
  focusSessions,
  onAddFocusSession,
  activeWorkspace,
  audioMode,
  setAudioMode
}) => {
  const [timerType, setTimerType] = useState<"pomodoro" | "short_break" | "long_break" | "custom">("pomodoro");
  const [customMinutes, setCustomMinutes] = useState(45);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [volume, setVolume] = useState(0.3);

  // Filter tasks for selection
  const availableTasks = tasks.filter((t) => !t.completed && (activeWorkspace === "All" || t.workspace === activeWorkspace));
  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  // Timer Tick
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      // Log session
      const duration = timerType === "pomodoro" ? 25 :
                       timerType === "short_break" ? 5 :
                       timerType === "long_break" ? 15 : customMinutes;

      onAddFocusSession({
        taskId: selectedTaskId || undefined,
        taskTitle: selectedTask?.title || "Free Deep Work Block",
        durationMinutes: duration,
        completedAt: new Date().toISOString(),
        type: timerType,
        workspace: activeWorkspace
      });
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, secondsLeft, timerType, selectedTaskId, selectedTask, customMinutes, activeWorkspace, onAddFocusSession]);

  const switchPreset = (type: "pomodoro" | "short_break" | "long_break" | "custom") => {
    setTimerType(type);
    setIsRunning(false);
    if (type === "pomodoro") setSecondsLeft(25 * 60);
    else if (type === "short_break") setSecondsLeft(5 * 60);
    else if (type === "long_break") setSecondsLeft(15 * 60);
    else if (type === "custom") setSecondsLeft(customMinutes * 60);
  };

  const handleCustomMinuteChange = (mins: number) => {
    const val = Math.max(1, Math.min(180, mins));
    setCustomMinutes(val);
    if (timerType === "custom") {
      setSecondsLeft(val * 60);
    }
  };

  const handleSoundChange = (mode: "off" | "drone" | "pink" | "rain") => {
    setAudioMode(mode);
    soundscapeEngine.play(mode);
  };

  const handleVolumeSlider = (val: number) => {
    setVolume(val);
    soundscapeEngine.setVolume(val);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const totalFocusMinutes = focusSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2 pb-6 border-b border-border-hairline"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface border border-border-hairline text-[11px] font-mono tracking-widest text-primary uppercase shadow-xs">
          <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>Sovereign Deep Work Sanctuary</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
          Distraction-Free Focus Engine
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto">
          Eliminate digital noise. Pair precision Pomodoro intervals with Web Audio acoustic masking and calming motion visuals.
        </p>
      </motion.div>

      {/* Main Focus Console with Breathing Motion Graphic Backdrop */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="p-8 sm:p-12 rounded-3xl bg-surface border border-border-hairline apple-shadow-hero text-center space-y-8 relative overflow-hidden"
      >
        {/* Ambient Breathing Rings (expands and contracts during focus) */}
        {isRunning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-0 opacity-20">
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-96 h-96 rounded-full bg-gradient-to-tr from-primary/30 to-cyan-400/30 blur-2xl"
            />
          </div>
        )}

        {/* Preset Selector */}
        <div className="flex items-center justify-center flex-wrap gap-2 relative z-10">
          <div className="flex items-center bg-surface-muted p-1.5 rounded-2xl border border-border-hairline text-xs font-mono text-text-secondary">
            {(["pomodoro", "short_break", "long_break", "custom"] as const).map((type) => (
              <motion.button
                key={type}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => switchPreset(type)}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  timerType === type ? "bg-surface text-text-primary font-bold shadow-xs" : ""
                }`}
              >
                {type === "pomodoro" ? "Pomodoro (25m)" :
                 type === "short_break" ? "Short Break (5m)" :
                 type === "long_break" ? "Long Break (15m)" :
                 `Custom (${customMinutes}m)`}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom Minutes Slider if custom */}
        {timerType === "custom" && (
          <div className="max-w-xs mx-auto flex items-center justify-center gap-3 text-xs font-mono relative z-10">
            <span className="text-text-secondary">Duration:</span>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={customMinutes}
              onChange={(e) => handleCustomMinuteChange(Number(e.target.value))}
              className="w-40"
            />
            <span className="font-bold text-text-primary">{customMinutes} mins</span>
          </div>
        )}

        {/* Giant Timer Display */}
        <div className="py-4 relative z-10">
          <motion.div 
            key={secondsLeft}
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            className="text-7xl sm:text-9xl font-mono font-extrabold tracking-tight text-text-primary select-none"
          >
            {formatTime(secondsLeft)}
          </motion.div>
          <div className="text-xs sm:text-sm font-mono text-text-secondary mt-3">
            {isRunning ? (
              <span className="text-emerald-600 font-semibold flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                Deep focus active • acoustic masking enabled
              </span>
            ) : (
              "Standing by • Select an objective and initiate timer"
            )}
          </div>
        </div>

        {/* Task Linker */}
        <div className="max-w-md mx-auto space-y-1.5 text-left relative z-10">
          <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary block">
            Link Focus Session to Objective
          </label>
          <select
            value={selectedTaskId || ""}
            onChange={(e) => setSelectedTaskId(e.target.value ? Number(e.target.value) : null)}
            className="w-full p-2.5 rounded-xl bg-surface-muted border border-border-hairline text-xs font-medium text-text-primary"
          >
            <option value="">-- No specific task (Free Focus Block) --</option>
            {availableTasks.map((t) => (
              <option key={t.id} value={t.id}>
                [{t.priority}] {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Main Controls (Start, Pause, Reset) */}
        <div className="flex items-center justify-center gap-4 relative z-10">
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsRunning(!isRunning)}
            className="apple-btn px-8 py-3.5 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? "Pause Session" : "Begin Focus"}</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => switchPreset(timerType)}
            className="p-3.5 rounded-full bg-surface-muted hover:bg-surface-container border border-border-hairline text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Acoustic Soundscape Synthesizer Console & Soundwave Graphic */}
        <div className="pt-6 border-t border-border-hairline max-w-lg mx-auto space-y-4 relative z-10">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-primary" />
              <span>Acoustic Masking Soundscapes</span>
            </span>
            <div className="flex items-center gap-2">
              <MotionSoundwaveGraphic active={audioMode !== "off"} barsCount={8} />
              <span className="text-[11px] font-mono text-emerald-600">Web Audio API</span>
            </div>
          </div>

          {/* Sound buttons */}
          <div className="grid grid-cols-4 gap-2 text-xs font-mono">
            {(["off", "drone", "pink", "rain"] as const).map((mode) => (
              <motion.button
                key={mode}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSoundChange(mode)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  audioMode === mode 
                    ? "bg-primary/10 border-primary/40 text-primary font-bold shadow-xs" 
                    : "border-border-hairline hover:bg-surface-muted"
                }`}
              >
                {mode === "off" ? "Muted" :
                 mode === "drone" ? "432Hz Carrier" :
                 mode === "pink" ? "Pink Noise" : "Serene Rain"}
              </motion.button>
            ))}
          </div>

          {/* Volume slider */}
          {audioMode !== "off" && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center justify-center gap-3 text-xs font-mono pt-1"
            >
              <Volume2 className="w-4 h-4 text-text-secondary" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => handleVolumeSlider(Number(e.target.value))}
                className="w-44"
              />
              <span className="text-text-secondary">{Math.round(volume * 100)}%</span>
            </motion.div>
          )}
        </div>

      </motion.div>

      {/* Focus History Log & Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-6 rounded-3xl bg-surface border border-border-hairline apple-shadow-float space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm text-text-primary">Focus History Log</h3>
          </div>
          <span className="text-xs font-mono text-emerald-600 font-bold">
            Total Logged: {totalFocusMinutes} minutes ({Math.round(totalFocusMinutes / 60 * 10) / 10} hrs)
          </span>
        </div>

        <div className="space-y-2">
          {focusSessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 rounded-2xl bg-surface-muted/50 border border-border-hairline text-xs font-mono"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <div>
                  <span className="font-semibold text-text-primary">{session.taskTitle}</span>
                  <span className="text-[10px] text-text-tertiary ml-2">({session.type})</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-text-secondary">
                <span>{session.durationMinutes} min</span>
                <span className="text-[10px] text-text-tertiary">{new Date(session.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </motion.div>
          ))}

          {focusSessions.length === 0 && (
            <div className="text-center py-6 text-xs text-text-tertiary">
              No completed sessions yet. Start your first sprint above!
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
};
