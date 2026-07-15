"use client";

import { motion } from "framer-motion";
import { Terminal, Shield, Cpu, Activity, Lock } from "lucide-react";

export default function HeroIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
      {/* Ambient soft glow behind */}
      <div
        className="absolute inset-0 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(91,42,134,0.35) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* 3D Perspective Container */}
      <div
        className="relative w-[340px] h-[340px]"
        style={{ perspective: "1000px" }}
      >
        {/* Floating 3D Layer Wrapper */}
        <motion.div
          animate={{
            y: [-12, 12, -12],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative w-full h-full"
          style={{
            transform: "rotateX(22deg) rotateY(-22deg) rotateZ(6deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* ================================================= */}
          {/* LAYER 1: BASE LOGS CARD (translateZ = 0px)       */}
          {/* ================================================= */}
          <div
            className="absolute inset-0 rounded-2xl glass p-5 flex flex-col justify-between shadow-2xl border border-glass-border"
            style={{ transform: "translateZ(0px)", transformStyle: "preserve-3d" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-secondary" />
                <span className="font-heading text-[11px] font-semibold tracking-wider text-muted uppercase">
                  sec_terminal_v1.0
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  Secure
                </span>
              </div>
            </div>

            {/* Terminal Lines */}
            <div className="space-y-2.5 font-mono text-[10px] text-muted/95 mt-4">
              <p className="text-secondary/80 font-semibold">
                $ init gcet_shield_firewall
              </p>
              <p className="flex items-center gap-1 text-emerald-400">
                <span>[OK]</span> Ports monitored: 100% secure
              </p>
              <p className="flex items-center gap-1">
                <span>[OK]</span> IPS/IDS perimeter active
              </p>
              <p className="flex items-center gap-1 text-accent">
                <span>[OK]</span> Cryptoshield v2 loaded
              </p>
              <p className="text-secondary/60">$ listening on port 443...</p>
            </div>

            {/* Micro grid graphical footer */}
            <div className="border-t border-glass-border/40 pt-3 mt-4 flex items-center justify-between">
              <span className="text-[9px] font-semibold text-muted/60 uppercase">
                System: Encrypted
              </span>
              <Cpu className="w-4 h-4 text-muted/40" />
            </div>
          </div>

          {/* ================================================= */}
          {/* LAYER 2: MIDDLE TRAFFIC CARD (translateZ = 40px) */}
          {/* ================================================= */}
          <div
            className="absolute top-10 left-10 w-[240px] h-[155px] rounded-2xl bg-[#13131A]/85 border border-primary/20 backdrop-blur-md p-4 flex flex-col justify-between shadow-3xl"
            style={{ transform: "translateZ(45px)", transformStyle: "preserve-3d" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-secondary" />
                <span className="font-heading text-[10px] font-semibold tracking-wider text-foreground uppercase">
                  Traffic Scope
                </span>
              </div>
              <span className="text-[9px] text-muted font-mono font-semibold">
                1.84K req/s
              </span>
            </div>

            {/* SVG Animated Chart */}
            <div className="h-16 w-full overflow-hidden flex items-end mt-2">
              <svg className="w-full h-full" viewBox="0 0 200 60" fill="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(122, 62, 177, 0.4)" />
                    <stop offset="100%" stopColor="rgba(122, 62, 177, 0)" />
                  </linearGradient>
                </defs>
                {/* Background Area */}
                <path
                  d="M0,50 Q25,20 50,45 T100,20 T150,35 T200,15 L200,60 L0,60 Z"
                  fill="url(#chartGrad)"
                />
                {/* Waving line */}
                <motion.path
                  d="M0,50 Q25,20 50,45 T100,20 T150,35 T200,15"
                  stroke="#7A3EB1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
                {/* Pulsing indicator node */}
                <circle cx="200" cy="15" r="3" fill="#FF7A1A" />
                <circle
                  cx="200"
                  cy="15"
                  r="6"
                  fill="none"
                  stroke="#FF7A1A"
                  strokeWidth="1"
                  className="animate-ping"
                />
              </svg>
            </div>

            <div className="text-[9px] text-muted flex items-center justify-between border-t border-glass-border/30 pt-2.5">
              <span>Security Perimeter Status</span>
              <span className="text-emerald-400 font-semibold font-mono">Stable</span>
            </div>
          </div>

          {/* ================================================= */}
          {/* LAYER 3: TOP WIDGET CARD (translateZ = 80px)      */}
          {/* ================================================= */}
          <div
            className="absolute bottom-6 right-6 w-[170px] h-[105px] rounded-2xl bg-[#13131A]/95 border border-accent/25 backdrop-blur-xl p-3.5 flex items-center gap-3 shadow-3xl"
            style={{ transform: "translateZ(90px)" }}
          >
            {/* Spinning Radar Icon */}
            <div className="relative w-11 h-11 flex-shrink-0 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
              {/* Sonar Radar Swivel */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-t border-accent rounded-full opacity-60"
              />
            </div>

            {/* Widget Text Details */}
            <div className="flex flex-col justify-center min-w-0">
              <p className="font-heading text-[10px] font-semibold text-foreground uppercase tracking-wider truncate">
                Threat Monitor
              </p>
              <p className="text-[14px] font-bold text-foreground mt-0.5 font-mono">
                247 <span className="text-[9px] text-muted font-normal font-sans">blocked/hr</span>
              </p>
              {/* Mini progress bar */}
              <div className="w-full h-1 bg-surface border border-glass-border/40 rounded-full overflow-hidden mt-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "80%" }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-full bg-accent"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
