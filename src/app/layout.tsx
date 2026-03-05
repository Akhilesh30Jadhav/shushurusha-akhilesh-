import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ChakraBackground } from "@/components/ui/ashoka-chakra";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SUSHRUSHA | Protocol Training Simulator",
  description: "Immersive Scenario-based Protocol Training for ASHA Workers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${outfit.className} antialiased min-h-screen bg-background text-foreground relative z-0`}
      >
        <ChakraBackground />
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
