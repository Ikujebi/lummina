"use client";

import { useState } from "react";
import Image from "next/image";
import heroIllustration from "@/public/undraw_forgot-password_nttj.svg";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
  e.preventDefault();// 🚨 prevent page reload

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setMessage(data.message || "Check your email for reset link");
      setEmail("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage("Failed to send reset link");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7E7CE]/50 flex flex-col">
      <main className="flex-1 grid gap-12 justify-center items-center grid-cols-1 lg:grid-cols-[minmax(320px,560px)_minmax(320px,520px)] p-6 lg:p-16">
        <section className="bg-[#FFF7E0] backdrop-blur-sm rounded-[20px] shadow-2xl p-6 md:p-12 border border-[#FFD580]/50">
          <header className="text-center mb-8">
            <h1 className="text-[#5F021F] text-2xl md:text-3xl font-bold">
              Forgot Your Password?
            </h1>
            <p className="text-sm md:text-base text-[#5F021F]/80 mt-2">
              Enter your registered email to reset your password.
            </p>
          </header>

          {/* ✅ attach handler here */}
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <label className="text-sm text-[#5F021F]/90">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="w-full border border-[#FFD580]/50 rounded-lg px-4 h-12 text-sm text-[#5F021F]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#FFA500] text-[#5F021F] font-semibold rounded-lg shadow-md hover:brightness-110 transition mt-4 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            {/* ✅ feedback */}
            {message && (
              <div className="text-center text-sm text-[#5F021F]/80 mt-2">
                {message}
              </div>
            )}
          </form>
        </section>

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
    </div>
  );
}
