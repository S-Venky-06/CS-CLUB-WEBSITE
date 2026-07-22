"use client";

import AnimatedBackground from "@/components/background/AnimatedBackground";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, Terminal, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main className="min-h-[85vh] flex items-center justify-center px-4 pt-32 pb-16 relative overflow-hidden">
        
        {/* Background Cyber Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20 mix-blend-overlay" />
        
        <div className="max-w-xl w-full relative group perspective-[1000px]">
          
          <motion.div 
            initial={{ opacity: 0, y: 40, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="relative glass-prominent p-8 sm:p-12 flex flex-col items-center text-center overflow-hidden border border-red-500/30 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.15)] backdrop-blur-2xl"
          >
            {/* Top decorative hazard pattern */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-accent to-red-600" />
            
            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-red-500/50" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-red-500/50" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-red-500/50" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-red-500/50" />
            
            {/* Terminal warning icon */}
            <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(239,68,68,0.2)] relative">
              <div className="absolute inset-0 rounded-full border border-red-500/20 animate-ping-slow" />
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>

            {/* Glitching 404 Header */}
            <div className="relative mb-4">
              <h1 className="font-heading text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-400 to-red-600 tracking-widest select-none drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                404
              </h1>
              <h1 className="absolute inset-0 font-heading text-7xl sm:text-9xl font-black text-cyan opacity-50 mix-blend-screen -translate-x-[2px] translate-y-[2px] animate-glitch-1 pointer-events-none select-none tracking-widest">
                404
              </h1>
              <h1 className="absolute inset-0 font-heading text-7xl sm:text-9xl font-black text-accent opacity-50 mix-blend-screen translate-x-[2px] -translate-y-[2px] animate-glitch-2 pointer-events-none select-none tracking-widest">
                404
              </h1>
            </div>
            
            {/* Tech subtitle status with typing animation */}
            <div className="mb-8 w-full max-w-[300px] overflow-hidden whitespace-nowrap border-r-2 border-red-500 animate-[typing_2s_steps(40,end),blink-caret_0.75s_step-end_infinite] mx-auto text-center">
              <span className="text-xs sm:text-sm font-mono text-red-400 uppercase tracking-[0.3em] font-bold">
                <Terminal className="w-3 h-3 inline-block mr-2 -mt-1" />
                SYSTEM_FAILURE
              </span>
            </div>

            {/* Main Message */}
            <h2 className="text-white font-heading text-2xl font-bold mb-3 tracking-wide">
              Entity Not Found
            </h2>
            <p className="text-muted text-base leading-relaxed max-w-[320px] mb-10 font-medium">
              The requested directory or sector was not found on this secure node. It may have been relocated or purged.
            </p>

            {/* Action Button */}
            <a
              href="/"
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 w-full sm:w-auto rounded-xl bg-red-500/10 text-red-400 font-bold text-sm border border-red-500/30 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat group-hover:animate-shimmer-sweep rounded-xl" />
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="tracking-wide">Return to Mainframe</span>
            </a>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
