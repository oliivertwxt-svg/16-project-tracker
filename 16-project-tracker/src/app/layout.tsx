import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { UserMenu } from "./components/user-menu";

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
    default: "Project Tracker",
    template: "%s | Project Tracker",
  },
  description: "Track projects, tasks, and progress in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
            <Link href="/" className="text-lg font-bold text-zinc-950">
              Project Tracker
            </Link>
            <Suspense
              fallback={
                <div className="h-9 w-32 animate-pulse rounded-lg bg-zinc-100" />
              }
            >
              <UserMenu />
            </Suspense>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
