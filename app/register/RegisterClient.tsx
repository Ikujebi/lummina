"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import heroIllustration from "@/public/img/careers.jpg";
import { useSearchParams } from "next/navigation";

const steps = [
  { number: 1, label: "Log in", status: "complete" },
  { number: 2, label: "Create Account", status: "active" },
  { number: 3, label: "Client Dashboard", status: "upcoming" },
  { number: 4, label: "Secure Chat", status: "upcoming" },
  { number: 5, label: "Legal Resources", status: "upcoming" },
  { number: 6, label: "Lawyer Dashboard", status: "upcoming" },
];

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? undefined;

  const [role, setRole] = useState<"CLIENT" | "LAWYER">("CLIENT");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Clean Fix: Initialize as true if no token exists, false if we need to fetch
  const [roleLoaded, setRoleLoaded] = useState(!token);

  // Prefill email & role from token if available
  useEffect(() => {
    // If no token exists, roleLoaded is already true. Exit early.
    if (!token) return;

    fetch(`/api/invitations/${token}`)
      .then((res) => res.json())
      .then((invitation) => {
        if (invitation.email) {
          setForm((prev) => ({ ...prev, email: invitation.email }));
        }
        if (invitation.role === "CLIENT" || invitation.role === "LAWYER") {
          setRole(invitation.role);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch invitation details:", err);
      })
      .finally(() => {
        // Asynchronous update safely signals loading completion
        setRoleLoaded(true);
      });
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          address: form.address,
          role,
          token,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      window.location.href = "/";
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#F7E7CE]/50 flex flex-col overflow-y-auto no-scrollbar">
      <main className="flex-1 grid gap-12 justify-center items-center grid-cols-1 lg:grid-cols-[minmax(320px,560px)_minmax(320px,520px)] p-6 lg:p-16">
        {/* Registration Card */}
        <section className="bg-[#FFF7E0] rounded-[20px] shadow-2xl p-6 md:p-12 border border-[#FFD580]/50">
          <header className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2 text-[#5F021F]">
              <div className="w-6 h-6 bg-[#5F021F] rounded-full" />
              <span className="font-semibold text-xl md:text-2xl">
                LexTrust Nigeria
              </span>
            </div>
            <h1 className="text-[#5F021F] text-2xl md:text-3xl font-bold">
              Create Your Account
            </h1>
          </header>

          {/* Role Switch */}
          <div className="relative grid grid-cols-2 bg-[#FFF3D6] rounded-md p-1 mb-6 z-0">
            <button
              type="button"
              className={`py-3 text-sm font-semibold rounded-md transition-colors duration-200 z-10 ${
                role === "CLIENT" ? "text-[#FFA500]" : "text-[#5F021F]/80"
              }`}
              onClick={() => setRole("CLIENT")}
              disabled={!!token}
            >
              🧑‍💼 Client
            </button>
            <button
              type="button"
              className={`py-3 text-sm font-semibold rounded-md transition-colors duration-200 z-10 ${
                role === "LAWYER" ? "text-[#FFA500]" : "text-[#5F021F]/80"
              }`}
              onClick={() => setRole("LAWYER")}
              disabled={!!token}
            >
              ⚖️ Lawyer
            </button>

            <span
              className={`absolute top-1 left-1 w-[calc(50%-0.25rem)] h-[calc(100%-0.5rem)] bg-[#FFF7E0] rounded-md shadow-md transition-transform duration-200 ease-in-out -z-10 ${
                role === "LAWYER" ? "translate-x-full" : "translate-x-0"
              }`}
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="grid gap-6 text-[#5F021F]/90">
            {/* Full Name */}
            <div className="grid gap-2">
              <label className="text-sm text-[#5F021F]/90">Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
className="w-full border border-[#FFD580]/50 rounded-lg px-4 h-12 text-sm bg-[#FFF7E0] disabled:opacity-60 focus:outline-none focus:ring-0 focus:border-[#FFD580]/50"              />
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <label className="text-sm text-[#5F021F]/90">Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
className="w-full border border-[#FFD580]/50 rounded-lg px-4 h-12 text-sm bg-[#FFF7E0] disabled:opacity-60 focus:outline-none focus:ring-0 focus:border-[#FFD580]/50"                disabled={!!token}
              />
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <label className="text-sm text-[#5F021F]/90">Phone Number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-[#FFD580]/50 rounded-lg px-4 h-12 text-sm bg-[#FFF7E0] disabled:opacity-60 focus:outline-none focus:ring-0 focus:border-[#FFD580]/50"
              />
            </div>

            {/* Passwords */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <label className="text-sm text-[#5F021F]/90">Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
className="w-full border border-[#FFD580]/50 rounded-lg px-4 h-12 text-sm bg-[#FFF7E0] focus:outline-none focus:ring-0 focus:border-[#FFD580]/50 active:outline-none active:ring-0"                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-[#5F021F]/90">
                  Confirm Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
className="w-full border border-[#FFD580]/50 rounded-lg px-4 h-12 text-sm bg-[#FFF7E0] focus:outline-none focus:ring-0 focus:border-[#FFD580]/50 active:outline-none active:ring-0"                />
              </div>
            </div>

            {/* Location */}
            <div className="grid gap-2">
              <label className="text-sm text-[#5F021F]/90">State / City</label>
              <select
                name="address"
                value={form.address}
                onChange={handleChange}
className="w-full border border-[#FFD580]/50 rounded-lg px-4 h-12 text-sm bg-[#FFF7E0] disabled:opacity-60 focus:outline-none focus:ring-0 focus:border-[#FFD580]/50"              >
                <option value="">Select your location</option>
                <option>Lagos</option>
                <option>Abuja</option>
                <option>Port Harcourt</option>
                <option>Ibadan</option>
                <option>Kano</option>
                <option>Enugu</option>
              </select>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-600 text-sm text-center font-medium">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || (!!token && !roleLoaded)}
              className="w-full h-14 bg-[#FFA500] text-[#5F021F] font-semibold rounded-lg shadow-md mt-4 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </section>

        {/* Right Illustration */}
        <div className="hidden lg:grid place-items-center">
          <div className="w-full max-w-[520px] rounded-lg shadow-lg overflow-hidden">
            <Image
              width={520}
              height={320}
              src={heroIllustration}
              alt="Registration Illustration"
              className="object-cover rounded-lg"
              priority
            />
          </div>
        </div>
      </main>

      {/* Stepper */}
      <nav className="max-w-[1120px] w-[90%] mx-auto my-8 bg-[#FFF7E0] rounded-xl shadow-md p-6 grid gap-4 border border-[#FFD580]/40">
        <p className="uppercase text-sm font-semibold text-[#5F021F]">
          Step Guide
        </p>
        <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 list-none">
          {steps.map((step) => (
            <li
              key={step.number}
              className="flex items-center gap-2 p-3 rounded-lg bg-[#F7E7CE]/60"
            >
              <span className="w-8 h-8 rounded-full grid place-items-center font-semibold text-sm bg-[#FFD580]/50">
                {step.number}
              </span>
              <span className="text-sm font-semibold text-[#5F021F]">
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <footer className="text-center text-sm text-[#5F021F]/60 py-4">
        © 2026 LexTrust Nigeria — Trusted Digital Legal Services.
      </footer>
    </div>
  );
}