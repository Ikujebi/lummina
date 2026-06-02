import { Dispatch, SetStateAction } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

type PasswordsState = {
  current: string;
  new: string;
  confirm: string;
};

type PasswordFormProps = {
  passwords: PasswordsState;
  setPasswords: Dispatch<SetStateAction<PasswordsState>>;
  onChangePassword: () => void;
  loading: boolean;
  strength: number;
};

export default function PasswordForm({
  passwords,
  setPasswords,
  onChangePassword,
  loading,
}: PasswordFormProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="space-y-6 text-[#5F021F]">
      {/* TITLE (matches your original section style) */}
      <div>
        <h2 className="text-2xl font-bold text-[#5F021F]">
          Change Password
        </h2>
        <p className="text-sm text-[#5F021F]/70 mt-1">
          Use a strong password to keep your account secure.
        </p>
      </div>

      {/* CURRENT PASSWORD */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#5F021F]">
          Current Password
        </label>

        <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            value={passwords.current}
            onChange={(e) =>
              setPasswords({
                ...passwords,
                current: e.target.value,
              })
            }
            className="w-full h-12 px-4 pr-12 rounded-2xl border border-gray-200 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
          />

          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* NEW PASSWORD */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#5F021F]">
          New Password
        </label>

        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            value={passwords.new}
            onChange={(e) =>
              setPasswords({
                ...passwords,
                new: e.target.value,
              })
            }
            className="w-full h-12 px-4 pr-12 rounded-2xl border border-gray-200 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
          />

          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* CONFIRM PASSWORD */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#5F021F]">
          Confirm New Password
        </label>

        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={passwords.confirm}
            onChange={(e) =>
              setPasswords({
                ...passwords,
                confirm: e.target.value,
              })
            }
            className="w-full h-12 px-4 pr-12 rounded-2xl border border-gray-200 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
          />

          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* BUTTON */}
      <button
        onClick={onChangePassword}
        disabled={loading}
        className="h-12 px-6 rounded-2xl bg-[#5F021F] hover:bg-[#430116] text-white font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
      >
        {loading && <Loader2 className="animate-spin" size={18} />}
        {loading ? "Updating Password..." : "Change Password"}
      </button>
    </div>
  );
}