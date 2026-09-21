import React, { useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValue } from "framer-motion";
import { Sparkles, Activity, Shield, Cpu, Compass, Orbit, Zap } from "lucide-react";

/**
 * Top Scroll Progress Indicator Bar with Spring Physics & Glow
 */
export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 z-[9999] origin-left pointer-events-none shadow-[0_0_12px_rgba(59,130,246,0.6)]"
      style={{ scaleX }}
    />
  );
};

/**
 * Interactive Particle & Constellation Motion Graphic Canvas
 */
export const MotionConstellationCanvas: React.FC<{
  className?: string;
  density?: number;
  interactive?: boolean;
}> = ({ className = "h-48", density = 32, interactive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle nodes
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      baseAlpha: number;
    }> = [];

    const colors = ["#0071e3", "#6366f1", "#06b6d4", "#a855f7", "#3b82f6"];

    for (let i = 0; i < density; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.4 + 0.2
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const onMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const onMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            const alpha = (1 - dist / 90) * 0.22;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 113, 227, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on borders
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse attraction/repulsion
        if (interactive) {
          const mdx = mouseX - p.x;
          const mdy = mouseY - p.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 100 && mdist > 0) {
            const force = (100 - mdist) / 100;
            p.x -= (mdx / mdist) * force * 1.5;
            p.y -= (mdy / mdist) * force * 1.5;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.baseAlpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (canvas) {
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseleave", onMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [density, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block rounded-2xl pointer-events-auto ${className}`}
    />
  );
};

/**
 * Animated Orbital Rings Graphic with Motion Rotations
 */
export const MotionOrbitalRings: React.FC<{ size?: number; color?: string }> = ({
  size = 140,
  color = "#0071e3"
}) => {
  return (
    <div
      className="relative flex items-center justify-center pointer-events-none select-none"
      style={{ width: size, height: size }}
    >
      {/* Outer Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-dashed border-primary/25"
      />

      {/* Counter-rotating Middle Ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute inset-3 rounded-full border border-primary/30 flex items-start justify-center"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-primary -mt-1.5 shadow-[0_0_8px_#0071e3]" />
      </motion.div>

      {/* Inner Ring with Satellite */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-7 rounded-full border border-cyan-400/30 flex items-center justify-end"
      >
        <div className="w-2 h-2 rounded-full bg-cyan-400 -mr-1 shadow-[0_0_6px_#22d3ee]" />
      </motion.div>

      {/* Pulsing Core */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center text-white shadow-md shadow-primary/30"
      >
        <Sparkles className="w-4 h-4" />
      </motion.div>
    </div>
  );
};

/**
 * 3D Tilt Card with Framer Motion Physics
 */
export const Motion3DCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = "", onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d"
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`transition-shadow duration-300 ${className}`}
    >
      <div style={{ transform: "translateZ(20px)" }}>{children}</div>
    </motion.div>
  );
};

/**
 * Animated Flowing Soundwave Graphic
 */
export const MotionSoundwaveGraphic: React.FC<{
  active?: boolean;
  barsCount?: number;
}> = ({ active = true, barsCount = 18 }) => {
  return (
    <div className="flex items-center gap-1 h-8 px-2">
      {Array.from({ length: barsCount }).map((_, i) => (
        <motion.div
          key={i}
          animate={
            active
              ? {
                  height: [
                    "6px",
                    `${Math.sin(i * 0.5) * 16 + 18}px`,
                    "8px",
                    `${Math.cos(i * 0.4) * 18 + 22}px`,
                    "6px"
                  ]
                }
              : { height: "4px" }
          }
          transition={{
            duration: 1.4 + (i % 5) * 0.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (i * 0.08)
          }}
          className={`w-1 rounded-full ${
            active
              ? "bg-gradient-to-t from-primary to-cyan-400 shadow-[0_0_4px_rgba(0,113,227,0.4)]"
              : "bg-text-tertiary/30"
          }`}
        />
      ))}
    </div>
  );
};

/**
 * Animated Circular Metric Indicator with Spring Drawing
 */
export const MotionMetricRing: React.FC<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}> = ({ progress, size = 64, strokeWidth = 5, label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-container"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="url(#gradient-metric)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (circumference * progress) / 100 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gradient-metric" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0071e3" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-bold font-mono text-text-primary leading-none">
          {Math.round(progress)}%
        </span>
        {label && <span className="text-[8px] font-mono text-text-tertiary mt-0.5">{label}</span>}
      </div>
    </div>
  );
};

/**
 * Floating Back-To-Top Button with Framer Motion Animation
 */
export const MotionBackToTopButton: React.FC = () => {
  const { scrollY } = useScroll();
  const [visible, setVisible] = React.useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setVisible(latest > 350);
    });
  }, [scrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={visible ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
      transition={{ duration: 0.2 }}
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-surface border border-border-hairline apple-shadow-hero text-text-primary hover:text-primary hover:border-primary/40 transition-all cursor-pointer backdrop-blur-md"
      title="Scroll to Top"
    >
      <Zap className="w-4 h-4 fill-current text-primary" />
    </motion.button>
  );
};
