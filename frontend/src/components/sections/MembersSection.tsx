
"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
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

  return (
    <article className="group relative glass-card flex flex-col overflow-hidden border border-glass-border/60 hover:border-primary/30 transition-all duration-300 rounded-2xl shadow-lg">
      {/* Rectangular Image slot */}
      <div
        className={`relative w-full overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent ${isLeadership ? "h-56" : "h-44"
          }`}
      >
        <div className="absolute inset-0 border border-primary/20" />

        {!imageError ? (
          <Image
            src={member.image}
            alt={`${member.name}'s portrait`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
            onError={() => setImageError(true)}
            className="object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
            priority={priority}
            loading={priority ? undefined : "lazy"}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/30 via-secondary/15 to-surface">
            <span
              className={`font-heading font-bold text-foreground tracking-widest ${isLeadership ? "text-3xl" : "text-xl"
                }`}
            >
              {member.initials}
            </span>
          </div>
        )}

        {/* Cyber scanner details */}
        {isLeadership && (
          <>
            <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-accent/40" />
            <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-accent/40" />
            <div className="absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-accent/40" />
            <div className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-accent/40" />
          </>
        )}
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/15 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-out" />
      </div>

      {/* Card Content block */}
      <div className="p-5 flex flex-col flex-grow text-left">
        {member.role && (
          <span className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1.5">
            {member.role}
          </span>
        )}
        <h4
          className={`font-heading font-bold text-foreground mb-1 ${isLeadership ? "text-xl" : "text-base"
            }`}
        >
          {member.name}
        </h4>
        <p className="text-xs text-muted leading-relaxed mb-5 flex-grow">
          {member.specialty}
        </p>

        {/* Social link bar */}
        {((member.linkedin && member.linkedin !== "#") || (member.instagram && member.instagram !== "#")) && (
          <div className="flex items-center gap-3 pt-3.5 border-t border-glass-border/40">
            {member.linkedin && member.linkedin !== "#" && (
              <a
                href={member.linkedin}
                className="w-8 h-8 rounded-lg bg-surface border border-glass-border flex items-center justify-center text-muted hover:text-foreground hover:border-secondary/40 hover:bg-primary/10 transition-all duration-200"
                aria-label={`${member.name}'s LinkedIn`}
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            )}
            {member.instagram && member.instagram !== "#" && (
              <a
                href={member.instagram}
                className="w-8 h-8 rounded-lg bg-surface border border-glass-border flex items-center justify-center text-muted hover:text-foreground hover:border-secondary/40 hover:bg-primary/10 transition-all duration-200"
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

  return (
    <section id="members" className="relative py-24 sm:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-3 block">
            Command Structure
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Meet the Core Team
          </h2>
          <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
            The dedicated student leaders driving the training, operations, and technical
            innovation of the Cybersecurity Club.
          </p>
        </motion.div>

        {/* 1. CLUB LEADERSHIP */}
        <div className="mb-20">
          <div className="flex items-center gap-2 mb-8 justify-center md:justify-start">
            <Shield className="w-5 h-5 text-accent" />
            <h3 className="font-heading text-lg font-bold tracking-wider text-muted uppercase">
              Club Leadership
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {leadership.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * i }}
              >
                <MemberCard member={member} isLeadership={true} priority={true} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* 2. TEAM LEADS */}
        <div className="mb-20">
          <div className="flex items-center gap-2 mb-8 justify-center md:justify-start">
            <Award className="w-5 h-5 text-secondary" />
            <h3 className="font-heading text-lg font-bold tracking-wider text-muted uppercase">
              Team Leads
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {leads.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.08 * i }}
              >
                <MemberCard member={member} isLeadership={false} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* 3. CORE TEAM MEMBERS */}
        <div>
          <div className="flex items-center gap-2 mb-8 justify-center md:justify-start">
            <Users className="w-5 h-5 text-muted" />
            <h3 className="font-heading text-lg font-bold tracking-wider text-muted uppercase">
              Core Members
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-5">
            {coreTeam.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.05 * i }}
              >
                <MemberCard member={member} isLeadership={false} />
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
