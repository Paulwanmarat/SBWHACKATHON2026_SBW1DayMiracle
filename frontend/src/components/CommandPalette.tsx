import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, FileUp, Users, AlertTriangle, Lightbulb, ClipboardCheck, BarChart3, BookOpen, X, Command } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { label: 'Overview Dashboard', path: '/', category: 'Navigation', icon: LayoutDashboard },
    { label: 'Assessment Ingestion', path: '/assessment', category: 'Navigation', icon: FileUp },
    { label: 'Students Directory', path: '/students', category: 'Navigation', icon: Users },
    { label: 'Identified Learning Gaps', path: '/learning-gaps', category: 'Navigation', icon: AlertTriangle },
    { label: 'Intervention Strategies', path: '/interventions', category: 'Navigation', icon: Lightbulb },
    { label: 'Post-Test Evaluation', path: '/post-test', category: 'Navigation', icon: ClipboardCheck },
    { label: 'Learning Reports', path: '/reports', category: 'Navigation', icon: BarChart3 },
    { label: 'About & Methodology', path: '/about', category: 'Navigation', icon: BookOpen },
    { label: 'Student Profile S001', path: '/students/S001', category: 'Quick Link', icon: Users },
    { label: 'Student Profile S002', path: '/students/S002', category: 'Quick Link', icon: Users },
  ];

  const filtered = quickLinks.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#18181b] rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl space-y-0">
        {/* Search Input */}
        <div className="p-3.5 border-b border-zinc-800 flex items-center gap-3 bg-zinc-900/50">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search page..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent border-none text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-0"
          />
          <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
            <Command className="w-3 h-3" /> K
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item.path)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-blue-400 group-hover:border-zinc-700">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200 group-hover:text-white">{item.label}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{item.path}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded pill-blue uppercase">
                    {item.category}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-zinc-500 font-medium">No matching commands or pages found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
