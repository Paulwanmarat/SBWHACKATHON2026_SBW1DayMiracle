import { Users, Shield, Sparkles } from 'lucide-react';

export default function Footer() {
  const members = [
    'Phanyawat Wanmarat',
    'Krittapat Tangnopakhun',
    'Pongpat Lurinsakorn',
    'Pawinwat Kuljirapat',
  ];

  return (
    <footer className="mt-28 mb-16 pt-10 border-t border-zinc-800/60 w-full flex justify-center">
      <div className="card p-8 max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-8 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                Project Team
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-3">
              <span>SBW1DayMiracle</span>
              <span className="text-xs px-3 py-1 rounded-full pill-blue font-bold">
                Hackathon 2026
              </span>
            </h3>
          </div>

          <div>
            <p className="text-xs font-extrabold text-zinc-400 mb-3 flex items-center gap-2 uppercase tracking-widest">
              <Users className="w-4 h-4 text-blue-400" />
              Team Members
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {members.map((member) => (
                <div
                  key={member}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-200 bg-zinc-900 border border-zinc-800 flex items-center gap-2.5"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{member}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-medium">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>© 2026 SBW1DayMiracle. All Rights Reserved.</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
            <span className="text-blue-400 font-bold">LEARNEX v2.5.0</span>
            <span>•</span>
            <span>Learning Intelligence Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
