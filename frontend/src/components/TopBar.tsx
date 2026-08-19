import { Database, User, Bell, Menu, GraduationCap, Command, Search } from 'lucide-react';
import { useToast } from './ToastProvider';

interface TopBarProps {
  isDemo: boolean;
  onMenuClick: () => void;
  onOpenCommandPalette: () => void;
}

export default function TopBar({ isDemo, onMenuClick, onOpenCommandPalette }: TopBarProps) {
  const { showToast } = useToast();

  const handleNotificationClick = () => {
    showToast('Notifications synced: 2 pending learning gap alerts', 'info');
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 h-[60px] flex items-center justify-between px-4 sm:px-6 z-40 desktop-topbar-offset bg-[#09090b]/80 border-b border-zinc-800/80 backdrop-blur-md"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">LEARNEX</span>
        </div>

        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-3 ml-6 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 transition-all shadow-xs"
        >
          <Search className="w-3.5 h-3.5 text-zinc-500" />
          <span className="font-medium">Search dashboard or student...</span>
          <span className="flex items-center gap-0.5 text-[10px] font-mono font-semibold text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded-md border border-zinc-700">
            <Command className="w-3 h-3" /> K
          </span>
        </button>

        {isDemo && (
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full pill-amber text-xs font-bold">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Demo Benchmark Mode</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-semibold text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Subject: Mathematics</span>
        </div>

        <button
          onClick={handleNotificationClick}
          className="w-8.5 h-8.5 rounded-xl flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500" />
        </button>

        <div className="w-8.5 h-8.5 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 font-bold text-xs">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
