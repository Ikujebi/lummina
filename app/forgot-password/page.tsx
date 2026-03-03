// app/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import heroIllustration from "@/public/undraw_forgot-password_nttj.svg"; // replace with your HD image

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-[#F7E7CE]/50 flex flex-col">
      <main className="flex-1 grid gap-12 justify-center items-center grid-cols-1 lg:grid-cols-[minmax(320px,560px)_minmax(320px,520px)] p-6 lg:p-16">

        {/* Forgot Password Card */}
        <section className="bg-[#FFF7E0] backdrop-blur-sm rounded-[20px] shadow-2xl p-6 md:p-12 border border-[#FFD580]/50">
          <header className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2 text-[#5F021F]">
              <div className="w-6 h-6 bg-[#5F021F] rounded-full" />
              <span className="font-semibold text-xl md:text-2xl">LexTrust Nigeria</span>
            </div>
            <h1 className="text-[#5F021F] text-2xl md:text-3xl font-bold">
              Forgot Your Password?
            </h1>
            <p className="text-sm md:text-base text-[#5F021F]/80 mt-2">
              Enter your registered email to reset your password.
            </p>
          </header>

          {/* Form */}
          <form className="grid gap-6">
            {/* Email */}
            <div className="grid gap-2">
              <label className="text-sm text-[#5F021F]/90">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="w-full border border-[#FFD580]/50 rounded-lg px-4 h-12 text-sm text-[#5F021F] placeholder-[#FFA500] focus:outline-none focus:ring-2 focus:ring-[#FFA500] transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-14 bg-[#FFA500] text-[#5F021F] font-semibold rounded-lg shadow-md hover:brightness-110 transition mt-4"
            >
              Send Reset Link
            </button>

            {/* Guide */}
            <div className="text-center text-sm text-[#5F021F]/70 mt-2">
              After submission, you’ll receive an email with instructions to reset your password.
            </div>
          </form>
        </section>

        {/* Right-hand Illustration */}
        <div className="hidden md:grid place-items-center">
          <div className="w-full max-w-[520px] h-auto rounded-lg shadow-lg overflow-hidden">
            <Image
              src={heroIllustration}
              alt="Forgot Password Illustration"
              className="object-cover rounded-lg"
            />
          </div>
        </div>
      </main>

      <footer className="text-center text-sm text-[#5F021F]/60 py-4">
        © 2025 LexTrust Nigeria — Trusted Digital Legal Services.
      </footer>
    </div>
  );
}