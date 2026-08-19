import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, CheckCircle2, HelpCircle, BookOpen, Loader2, TrendingUp, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';

function getMasteryColor(m: number) {
  if (m < 60) return '#f87171';
  if (m < 75) return '#fbbf24';
  return '#34d399';
}

export default function ReportPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!studentId) return;
    api
      .getStudentReport(studentId)
      .then((res) => {
        setReport(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <p className="text-xs font-semibold text-zinc-500">Compiling learning gain report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return <div className="text-center py-20 text-xs font-medium text-zinc-500">Student report not found.</div>;
  }

  const postTest = report.post_tests?.[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/students/${studentId}`)}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 block mb-0.5">Diagnostic Verification</span>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Learning Gain Report:</span>
              <span className="font-mono text-blue-400">{studentId}</span>
            </h1>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full pill-green text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>Evidence Verified</span>
        </div>
      </div>

      {/* Main Gain Banner */}
      {postTest ? (
        <div className="card p-6 space-y-5 border-l-4 border-l-emerald-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Target Domain: {postTest.concept}</h2>
                <p className="text-xs text-zinc-400">Empirical Pre vs Post Intervention Mastery Comparison</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold pill-green uppercase tracking-wider self-start sm:self-auto">
              Mastery Growth
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center pt-3 border-t border-zinc-800">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Pre-Test Diagnostic</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-red-400">{postTest.pre_score}%</p>
              <p className="text-[11px] text-zinc-500">Baseline score</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Post-Test Evaluation</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{postTest.post_score}%</p>
              <p className="text-[11px] text-zinc-500">Post-remediation score</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-1">
            <p className="text-xs uppercase tracking-wider font-semibold text-emerald-400">Measured Learning Gain</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
              +{postTest.learning_gain} percentage points
            </p>
            <p className="text-xs text-zinc-400 font-medium">
              Validated gain across {postTest.questions_total} evaluation items
            </p>
          </div>
        </div>
      ) : (
        <div className="card p-10 text-center space-y-3">
          <HelpCircle className="w-8 h-8 mx-auto text-zinc-500" />
          <h3 className="text-sm font-bold text-white">No Post-Test Data Recorded</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Complete an adaptive remediation exercise and post-test assessment for student {studentId} to generate empirical Learning Gain proof.
          </p>
          <button
            onClick={() => navigate(`/students/${studentId}`)}
            className="btn-primary px-4 py-2 text-xs font-semibold"
          >
            Return to Student Profile
          </button>
        </div>
      )}

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="card p-5 space-y-3">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            Concept Mastery Breakdown
          </h3>
          <div className="space-y-2.5">
            {report.concepts?.map((c: any) => (
              <div key={c.concept} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-white">{c.concept}</span>
                  <span style={{ color: getMasteryColor(c.mastery) }}>{c.mastery}%</span>
                </div>
                <div className="w-full rounded-full h-1.5 bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.mastery}%`, background: getMasteryColor(c.mastery) }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Diagnostic Audit Trail
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-0.5">
              <p className="font-bold text-white">Item Response Log Volume</p>
              <p className="text-zinc-400 font-medium">Evaluated across <strong className="text-white">{report.total_responses}</strong> response logs.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-0.5">
              <p className="font-bold text-white">Adaptive Remediation Log</p>
              <p className="text-zinc-400 font-medium">
                {report.practice_summary?.length > 0
                  ? `Completed adaptive practice exercises across ${report.practice_summary.length} concepts.`
                  : 'No active practice attempts logged.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
