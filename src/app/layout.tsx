import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#FF7A00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "SUSHRUSHA | Protocol Training Simulator",
  description: "Immersive Scenario-based Protocol Training for ASHA Workers",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SUSHRUSHA",
    startupImage: ["/apple-touch-icon.png"],
  },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  keywords: ["ASHA", "healthcare", "training", "simulator", "PWA"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${outfit.className} antialiased min-h-screen flex flex-col bg-background text-foreground relative z-0 overflow-x-hidden`}
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
