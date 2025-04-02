import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "AI Hedge Fund",
  description: "Web interface for the AI Hedge Fund simulation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <header className="border-b border-border py-4">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold">AI Hedge Fund</h1>
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-border py-4">
          <div className="container mx-auto px-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} AI Hedge Fund. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
