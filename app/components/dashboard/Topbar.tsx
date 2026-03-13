"use client";

type Props = {
  clientName: string;
  notifications: number;
  onToggleSidebar: () => void;
};

export default function Topbar({
  clientName,
  notifications,
  onToggleSidebar,
}: Props) {
  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white  flex justify-between items-center px-6 md:px-10 z-50">
      <div className="flex items-center gap-3 font-semibold text-xl text-[#5F021F]">
        <span className="w-6 h-6 bg-[#FFA500] rounded-full" />
        Lummina
      </div>

      <div className="flex items-center gap-6">
        <span className="hidden md:block text-[#5F021F] font-medium">
          {clientName}
        </span>

        <div className="relative text-[#5F021F]">
          🔔
          {notifications > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#FFA500] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {notifications}
            </span>
          )}
        </div>

        {/* Hamburger always on top of sidebar */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 bg-[#FFA500] text-white rounded-md relative z-60"
        >
          ☰
        </button>
      </div>
    </header>
  );
}
