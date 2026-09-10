import React from "react";
import PageTransition from "@/components/transitions/PageTransition";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnimatedBackground from "@/components/background/AnimatedBackground";
import { Mail, MapPin } from "lucide-react";

export const metadata = {
  title: "Contact Us | Cybersecurity Club",
  description: "Contact information for the GCET Cybersecurity Club.",
};

export default function ContactPage() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
        <PageTransition>
          <div className="max-w-4xl w-full mx-auto bg-black/60 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8 sm:p-12 shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)]">
            <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Contact Us
            </h1>

            <div className="space-y-8 text-gray-300 leading-relaxed">
              <p>
                Have questions about our events, memberships, or policies? We're here to help! Reach out to us through our official channels below.
              </p>

              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-start gap-4 hover:border-cyan/50 transition-colors">
                  <div className="p-3 bg-cyan/20 rounded-lg text-cyan">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email Us</h3>
                    <p className="text-sm text-gray-400 mb-2">For general inquiries and support:</p>
                    <a href="mailto:cybersecurityclub@gcet.edu.in" className="text-blue-400 hover:text-blue-300 transition-colors">
                      cybersecurityclub@gcet.edu.in
                    </a>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-start gap-4 hover:border-accent/50 transition-colors">
                  <div className="p-3 bg-accent/20 rounded-lg text-accent">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Visit Us</h3>
                    <p className="text-sm text-gray-400 mb-2">College Campus:</p>
                    <p className="text-gray-300 text-sm">
                      Geethanjali College of Engineering and Technology<br />
                      Keesara, Cheeryal, Hyderabad-501301
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-start gap-4 hover:border-green-500/50 transition-colors md:col-span-2 lg:col-span-1">
                  <div className="p-3 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <img src="/whatsapp.png" alt="WhatsApp" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">WhatsApp Us</h3>
                    <p className="text-sm text-gray-400 mb-2">Dhanush - President, CS Club</p>
                    <a href="https://wa.me/919866930336" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">
                      +91 98669 30336
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-white mb-3">Operating Hours</h2>
                <p>
                  Our club administration team typically responds to emails within 24-48 business hours. If you have an urgent inquiry regarding an ongoing event, please approach the registration desk on campus.
                </p>
              </div>
            </div>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </>
  );
}
