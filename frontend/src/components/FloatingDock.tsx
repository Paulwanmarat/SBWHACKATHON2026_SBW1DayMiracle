import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileUp,
  Users,
  AlertTriangle,
  Lightbulb,
  ClipboardCheck,
  BarChart3,
  BookOpen,
  Sparkles,
} from 'lucide-react';

const dockItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/assessment', icon: FileUp, label: 'Assessment' },
  { to: '/students', icon: Users, label: 'Students' },
  { to: '/learning-gaps', icon: AlertTriangle, label: 'Gaps Radar' },
  { to: '/interventions', icon: Lightbulb, label: 'Strategies' },
  { to: '/post-test', icon: ClipboardCheck, label: 'Post-Test' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/about', icon: BookOpen, label: 'Architecture' },
];

export default function FloatingDock() {
  const location = useLocation();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-full px-4 pointer-events-auto">
      <nav
        className="flex items-center gap-1.5 sm:gap-2 p-2 rounded-2xl sm:rounded-full border border-white/15 shadow-2xl shadow-cyan-500/10 transition-all duration-300"
        style={{
          background: 'rgba(5, 8, 17, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(6, 182, 212, 0.15)',
        }}
      >
        {/* Brand Indicator */}
        <div className="hidden sm:flex items-center gap-2 pl-3 pr-2 border-r border-white/10 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
        </div>

        {/* Navigation Dock Links */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {dockItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                id={`dock-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`group relative p-2.5 sm:p-3 rounded-xl sm:rounded-full transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/25 to-purple-500/20 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/20 scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-white/10 hover:scale-110'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'}`} />
                <span className={`text-xs font-extrabold transition-all hidden md:inline-block ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {item.label}
                </span>

                {/* Hover Tooltip for icon-only mobile view */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-slate-900 border border-white/20 text-[10px] font-extrabold text-cyan-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl md:hidden">
                  {item.label}
                </div>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
