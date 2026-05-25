import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css'
import { Toaster } from "react-hot-toast"; // <- import Toaster

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lummina Law Management System",
  description: "Lummina Law Management System is an all-in-one digital platform designed to streamline legal operations for modern law firms and legal departments. It centralizes case management, client communication, document storage, billing, scheduling, and workflow automation into one secure and efficient system. Built to improve productivity, collaboration, and compliance, Lummina helps legal professionals manage matters seamlessly while delivering faster, smarter, and more organized legal services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}

        {/* Global toast container */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            className: "bg-[#F7E7CE] text-[#5F021F] rounded-xl px-4 py-2 font-medium shadow-lg",
            duration: 3000,
          }}
        />
      </body>
    </html>
  );
}