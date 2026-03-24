'use client';

export default function Topbar() {
  return (
    <header className="fixed top-0 right-0 w-[calc(100%-18rem)] z-50 bg-[#f8f9ff]/70 backdrop-blur-xl flex justify-between items-center px-12 h-24 border-0">
      {/* Search */}
      <div className="flex items-center flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#45464d] opacity-50 text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="Search resources, users or analytics..."
            className="w-full bg-[#eff4ff] border-none rounded-full py-3 pl-12 pr-6 text-sm focus:ring-2 focus:ring-[#3755c3]/20 focus:outline-none transition-all font-body"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Notifications Bell */}
        <button className="p-3 text-[#45464d] hover:bg-[#e5eeff] rounded-full transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Apps Grid */}
        <button className="p-3 text-[#45464d] hover:bg-[#e5eeff] rounded-full transition-colors">
          <span className="material-symbols-outlined">apps</span>
        </button>

        {/* Divider */}
        <div className="h-10 w-px bg-[#c6c6cd]/30 mx-2"></div>

        {/* Admin Profile */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-[#0b1c30]">Admin User</p>
            <p className="text-xs text-[#45464d]">Super Admin</p>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg">
            <div className="w-full h-full bg-gradient-to-br from-[#3755c3] to-[#607cec] flex items-center justify-center text-white font-bold text-lg font-headline">
              A
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
