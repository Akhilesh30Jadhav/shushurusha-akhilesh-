import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ChakraBackground } from "@/components/ui/ashoka-chakra";
import { Footer } from "@/components/ui/Footer";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SUSHRUSHA | Protocol Training Simulator",
  description: "Immersive Scenario-based Protocol Training for ASHA Workers",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SUSHRUSHA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${outfit.className} antialiased min-h-screen flex flex-col bg-background text-foreground relative z-0`}
      >
        <ChakraBackground />
        <LanguageProvider>
          <main className="flex-1 w-full relative z-10">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
