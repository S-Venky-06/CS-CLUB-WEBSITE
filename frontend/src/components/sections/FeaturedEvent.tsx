"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";

export default function FeaturedEvent() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="events" className="relative py-24 sm:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-3 block">
            Upcoming
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Featured Event
          </h2>
          <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
            Don&apos;t miss our next flagship event — an opportunity to learn,
            compete, and connect with fellow cybersecurity enthusiasts.
          </p>
        </motion.div>

        {/* Event Card */}
        <motion.article
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto glass-card overflow-hidden group"
        >
          {/* Banner */}
          <div className="relative h-48 sm:h-64 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-secondary/20 to-accent/10" />
            <div className="absolute inset-0 bg-grid opacity-30" />
            {/* Decorative elements */}
            <div className="absolute top-6 left-6 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-accent/90 text-white text-xs font-semibold">
                LIVE EVENT
              </span>
            </div>
            {/* Decorative geometric */}
            <svg
              className="absolute right-8 bottom-8 w-32 h-32 opacity-20"
              viewBox="0 0 120 120"
              fill="none"
              aria-hidden="true"
            >
              <polygon
                points="60,10 110,40 110,90 60,120 10,90 10,40"
                stroke="rgba(122,62,177,0.5)"
                strokeWidth="1"
                fill="none"
              />
              <polygon
                points="60,30 90,50 90,80 60,100 30,80 30,50"
                stroke="rgba(255,122,26,0.3)"
                strokeWidth="1"
                fill="none"
              />
            </svg>
            {/* Center text on banner */}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-heading text-2xl sm:text-3xl font-bold text-foreground text-center text-glow">
                Junior Registrations
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-3">
              New Club Members Registration — For Juniors
            </h3>

            <div className="flex flex-wrap gap-4 sm:gap-6 mb-5">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Calendar className="w-4 h-4 text-secondary" />
                <span>Open Now</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Clock className="w-4 h-4 text-secondary" />
                <span>All Day</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>Online Registration</span>
              </div>
            </div>

            <p className="text-muted text-sm sm:text-base leading-relaxed mb-6">
              Calling all juniors! Join the Cybersecurity Club of GCET to jumpstart your 
              journey into ethical hacking, digital forensics, and network defense. No prior 
              experience is required—just curiosity and a passion for technology. Sign up 
              now to access exclusive workshops, training sessions, and CTF challenges.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#"
                className="group/btn inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold text-sm shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:brightness-110 transition-all duration-300"
              >
                Register Now
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-glass-border text-muted hover:text-foreground hover:border-secondary/30 font-medium text-sm transition-all duration-300"
              >
                Learn More
              </a>
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
