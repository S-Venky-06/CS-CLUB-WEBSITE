"use client";

import { motion } from "framer-motion";
import { Trophy, Award, ExternalLink, ShieldCheck, Cpu, Terminal, Flame, Zap, CheckCircle2 } from "lucide-react";

const ctfStats = [
  { value: "Rank #2", label: "Nationwide (HackZero '26)" },
  { value: "212+", label: "Teams Competed Against" },
  { value: "15", label: "CTF Participations" },
  { value: "5", label: "Top Podium Rankings" },
];

const hallOfFame = [
  {
    title: "INCEPTION CTF 2025",
    rank: "1st Place Champions 🥇",
    description: "Secured 1st Place overall. Locked the perimeter and earned ACP Credentials & K7 Security Licenses.",
    operators: ["G H Dhanush Reddy", "Vyshnav DesiReddy (Team DDMM)", "Kakumanu Harshith", "S S S Venkatesh (Team TryHack - 2nd)"],
    gradient: "from-[#F47820] via-[#FFA24A] to-[#7A1D5C]",
    borderColor: "border-[#F47820]",
    glowColor: "rgba(244,120,32,0.3)",
  },
  {
    title: "HackZero '26 (VIT Bhopal OWASP)",
    rank: "2nd Place Runner-Up 🥈",
    description: "Achieved Rank #2 out of 212 participating teams nationwide in an intense 24-hour offensive hacking marathon.",
    operators: ["G H Dhanush Reddy", "S S S Venkatesh", "Kakumanu Harshith", "Vyshnav DesiReddy"],
    gradient: "from-[#B23A87] via-[#7A1D5C] to-[#54276A]",
    borderColor: "border-[#B23A87]",
    glowColor: "rgba(178,58,135,0.3)",
  },
];

const skillVectors = [
  { name: "Web Exploitation", percentage: 95, icon: Terminal, color: "from-[#F47820] to-[#FFA24A]" },
  { name: "Reverse Engineering", percentage: 90, icon: Cpu, color: "from-[#B23A87] to-[#F47820]" },
  { name: "OSINT Intelligence", percentage: 88, icon: ShieldCheck, color: "from-[#7A1D5C] to-[#B23A87]" },
  { name: "Cryptography", percentage: 85, icon: Zap, color: "from-[#54276A] to-[#B23A87]" },
  { name: "Digital Forensics", percentage: 80, icon: Flame, color: "from-[#F47820] to-[#7A1D5C]" },
];

const timeline = [
  { year: "2024", phase: "Initiation", desc: "Formed collective & offensive sandbox operations." },
  { year: "EARLY 2025", phase: "First Engagement", desc: "Regional CTF debut in Web & OSINT vectors." },
  { year: "LATE 2025", phase: "Inception Champions", desc: "1st Place overall; earned ACP credentials." },
  { year: "2026", phase: "HackZero Finals", desc: "Rank #2 out of 212 teams nationwide." },
];

export default function TeamDDMMShowcase() {
  return (
    <div className="w-full space-y-12 my-8">
      {/* Top Banner / Hero Card */}
      <div className="relative glass-prominent rounded-3xl p-6 sm:p-10 border border-[#F47820]/40 overflow-hidden shadow-[0_0_50px_rgba(244,120,32,0.15)]">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7A1D5C] via-[#B23A87] to-[#F47820]" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F47820]/15 border border-[#F47820]/30 text-xs font-mono font-bold text-[#F47820] shadow-[0_0_15px_rgba(244,120,32,0.2)]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>🏆 STATUS: MISSION ACCOMPLISHED &bull; NFSU BHOPAL CTF CONQUERED</span>
            </div>

            <h3 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              TEAM <span className="gradient-text">DDMM</span>
            </h3>

            <p className="text-sm sm:text-base text-[#EDEAF2]/90 max-w-2xl font-medium leading-relaxed">
              <strong className="text-[#F47820]">Breaking Systems. Capturing Flags.</strong> The premier competitive CTF wing operating out of Geethanjali College of Engineering and Technology.
            </p>
          </div>

          <a
            href="https://ddmm-ctf.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#7A1D5C] via-[#B23A87] to-[#F47820] text-[#EDEAF2] font-bold text-sm shadow-lg shadow-[#F47820]/30 hover:shadow-[#F47820]/60 transition-all duration-300 hover:-translate-y-1 whitespace-nowrap cursor-pointer"
          >
            <span>Visit Official Team DDMM Website</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Live Performance Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
          {ctfStats.map((stat, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#150F1F]/60 border border-white/10 text-center">
              <p className="font-heading text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#EDEAF2] via-[#B23A87] to-[#F47820]">
                {stat.value}
              </p>
              <p className="text-[11px] uppercase tracking-wider text-[#8B8496] font-semibold mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Hall of Fame / CTF Trophies Grid */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-5 h-5 text-[#F47820]" />
          <h4 className="font-heading text-xl font-bold text-foreground tracking-wide">
            Hall of Fame & Podium Finishes
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hallOfFame.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative glass-card p-6 sm:p-8 rounded-2xl border ${item.borderColor} shadow-xl overflow-hidden group flex flex-col justify-between`}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient}`} />
              
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="text-xs font-mono font-bold tracking-widest text-[#F47820] uppercase">
                      Verified Result
                    </span>
                    <h5 className="font-heading text-2xl font-bold text-foreground mt-1">
                      {item.title}
                    </h5>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#F47820]/15 border border-[#F47820]/40 text-xs font-extrabold text-[#F47820] shadow-md">
                    {item.rank}
                  </span>
                </div>

                <p className="text-sm text-[#8B8496] leading-relaxed mb-6 font-medium">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#EDEAF2]/70 font-semibold">
                  Roster In Engagement:
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.operators.map((op, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#150F1F] border border-white/10 text-xs font-medium text-[#EDEAF2]">
                      <CheckCircle2 className="w-3 h-3 text-[#F47820]" />
                      {op}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          {/* 3rd Card: More Achievements & Official DDMM Website Redirect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative glass-prominent p-6 sm:p-8 rounded-2xl border-2 border-[#F47820]/60 shadow-[0_0_30px_rgba(244,120,32,0.2)] overflow-hidden group flex flex-col justify-between bg-gradient-to-b from-[#150F1F] via-[#1E1530] to-[#0A0710]"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F47820] via-[#FFA24A] to-[#B23A87]" />

            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-xs font-mono font-bold tracking-widest text-[#F47820] uppercase">
                    More Accomplishments
                  </span>
                  <h5 className="font-heading text-2xl font-bold text-foreground mt-1">
                    Explore Full CTF History
                  </h5>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#F47820]/20 border border-[#F47820]/50 text-xs font-extrabold text-[#FFA24A] shadow-md animate-pulse">
                  15+ Events 🏆
                </span>
              </div>

              <p className="text-sm text-[#EDEAF2]/90 leading-relaxed mb-6 font-medium">
                View our complete timeline of national & global CTF victories, detailed challenge writeups, live scoreboard rankings, and offensive vectors.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <a
                href="https://ddmm-ctf.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#7A1D5C] via-[#B23A87] to-[#F47820] text-white font-extrabold text-sm shadow-lg shadow-[#F47820]/30 hover:shadow-[#F47820]/60 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Visit Official DDMM Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Skills Vector Progress & Operational Timeline */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Dominant Vectors (Skills) */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-glass-border">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-[#B23A87]" />
            <h4 className="font-heading text-lg font-bold text-foreground">
              Dominant Vector Proficiency
            </h4>
          </div>

          <div className="space-y-5">
            {skillVectors.map((skill, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-[#EDEAF2]">
                    <skill.icon className="w-4 h-4 text-[#F47820]" />
                    {skill.name}
                  </span>
                  <span className="text-[#F47820] font-mono">{skill.percentage}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#150F1F] overflow-hidden p-0.5 border border-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.percentage}%` }}
                    transition={{ duration: 1, delay: 0.2 + idx * 0.1 }}
                    className={`h-full rounded-full bg-gradient-to-r ${skill.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Timeline */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-glass-border">
          <div className="flex items-center gap-2 mb-6">
            <Terminal className="w-5 h-5 text-[#F47820]" />
            <h4 className="font-heading text-lg font-bold text-foreground">
              Operational Track Record
            </h4>
          </div>

          <div className="space-y-6 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#54276A]/40">
            {timeline.map((item, idx) => (
              <div key={idx} className="relative pl-8 group">
                <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-[#F47820] border-2 border-[#0A0710] shadow-[0_0_8px_rgba(244,120,32,0.8)] -translate-x-1/2" />
                <div className="flex items-center gap-2 text-xs font-mono text-[#F47820] font-bold">
                  <span>{item.year}</span>
                  <span>&bull;</span>
                  <span className="text-[#EDEAF2] uppercase">{item.phase}</span>
                </div>
                <p className="text-xs text-[#8B8496] mt-1 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
