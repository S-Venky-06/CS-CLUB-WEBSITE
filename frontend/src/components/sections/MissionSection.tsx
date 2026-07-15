"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Target, Eye, Users } from "lucide-react";

const cards = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To cultivate a culture of cybersecurity awareness and expertise within our institution, empowering students with practical skills in ethical hacking, digital forensics, and secure software development.",
    gradient: "from-primary/20 to-transparent",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "To become a nationally recognized student cybersecurity organization that produces industry-ready professionals and contributes to a safer digital ecosystem through innovation and collaboration.",
    gradient: "from-secondary/20 to-transparent",
  },
  {
    icon: Users,
    title: "Who We Are",
    description:
      "A passionate community of aspiring cybersecurity professionals, united by our curiosity for technology and commitment to defending the digital world. From beginners to advanced practitioners, everyone has a place here.",
    gradient: "from-accent/10 to-transparent",
  },
];

export default function MissionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative py-24 sm:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-3 block">
            About the Club
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Driven by Purpose
          </h2>
          <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
            We bridge the gap between academic learning and real-world
            cybersecurity challenges through a community built on knowledge
            sharing, innovation, and ethical practice.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {cards.map((card, i) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 * i }}
              className="group glass-card p-6 sm:p-8 relative overflow-hidden"
            >
              {/* Top gradient accent */}
              <div
                className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${card.gradient}`}
              />

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <card.icon className="w-6 h-6 text-secondary" />
              </div>

              {/* Content */}
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                {card.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                {card.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
