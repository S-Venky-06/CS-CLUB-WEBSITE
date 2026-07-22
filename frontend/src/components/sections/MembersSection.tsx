"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Instagram, Linkedin, Shield, Award, Users } from "lucide-react";
import Image from "next/image";

interface Member {
  name: string;
  role?: string;
  specialty: string;
  initials: string;
  image: string;
  linkedin?: string;
  instagram?: string;
}

// Leadership Team data
const leadership: Member[] = [
  {
    name: "Dhanush Reddy",
    role: "Club President",
    specialty: "Team DDMM CTF Player & Winner",
    initials: "DR",
    image: "/members/president.png",
    linkedin: "https://www.linkedin.com/in/dhanush3105/",
    instagram: "https://www.instagram.com/dhanush_reddy_31",
  },
  {
    name: "Shreyas Behara",
    role: "Vice President",
    specialty: "Amazon ML Summer School Cohort",
    initials: "SB",
    image: "/members/vp1.png",
    linkedin: "https://www.linkedin.com/in/shreyas-behara/",
    instagram: "https://www.instagram.com/shreyasbehara_30?igsh=MWswZjhmN3ZveGp3Nw%3D%3D",
  },
  {
    name: "K.Manogna",
    role: "Vice President",
    specialty: "Core Member",
    initials: "KM",
    image: "/members/vp2.png",
    linkedin: "https://www.linkedin.com/in/manogna-kundam-9a0a63376/",
    instagram: "https://www.instagram.com/manognareddyy?igsh=cTY3bWV0OTlpNnNw",
  },
];

// Team Leads data
const leads: Member[] = [
  {
    name: "S.S.S.Venkatesh",
    role: "Technical & Logistics Lead",
    specialty: "Team DDMM CTF Player & Winner",
    initials: "VS",
    image: "/members/lead_tech.png",
    linkedin: "https://www.linkedin.com/in/s-s-s-venkatesh-ab0859291/",
    instagram: "https://www.instagram.com/venkysama333/",
  },
  {
    name: "Vaishnavi Pratha",
    role: "Designing Head",
    specialty: "Creative Director & Visual Media Lead",
    initials: "VP",
    image: "/members/lead_design.png",
    linkedin: "https://www.linkedin.com/in/vaishnavipratha7/",
  },
  {
    name: "Vikram Aditya",
    role: "Social Media Head",
    specialty: "Outreach & Social Media Handler",
    initials: "VA",
    image: "/members/lead_social1.png",
    linkedin: "https://www.linkedin.com/in/atragada-vikramaditya-026697303/",
    instagram: "https://www.instagram.com/vikramaditya.atragada?igsh=MWsxdDI0aDhudnlxcg%3D%3D",
  },
  {
    name: "G.Vaishnavi",
    role: "Social Media Head",
    specialty: "Content Strategy & Copywriting",
    initials: "GV",
    image: "/members/lead_social2.png",
    linkedin: "https://www.linkedin.com/in/vaishnavi-gajula-0b369b303/",
    instagram: "https://www.instagram.com/_vaishnavigajula_?igsh=ajB3N2x2NHA3YXps",
  },
  {
    name: "Gunjana Kachuwah",
    role: "Operations Lead",
    specialty: "Event Strategy & Public Relations",
    initials: "GK",
    image: "/members/lead_ops.png",
    linkedin: "https://www.linkedin.com/in/gunjana-kachuwah/",
    instagram: "https://www.instagram.com/gunjana_kachuwah?igsh=cXliYnhja3Bhcmc1",
  },
];

// Core Team data
const coreTeam: Member[] = [
  {
    name: "K.Harshith Subramanyam",
    role: "Core Member",
    specialty: "Team DDMM CTF Player & Winner",
    initials: "KH",
    image: "/members/core1.png",
    linkedin: "https://www.linkedin.com/in/kakumanu-harshith-subrahmanyam-56455a255/",
    instagram: "https://www.instagram.com/suubbbuu/",
  },
  {
    name: "V.Padmavathi Pranathi",
    role: "Core Member",
    specialty: "EY Intern",
    initials: "PR",
    image: "/members/core2.png",
    linkedin: "https://www.linkedin.com/in/v-padmavathi-pranathi-5165a8359/",
    instagram: "https://www.instagram.com/_padmavathipranathi/",
  },
  {
    name: "Sai Lasya",
    role: "Core Member",
    specialty: "",
    initials: "SL",
    image: "/members/core3.png",
    linkedin: "https://www.linkedin.com/in/lasya-k-376740318/",
    instagram: "https://www.instagram.com/lasya_jpg/",
  },
  {
    name: "Harsh Jha",
    role: "Core Member",
    specialty: "",
    initials: "HJ",
    image: "/members/core4.png",
    linkedin: "https://www.linkedin.com/in/harsh-jha-883aa5327/",
    instagram: "https://www.instagram.com/markjhaash/",
  },
  {
    name: "Saathvik",
    role: "Core Member",
    specialty: "",
    initials: "SA",
    image: "/members/core5.png",
    linkedin: "https://www.linkedin.com/in/saathvik-vinnakota-007838363/",
    instagram: "https://www.instagram.com/s4a.thv1k/",
  },
  {
    name: "Mohammed Adil Ahmed",
    role: "Core Member",
    specialty: "Ex-NIT Warangal Intern",
    initials: "MA",
    image: "/members/core6.png",
    linkedin: "https://www.linkedin.com/in/mohammed-adil-ahmed-shareef-445586323/",
    instagram: "#",
  },
];

// Refactored Sub-Component to handle state and render cards uniformly
function MemberCard({
  member,
  isLeadership = false,
  priority = true,
}: {
  member: Member;
  isLeadership?: boolean;
  priority?: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const glowColor = isLeadership ? "rgba(255,85,0,0.4)" : "rgba(0,240,255,0.4)";
  const gradientClass = isLeadership ? "from-accent to-primary" : "from-cyan to-primary";

  return (
    <article className="group relative glass-card flex flex-col overflow-hidden border border-glass-border hover:border-transparent transition-all duration-500 rounded-2xl shadow-lg transform-gpu hover:-translate-y-2">
      
      {/* Holographic Border Effect on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl bg-gradient-to-br from-primary via-cyan to-accent pointer-events-none p-[1.5px] -z-10">
         <div className="w-full h-full bg-[#0B0B12] rounded-2xl" />
      </div>

      {/* Ambient glow behind card */}
      <div 
        className="absolute -inset-2 opacity-0 group-hover:opacity-60 blur-xl transition-opacity duration-500 -z-20"
        style={{ background: glowColor }}
      />

      {/* Image slot */}
      <div
        className="relative w-full overflow-hidden bg-gradient-to-br from-surface to-background aspect-[3/4]"
      >
        {!imageError ? (
          <Image
            src={member.image}
            alt={`${member.name}'s portrait`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            onError={() => setImageError(true)}
            className="object-cover object-center filter grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out group-hover:scale-105"
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface to-[#13131A]">
            <span
              className={`font-heading font-bold text-foreground tracking-widest ${
                isLeadership ? "text-3xl" : "text-xl"
              }`}
            >
              {member.initials}
            </span>
          </div>
        )}

        {/* Cyber scanner frame */}
        <div className="absolute inset-0 border-[4px] border-[#0B0B12] opacity-50 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B12] via-transparent to-transparent opacity-80 z-10" />
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none z-10 mix-blend-overlay" />
        
        {/* Animated Scanline */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan/20 to-transparent -translate-y-full group-hover:animate-[scan-line_2s_linear_infinite] z-20 pointer-events-none" />
      </div>

      {/* Card Content block */}
      <div className="p-5 flex flex-col flex-grow text-left relative z-20 bg-[#0B0B12]/80 backdrop-blur-md">
        {member.role && (
          <span className={`inline-block w-max px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest mb-3 bg-gradient-to-r ${gradientClass} text-white shadow-md`}>
            {member.role}
          </span>
        )}
        <h4
          className={`font-heading font-bold text-foreground mb-1.5 transition-colors duration-300 group-hover:text-white ${
            isLeadership ? "text-xl" : "text-base"
          }`}
        >
          {member.name}
        </h4>
        <p className="text-xs text-muted leading-relaxed mb-4 flex-grow group-hover:text-muted/90 transition-colors">
          {member.specialty}
        </p>

        {/* Social link bar */}
        {((member.linkedin && member.linkedin !== "#") || (member.instagram && member.instagram !== "#")) && (
          <div className="flex items-center gap-3 pt-4 border-t border-glass-border">
            {member.linkedin && member.linkedin !== "#" && (
              <a
                href={member.linkedin}
                className="w-8 h-8 rounded-lg bg-surface/50 border border-glass-border flex items-center justify-center text-muted hover:text-cyan hover:border-cyan hover:shadow-[0_0_10px_rgba(0,240,255,0.4)] hover:-translate-y-1 transition-all duration-300"
                aria-label={`${member.name}'s LinkedIn`}
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            )}
            {member.instagram && member.instagram !== "#" && (
              <a
                href={member.instagram}
                className="w-8 h-8 rounded-lg bg-surface/50 border border-glass-border flex items-center justify-center text-muted hover:text-accent hover:border-accent hover:shadow-[0_0_10px_rgba(255,85,0,0.4)] hover:-translate-y-1 transition-all duration-300"
                aria-label={`${member.name}'s Instagram`}
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function MembersSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState<"leadership" | "leads" | "core">("leadership");

  const tabs = [
    { id: "leadership", label: "Leadership", icon: Shield, color: "text-accent" },
    { id: "leads", label: "Team Leads", icon: Award, color: "text-cyan" },
    { id: "core", label: "Core Members", icon: Users, color: "text-primary" },
  ] as const;

  return (
    <section id="members" className="relative py-28 sm:py-36 overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 relative"
        >
          <div className="inline-block relative mb-4">
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-cyan block relative z-10">
              Command Structure
            </span>
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
              className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent origin-left"
            />
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Meet the <span className="gradient-text">Core Team</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            The dedicated student leaders driving the training, operations, and technical
            innovation of the Cybersecurity Club.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.id ? "text-white" : "text-muted hover:text-foreground hover:bg-surface/50"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 rounded-full bg-surface border border-glass-border-hover shadow-[0_0_15px_rgba(108,63,255,0.2)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon className={`w-4 h-4 relative z-10 ${activeTab === tab.id ? tab.color : ""}`} />
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === "leadership" && (
              <motion.div
                key="leadership"
                initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(5px)" }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto"
              >
                {leadership.map((member, i) => (
                  <MemberCard key={member.name} member={member} isLeadership={true} priority={true} />
                ))}
              </motion.div>
            )}

            {activeTab === "leads" && (
              <motion.div
                key="leads"
                initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(5px)" }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6"
              >
                {leads.map((member, i) => (
                  <MemberCard key={member.name} member={member} isLeadership={false} priority={false} />
                ))}
              </motion.div>
            )}

            {activeTab === "core" && (
              <motion.div
                key="core"
                initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(5px)" }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6"
              >
                {coreTeam.map((member, i) => (
                  <MemberCard key={member.name} member={member} isLeadership={false} priority={false} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 -left-1/4 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
}
