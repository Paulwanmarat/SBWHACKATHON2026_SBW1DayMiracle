import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Users, ArrowRight, Loader2, Lightbulb, HelpCircle, GitFork, ArrowLeft } from 'lucide-react';
import { api } from '../api/client';
import type { LearningGap, LearningGapDetail } from '../types';
import MathFormula from '../components/MathFormula';

function getMasteryColor(m: number) {
  if (m < 60) return '#f87171';
  if (m < 75) return '#fbbf24';
  return '#34d399';
}

function getPriorityBadge(p: string) {
  if (p === 'HIGH') return 'pill-red';
  if (p === 'MEDIUM') return 'pill-amber';
  return 'pill-green';
}

export default function LearningGapsPage() {
  const [gaps, setGaps] = useState<LearningGap[]>([]);
  const [detail, setDetail] = useState<LearningGapDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedConcept = searchParams.get('concept');

  useEffect(() => {
    api
      .getLearningGaps()
      .then((res) => {
        setGaps(res.learning_gaps);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedConcept) {
      api
        .getLearningGapDetail(selectedConcept)
        .then((res) => {
          setDetail(res);
        })
        .catch(() => {});
    } else {
      setDetail(null);
    }
  }, [selectedConcept]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <p className="text-xs font-semibold text-zinc-500">Loading learning gaps...</p>
        </div>
      </div>
    );
  }

  // Detail Inspector View
  if (selectedConcept && detail) {
    const badge = getPriorityBadge(detail.priority);
    return (
      <div className="space-y-8 py-2">
        <div>
          <button
            onClick={() => navigate('/learning-gaps')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Learning Gaps
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 card p-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge} uppercase tracking-wider`}>
                {detail.priority} PRIORITY GAP
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{detail.concept}</h1>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Algorithmic Confidence: {Math.round((detail.confidence || 0.85) * 100)}%
            </p>
          </div>
          <button
            onClick={() => navigate(`/interventions?concept=${encodeURIComponent(detail.concept)}`)}
            className="btn-primary px-5 py-3 text-xs font-semibold self-start md:self-auto"
          >
            <Lightbulb className="w-4 h-4" /> Generate Intervention
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="card p-6 space-y-3 border-t-4 border-t-blue-500">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Concept Mastery Score</p>
            <p className="text-3xl font-extrabold tracking-tight" style={{ color: getMasteryColor(detail.mastery) }}>
              {detail.mastery}%
            </p>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${detail.mastery}%`, background: getMasteryColor(detail.mastery) }} />
            </div>
          </div>
          <div className="card p-6 space-y-3">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Affected Cohort Size</p>
            <p className="text-3xl font-extrabold text-white tracking-tight">{detail.students_affected}</p>
            <p className="text-xs text-zinc-400">Out of {detail.total_students} total evaluated</p>
          </div>
          <div className="card p-6 space-y-3">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Targeted Action</p>
            <p className="text-xs font-medium text-zinc-300 leading-relaxed">{detail.recommended_action}</p>
          </div>
        </div>

        {/* Rationale */}
        <div className="card p-7 space-y-3 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Explainability Rationale</span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {detail.explainability ||
              `Class mastery (${detail.mastery}%) is below target threshold based on observed distractor patterns across ${detail.total_students} students.`}
          </p>
        </div>

        {/* Downstream Impacts */}
        {detail.downstream_impacts && detail.downstream_impacts.length > 0 && (
          <div className="card p-7 space-y-3 border-l-4 border-l-amber-500">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <GitFork className="w-4 h-4" />
              <span>Downstream Dependent Concepts</span>
            </div>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {detail.downstream_impacts.map((impact, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg pill-amber text-xs font-semibold">
                  {impact}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Error Patterns Table */}
        {detail.error_patterns && detail.error_patterns.length > 0 && (
          <div className="card p-8 space-y-4">
            <h2 className="text-base font-bold text-white tracking-tight">Observed Incorrect Item Responses</h2>
            <div className="table-scroll border border-zinc-800 rounded-2xl">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th className="text-left">Student ID</th>
                    <th className="text-left">Selected Distractor Response</th>
                    <th className="text-left">Target Correct Solution</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.error_patterns.map((ep: any, idx: number) => (
                    <tr key={idx}>
                      <td className="font-mono font-bold text-white text-xs">{ep.student_id}</td>
                      <td>
                        <span className="px-2.5 py-1 rounded pill-red font-mono text-xs inline-block">
                          <MathFormula tex={ep.student_answer || ''} />
                        </span>
                      </td>
                      <td>
                        <span className="px-2.5 py-1 rounded pill-green font-mono text-xs inline-block">
                          <MathFormula tex={ep.correct_answer || ''} />
                        </span>
                      </td>
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

  // All Gaps List View - Grid gap 6
  return (
    <div className="space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold pill-blue uppercase tracking-wider block w-fit mb-2">
            Diagnostic Insights
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Identified Learning Gaps
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {gaps.length} concept deficits flagged requiring targeted instructional intervention
          </p>
        </div>
      </div>

      {/* Gap Cards Grid - Gap 6 separation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gaps.map((gap) => {
          const badge = getPriorityBadge(gap.priority);
          return (
            <div
              key={gap.concept}
              className={`card p-7 space-y-4 cursor-pointer hover:border-zinc-600 transition-all ${
                gap.priority === 'HIGH' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-amber-500'
              }`}
              onClick={() => navigate(`/learning-gaps?concept=${encodeURIComponent(gap.concept)}`)}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${badge} uppercase tracking-wider`}>
                    {gap.priority} PRIORITY
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2.5 tracking-tight">{gap.concept}</h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800" style={{ color: getMasteryColor(gap.mastery) }}>
                  {gap.mastery}%
                </span>
              </div>

              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${gap.mastery}%`, background: getMasteryColor(gap.mastery) }} />
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-500" />
                  <span className="font-medium">{gap.students_affected} affected students</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                  <span>Inspect Diagnostic</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
