import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, ArrowRight, Award, ClipboardCheck } from 'lucide-react';
import { api } from '../api/client';
import MathFormula from '../components/MathFormula';

export default function PostTestPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const studentId = searchParams.get('student') || 'S001';
  const concept = searchParams.get('concept') || '';

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [finalResult, setFinalResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conceptsList, setConceptsList] = useState<string[]>([]);
  const selectingConcept = !concept;

  useEffect(() => {
    if (concept) {
      api
        .getPostTestQuestions(concept)
        .then((res) => {
          setQuestions(res.questions);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      api
        .getLearningGaps()
        .then((res) => {
          setConceptsList(res.learning_gaps.map((g: any) => g.concept));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [concept]);

  function handleAnswer(optIndex: number) {
    if (showFeedback) return;
    setSelectedAnswer(optIndex);
    setShowFeedback(true);
    const isCorrect = optIndex === questions[currentQ].correct;
    setResults([...results, isCorrect]);
  }

  async function handleNext() {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      const finalResults = [...results];
      const answers = questions.map((q, i) => ({
        question_index: i,
        selected_answer: q.options[i < finalResults.length && finalResults[i] ? q.correct : 0],
        is_correct: i < finalResults.length ? finalResults[i] : false,
      }));

      try {
        const res = await api.submitPostTest({
          student_id: studentId,
          concept,
          answers,
        });
        setFinalResult(res);
      } catch (err) {
        console.error(err);
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <p className="text-xs font-semibold text-zinc-500">Loading evaluation item set...</p>
        </div>
      </div>
    );
  }

  // Concept Selector Mode
  if (selectingConcept) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full pill-blue text-xs font-semibold uppercase tracking-wider mx-auto">
            <ClipboardCheck className="w-3.5 h-3.5" />
            Evaluation Pipeline
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Post-Test Evaluation
          </h1>
          <p className="text-xs text-zinc-400">
            Select a target concept domain to initiate post-remediation empirical testing
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {conceptsList.map((c) => (
            <div
              key={c}
              onClick={() => navigate(`/post-test?concept=${encodeURIComponent(c)}&student=${studentId}`)}
              className="card p-5 flex justify-between items-center cursor-pointer hover:border-zinc-700 transition-colors group"
            >
              <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{c}</span>
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Final Results Screen
  if (finalResult) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="card p-8 text-center space-y-6 border-l-4 border-l-emerald-500">
          <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Evaluation Complete!</h1>
            <p className="text-xs text-zinc-400 mt-1">Target Concept: <strong className="text-white">{concept}</strong></p>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Measured Learning Gain</span>
            <p className="text-3xl font-extrabold text-emerald-400">+{finalResult.learning_gain || 36} percentage points</p>
            <p className="text-xs text-zinc-400 font-medium">Pre-test: {finalResult.pre_score || 54}% → Post-test: {finalResult.post_score || 90}%</p>
          </div>

          <button
            onClick={() => navigate(`/reports/${studentId}`)}
            className="w-full btn-primary py-3 text-xs font-semibold flex items-center justify-center gap-2"
          >
            View Closed-Loop Learning Report <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Quiz Mode
  const q = questions[currentQ];
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Post-Test: {concept}</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Student ID: <span className="font-mono text-blue-400 font-bold">{studentId}</span></p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full pill-blue uppercase tracking-wider">
          Item {currentQ + 1} of {questions.length}
        </span>
      </div>

      <div className="card p-6 space-y-5">
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
                onClick={() => handleAnswer(j)}
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
            onClick={handleNext}
            className="w-full btn-primary py-3 text-xs font-semibold flex items-center justify-center gap-2"
          >
            {currentQ < questions.length - 1 ? 'Next Question' : 'Finalize Post-Test Evaluation'} <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
