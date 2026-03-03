"use client";

import Image from "next/image";
import Link from "next/link";
import heroIllustration from "@/public/img/careers.jpg"; // Replace with your HD image

export default function SignInPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-[minmax(320px,1fr)_minmax(320px,1fr)] gap-8 lg:gap-12 p-6 lg:p-12 items-center justify-center bg-[#F7E7CE]">
      
      {/* Sign-in Card */}
      <section className="bg-white/90 rounded-[1.25rem] shadow-2xl p-6 md:p-10 border border-[#FFD580]/30 w-full max-w-lg mx-auto lg:mx-0">
        <header className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2 text-[#5F021F] justify-center">
            <span aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2l8 3v7c0 5.523-3.08 9.41-8 11-4.92-1.59-8-5.477-8-11V5l8-3z" fill="currentColor" opacity="0.15"/>
                <path d="M22 5v7c0 4.971-2.593 8.22-8 10-5.407-1.78-8-5.029-8-10V5l8-3 8 3z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10.5 13.5l2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="font-bold text-xl md:text-2xl">LexTrust</span>
          </div>
          <h1 className="text-[#5F021F] text-2xl md:text-3xl font-semibold">Sign in to your account</h1>
        </header>

        <form className="grid gap-4" action="#" method="post" noValidate>
          {/* Email */}
          <div className="grid gap-2">
            <label htmlFor="email" className="text-[#5F021F] text-sm">Email</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFA500]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6.75A1.75 1.75 0 0 1 4.75 5h14.5A1.75 1.75 0 0 1 21 6.75v10.5A1.75 1.75 0 0 1 19.25 19H4.75A1.75 1.75 0 0 1 3 17.25V6.75z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="yourname@example.com"
                className="w-full h-14 pl-12 pr-3 border border-[#5F021F] rounded-lg text-[#5F021F] placeholder-[#FFA500] focus:outline-none focus:ring-2 focus:ring-[#FFA500]/20 transition"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <label htmlFor="password" className="text-[#5F021F] text-sm">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFA500]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full h-14 pl-12 pr-3 border border-[#5F021F] rounded-lg text-[#5F021F] placeholder-[#FFA500] focus:outline-none focus:ring-2 focus:ring-[#FFA500]/20 transition"
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Sign-in Button */}
          <button
            className="w-full h-14 bg-[#5F021F] text-white font-semibold rounded-lg shadow-md hover:brightness-105 transition mt-4"
            type="submit"
          >
            Sign In
          </button>

          {/* Links */}
          <div className="flex flex-wrap justify-between gap-2 mt-2 text-sm">
            <Link href="/forgot-password" className="text-[#5F021F] font-semibold hover:underline">Forgot password?</Link>
            <Link href="/register" className="text-[#5F021F] font-semibold hover:underline">Create new account</Link>
          </div>
        </form>
      </section>

      {/* Illustration / Artwork */}
      <aside className="hidden lg:grid place-items-center">
        <Image
          src={heroIllustration}
          alt="Legal career illustration"
          className="w-full max-w-[540px] h-auto rounded-xl shadow-lg object-cover"
          priority
        />
      </aside>
    </main>
  );
}