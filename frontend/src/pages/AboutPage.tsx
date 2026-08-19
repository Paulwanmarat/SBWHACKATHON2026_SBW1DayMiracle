import {
  BrainCircuit,
  Target,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  GraduationCap,
  GitBranch,
} from 'lucide-react';
import MathFormula from '../components/MathFormula';

export default function AboutPage() {
  const researchPillars = [
    {
      icon: BrainCircuit,
      color: 'text-blue-400',
      title: 'Automated Misconception Engine',
      description:
        'Analyzes diagnostic item response matrices to detect recurring error patterns, clustering student responses to formulate evidence-based cognitive gap hypotheses.',
    },
    {
      icon: Target,
      color: 'text-emerald-400',
      title: 'Closed-Loop Gain Measurement',
      description:
        'Validates remediation efficacy by comparing pre-test and post-test assessments, computing percentage-point growth (+pp) for empirical proof of skill acquisition.',
    },
    {
      icon: GitBranch,
      color: 'text-amber-400',
      title: 'Concept Dependency Graph Traversal',
      description:
        'Maps prerequisite and downstream relationships between mathematical domains to prevent cascading cognitive gaps before advanced instruction.',
    },
    {
      icon: ShieldCheck,
      color: 'text-red-400',
      title: 'Rule-Backed Explainable AI',
      description:
        'Ensures 100% deterministic transparency without black-box hallucination, grounding every recommendation in local educational knowledge schemas.',
    },
  ];

  const methodologySteps = [
    {
      step: '01',
      title: 'Diagnostic Ingestion',
      desc: 'Parses item-level response logs (correct answers, distractors, timing) across concept domains.',
    },
    {
      step: '02',
      title: 'Mastery Estimation',
      desc: 'Computes scalar mastery percentages and item observation density confidence scores.',
    },
    {
      step: '03',
      title: 'Gap Identification',
      desc: 'Clusters students into Struggling, Developing, and Mastery archetypes.',
    },
    {
      step: '04',
      title: 'Targeted Remediation',
      desc: 'Synthesizes grounded pedagogical guides, step-by-step worked examples, and hints.',
    },
    {
      step: '05',
      title: 'Gain Validation',
      desc: 'Measures pre/post percentage-point improvement to confirm closed-loop learning.',
    },
  ];

  return (
    <div className="space-y-14 max-w-4xl mx-auto py-4">
      {/* Centered Header Abstract */}
      <div className="card p-9 md:p-12 space-y-5 text-center border-t-4 border-t-blue-500 shadow-xl">
        <div className="flex items-center justify-center gap-3">
          <span className="px-4 py-1.5 rounded-full pill-blue text-xs font-bold uppercase tracking-wider">
            Academic Research Specification
          </span>
          <span className="text-xs text-zinc-400 font-mono">LEARNEX Engine Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto">
          System Architecture & Methodology
        </h1>
        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl mx-auto">
          LEARNEX is an <strong>Evidence-Driven Closed-Loop Learning Intelligence Platform</strong>. Designed for mathematical and technical domains, it replaces subjective evaluation with deterministic knowledge-state modeling, automated misconception hypothesis generation, and empirical learning gain verification.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
        <div className="card p-7 space-y-2 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Engine Latency</span>
          <p className="text-3xl font-extrabold text-blue-400 tracking-tight">&lt; 150 ms</p>
          <p className="text-xs text-zinc-400 leading-normal">Real-time log parsing</p>
        </div>
        <div className="card p-7 space-y-2 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Pattern Coverage</span>
          <p className="text-3xl font-extrabold text-emerald-400 tracking-tight">100%</p>
          <p className="text-xs text-zinc-400 leading-normal">Rule-backed detection</p>
        </div>
        <div className="card p-7 space-y-2 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Precision</span>
          <p className="text-3xl font-extrabold text-amber-400 tracking-tight">Deterministic</p>
          <p className="text-xs text-zinc-400 leading-normal">Zero hallucination</p>
        </div>
        <div className="card p-7 space-y-2 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Responsiveness</span>
          <p className="text-3xl font-extrabold text-red-400 tracking-tight">Mobile + PC</p>
          <p className="text-xs text-zinc-400 leading-normal">Fully adaptive layout</p>
        </div>
      </div>

      {/* Core Architectural Pillars */}
      <div className="space-y-8">
        <div className="flex items-center justify-center gap-3 text-center">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight uppercase">
            Core Architectural Pillars
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {researchPillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} className="card p-8 space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">
                  <Icon className={`w-6 h-6 ${p.color}`} />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">{p.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-sm mx-auto">{p.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pipeline Flow */}
      <div className="card p-9 space-y-8 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Cpu className="w-4.5 h-4.5" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight uppercase">
            End-to-End Diagnostic Pipeline
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {methodologySteps.map((s) => (
            <div key={s.step} className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 text-center">
              <span className="text-base font-mono font-bold text-blue-400">{s.step}</span>
              <h4 className="text-xs font-bold text-white tracking-tight">{s.title}</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mathematical Formulations Section */}
      <div className="card p-9 space-y-8 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight uppercase">
              Mathematical Formulations
            </h2>
          </div>
          <span className="text-xs font-bold px-3.5 py-1 rounded-full pill-blue uppercase tracking-wider mt-1">
            KaTeX Rendered
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 text-center">
          <div className="p-7 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">1. Concept Mastery Estimation Formula</h4>
            <MathFormula tex="M(s, c) = \frac{\sum_{i=1}^{N} r_{i, c}}{N_{\text{total}}} \times 100\%" displayMode />
            <p className="text-xs text-zinc-300 leading-relaxed">
              Evaluates student <MathFormula tex="s" /> on concept <MathFormula tex="c" /> where <MathFormula tex="r_{i,c} \in \{0, 1\}" /> represents individual item response correctness.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">2. Misconception Confidence Heuristic</h4>
            <MathFormula tex="\text{Confidence}(m) = \min\left(95\%, 60\% + N_{\text{affected}} \cdot 4\%\right)" displayMode />
            <p className="text-xs text-zinc-300 leading-relaxed">
              Scalar confidence for misconception hypothesis $m$ scaled dynamically by distractor observation density.
            </p>
          </div>
        </div>
      </div>

      {/* Team Credits */}
      <div className="card p-9 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto text-white shadow-lg">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white">Developed by SBW1DayMiracle</h3>
        <p className="text-xs sm:text-sm text-zinc-300 font-medium">
          Phanyawat Wanmarat · Krittapat Tangnopakhun · Pongpat Lurinsakorn · Pawinwat Kuljirapat
        </p>
        <p className="text-xs text-zinc-500 font-mono pt-1">© 2026 SBW1DayMiracle. All Rights Reserved.</p>
      </div>
    </div>
  );
}
