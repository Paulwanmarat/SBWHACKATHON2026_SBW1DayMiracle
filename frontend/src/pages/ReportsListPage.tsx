import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, BarChart3, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import type { StudentSummary } from '../types';

function getMasteryColor(m: number) {
  if (m < 60) return '#f87171';
  if (m < 75) return '#fbbf24';
  return '#34d399';
}

export default function ReportsListPage() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getStudents()
      .then((r) => {
        setStudents(r.students);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) => s.student_id.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <p className="text-xs font-semibold text-zinc-500">Loading learning reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold pill-blue uppercase tracking-wider block w-fit mb-1">
            Empirical Proof
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Learning Gain Reports
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Select a student profile to inspect verified post-intervention learning gains
          </p>
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 text-xs w-full rounded-lg bg-[#18181b] border border-zinc-800 focus:border-blue-500 text-white placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* Desktop Data Table */}
      <div className="hidden md:block card overflow-hidden">
        <div className="table-scroll">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Student ID</th>
                <th className="text-left">Overall Mastery Progress</th>
                <th className="text-left">Observation Density</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.student_id}
                  className="cursor-pointer group hover:bg-zinc-800/50 transition-colors"
                  onClick={() => navigate(`/reports/${s.student_id}`)}
                >
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                        <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <span className="font-mono font-bold text-white text-xs">{s.student_id}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-32 rounded-full h-1.5 bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${s.overall_mastery}%`, background: getMasteryColor(s.overall_mastery) }}
                        />
                      </div>
                      <span className="text-xs font-bold" style={{ color: getMasteryColor(s.overall_mastery) }}>
                        {s.overall_mastery.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="text-xs text-zinc-400 font-medium">{s.total_responses} item responses</td>
                  <td className="text-center">
                    <div className="w-6 h-6 mx-auto rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="py-12 text-center text-xs text-zinc-500">No matching student reports found.</div>}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filtered.map((s) => (
          <div
            key={s.student_id}
            className="card p-4 space-y-2.5 cursor-pointer hover:border-zinc-700 transition-colors"
            onClick={() => navigate(`/reports/${s.student_id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="font-mono font-bold text-white text-sm">{s.student_id}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-400">Mastery Score</span>
                <span style={{ color: getMasteryColor(s.overall_mastery) }}>
                  {s.overall_mastery.toFixed(1)}%
                </span>
              </div>
              <div className="w-full rounded-full h-1.5 bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${s.overall_mastery}%`, background: getMasteryColor(s.overall_mastery) }}
                />
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-10 text-xs text-zinc-500">No matching student reports found.</div>}
      </div>
    </div>
  );
}
