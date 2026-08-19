import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingDown, Loader2, Sparkles, BookOpen, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from '../api/client';
import type { StudentDetail } from '../types';

function getMasteryColor(m: number) {
  if (m < 60) return '#f87171';
  if (m < 75) return '#fbbf24';
  return '#34d399';
}

function getArchetypeBadge(archetype?: string) {
  if (archetype === 'Mastery') return 'pill-green';
  if (archetype === 'Developing') return 'pill-amber';
  return 'pill-red';
}

export default function StudentProfilePage() {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!studentId) return;
    api
      .getStudent(studentId)
      .then((res) => {
        setStudent(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <p className="text-xs font-semibold text-zinc-500">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return <div className="text-center py-20 text-xs text-zinc-500">Student profile not found.</div>;
  }

  const chartData = student.concepts.map((c) => ({
    name: c.concept.length > 24 ? c.concept.slice(0, 22) + '…' : c.concept,
    fullName: c.concept,
    mastery: c.mastery,
  }));

  const archetype =
    student.archetype ||
    (student.overall_mastery >= 75 ? 'Mastery' : student.overall_mastery >= 55 ? 'Developing' : 'Struggling');
  const badgeStyle = getArchetypeBadge(archetype);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 card p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/students')}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 block mb-0.5">Student Profile</span>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>ID:</span>
              <span className="font-mono text-blue-400">{student.student_id}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeStyle}`}>
            {archetype} Archetype
          </span>
          <button
            onClick={() => navigate(`/learn/${student.student_id}?concept=${encodeURIComponent(student.weakest_concepts[0]?.concept || '')}`)}
            className="btn-primary px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4" /> Launch Adaptive Path
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="card p-4 sm:p-5 space-y-2 border-t-2 border-t-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Overall Mastery Score</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: getMasteryColor(student.overall_mastery) }}>
            {student.overall_mastery}%
          </p>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${student.overall_mastery}%`, background: getMasteryColor(student.overall_mastery) }}
            />
          </div>
        </div>

        <div className="card p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Response Logs</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{student.total_responses}</p>
          <p className="text-xs text-zinc-400">{student.correct_responses} correct answers</p>
        </div>

        <div className="card p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Primary Weakest Domain</span>
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-sm font-bold text-red-400 flex items-center gap-2 mt-1">
            <span>{student.weakest_concepts[0]?.concept || 'None Identified'}</span>
          </p>
        </div>
      </div>

      {/* Concept Mastery Graph */}
      <div className="card p-4 sm:p-6 space-y-4">
        <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">Concept Mastery Evaluation Breakdown</h2>
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#27272a" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#71717a' }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 600 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="card-surface p-3 text-xs space-y-1">
                      <p className="font-bold text-white">{d.fullName}</p>
                      <p className="text-zinc-400">
                        Mastery Score: <span className="font-bold" style={{ color: getMasteryColor(d.mastery) }}>{d.mastery}%</span>
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="mastery" radius={[0, 6, 6, 0]} barSize={18}>
                {chartData.map((e, i) => (
                  <Cell key={i} fill={getMasteryColor(e.mastery)} fillOpacity={0.9} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
