import React from "react";
import PageTransition from "@/components/transitions/PageTransition";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnimatedBackground from "@/components/background/AnimatedBackground";

export const metadata = {
  title: "Privacy Policy | Cybersecurity Club",
  description: "Privacy policy for the GCET Cybersecurity Club website.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main id="main-content" className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
        <PageTransition>
          <div className="max-w-4xl w-full mx-auto bg-black/60 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8 sm:p-12 shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)]">
            <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Privacy Policy
            </h1>

            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p>Last updated: {new Date().toLocaleDateString()}</p>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">1. Information We Collect</h2>
                <p>
                  When you register for our events or join our club, we may collect personal information including, but not limited to, your Name, Email Address, Phone Number, College Roll Number, and academic details (Domain/Section). We may also collect authentication data when you log in via Google OAuth.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
                <p>
                  The collected information is solely used for:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Processing event registrations and payments.</li>
                  <li>Sending event updates, certificates, and important announcements.</li>
                  <li>Managing club memberships and tracking attendance.</li>
                  <li>Improving our website and user experience.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">3. Data Sharing & Security</h2>
                <p>
                  Your privacy is our priority. <strong>We do not sell, trade, or rent your personal identification information to others.</strong> We may share necessary transaction details with our trusted payment gateway partner (Cashfree) strictly for the purpose of securely processing your payments.
                </p>
                <p className="mt-2">
                  We adopt appropriate data collection, storage, and processing practices and security measures to protect against unauthorized access, alteration, or destruction of your personal information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">4. Third-Party Links</h2>
                <p>
                  Our website may contain links to external sites (e.g., TryHackMe, HackTheBox, LinkedIn). We are not responsible for the privacy practices or the content of such websites.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-3">5. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site, please contact us at:
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
