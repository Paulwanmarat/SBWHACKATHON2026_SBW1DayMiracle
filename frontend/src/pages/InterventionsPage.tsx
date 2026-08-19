import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lightbulb, CheckCircle2, Loader2, Sparkles, BookOpen, Layers } from 'lucide-react';
import { api } from '../api/client';
import type { Intervention, PracticeQuestion } from '../types';
import MathFormula from '../components/MathFormula';
import { useToast } from '../components/ToastProvider';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { badge: string; label: string }> = {
    approved: { badge: 'pill-green', label: 'Approved' },
    draft: { badge: 'pill-amber', label: 'Pending Review' },
    rejected: { badge: 'pill-red', label: 'Rejected' },
  };
  const s = map[status] || map.draft;
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.badge}`}>
      {s.label}
    </span>
  );
}

export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [approving, setApproving] = useState(false);
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const conceptParam = searchParams.get('concept');

  useEffect(() => {
    loadInterventions();
  }, []);

  useEffect(() => {
    if (conceptParam && !loading && interventions.length >= 0) {
      const existing = interventions.find(
        (i) => i.concept.toLowerCase() === conceptParam.toLowerCase()
      );
      if (existing) {
        setSelectedIntervention(existing);
      }
    }
  }, [conceptParam, loading, interventions]);

  async function loadInterventions() {
    try {
      const res = await api.getInterventions();
      setInterventions(res.interventions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(concept: string) {
    setGenerating(true);
    try {
      const res = await api.generateIntervention(concept);
      await loadInterventions();
      setSelectedIntervention(res.intervention);
      showToast(`Strategy synthesized for ${concept}`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Generation failed', 'warning');
    } finally {
      setGenerating(false);
    }
  }

  async function handleApprove(id: number) {
    setApproving(true);
    try {
      await api.approveIntervention(id);
      await loadInterventions();
      if (selectedIntervention) {
        setSelectedIntervention({ ...selectedIntervention, status: 'approved' });
      }
      showToast('Intervention strategy approved!', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setApproving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <p className="text-xs font-semibold text-zinc-500">Loading intervention strategies...</p>
        </div>
      </div>
    );
  }

  const practiceQs: PracticeQuestion[] = selectedIntervention
    ? typeof selectedIntervention.practice_questions === 'string'
      ? JSON.parse(selectedIntervention.practice_questions || '[]')
      : selectedIntervention.practice_questions || []
    : [];

  return (
    <div className="space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold pill-blue uppercase tracking-wider block w-fit mb-2">
            Pedagogical Engine
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Intervention Strategies
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Targeted remediation pathways, step-by-step scaffolds, and adaptive item sets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Intervention List - Spacious space-y-6 separation */}
        <div className="space-y-6">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-blue-400" />
            Generated Strategies
          </h2>
          {interventions.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedIntervention(item)}
              className={`card p-6 space-y-3 cursor-pointer transition-all ${
                selectedIntervention?.id === item.id
                  ? 'border-blue-500 bg-zinc-800/90 shadow-lg scale-[1.01]'
                  : 'hover:border-zinc-600 hover:bg-zinc-800/40'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white tracking-tight">{item.concept}</h3>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{item.learning_objective}</p>
            </div>
          ))}

          {conceptParam && !interventions.some((i) => i.concept.toLowerCase() === conceptParam.toLowerCase()) && (
            <div className="card p-6 text-center space-y-4">
              <Sparkles className="w-7 h-7 text-blue-400 mx-auto" />
              <p className="text-xs font-semibold text-zinc-300">
                Generate tailored intervention strategy for <strong className="text-white">{conceptParam}</strong>
              </p>
              <button
                onClick={() => handleGenerate(conceptParam)}
                disabled={generating}
                className="w-full btn-primary py-3 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
                Synthesize Strategy
              </button>
            </div>
          )}
        </div>

        {/* Selected Intervention Inspector */}
        <div className="lg:col-span-2">
          {selectedIntervention ? (
            <div className="card p-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={selectedIntervention.status} />
                    <span className="text-xs text-zinc-500 font-mono">
                      Generated: {new Date(selectedIntervention.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight mt-3">
                    {selectedIntervention.concept} Remediation
                  </h2>
                </div>
                {selectedIntervention.status !== 'approved' && (
                  <button
                    onClick={() => handleApprove(selectedIntervention.id)}
                    disabled={approving}
                    className="btn-primary bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-semibold flex items-center gap-2 shrink-0"
                  >
                    {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Approve Strategy
                  </button>
                )}
              </div>

              {/* Target Learning Objective */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Target Learning Objective
                </h4>
                <div className="p-4 rounded-xl pill-amber text-xs font-semibold leading-relaxed">
                  {selectedIntervention.learning_objective}
                </div>
              </div>

              {/* Remediation Guide & Hints */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Pedagogical Remediation Scaffolding
                </h4>
                <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 leading-relaxed whitespace-pre-line font-mono">
                  {selectedIntervention.explanation}
                </div>
              </div>

              {/* Practice Questions Preview */}
              {practiceQs.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    Adaptive Practice Question Set
                  </h4>
                  <div className="space-y-4">
                    {practiceQs.map((q, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200">
                        <span className="font-bold text-blue-400 mr-2 text-sm">Q{idx + 1}.</span>
                        <MathFormula tex={typeof q === 'string' ? q : q.question} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-12 text-center text-xs font-medium text-zinc-500">
              Select an intervention strategy from the panel on the left to inspect diagnostic remediation details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
