import type { Metadata } from "next";
import AnimatedBackground from "@/components/background/AnimatedBackground";
import Navbar from "@/components/layout/Navbar";
import FeaturedEvent from "@/components/sections/FeaturedEvent";
import GalleryPreview from "@/components/sections/GalleryPreview";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/transitions/PageTransition";

export const metadata: Metadata = {
  title: "Events | Cybersecurity Club | Geethanjali College",
  description:
    "Join the latest workshops, guest lectures, CTF hacking contests, and recruiting drives organized by GCET's Cybersecurity Club.",
  keywords: [
    "Cybersecurity Events",
    "GCET Workshops",
    "Hacking Competitions",
    "CTF GCET",
    "Cyber Congress",
    "Shastra",
    "Chrakuvyh",
  ],
  openGraph: {
    title: "Events | Cybersecurity Club | Geethanjali College",
    description:
      "Join the latest workshops, guest lectures, CTF hacking contests, and recruiting drives organized by GCET's Cybersecurity Club.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Events | Cybersecurity Club | Geethanjali College",
    description:
      "Join the latest workshops, guest lectures, CTF hacking contests, and recruiting drives organized by GCET's Cybersecurity Club.",
  },
};

export default function EventsPage() {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main id="main-content" className="pt-20">
        <PageTransition>
          <FeaturedEvent />
          <GalleryPreview />
        </PageTransition>
      </main>
      <Footer />
    </>
  );
}
