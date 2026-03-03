// app/components/Stepper.tsx
"use client";

import Link from "next/link";

interface Step {
  number: number;
  label: string;
  href: string;
  status?: "active" | "complete" | "upcoming";
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  hint?: string;
  nextHref?: string;
  prevHref?: string;
}

const Stepper = ({ steps, currentStep, hint, nextHref, prevHref }: StepperProps) => {
  return (
    <nav
      aria-label="LexTrust Step Guide"
      className="max-w-[1120px] mx-auto my-12 p-6 bg-white rounded-2xl shadow-lg grid gap-5"
    >
      {/* Intro */}
      <div className="flex flex-col gap-1">
        <p className="uppercase text-[18px] tracking-wider text-[#FFA500] font-semibold">
          Step Guide
        </p>
        <p className="text-sm text-gray-500">
          Step {currentStep} of {steps.length}
        </p>
      </div>

      {/* Step List */}
      <ol className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 list-none p-0 m-0">
        {steps.map((step) => {
          const isActive = step.number === currentStep;
          const isComplete = step.status === "complete";

          return (
            <li key={step.number}>
              <Link
                href={step.href}
                className={`
                  flex items-center gap-3 p-3 rounded-xl
                  transition-transform duration-150 ease-in-out
                  ${isActive ? "bg-white border border-[#FFA500] shadow-[0_12px_30px_rgba(255,165,0,0.15)]" : "bg-[#F7e7ce] border border-transparent"}
                  hover:translate-y-[-1px] hover:shadow-lg
                  text-[#5F021F] font-semibold
                `}
              >
                <span
                  className={`
                    w-8 h-8 rounded-full grid place-items-center text-sm font-semibold
                    ${isActive ? "bg-[#FFA500] text-white" : isComplete ? "bg-[#00A884] text-white" : "bg-gray-200 text-[#5F021F]"}
                  `}
                >
                  {step.number}
                </span>
                <span>{step.label}</span>
              </Link>
            </li>
          );
        })}
      </ol>

      {/* Actions */}
      {(hint || nextHref || prevHref) && (
        <div className="flex flex-wrap justify-between gap-3 items-center mt-3">
          {hint && <span className="text-sm text-gray-500">{hint}</span>}
          <div className="flex flex-wrap gap-3">
            {prevHref && (
              <Link
                href={prevHref}
                className="inline-flex items-center justify-center px-4 py-3 rounded-xl font-semibold text-sm border border-[#FFA500] text-[#FFA500] bg-transparent hover:bg-[#FFF2E0] transition"
              >
                ← Previous
              </Link>
            )}
            {nextHref && (
              <Link
                href={nextHref}
                className="inline-flex items-center justify-center px-4 py-3 rounded-xl font-semibold text-sm bg-[#FFA500] text-white shadow-lg hover:translate-y-[-1px] transition"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Stepper;