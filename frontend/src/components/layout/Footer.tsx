"use client";

import { Mail, Github, Linkedin, Instagram } from "lucide-react";
import Image from "next/image";

const quickLinks = [
  { label: "Home", href: "/#home" },
  { label: "Events", href: "/events" },
  { label: "Members", href: "/members" },
  { label: "About", href: "/#about" },
];

const socialLinks = [
  { icon: Github, href: "https://github.com/cyber438", label: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/cyber-security-club-gcet-72572a378/", label: "LinkedIn" },
  { icon: Instagram, href: "https://www.instagram.com/cybersecurity_club_gcet/", label: "Instagram" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-glass-border bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white overflow-hidden flex items-center justify-center border border-glass-border">
                <Image
                  src="/club-logo.png"
                  alt="Cybersecurity Club Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <div>
                <p className="font-heading font-semibold text-foreground text-sm">
                  Cybersecurity Club
                </p>
                <p className="text-xs text-muted">GCET</p>
              </div>
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              Empowering the next generation of cybersecurity professionals
              through education, practice, and community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-foreground text-sm mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted hover:text-foreground transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-foreground text-sm mb-4">
              Contact
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="mailto:cybersecurityclub@gcet.edu.in"
                  className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200"
                >
                  <Mail className="w-4 h-4" />
                  cybersecurityclub@gcet.edu.in
                </a>
              </li>
              <li className="text-sm text-muted">
                Geethanjali College of Enginnering and Technology
              </li>
              <li className="text-sm text-muted">
                Keesara,Cheereyal,Hyderabad-501301
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-heading font-semibold text-foreground text-sm mb-4">
              Follow Us
            </h4>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-surface border border-glass-border flex items-center justify-center text-muted hover:text-foreground hover:border-secondary/30 hover:bg-primary/10 transition-all duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-glass-border grid grid-cols-1 sm:grid-cols-3 items-center gap-4 text-center">
          <p className="text-xs text-muted sm:text-left">
            © {new Date().getFullYear()} Cybersecurity Club of GCET. All rights
            reserved.
          </p>
          <p className="text-xs text-accent/80 sm:text-center font-medium">
            Website made by S.S.S.Venkatesh
          </p>
          <p className="text-xs text-muted/60 sm:text-right">
            Designed with passion for security.
          </p>
        </div>
      </div>
    </footer>
  );
}
