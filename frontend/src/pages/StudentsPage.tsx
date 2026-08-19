import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, TrendingDown, ArrowRight, Users, Filter, ArrowUpDown } from 'lucide-react';
import { api } from '../api/client';
import type { StudentSummary } from '../types';

function getMasteryColor(m: number) {
  if (m < 60) return '#f87171';
  if (m < 75) return '#fbbf24';
  return '#34d399';
}

type ArchetypeFilter = 'all' | 'struggling' | 'developing' | 'mastery';
type SortField = 'id' | 'mastery_asc' | 'mastery_desc' | 'responses';

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ArchetypeFilter>('all');
  const [sort, setSort] = useState<SortField>('mastery_asc');
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

  let filtered = students.filter((s) => s.student_id.toLowerCase().includes(search.toLowerCase()));

  if (filter === 'struggling') filtered = filtered.filter((s) => s.overall_mastery < 60);
  else if (filter === 'developing') filtered = filtered.filter((s) => s.overall_mastery >= 60 && s.overall_mastery < 75);
  else if (filter === 'mastery') filtered = filtered.filter((s) => s.overall_mastery >= 75);

  if (sort === 'mastery_asc') filtered.sort((a, b) => a.overall_mastery - b.overall_mastery);
  else if (sort === 'mastery_desc') filtered.sort((a, b) => b.overall_mastery - a.overall_mastery);
  else if (sort === 'responses') filtered.sort((a, b) => b.total_responses - a.total_responses);
  else if (sort === 'id') filtered.sort((a, b) => a.student_id.localeCompare(b.student_id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <p className="text-xs font-semibold text-zinc-500">Loading student directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold pill-blue uppercase tracking-wider block w-fit mb-1">
            Cohort Directory
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Enrolled Students
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {students.length} active student profiles tracked in intelligence engine
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

      {/* Controls Bar */}
      <div className="card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1 mr-2">
            <Filter className="w-3.5 h-3.5 text-blue-400" /> Archetype:
          </span>
          {(['all', 'struggling', 'developing', 'mastery'] as ArchetypeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                filter === f
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" /> Sort:
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortField)}
            className="px-2.5 py-1 text-xs font-semibold bg-[#18181b] border border-zinc-800 rounded-lg text-zinc-300 focus:border-blue-500"
          >
            <option value="mastery_asc">Mastery: Lowest First</option>
            <option value="mastery_desc">Mastery: Highest First</option>
            <option value="responses">Log Density</option>
            <option value="id">Student ID</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block card overflow-hidden">
        <div className="table-scroll">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Student ID</th>
                <th className="text-left">Mastery Score</th>
                <th className="text-left">Proficiency Gauge</th>
                <th className="text-left">Weakest Concept</th>
                <th className="text-left">Response Density</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.student_id}
                  className="cursor-pointer group hover:bg-zinc-800/50 transition-colors"
                  onClick={() => navigate(`/students/${s.student_id}`)}
                >
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <span className="font-mono font-bold text-white text-xs">{s.student_id}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-bold text-xs" style={{ color: getMasteryColor(s.overall_mastery) }}>
                      {s.overall_mastery}%
                    </span>
                  </td>
                  <td>
                    <div className="w-28 rounded-full h-1.5 bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${s.overall_mastery}%`, background: getMasteryColor(s.overall_mastery) }}
                      />
                    </div>
                  </td>
                  <td className="text-zinc-300 font-medium">
                    {s.weakest_concept ? (
                      <div className="flex items-center gap-1.5">
                        <TrendingDown className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="text-xs text-red-300 font-medium">{s.weakest_concept}</span>
                      </div>
                    ) : (
                      <span className="text-emerald-400 text-xs font-medium">Mastery Achieved</span>
                    )}
                  </td>
                  <td className="text-zinc-400 text-xs">{s.total_responses} item logs</td>
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
        {filtered.length === 0 && <div className="py-12 text-center text-xs text-zinc-500">No matching student profiles found.</div>}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {filtered.map((s) => (
          <div
            key={s.student_id}
            className="card p-4 sm:p-5 space-y-3 cursor-pointer hover:border-zinc-700 transition-colors"
            onClick={() => navigate(`/students/${s.student_id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="font-mono font-bold text-white text-sm">{s.student_id}</span>
              </div>
              <span className="text-sm font-bold" style={{ color: getMasteryColor(s.overall_mastery) }}>
                {s.overall_mastery}%
              </span>
            </div>
            <div className="w-full rounded-full h-1.5 bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${s.overall_mastery}%`, background: getMasteryColor(s.overall_mastery) }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-0.5">
              <span>{s.weakest_concept ? `Weakest: ${s.weakest_concept}` : 'Mastery Achieved'}</span>
              <span>{s.total_responses} logs</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-10 text-xs text-zinc-500">No matching student profiles found.</div>}
      </div>
    </div>
  );
}
