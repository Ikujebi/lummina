"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Bg from "@/public/img/loginbg.png";
import Logo from "@/public/img/Lummina2.png";

type LoginResponse = {
  role?: "ADMIN" | "LAWYER" | "CLIENT";
  error?: string;
};

export default function SignInPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data: LoginResponse = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Login failed");

      localStorage.setItem("isLoggedIn", "true");

      if (data.role === "ADMIN") router.push("/admin/dashboard");
      else if (data.role === "LAWYER") router.push("/lawyer/dashboard");
      else router.push("/client/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden text-[#5F021F]/90">

      {/* Background image */}
      <Image
        src={Bg}
        alt="Background"
        fill
        priority
        className="object-cover -z-20 brightness-90 contrast-105 saturate-95"
      />

      {/* Cream overlay */}
      <div className="absolute inset-0 bg-[#F6E9D2]/70 backdrop-blur-[2px] -z-10" />

      {/* Subtle warm glow */}
      <div className="absolute w-[450px] h-[450px] bg-[#FFD580]/10 rounded-full blur-3xl top-[-120px] left-[-120px]" />

      {/* Card */}
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-[#FFF6E5]/95 border border-[#E6C98F]/40 rounded-2xl shadow-[0_20px_50px_rgba(95,2,31,0.12)] p-8"
      >

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src={Logo} alt="Lummina Logo" width={150} height={50} priority />
        </div>

        <h1 className="text-center text-[#5F021F] text-2xl font-semibold mb-6">
          Sign in to your account
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-5">

          {/* Email */}
          <div className="grid gap-1">
            <label className="text-[#5F021F]/75 text-sm">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              /* FIXED HERE: Added dark:text-[#5F021F] text-[#5F021F] */
              className="h-12 px-4 rounded-lg bg-white/70 border border-[#E6C98F]/40 text-[#5F021F] dark:text-[#5F021F] focus:outline-none focus:ring-2 focus:ring-[#5F021F]/50 transition"
            />
          </div>

          {/* Password */}
          <div className="grid gap-1">
            <label className="text-[#5F021F]/75 text-sm">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                required
                /* FIXED HERE: Added dark:text-[#5F021F] text-[#5F021F] */
                className="w-full h-12 px-4 pr-12 rounded-lg bg-white/70 border border-[#E6C98F]/40 text-[#5F021F] dark:text-[#5F021F] focus:outline-none focus:ring-2 focus:ring-[#5F021F]/50 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5F021F]/60 hover:text-[#5F021F]"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          {/* Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            type="submit"
            disabled={loading}
            className="h-12 bg-[#5F021F] text-white font-semibold rounded-lg mt-2 hover:bg-[#7A0328] transition shadow-md"
          >
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>

          {/* Links */}
          <div className="flex justify-between text-sm text-[#5F021F]/70 mt-2">
            <Link href="/forgot-password" className="hover:text-[#5F021F] transition">
              Forgot password?
            </Link>
            <Link href="/register" className="hover:text-[#5F021F] transition">
              Create account
            </Link>
          </div>

        </form>
      </motion.section>
    </main>
  );
}