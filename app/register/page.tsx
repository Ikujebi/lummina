"use client";

import { useState } from "react";
import Image from "next/image";
import heroIllustration from "@/public/img/careers.jpg"; // replace with your HD image

const steps = [
  { number: 1, label: "Log in", status: "complete" },
  { number: 2, label: "Create Account", status: "active" },
  { number: 3, label: "Client Dashboard", status: "upcoming" },
  { number: 4, label: "Secure Chat", status: "upcoming" },
  { number: 5, label: "Legal Resources", status: "upcoming" },
  { number: 6, label: "Lawyer Dashboard", status: "upcoming" },
];

export default function RegisterPage() {
  const [role, setRole] = useState<"client" | "lawyer">("client");

  return (
    <div className="min-h-screen bg-[#F7E7CE]/50 flex flex-col">
      <main className="flex-1 grid gap-12 justify-center items-center grid-cols-1 lg:grid-cols-[minmax(320px,560px)_minmax(320px,520px)] p-6 lg:p-16">

        {/* Registration Card */}
        <section className="bg-[#FFF7E0] backdrop-blur-sm rounded-[20px] shadow-2xl p-6 md:p-12 border border-[#FFD580]/50">
          <header className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2 text-[#5F021F]">
              <div className="w-6 h-6 bg-[#5F021F] rounded-full" />
              <span className="font-semibold text-xl md:text-2xl">LexTrust Nigeria</span>
            </div>
            <h1 className="text-[#5F021F] text-2xl md:text-3xl font-bold">
              Create Your Account
            </h1>
          </header>

          {/* Role Switch */}
          <div className="relative grid grid-cols-2 bg-[#FFF3D6] rounded-md p-1 mb-6">
            <button
              type="button"
              className={`py-3 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-colors ${
                role === "client" ? "text-[#FFA500]" : "text-[#5F021F]/80"
              }`}
              onClick={() => setRole("client")}
            >
              🧑‍💼 Client
            </button>
            <button
              type="button"
              className={`py-3 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-colors ${
                role === "lawyer" ? "text-[#FFA500]" : "text-[#5F021F]/80"
              }`}
              onClick={() => setRole("lawyer")}
            >
              ⚖️ Lawyer (SCN)
            </button>

            <span
              className={`absolute top-1 left-1 w-[calc(50%-0.25rem)] h-[calc(100%-0.5rem)] bg-[#FFF7E0] rounded-md shadow-md transition-transform ${
                role === "lawyer" ? "translate-x-full" : "translate-x-0"
              }`}
            />
          </div>

          {/* Form */}
          <form className="grid gap-6">
            {/* Name / Email / Phone */}
            {["Full Name", "Email Address", "Phone Number"].map((label, i) => (
              <div key={i} className="grid gap-2">
                <label className="text-sm text-[#5F021F]/90">{label}</label>
                <input
                  type={label === "Email Address" ? "email" : label === "Phone Number" ? "tel" : "text"}
                  placeholder={label === "Full Name" ? "First and last name" :
                               label === "Email Address" ? "example@email.com" :
                               "+234 801 234 5678"}
                  required
                  className="w-full border border-[#FFD580]/50 rounded-lg px-4 h-12 text-sm text-[#5F021F] focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                />
              </div>
            ))}

            {/* Passwords */}
            <div className="grid md:grid-cols-2 gap-3">
              {["Password", "Confirm Password"].map((label, i) => (
                <div key={i} className="grid gap-2">
                  <label className="text-sm text-[#5F021F]/90">{label}</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    className="w-full border border-[#FFD580]/50 rounded-lg px-4 h-12 text-sm text-[#5F021F] focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                  />
                </div>
              ))}
            </div>

            {/* Location */}
            <div className="grid gap-2">
              <label className="text-sm text-[#5F021F]/90">State / City</label>
              <select className="w-full border border-[#FFD580]/50 rounded-lg h-12 px-4 text-sm text-[#5F021F] focus:outline-none focus:ring-2 focus:ring-[#FFA500]">
                <option value="">Select your location</option>
                <option>Lagos, NG</option>
                <option>Abuja (FCT), NG</option>
                <option>Port Harcourt, NG</option>
                <option>Ibadan, NG</option>
                <option>Kano, NG</option>
                <option>Enugu, NG</option>
              </select>
            </div>

            {/* Lawyer Fields */}
            {role === "lawyer" && (
              <>
                <div className="grid gap-2">
                  <label className="text-sm text-[#5F021F]/90">Supreme Court Enrollment Number</label>
                  <input
                    type="text"
                    placeholder="SCN/XXXX/Year"
                    className="w-full border border-[#FFD580]/50 rounded-lg px-4 h-12 text-sm text-[#5F021F] focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm text-[#5F021F]/90">Call to Bar Certificate (PDF)</label>
                  <label className="border-2 border-dashed border-[#FFA500]/50 rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer bg-[#FFF7E0]">
                    <span className="px-4 py-2 bg-[#FFA500] text-[#5F021F] rounded-lg font-semibold text-sm">Upload Document</span>
                    <span className="text-xs text-[#5F021F]/70">PDF max. 5 MB</span>
                    <input type="file" accept="application/pdf" className="hidden" />
                  </label>
                </div>
              </>
            )}

            {/* Submit */}
            <button className="w-full h-14 bg-[#FFA500] text-[#5F021F] font-semibold rounded-lg shadow-md hover:brightness-110 transition mt-4">
              Create Account
            </button>
          </form>
        </section>

        {/* Right-hand Illustration */}
        <div className="hidden lg:grid place-items-center">
          <div className="w-full max-w-[520px] h-auto rounded-lg shadow-lg overflow-hidden">
            <Image
              src={heroIllustration}
              alt="Career / Registration Illustration"
              className="object-cover rounded-lg"
            />
          </div>
        </div>
      </main>

      {/* Stepper */}
      <nav className="max-w-[1120px] w-[90%] mx-auto my-8 bg-[#FFF7E0] rounded-xl shadow-md p-6 grid gap-4 border border-[#FFD580]/40">
        <div className="flex flex-col gap-1">
          <p className="uppercase text-sm font-semibold text-[#5F021F]">Step Guide</p>
          <p className="text-sm text-[#5F021F]/70">Step 2 of 6 — Create Account</p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 list-none">
          {steps.map((step) => (
            <li
              key={step.number}
              className={`flex items-center gap-2 p-3 rounded-lg transition ${
                step.status === "active"
                  ? "bg-[#FFF7E0] border border-[#FFA500] shadow-md"
                  : step.status === "complete"
                  ? "bg-[#FFA500]/20 border border-[#FFA500]/30"
                  : "bg-[#F7E7CE]/60 border border-transparent text-[#5F021F]/50"
              }`}
            >
              <span
                className={`w-8 h-8 rounded-full grid place-items-center font-semibold text-sm ${
                  step.status === "active"
                    ? "bg-[#FFA500] text-[#5F021F]"
                    : step.status === "complete"
                    ? "bg-[#FFA500] text-[#5F021F]"
                    : "bg-[#FFD580]/50 text-[#5F021F]/70"
                }`}
              >
                {step.number}
              </span>
              <span className="text-sm font-semibold text-[#5F021F]">{step.label}</span>
            </li>
          ))}
        </ol>
      </nav>

      <footer className="text-center text-sm text-[#5F021F]/60 py-4">
        © 2025 LexTrust Nigeria — Trusted Digital Legal Services.
      </footer>
    </div>
  );
}