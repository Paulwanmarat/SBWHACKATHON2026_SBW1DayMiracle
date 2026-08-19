import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../components/ToastProvider';

interface Props {
  onDataLoaded?: (isDemo: boolean) => void;
}

export default function AssessmentPage({ onDataLoaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await api.uploadAssessment(file);
      setResult(res);
      onDataLoaded?.(false);
      showToast('CSV Assessment log uploaded successfully!', 'success');
    } catch (err: any) {
      setError(err.message || 'Error processing CSV file');
      showToast('CSV Upload Failed', 'warning');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full pill-blue text-xs font-semibold uppercase tracking-wider mx-auto">
          <Sparkles className="w-3.5 h-3.5" />
          Data Ingestion Pipeline
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Assessment Log Ingestion
        </h1>
        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
          Upload raw item-level diagnostic logs. Our engine automatically parses misconceptions, computes mastery scalars, and generates interventions.
        </p>
      </div>

      {/* Upload Box */}
      <div className="card p-8 text-center space-y-6">
        <label
          htmlFor="file-upload"
          className="group block border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl p-10 cursor-pointer transition-colors bg-zinc-900/50 hover:bg-zinc-900"
        >
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
            <Upload className="w-7 h-7" />
          </div>

          {file ? (
            <div className="flex items-center justify-center gap-2 text-blue-400 font-semibold text-sm">
              <FileText className="w-4 h-4" />
              <span>{file.name}</span>
              <span className="text-xs text-zinc-500">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Click to select or drag & drop CSV diagnostic file</p>
              <p className="text-xs text-zinc-500">Supported format: UTF-8 encoded .csv dataset</p>
            </div>
          )}
          <input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
        </label>

        {/* Expected Schema Badges */}
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-left space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-300 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
              Required CSV Header Schema
            </span>
            <span className="text-[10px] font-semibold text-blue-400 uppercase">Spec</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-mono font-medium">
            <span className="px-2 py-0.5 rounded pill-blue">student_id</span>
            <span className="px-2 py-0.5 rounded pill-blue">concept</span>
            <span className="px-2 py-0.5 rounded pill-blue">question_id</span>
            <span className="px-2 py-0.5 rounded pill-blue">is_correct</span>
            <span className="px-2 py-0.5 rounded pill-blue">distractor</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-3">
            <div className="flex items-center justify-center gap-2 font-bold text-sm text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span>Dataset Ingested & Analyzed!</span>
            </div>
            <p className="text-xs text-zinc-300">
              Processed <strong className="text-white">{result.total_responses || 0}</strong> records across <strong className="text-white">{result.students_count || 0}</strong> students.
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary px-5 py-2 text-xs font-semibold inline-flex items-center gap-2"
            >
              Explore Overview Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="pt-2">
          <button
            id="upload-csv-btn"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full btn-primary py-3 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Processing Data...' : 'Upload & Run Engine'}
          </button>
        </div>
      </div>
    </div>
  );
}
