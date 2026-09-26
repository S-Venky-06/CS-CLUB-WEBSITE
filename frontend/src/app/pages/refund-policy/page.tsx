import React from "react";
import PageTransition from "@/components/transitions/PageTransition";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnimatedBackground from "@/components/background/AnimatedBackground";

export const metadata = {
  title: "Refund & Cancellation Policy | Cybersecurity Club",
  description: "Official refund and cancellation policies for the GCET Cybersecurity Club events.",
};

export default function RefundPolicyPage() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main id="main-content" className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
        <PageTransition>
          <div className="max-w-4xl w-full mx-auto bg-black/60 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8 sm:p-12 shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)]">
            <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Refund & Cancellation Policy
            </h1>

            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p>Last updated: {new Date().toLocaleDateString()}</p>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">1. General Refund Policy</h2>
                <p>
                  The GCET Cybersecurity Club adheres to a strict <strong>NO REFUNDS</strong> policy for all event registrations, workshops, and memberships. Once a payment is successfully processed, it is considered final and non-refundable.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">2. Exceptions (Organizer Cancellation)</h2>
                <p>
                  The only exception to our no-refund policy is if an event is officially cancelled by the club organizers. In the rare event of a cancellation, registered participants will automatically receive a full refund to their original payment method within 5-7 business days.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">3. Non-Transferability & Replacements</h2>
                <p>
                  Registration IDs and tickets are strictly non-transferable. If a registered member is absent for an event, <strong>there will be no replacement allowed</strong> and their ticket cannot be given to another person.
                </p>
                <p className="mt-2">
                  Exceptions to this non-transferability rule may only be granted with explicit, prior written permission from the Club President. Without this permission, the absentee's spot remains forfeit.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">4. Failed Transactions</h2>
                <p>
                  If money was debited from your account but the registration failed or was marked as pending, the amount will typically be reversed by your bank or the payment gateway (Cashfree) automatically within 3-5 business days. If the issue persists, please contact our support team.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">5. Contact Information</h2>
                <p>
                  For any inquiries regarding this policy or payment disputes, please reach out to us at:
                  <br />
                  <a href="mailto:cybersecurityclub@gcet.edu.in" className="text-blue-400 hover:text-blue-300 transition-colors block mb-2">cybersecurityclub@gcet.edu.in</a>
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
