"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import zxcvbn from "zxcvbn";

import Bg from "@/public/img/loginbg.png";
import Logo from "@/public/img/Lummina2.png";

export default function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [timeLeft, setTimeLeft] = useState(600);

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

  const strength = useMemo(() => {
    if (!password) return 0;
    return zxcvbn(password).score;
  }, [password]);

  const strengthLabel = ["Very Weak", "Weak", "Fair", "Good", "Strong"][strength];

 const handleReset = async (e: React.SyntheticEvent) => {
    e.preventDefault();

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

      if (!res.ok) {
        throw new Error(data.error || "Reset failed");
      }

      setMessage("Password updated successfully");

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: unknown) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#5F021F]/90">
        Invalid reset token
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative text-[#5F021F]/90">
      <Image src={Bg} alt="bg" fill className="object-cover -z-10" />
      <div className="absolute inset-0 bg-black/40 -z-10" />

      <div className="bg-white/90 p-8 rounded-2xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Image
            src={Logo}
            alt="logo"
            width={120}
            height={120}
            className="h-auto"
          />
        </div>

        <p className="text-center mb-4">
          Expires in {formatTime(timeLeft)}
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded"
          />

          {password && (
            <p className="text-sm">
              Strength: {strengthLabel}
            </p>
          )}

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            className="w-full border p-2 rounded"
          />

          <button
            disabled={loading || timeLeft === 0}
            className="w-full bg-orange-500 text-white p-2 rounded"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        {message && (
          <p className="text-center mt-4">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}