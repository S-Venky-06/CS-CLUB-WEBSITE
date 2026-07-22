"use client";

import { Mail, Github, Linkedin, Instagram, Sparkles, Heart } from "lucide-react";
import Image from "next/image";

const quickLinks = [
  { label: "Home", href: "/#home" },
  { label: "Events", href: "/events" },
  { label: "Members", href: "/members" },
  { label: "About", href: "/#about" },
];

const socialLinks = [
  { icon: Github, href: "https://github.com/cyber438", label: "GitHub", hoverColor: "hover:text-white hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/cyber-security-club-gcet-72572a378/", label: "LinkedIn", hoverColor: "hover:text-cyan hover:border-cyan hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]" },
  { icon: Instagram, href: "https://www.instagram.com/cybersecurity_club_gcet/", label: "Instagram", hoverColor: "hover:text-accent hover:border-accent hover:shadow-[0_0_15px_rgba(255,85,0,0.4)]" },
];

export default function Footer() {
  return (
    <footer className="relative mt-20 pt-20 pb-10 overflow-hidden bg-background">
      {/* Top Glowing Divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-cyan to-transparent blur-sm opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-cyan/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-5">
            <div className="flex items-center gap-4 mb-6 group">
              <div className="relative">
                {/* Spinning Neon Halo */}
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary via-cyan to-accent opacity-70 blur group-hover:animate-spin-slow transition-all duration-700 pointer-events-none" />
                <div className="relative w-12 h-12 rounded-xl bg-white overflow-hidden flex items-center justify-center border-2 border-white/10 z-10">
                  <Image
                    src="/club-logo.png"
                    alt="Cybersecurity Club Logo"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
              </div>
              <div>
                <p className="font-heading font-bold text-foreground text-lg tracking-wide group-hover:text-cyan transition-colors duration-300">
                  Cybersecurity Club
                </p>
                <p className="text-xs text-muted font-semibold tracking-[0.2em] uppercase">GCET</p>
              </div>
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-md">
              Empowering the next generation of cybersecurity professionals
              through education, practice, and community. Bridging the gap between 
              theory and real-world defense.
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 lg:col-start-7">
            <h4 className="font-heading font-bold text-foreground text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan" />
              Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-muted transition-all duration-300 hover:translate-x-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-glass-border group-hover:bg-cyan transition-colors" />
                    <span className="group-hover:text-white transition-colors">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h4 className="font-heading font-bold text-foreground text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent" />
              Contact
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:cybersecurityclub@gcet.edu.in"
                  className="group flex items-center gap-3 p-3 rounded-xl bg-surface/30 border border-glass-border hover:border-cyan/50 hover:bg-surface/60 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-cyan/20 group-hover:text-cyan transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-muted group-hover:text-white transition-colors">
                    cybersecurityclub@gcet.edu.in
                  </span>
                </a>
              </li>
              <li className="text-sm text-muted/80 leading-relaxed pl-1 border-l-2 border-glass-border">
                Geethanjali College of Engineering and Technology<br />
                Keesara, Cheeryal, Hyderabad-501301
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Glassmorphic Dock */}
        <div className="relative rounded-2xl glass-prominent border border-glass-border-hover p-6 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden">
          {/* Animated Background for Dock */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-cyan/5 to-accent/5" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <p className="text-xs text-muted/80 font-medium">
              © {new Date().getFullYear()} Cybersecurity Club GCET.<br className="sm:hidden" /> All rights reserved.
            </p>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-glass-border" />
            <p className="text-[11px] text-cyan/90 font-semibold tracking-wider flex items-center justify-center sm:justify-start gap-1.5 uppercase">
              Made with <Heart className="w-3 h-3 text-accent fill-accent animate-pulse" /> by S.S.S.Venkatesh
            </p>
          </div>

          {/* Floating Social Links */}
          <div className="relative z-10 flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 rounded-xl bg-surface border border-glass-border flex items-center justify-center text-muted transition-all duration-300 cursor-pointer hover:-translate-y-1 ${social.hoverColor}`}
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
