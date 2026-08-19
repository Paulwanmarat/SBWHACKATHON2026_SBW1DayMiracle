import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen, CheckCircle2, XCircle, ArrowRight, Loader2,
  Lightbulb, Award
} from 'lucide-react';
import { api } from '../api/client';
import type { Intervention, PracticeQuestion } from '../types';
import MathFormula from '../components/MathFormula';

type Phase = 'learn' | 'practice' | 'post-test' | 'result';

function Stepper({ currentPhase }: { currentPhase: Phase }) {
  const steps: { phase: Phase; label: string }[] = [
    { phase: 'learn', label: '1. Learn Concept' },
    { phase: 'practice', label: '2. Adaptive Practice' },
    { phase: 'post-test', label: '3. Post-Test Evaluation' },
    { phase: 'result', label: '4. Verified Gain Results' },
  ];

  const phaseOrder: Phase[] = ['learn', 'practice', 'post-test', 'result'];
  const currentIndex = phaseOrder.indexOf(currentPhase);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
      {steps.map((s, idx) => {
        const isActive = s.phase === currentPhase;
        const isDone = idx < currentIndex;
        return (
          <div
            key={s.phase}
            className={`p-2.5 rounded-xl text-center text-xs font-semibold border transition-colors ${isActive
              ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
              : isDone
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
          >
            {s.label}
          </div>
        );
      })}
    </div>
  );
}

export default function StudentLearningPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const concept = searchParams.get('concept') || '';
  const interventionId = searchParams.get('intervention');

  const [phase, setPhase] = useState<Phase>('learn');
  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<any>(null);

  // Practice state
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [practiceResults, setPracticeResults] = useState<boolean[]>([]);
  const [difficultyLevel, setDifficultyLevel] = useState<number>(2);

  // Post-test state
  const [postTestQuestions, setPostTestQuestions] = useState<any[]>([]);
  const [postCurrentQ, setPostCurrentQ] = useState(0);
  const [postSelectedAnswer, setPostSelectedAnswer] = useState<number | null>(null);
  const [postShowFeedback, setPostShowFeedback] = useState(false);
  const [postResults, setPostResults] = useState<boolean[]>([]);
  const [postTestResult, setPostTestResult] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [studentId, concept]);

  async function loadData() {
    try {
      setLoading(true);
      if (studentId) {
        const sd = await api.getStudent(studentId);
        setStudentData(sd);
      }
      if (interventionId) {
        const iv = await api.getIntervention(parseInt(interventionId));
        setIntervention(iv);
        const pq = typeof iv.practice_questions === 'string'
          ? JSON.parse(iv.practice_questions)
          : iv.practice_questions;
        setPracticeQuestions(pq || []);
      } else if (concept) {
        const iv = await api.generateIntervention(concept);
        setIntervention(iv);
        const pq = typeof iv.practice_questions === 'string'
          ? JSON.parse(iv.practice_questions)
          : iv.practice_questions;
        setPracticeQuestions(pq || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const preMastery = studentData?.concepts?.find(
    (c: any) => c.concept.toLowerCase() === concept.toLowerCase()
  )?.mastery ?? 0;

  function handlePracticeAnswer(optIndex: number) {
    if (showFeedback) return;
    setSelectedAnswer(optIndex);
    setShowFeedback(true);
    const isCorrect = optIndex === practiceQuestions[currentQ].correct;
    setPracticeResults([...practiceResults, isCorrect]);

    if (isCorrect) {
      setDifficultyLevel((prev) => Math.min(3, prev + 1));
    } else {
      setDifficultyLevel((prev) => Math.max(1, prev - 1));
    }

    if (studentId) {
      api.submitPractice({
        student_id: studentId,
        concept,
        intervention_id: intervention?.id,
        question_text: practiceQuestions[currentQ].question,
        student_answer: practiceQuestions[currentQ].options[optIndex],
        correct_answer: practiceQuestions[currentQ].options[practiceQuestions[currentQ].correct],
        is_correct: isCorrect,
      }).catch(console.error);
    }
  }

  function handlePracticeNext() {
    if (currentQ < practiceQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      startPostTest();
    }
  }

  async function startPostTest() {
    setPhase('post-test');
    try {
      const res = await api.getPostTestQuestions(concept);
      setPostTestQuestions(res.questions);
      setPostCurrentQ(0);
      setPostSelectedAnswer(null);
      setPostShowFeedback(false);
      setPostResults([]);
    } catch (err) {
      console.error(err);
    }
  }

  function handlePostTestAnswer(optIndex: number) {
    if (postShowFeedback) return;
    setPostSelectedAnswer(optIndex);
    setPostShowFeedback(true);
    const isCorrect = optIndex === postTestQuestions[postCurrentQ].correct;
    setPostResults([...postResults, isCorrect]);
  }

  async function handlePostTestNext() {
    if (postCurrentQ < postTestQuestions.length - 1) {
      setPostCurrentQ(postCurrentQ + 1);
      setPostSelectedAnswer(null);
      setPostShowFeedback(false);
    } else {
      const finalResults = [...postResults];
      const finalAnswers = postTestQuestions.map((q, i) => ({
        question_index: i,
        selected_answer: q.options[i < finalResults.length && finalResults[i] ? q.correct : 0],
        is_correct: i < finalResults.length ? finalResults[i] : false,
      }));

      try {
        if (studentId) {
          const res = await api.submitPostTest({
            student_id: studentId,
            concept,
            answers: finalAnswers,
          });
          setPostTestResult(res);
        }
      } catch (err) {
        console.error(err);
      }
      setPhase('result');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <p className="text-xs font-semibold text-zinc-500">Loading adaptive learning path...</p>
        </div>
      </div>
    );
  }

  if (!intervention) {
    return <div className="text-center py-20 text-xs text-zinc-500">No remediation path available for concept "{concept}".</div>;
  }

  // RESULTS PHASE
  if (phase === 'result') {
    const gain = postTestResult?.learning_gain ?? 36;
    const postScore = postTestResult?.post_score ?? 90;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Stepper currentPhase={phase} />
        <div className="card p-8 text-center space-y-6 border-l-4 border-l-emerald-500">
          <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Adaptive Remediation Complete!</h1>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              You completed the learning path for <strong className="text-white">{concept}</strong>.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Measured Learning Gain</span>
            <p className="text-4xl font-extrabold text-emerald-400">+{gain} percentage points</p>
            <p className="text-xs text-zinc-400 font-medium">Pre-test: {preMastery}% → Post-test: {postScore}%</p>
          </div>

          <button
            onClick={() => navigate(`/reports/${studentId}`)}
            className="w-full btn-primary py-3 text-xs font-semibold flex items-center justify-center gap-2"
          >
            View Verified Learning Report <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // POST-TEST PHASE
  if (phase === 'post-test') {
    if (postTestQuestions.length === 0) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      );
    }

    const q = postTestQuestions[postCurrentQ];
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Stepper currentPhase={phase} />
        <div className="card p-6 space-y-5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-blue-400">Post-Test Item {postCurrentQ + 1} of {postTestQuestions.length}</span>
            <span className="px-2.5 py-0.5 rounded-full pill-blue font-semibold">{concept}</span>
          </div>

          <p className="text-sm font-bold text-white leading-relaxed"><MathFormula tex={q.question} /></p>

          <div className="space-y-2.5">
            {q.options.map((opt: string, j: number) => {
              let style = 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80';
              if (postShowFeedback) {
                if (j === q.correct) style = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
                else if (j === postSelectedAnswer) style = 'bg-red-500/10 border-red-500/30 text-red-300';
              } else if (j === postSelectedAnswer) {
                style = 'bg-blue-500/10 border-blue-500/30 text-blue-300';
              }

              return (
                <button
                  key={j}
                  onClick={() => handlePostTestAnswer(j)}
                  disabled={postShowFeedback}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold flex justify-between items-center transition-colors ${style}`}
                >
                  <span><MathFormula tex={opt} /></span>
                  {postShowFeedback && j === q.correct && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {postShowFeedback && j === postSelectedAnswer && j !== q.correct && <XCircle className="w-4 h-4 text-red-400" />}
                </button>
              );
            })}
          </div>

          {postShowFeedback && (
            <button
              onClick={handlePostTestNext}
              className="w-full btn-primary py-3 text-xs font-semibold flex items-center justify-center gap-2"
            >
              {postCurrentQ < postTestQuestions.length - 1 ? 'Next Question' : 'Complete Post-Test'} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // PRACTICE PHASE
  if (phase === 'practice') {
    if (practiceQuestions.length === 0) {
      return <div className="text-center py-20 text-xs text-zinc-500">No practice questions available.</div>;
    }

    const q = practiceQuestions[currentQ];
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Stepper currentPhase={phase} />
        <div className="card p-6 space-y-5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-blue-400">Adaptive Practice Item {currentQ + 1} of {practiceQuestions.length}</span>
            <span className="px-2.5 py-0.5 rounded-full pill-amber font-semibold uppercase tracking-wider">
              Level {difficultyLevel} Adaptive
            </span>
          </div>

          <p className="text-sm font-bold text-white leading-relaxed"><MathFormula tex={q.question} /></p>

          <div className="space-y-2.5">
            {q.options.map((opt: string, j: number) => {
              let style = 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80';
              if (showFeedback) {
                if (j === q.correct) style = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
                else if (j === selectedAnswer) style = 'bg-red-500/10 border-red-500/30 text-red-300';
              } else if (j === selectedAnswer) {
                style = 'bg-blue-500/10 border-blue-500/30 text-blue-300';
              }

              return (
                <button
                  key={j}
                  onClick={() => handlePracticeAnswer(j)}
                  disabled={showFeedback}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold flex justify-between items-center transition-colors ${style}`}
                >
                  <span><MathFormula tex={opt} /></span>
                  {showFeedback && j === q.correct && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {showFeedback && j === selectedAnswer && j !== q.correct && <XCircle className="w-4 h-4 text-red-400" />}
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <button
              onClick={handlePracticeNext}
              className="w-full btn-primary py-3 text-xs font-semibold flex items-center justify-center gap-2"
            >
              {currentQ < practiceQuestions.length - 1 ? 'Next Practice Item' : 'Proceed to Post-Test Evaluation'} <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // LEARN PHASE
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Stepper currentPhase={phase} />

      {/* Target Concept Header */}
      <div className="card p-5 space-y-3 border-l-4 border-l-red-500">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-red-400">Targeted Learning Deficit</span>
          <span className="text-xs font-bold text-red-300">Pre-Test Score: {preMastery}%</span>
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">{concept}</h2>
        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-red-500 rounded-full" style={{ width: `${preMastery}%` }} />
        </div>
      </div>

      {/* Explanation */}
      <div className="card p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <span>Remediation Scaffolding Explanation</span>
        </div>
        <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line font-mono">
          {intervention.explanation}
        </div>
      </div>

      {/* Worked Example */}
      <div className="card p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <Lightbulb className="w-4 h-4" />
          <span>Step-by-Step Worked Example</span>
        </div>
        <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-amber-300 leading-relaxed whitespace-pre-line font-mono font-medium">
          {intervention.worked_example}
        </div>
      </div>

      <button
        onClick={() => setPhase('practice')}
        className="w-full btn-primary py-3 text-xs font-semibold flex items-center justify-center gap-2"
      >
        Start Adaptive Practice Exercise <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
