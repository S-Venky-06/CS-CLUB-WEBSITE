import type { Metadata } from "next";
import AnimatedBackground from "@/components/background/AnimatedBackground";
import Navbar from "@/components/layout/Navbar";
import MembersSection from "@/components/sections/MembersSection";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/transitions/PageTransition";

export const metadata: Metadata = {
  title: "Members | Cybersecurity Club | Geethanjali College",
  description:
    "Meet the core student leadership, coordinators, designing heads, and active members of the GCET Cybersecurity Club.",
  keywords: [
    "Cybersecurity Club Members",
    "GCET Core Team",
    "Club Leadership",
    "Dhanush Reddy",
    "Shreyas Behara",
    "S.S.S.Venkatesh",
    "student coordinators",
  ],
  openGraph: {
    title: "Members | Cybersecurity Club | Geethanjali College",
    description:
      "Meet the core student leadership, coordinators, designing heads, and active members of the GCET Cybersecurity Club.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Members | Cybersecurity Club | Geethanjali College",
    description:
      "Meet the core student leadership, coordinators, designing heads, and active members of the GCET Cybersecurity Club.",
  },
};

export default function MembersPage() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main id="main-content" className="pt-20">
        <PageTransition>
          <MembersSection />
        </PageTransition>
      </main>
      <Footer />
    </>
  );
}
