"use client";

import AnimatedBackground from "@/components/background/AnimatedBackground";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main className="min-h-[80vh] flex items-center justify-center px-4 pt-24 pb-16">
        <div className="max-w-md w-full relative group">
          {/* Glowing purple shadow effect in background */}
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
          
          <div className="relative glass-card p-8 sm:p-10 flex flex-col items-center text-center overflow-hidden border border-glass-border">
            {/* Top decorative hazard pattern */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-primary to-accent opacity-85" />
            
            {/* Terminal warning icon */}
            <div className="w-14 h-14 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center mb-6">
              <Terminal className="w-6 h-6 text-accent animate-pulse" />
            </div>

            {/* Glowing Monospace 404 Header */}
            <h1 className="font-heading text-6xl sm:text-7xl font-bold text-foreground tracking-wider mb-2 select-none text-glow">
              404
            </h1>
            
            {/* Tech subtitle status */}
            <span className="text-[10px] font-mono text-accent uppercase tracking-widest bg-accent/10 px-2.5 py-1 rounded border border-accent/20 mb-6">
              STATUS: ACCESS_DENIED
            </span>

            {/* Main Message */}
            <p className="text-foreground font-heading text-lg font-semibold mb-2">
              The page you&apos;re looking for doesn&apos;t exist.
            </p>
            <p className="text-muted text-sm leading-relaxed max-w-[280px]">
              The requested directory or file was not found on this secure node.
            </p>

            {/* Action Button */}
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 mt-8 w-full rounded-xl bg-accent text-white font-semibold text-sm shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:brightness-110 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Return Home
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
