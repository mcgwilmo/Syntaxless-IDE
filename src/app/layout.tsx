import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ScrollRevealManager } from "@/components/scroll-reveal-manager";
import { ThemeProvider, ThemeScript } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "T.R.A.C.E.",
    template: "%s | T.R.A.C.E.",
  },
  description:
    "T.R.A.C.E. is a browser-based syntaxless IDE for building programs from ideas, logic, and natural language.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans text-[var(--foreground)]">
        <ThemeScript />
        <ThemeProvider>
          <ScrollRevealManager />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
