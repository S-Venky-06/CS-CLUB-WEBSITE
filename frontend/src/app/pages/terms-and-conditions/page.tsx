import React from "react";
import PageTransition from "@/components/transitions/PageTransition";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnimatedBackground from "@/components/background/AnimatedBackground";

export const metadata = {
  title: "Terms & Conditions | Cybersecurity Club",
  description: "Terms and conditions for participating in GCET Cybersecurity Club events.",
};

export default function TermsAndConditionsPage() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
        <PageTransition>
          <div className="max-w-4xl w-full mx-auto bg-black/60 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8 sm:p-12 shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)]">
            <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Terms & Conditions
            </h1>

            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p>Last updated: {new Date().toLocaleDateString()}</p>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
                <p>
                  By registering for events, workshops, or activities organized by the GCET Cybersecurity Club, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you should not register for our events.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">2. Code of Conduct</h2>
                <p>
                  All participants must strictly adhere to the club's code of conduct. We promote ethical hacking and cybersecurity education. Any malicious activity, unauthorized testing, or inappropriate behavior during club events will result in immediate expulsion without refund and possible disciplinary action by the college.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">3. Registration & Payments</h2>
                <p>
                  Registrations are subject to availability and capacity limits. Payments made for event registrations are securely processed through our authorized payment gateway (Cashfree). You are responsible for ensuring that all details provided during registration are accurate.
                </p>
                <p className="mt-2">
                  Please refer to our <a href="/pages/refund-policy" className="text-blue-400 hover:underline">Refund Policy</a> regarding cancellations and transferability of registrations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">4. Intellectual Property</h2>
                <p>
                  All materials, slides, code repositories, and resources shared during club events are the intellectual property of the GCET Cybersecurity Club or the respective speakers. They may not be redistributed or used for commercial purposes without explicit permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">5. Modification of Terms</h2>
                <p>
                  The club reserves the right to modify these terms at any time. Any changes will be posted on this page. Your continued participation in club activities following the posting of changes constitutes your acceptance of those changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">6. Contact Us</h2>
                <p>
                  If you have any questions about these Terms & Conditions, please contact us at:
                  <br />
                  <a href="mailto:cybersecurityclub@gcet.edu.in" className="text-blue-400 hover:text-blue-300 transition-colors block mb-2 mt-2">cybersecurityclub@gcet.edu.in</a>
                  Or WhatsApp Dhanush (President, CS Club): <a href="https://wa.me/919866930336" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">+91 98669 30336</a>
                </p>
              </section>
            </div>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </>
  );
}
