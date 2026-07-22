import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cybersecurity Club of GCET | Learn • Secure • Innovate",
  description:
    "The official Cybersecurity Club of GCET — a student-driven community dedicated to cybersecurity education, ethical hacking, and digital defense innovation.",
  keywords: [
    "cybersecurity",
    "GCET",
    "security club",
    "ethical hacking",
    "cyber defense",
    "student organization",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Cybersecurity Club of GCET",
    description:
      "Learn • Secure • Innovate — Join the premier cybersecurity community at GCET.",
    type: "website",
    locale: "en_US",
    siteName: "GCET Cybersecurity Club",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cybersecurity Club of GCET",
    description:
      "Learn • Secure • Innovate — Join the premier cybersecurity community at GCET.",
  },
};

export const viewport = {
  themeColor: "#09090B",
};

import { AuthProvider } from "@/components/providers/AuthProvider";
import { BackendWakeupProvider } from "@/components/providers/BackendWakeupProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-body">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <AuthProvider>
            <BackendWakeupProvider>{children}</BackendWakeupProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
