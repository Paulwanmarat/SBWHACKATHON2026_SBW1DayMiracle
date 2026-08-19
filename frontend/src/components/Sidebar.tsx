import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileUp, Users, AlertTriangle, Lightbulb, ClipboardCheck, BarChart3, BookOpen, GraduationCap, X, ChevronRight } from 'lucide-react';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/assessment', icon: FileUp, label: 'Assessment' },
  { to: '/students', icon: Users, label: 'Students' },
  { to: '/learning-gaps', icon: AlertTriangle, label: 'Learning Gaps' },
  { to: '/interventions', icon: Lightbulb, label: 'Interventions' },
  { to: '/post-test', icon: ClipboardCheck, label: 'Post-Test' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/about', icon: BookOpen, label: 'About & Method' },
];

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const loc = useLocation();
  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-[240px] z-50 flex flex-col bg-[#09090b] border-r border-zinc-800/80 transition-transform duration-200 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
    >
      {/* Sidebar Logo Header */}
      <div className="h-[60px] px-5 flex items-center justify-between border-b border-zinc-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/20">
            <GraduationCap className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="leading-tight">
            <span className="text-sm font-extrabold text-white tracking-tight block">LEARNEX</span>
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">AI Engine v2.5</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">
          Main Menu
        </div>
        {nav.map((item) => {
          const Icon = item.icon;
          const active = item.to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${active
                  ? 'bg-blue-600/10 text-white border border-blue-500/30 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-blue-400 font-bold' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}
                />
                <span>{item.label}</span>
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer Badge */}
      <div className="p-4 border-t border-zinc-800/80 shrink-0">
        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-center space-y-1">
          <p className="text-[11px] font-bold text-white">SBW1DayMiracle</p>
          <p className="text-[10px] text-zinc-500 font-mono">Hackathon 2026</p>
        </div>
      </div>
    </aside>
  );
}
