import type { Metadata } from "next";
import AnimatedBackground from "@/components/background/AnimatedBackground";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/hero/HeroSection";
import MissionSection from "@/components/sections/MissionSection";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/transitions/PageTransition";

export const metadata: Metadata = {
  title: "Cybersecurity Club | Geethanjali College",
  description:
    "Official website of the Cybersecurity Club at Geethanjali College of Engineering and Technology.",
  keywords: [
    "Cybersecurity Club",
    "GCET",
    "Geethanjali College",
    "student club",
    "ethical hacking",
    "cyber security training",
  ],
  openGraph: {
    title: "Cybersecurity Club | Geethanjali College",
    description:
      "Official website of the Cybersecurity Club at Geethanjali College of Engineering and Technology.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cybersecurity Club | Geethanjali College",
    description:
      "Official website of the Cybersecurity Club at Geethanjali College of Engineering and Technology.",
  },
};

export default function HomePage() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main id="main-content">
        <PageTransition>
          <HeroSection />
          <MissionSection />
        </PageTransition>
      </main>
      <Footer />
    </>
  );
}
