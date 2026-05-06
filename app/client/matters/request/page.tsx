"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Scale,
  ShieldCheck,
  Gavel,
  HelpCircle,
  Send,
  Loader2,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming shadcn utility

const OPTIONS = [
  {
    label: "Contract Review",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Legal Advice",
    icon: Scale,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    label: "Compliance Issue",
    icon: ShieldCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Dispute / Litigation",
    icon: Gavel,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    label: "Other",
    icon: HelpCircle,
    color: "text-gray-600",
    bg: "bg-gray-50",
  },
];

type Step = "type" | "details" | "review";

export default function NewMatterRequestPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("type");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const canProceedDetails = description.trim().length > 10;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients/matters/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: type, description }),
      });
      if (!res.ok) throw new Error("Failed");
      router.push("/client/cases?status=submitted");
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-12 min-h-screen">
      {/* PROGRESS TRACKER */}
      <div className="flex items-center justify-center gap-4 mb-12">
        {(["type", "details", "review"] as const).map((s, idx) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                "h-2 w-12 md:w-20 rounded-full transition-all duration-500",
                step === s ||
                  (idx === 0 && step !== "type") ||
                  (idx === 1 && step === "review")
                  ? "bg-[#5F021F]"
                  : "bg-gray-200",
              )}
            />
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 shadow-2xl shadow-[#5F021F]/5 rounded-[2rem] overflow-hidden">
        {/* HEADER SECTION */}
        <div className="bg-[#5F021F] p-8 text-white">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            {step === "type" && "Start a Request"}
            {step === "details" && "The Details"}
            {step === "review" && "Final Review"}
          </h1>
          <p className="text-[#FFA500] font-medium text-sm mt-1 opacity-90">
            {step === "type" && "Step 1: Choose your category"}
            {step === "details" && `Step 2: Describing ${type}`}
            {step === "review" && "Step 3: Confirm submission"}
          </p>
        </div>

        <div className="p-8">
          {/* STEP 1: CATEGORY SELECTION */}
          {step === "type" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-lg font-bold text-gray-800 mb-6">
                What do you need help with?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OPTIONS.map((o) => (
                  <button
                    key={o.label}
                    onClick={() => {
                      setType(o.label);
                      setStep("details");
                    }}
                    className="flex items-center justify-between p-5 border-2 border-gray-50 rounded-2xl hover:border-[#5F021F] hover:bg-[#5F021F]/5 transition-all group text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "p-3 rounded-xl transition-colors",
                          o.bg,
                          o.color,
                        )}
                      >
                        <o.icon size={24} />
                      </div>
                      <span className="font-bold text-gray-700 group-hover:text-[#5F021F]">
                        {o.label}
                      </span>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-gray-300 group-hover:text-[#5F021F] transform group-hover:translate-x-1 transition-all"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: DETAILS */}
          {step === "details" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <button
                onClick={() => setStep("type")}
                className="flex items-center gap-2 text-gray-400 hover:text-[#5F021F] mb-6 transition-colors font-medium text-sm"
              >
                <ArrowLeft size={16} /> Change category
              </button>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">
                  Please explain the situation
                </label>
                <textarea
                  autoFocus
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what happened, who is involved, and any critical deadlines..."
                  className="w-full h-52 border-2 border-gray-50 rounded-2xl p-5 text-base focus:outline-none focus:border-[#5F021F] focus:ring-4 focus:ring-[#5F021F]/5 transition-all bg-gray-50/30"
                />
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs font-bold",
                      description.length > 10
                        ? "text-green-500"
                        : "text-gray-400",
                    )}
                  >
                    {description.length} / 10 characters minimum
                  </span>
                  <button
                    disabled={!canProceedDetails}
                    onClick={() => setStep("review")}
                    className="bg-[#5F021F] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#5F021F]/20 disabled:opacity-30 disabled:shadow-none transition-all hover:scale-[1.02] active:scale-95"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {step === "review" && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[1.5rem] p-6 mb-8 relative">
                <div className="absolute -top-3 left-6 bg-white px-3 py-1 border border-gray-200 rounded-full text-[10px] font-black text-[#5F021F] uppercase tracking-widest">
                  Summary
                </div>
                <div className="space-y-6 pt-2">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-500" size={20} />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        Type
                      </p>
                      <p className="font-black text-[#5F021F]">{type}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">
                      Description
                    </p>
                    <p className="text-gray-600 leading-relaxed text-sm bg-white p-4 rounded-xl border border-gray-100 italic">
                      {'"'}
                      {description}
                      {'"'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4">
                <button
                  onClick={() => setStep("details")}
                  className="w-full md:w-auto px-6 py-3 text-gray-400 font-bold hover:text-[#5F021F] transition-colors"
                >
                  Edit details
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full flex-1 bg-[#FFA500] text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-[#FFA500]/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      Submit Request <Send size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-gray-400 text-xs mt-8">
        Secure legal intake. Your data is encrypted and private.
      </p>
    </div>
  );
}
