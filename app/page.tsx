"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import heroIllustration from "@/public/img/careers.jpg";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

type LoginResponse = {
  role?: "ADMIN" | "LAWYER" | "CLIENT";
  error?: string;
};

export default function SignInPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "", // optional, useful for registration
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

      if (data.role === "ADMIN") {
        localStorage.setItem("isLoggedIn", "true");
        router.push("/admin/dashboard");
      } else if (data.role === "LAWYER") {
        localStorage.setItem("isLoggedIn", "true");
        router.push("/lawyer/dashboard");
      } else {
        localStorage.setItem("isLoggedIn", "true");
        router.push("/client/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-[minmax(320px,1fr)_minmax(320px,1fr)] gap-8 lg:gap-12 p-6 lg:p-12 items-center justify-center bg-[#F7E7CE]">
      {/* Sign-in Card */}
      <section className="bg-white/90 rounded-[1.25rem] shadow-2xl p-6 md:p-10 border border-[#FFD580]/30 w-full max-w-lg mx-auto lg:mx-0">
        <header className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2 text-[#5F021F] justify-center">
            <span className="font-bold text-xl md:text-2xl">LexTrust</span>
          </div>
          <h1 className="text-[#5F021F] text-2xl md:text-3xl font-semibold">
            Sign in to your account
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {/* Email */}
          <div className="grid gap-2">
            <label className="text-[#5F021F] text-sm">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full h-14 px-4 border border-[#5F021F] rounded-lg"
            />
          </div>

          {/* Password */}
          <div className="grid gap-2 relative">
            <label className="text-[#5F021F] text-sm">Password</label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              required
              className="w-full h-14 px-4 border border-[#5F021F] rounded-lg pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Confirm Password (optional) */}
          <div className="grid gap-2 relative">
            <label className="text-[#5F021F] text-sm">Confirm Password</label>
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full h-14 px-4 border border-[#5F021F] rounded-lg pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#5F021F] text-white font-semibold rounded-lg mt-4 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Links */}
          <div className="flex justify-between text-sm mt-2">
            <Link href="/forgot-password" className="underline">
              Forgot password?
            </Link>
            <Link href="/register" className="underline">
              Create account
            </Link>
          </div>
        </form>
      </section>

      {/* Illustration */}
      <aside className="hidden lg:grid place-items-center">
        <Image
          src={heroIllustration}
          alt="Legal illustration"
          className="w-full max-w-[540px] rounded-xl shadow-lg"
        />
      </aside>
    </main>
  );
}