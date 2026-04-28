"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import zxcvbn from "zxcvbn";

import Bg from "@/public/img/loginbg.png";
import Logo from "@/public/img/Lummina2.png";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔐 TOKEN EXPIRY (10 mins demo — replace with backend expiry if available)
  const [timeLeft, setTimeLeft] = useState(10 * 60); // seconds

  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [token]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // 🧠 NETFLIX-LEVEL PASSWORD STRENGTH (zxcvbn)
  const strength = useMemo(() => {
    if (!password) return 0;
    return zxcvbn(password).score; // 0–4
  }, [password]);

  const strengthLabel = ["Very Weak", "Weak", "Fair", "Good", "Strong"][
    strength
  ];

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Reset failed");

      setMessage("Password updated successfully");

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ❌ invalid token
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Invalid or missing reset token
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      <Image src={Bg} alt="bg" fill className="object-cover -z-10" />
      <div className="absolute inset-0 bg-black/40 -z-10" />

      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <Image src={Logo} alt="logo" fill />
        </div>

        <h1 className="text-center text-xl font-bold text-[#5F021F] mb-2">
          Reset Password
        </h1>

        {/* ⏳ TOKEN EXPIRY UI */}
        <p className="text-center text-sm text-gray-600 mb-4">
          Link expires in{" "}
          <span className={timeLeft < 60 ? "text-red-500" : "text-green-600"}>
            {formatTime(timeLeft)}
          </span>
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-4 h-12"
            required
          />

          {/* 🧠 strength meter */}
          {password && (
            <p className="text-sm text-gray-600">
              Strength:{" "}
              <span
                className={
                  strength <= 1
                    ? "text-red-500"
                    : strength === 2
                      ? "text-yellow-500"
                      : "text-green-600"
                }
              >
                {strengthLabel}
              </span>
            </p>
          )}

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded-lg px-4 h-12"
            required
          />

          <button
            disabled={loading || timeLeft === 0}
            className="w-full h-12 bg-[#FFA500] text-[#5F021F] font-semibold rounded-lg disabled:opacity-50"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>

          {/* 🔁 resend flow */}
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "" }), // plug real email if available
              });

              setMessage("New reset link sent");
            }}
            className="text-sm text-blue-600 w-full mt-2"
          >
            Resend reset link
          </button>
        </form>

        {message && <p className="text-center text-sm mt-4">{message}</p>}
      </div>
    </div>
  );
}
