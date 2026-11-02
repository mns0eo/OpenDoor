import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DemoSwitcher } from "@/components/DemoSwitcher";

export const metadata: Metadata = {
  title: { default: "OpenDoor — Peer-to-peer mentoring", template: "%s · OpenDoor" },
  description:
    "OpenDoor connects students with peers who've been there — for academics, college prep, leadership, sports, music, entrepreneurship, and more.",
};

export const viewport: Viewport = { themeColor: "#14213D" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-navy focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Providers>
          <div className="bg-navy px-4 py-1.5 text-center text-xs text-white/80">
            <span className="font-medium text-white">Demo mode</span> · All profiles and data are fictional and stored only in this browser.
          </div>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
          <DemoSwitcher />
        </Providers>
      </body>
    </html>
  );
}
