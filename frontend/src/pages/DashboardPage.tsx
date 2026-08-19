import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Target,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Database,
  BrainCircuit,
  Sparkles,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  Layers,
  Download,
  Share2,
  PieChart as PieIcon,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { api } from '../api/client';
import MathFormula from '../components/MathFormula';
import { useToast } from '../components/ToastProvider';
import type { DashboardData } from '../types';

function getMasteryColor(m: number) {
  if (m < 60) return '#f87171';
  if (m < 75) return '#fbbf24';
  return '#34d399';
}

function getBarColor(m: number) {
  if (m < 60) return '#f87171';
  if (m < 75) return '#fbbf24';
  return '#34d399';
}

type ChartMode = 'bar' | 'area' | 'radar';
type FilterMode = 'all' | 'struggling' | 'developing' | 'mastery';

interface Props {
  onDataLoaded?: (isDemo: boolean) => void;
}

export default function DashboardPage({ onDataLoaded }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [chartMode, setChartMode] = useState<ChartMode>('bar');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const r = await api.getDashboard();
      setData(r);
      if (r.has_data) onDataLoaded?.(r.is_demo);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadDemo() {
    try {
      setLoadingDemo(true);
      await api.loadDemo();
      await loadDashboard();
      showToast('Synthetic Benchmark Dataset loaded successfully!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to load benchmark dataset', 'warning');
    } finally {
      setLoadingDemo(false);
    }
  }

  const handleExportCSV = () => {
    if (!data) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `learnex_analytics_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Diagnostic analytics exported to JSON/CSV', 'success');
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Dashboard link copied to clipboard!', 'info');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Initializing Intelligence Engine...
          </p>
        </div>
      </div>
    );
  }

  if (!data?.has_data) {
    return (
      <div className="max-w-xl mx-auto mt-12 text-center px-8 py-14 card space-y-6">
        <div className="w-18 h-18 mx-auto rounded-3xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-xl">
          <BrainCircuit className="w-9 h-9" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Welcome to LEARNEX
        </h2>
        <p className="text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
          Diagnostic AI engine designed to uncover student misconceptions, quantify learning gaps, and personalize educational interventions.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
          <button
            id="load-demo-btn"
            onClick={handleLoadDemo}
            disabled={loadingDemo}
            className="btn-primary px-6 py-3 text-sm font-semibold"
          >
            {loadingDemo ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Database className="w-4 h-4" />}
            Load Synthetic Benchmark
          </button>
          <button
            onClick={() => navigate('/assessment')}
            className="btn-ghost px-6 py-3 text-sm font-semibold"
          >
            Upload Custom CSV
          </button>
        </div>
      </div>
    );
  }

  let filteredConcepts = data.concepts;
  if (filterMode === 'struggling') filteredConcepts = data.concepts.filter((c) => c.mastery < 60);
  else if (filterMode === 'developing') filteredConcepts = data.concepts.filter((c) => c.mastery >= 60 && c.mastery < 75);
  else if (filterMode === 'mastery') filteredConcepts = data.concepts.filter((c) => c.mastery >= 75);

  const chartData = filteredConcepts.map((c) => ({
    name: c.concept.length > 20 ? c.concept.slice(0, 18) + '…' : c.concept,
    fullName: c.concept,
    mastery: c.mastery,
    students: c.students,
  }));

  const topGap = data.learning_gaps[0];
  const cl = data.class_clusters || { Struggling: 25, Developing: 40, Mastery: 35 };
  const total = (cl.Struggling || 0) + (cl.Developing || 0) + (cl.Mastery || 0);

  return (
    <div className="py-4">
      {/* Clean Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 mb-10 border-b border-zinc-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="px-3.5 py-1 rounded-full pill-blue text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Live Diagnostic Overview
            </span>
            <span className="text-xs text-zinc-400 font-mono">v2.5.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Class Learning Intelligence
          </h1>
          <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">
            Evidence-driven diagnostic platform. Analyzes assessment item logs, formulates misconception hypotheses, and tracks closed-loop learning gains.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="btn-ghost px-4.5 py-2.5 text-xs sm:text-sm font-semibold"
          >
            <Download className="w-4 h-4 text-blue-400" /> Export Data
          </button>
          <button
            onClick={handleShareLink}
            className="btn-primary px-4.5 py-2.5 text-xs sm:text-sm font-semibold"
          >
            <Share2 className="w-4 h-4 text-white" /> Share Dashboard
          </button>
        </div>
      </div>

      {/* Primary Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        <div className="card p-7 space-y-3 border-t-4 border-t-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider">Class Avg. Mastery</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Target className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: getMasteryColor(data.average_mastery) }}>
            {data.average_mastery}%
          </p>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>{data.total_responses} item responses</span>
          </div>
        </div>

        <StatCard
          icon={<Users className="w-4.5 h-4.5" />}
          label="Students Analyzed"
          value={data.total_students}
          color="indigo"
          subtext="Active cohorts"
        />
        <StatCard
          icon={<AlertTriangle className="w-4.5 h-4.5" />}
          label="Identified Gaps"
          value={data.learning_gaps_count}
          color="rose"
          subtext="High priority items"
        />
        <StatCard
          icon={<CheckCircle2 className="w-4.5 h-4.5" />}
          label="Completion Rate"
          value={`${data.assessment_completion}%`}
          color="emerald"
          subtext="Response density"
        />
      </div>

      {/* Class Archetype Distribution Bar - Explicit mb-10 for clear separation */}
      <div className="card p-8 space-y-5 mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2.5">
              <Layers className="w-4.5 h-4.5 text-blue-400" />
              Class Mastery Archetype Distribution
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Cohort categorization by proficiency thresholds</p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="text-zinc-400">Struggling (&lt;60%):</span>
              <span className="font-bold text-white text-sm">{cl.Struggling || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-zinc-400">Developing (60-74%):</span>
              <span className="font-bold text-white text-sm">{cl.Developing || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-zinc-400">Mastery (≥75%):</span>
              <span className="font-bold text-white text-sm">{cl.Mastery || 0}</span>
            </div>
          </div>
        </div>
        {total > 0 && (
          <div className="h-3.5 w-full rounded-full bg-zinc-900 overflow-hidden flex border border-zinc-800">
            <div
              style={{ width: `${((cl.Struggling || 0) / total) * 100}%` }}
              className="bg-red-500 rounded-l-full transition-all duration-300"
            />
            <div
              style={{ width: `${((cl.Developing || 0) / total) * 100}%` }}
              className="bg-amber-500 transition-all duration-300"
            />
            <div
              style={{ width: `${((cl.Mastery || 0) / total) * 100}%` }}
              className="bg-emerald-500 rounded-r-full transition-all duration-300"
            />
          </div>
        )}
      </div>

      {/* Concept Evaluation Chart & Priority Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 mb-10">
        {/* Concept Mastery Chart */}
        <div className="lg:col-span-2 card p-4 sm:p-8 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Concept Mastery Breakdown
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Item response accuracy categorized by topic domain</p>
            </div>

            {/* Mode Switches */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
              <button
                onClick={() => setChartMode('bar')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartMode === 'bar' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Bar Chart Mode"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartMode('area')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartMode === 'area' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Area Trend Mode"
              >
                <Activity className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartMode('radar')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartMode === 'radar' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Radar Domain Map"
              >
                <PieIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-4">
            <span className="text-xs font-bold text-zinc-400 flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-blue-400" /> Filter:
            </span>
            {(['all', 'struggling', 'developing', 'mastery'] as FilterMode[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilterMode(f)}
                className={`px-3.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all ${
                  filterMode === f
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'bar' ? (
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
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
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-zinc-400">Mastery Level:</span>
                            <span className="font-bold" style={{ color: getMasteryColor(d.mastery) }}>
                              {d.mastery}%
                            </span>
                          </div>
                          <p className="text-zinc-400 text-[11px]">{d.students} students evaluated</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="mastery" radius={[0, 6, 6, 0]} barSize={20}>
                    {chartData.map((e, i) => (
                      <Cell key={i} fill={getBarColor(e.mastery)} fillOpacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              ) : chartMode === 'area' ? (
                <AreaChart data={chartData} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717a' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#71717a' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="card-surface p-3 text-xs">
                          <p className="font-bold text-white">{d.fullName}</p>
                          <p className="text-blue-400 font-bold">Mastery: {d.mastery}%</p>
                        </div>
                      );
                    }}
                  />
                  <Area type="monotone" dataKey="mastery" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#areaGlow)" />
                </AreaChart>
              ) : (
                <RadarChart data={chartData} outerRadius="75%">
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#71717a' }} />
                  <Radar name="Mastery" dataKey="mastery" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.35} />
                  <Tooltip />
                </RadarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Gap Spotlight Card */}
        {topGap && (
          <div className="card p-5 sm:p-8 flex flex-col justify-between border-l-4 border-l-red-500">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Priority Gap
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold pill-red uppercase tracking-wider">
                  {topGap.priority} PRIORITY
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">{topGap.concept}</h3>
                <div className="flex items-center justify-between text-xs mt-2.5">
                  <span className="text-zinc-400 font-medium">Concept Mastery Score</span>
                  <span className="font-bold" style={{ color: getMasteryColor(topGap.mastery) }}>
                    {topGap.mastery}%
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-1.5">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${topGap.mastery}%` }} />
                </div>
              </div>

              <div className="space-y-3 text-xs pt-1">
                <div className="flex justify-between text-zinc-300 font-medium">
                  <span className="text-zinc-400">Affected Students:</span>
                  <span className="font-bold text-white">{topGap.students_affected} students</span>
                </div>

                {topGap.error_pattern && (
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider">
                      Primary Error Pattern
                    </p>
                    <p className="text-xs font-mono text-zinc-300 font-medium">{topGap.error_pattern}</p>
                  </div>
                )}
              </div>
            </div>

            <button
              id="view-learning-gap-btn"
              onClick={() => navigate(`/learning-gaps?concept=${encodeURIComponent(topGap.concept)}`)}
              className="mt-6 w-full btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2"
            >
              Inspect Gap & Diagnostics <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Misconception Hypotheses - Explicit mb-10 for clear separation */}
      {(data.misconception_hypotheses?.length ?? 0) > 0 && (
        <div className="card p-8 space-y-6 mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Potential Misconception Hypotheses</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Algorithmic inference derived from distractor selection patterns</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3.5 py-1 rounded-full pill-amber uppercase tracking-wider">
              Diagnostic Engine
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {data.misconception_hypotheses?.slice(0, 4).map((h) => (
              <div key={h.hypothesis_id} className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3 border-l-4 border-l-amber-500">
                <div className="flex justify-between items-center text-xs">
                  <span className="px-3 py-1 rounded pill-amber font-bold text-xs">
                    {h.concept}
                  </span>
                  <span className="text-amber-400 font-bold text-xs">
                    Confidence: {Math.round(h.confidence * 100)}%
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white tracking-tight">{h.label}</h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{h.evidence_summary}</p>
                <div className="flex items-center gap-2 pt-1 text-xs font-medium text-amber-300">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{h.recommended_remediation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Error Patterns Table - Explicit mb-10 for clear separation */}
      {data.error_patterns.length > 0 && (
        <div className="card p-8 space-y-5 mb-10">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">Common Distractor & Error Patterns</h2>
            <span className="text-xs font-medium text-zinc-400">Showing top distractor frequencies</span>
          </div>
          <div className="table-scroll border border-zinc-800 rounded-2xl">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="text-left">Concept</th>
                  <th className="text-left">Selected Wrong Answer</th>
                  <th className="text-left">Target Correct Answer</th>
                  <th className="text-left">Error Categorization</th>
                  <th className="text-center">Frequency</th>
                  <th className="text-center">Affected Students</th>
                </tr>
              </thead>
              <tbody>
                {data.error_patterns.slice(0, 8).map((p, i) => (
                  <tr key={i}>
                    <td className="font-bold text-white text-xs">{p.concept}</td>
                    <td>
                      <span className="px-2.5 py-1 rounded pill-red font-mono text-xs inline-block">
                        <MathFormula tex={p.wrong_answer || ''} />
                      </span>
                    </td>
                    <td>
                      <span className="px-2.5 py-1 rounded pill-green font-mono text-xs inline-block">
                        <MathFormula tex={p.correct_answer || ''} />
                      </span>
                    </td>
                    <td className="text-zinc-300 font-medium text-xs">{p.error_type || '—'}</td>
                    <td className="text-center font-bold text-white text-xs">{p.frequency}</td>
                    <td className="text-center font-bold text-blue-400 text-xs">{p.students_affected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'indigo' | 'emerald' | 'amber' | 'rose';
  subtext?: string;
}) {
  const styles = {
    indigo: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    rose: 'bg-red-500/10 border-red-500/20 text-red-400',
  };

  return (
    <div className="card p-7 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${styles[color]}`}>
          {icon}
        </div>
        <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
      {subtext && <p className="text-xs text-zinc-400 font-medium">{subtext}</p>}
    </div>
  );
}
