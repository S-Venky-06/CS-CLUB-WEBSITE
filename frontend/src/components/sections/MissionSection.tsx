"use client";

import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { Target, Eye, Users } from "lucide-react";

const cards = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To cultivate a culture of cybersecurity awareness and expertise within our institution, empowering students with practical skills in ethical hacking, digital forensics, and secure software development.",
    gradient: "from-primary via-cyan to-primary",
    shadowColor: "rgba(108,63,255,0.2)",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "To become a nationally recognized student cybersecurity organization that produces industry-ready professionals and contributes to a safer digital ecosystem through innovation and collaboration.",
    gradient: "from-cyan via-primary to-cyan",
    shadowColor: "rgba(0,240,255,0.2)",
  },
  {
    icon: Users,
    title: "Who We Are",
    description:
      "A passionate community of aspiring cybersecurity professionals, united by our curiosity for technology and commitment to defending the digital world. From beginners to advanced practitioners, everyone has a place here.",
    gradient: "from-accent via-primary to-accent",
    shadowColor: "rgba(255,85,0,0.2)",
  },
];

// Card component with 3D tilt effect
function TiltCard({ card, index, isInView }: { card: typeof cards[0], index: number, isInView: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
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
      ref={ref}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
      animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.6, delay: 0.2 * index, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative h-full perspective-[1000px]"
    >
      <div 
        className="glass-card p-8 h-full relative overflow-hidden transition-all duration-300"
        style={{ transform: "translateZ(0)" }}
      >
        {/* Animated Gradient Border Overlay on Hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${card.gradient} p-[1px] rounded-2xl -z-10 pointer-events-none`}>
          <div className="w-full h-full bg-surface/90 rounded-2xl" />
        </div>

        {/* Top subtle gradient accent line (default state) */}
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${card.gradient} opacity-50 group-hover:opacity-100 transition-opacity`}
        />

        {/* Ambient Hover Glow behind card */}
        <div 
          className="absolute -inset-4 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 -z-20 pointer-events-none"
          style={{ background: card.shadowColor }}
        />

        {/* Icon Container - Glassmorphic Circle */}
        <div 
          className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 backdrop-blur-md shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:bg-white/10"
          style={{ transform: "translateZ(30px)" }}
        >
          <card.icon className="w-7 h-7 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        </div>

        {/* Content */}
        <div style={{ transform: "translateZ(20px)" }}>
          <h3 className="font-heading text-xl font-bold text-foreground mb-4 group-hover:text-glow transition-all duration-300">
            {card.title}
          </h3>
          <p className="text-muted text-sm leading-relaxed font-medium group-hover:text-muted/90 transition-colors">
            {card.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function MissionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative py-28 sm:py-36 overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20 relative"
        >
          <div className="inline-block relative mb-4">
            <span className="text-sm font-bold tracking-[0.2em] uppercase text-cyan block relative z-10">
              About the Club
            </span>
            {/* Animated underline sweep */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
              className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent origin-left"
            />
          </div>
          
          <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Driven by <span className="gradient-text inline-block">Purpose</span>
          </h2>
          <p className="text-muted text-lg sm:text-xl max-w-2xl mx-auto font-medium">
            We bridge the gap between academic learning and real-world
            cybersecurity challenges through a community built on knowledge
            sharing, innovation, and ethical practice.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 perspective-[1200px]">
          {cards.map((card, i) => (
            <TiltCard key={card.title} card={card} index={i} isInView={isInView} />
          ))}
        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan/5 blur-[150px] rounded-full pointer-events-none translate-x-1/4 translate-y-1/4" />
    </section>
  );
}
