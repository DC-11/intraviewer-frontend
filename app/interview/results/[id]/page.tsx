/**
 * Interview Results and Analysis Page
 *
 * Fetches real data from backend APIs:
 * 1. GET /sessions/{id}/analyze                        — triggers LLM analysis (if not done yet)
 * 2. GET /sessions/{id}/analyss/result                 — emotion_result + qna_results
 * 3. GET /questions/session/{id}/with-answers           — questions + user spoken answers (combined)
 *
 * All three are merged client-side by question_id to build the full report.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import gsap from 'gsap';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Download,
  Share2,
  RotateCcw,
  Smile,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader,
  Lightbulb,
  MessageSquare,
  Brain,
} from 'lucide-react';
import { useInterviewStore } from '@/lib/stores/interviewStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { InterviewService } from '@/lib/services/interview.service';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

/* ------------------------------------------------------------------ */
/*  Types matching real backend responses                              */
/* ------------------------------------------------------------------ */

interface EmotionResult {
  perception: string;
  recommendation: string;
  confidence: string; // float stored as string
}

interface QnaResult {
  question_id: number;
  score: number;
  feedback: string;
  strength: string; // comma-separated
  weakness: string; // comma-separated
}

interface QuestionData {
  id: number;
  question_text: string;
  difficulty_level: string | null;
  recommended_answer: string | null;
}

interface TranscriptEntry {
  response: string;
  question_id: number;
}

/** Merged per-question analysis used for rendering */
interface QuestionAnalysis {
  questionId: string;
  question: string;
  difficulty: string;
  userAnswer: string;
  recommendedAnswer: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

/** Final assembled analysis shown in the UI */
interface AnalysisData {
  overallScore: number;
  highestScore: number;
  lowestScore: number;
  confidenceLevel: number;
  emotionPerception: string;
  recommendations: string[];
  questionAnalysis: QuestionAnalysis[];
}

/* ------------------------------------------------------------------ */
/*  Analysis Loading Screen                                             */
/* ------------------------------------------------------------------ */

const ANALYSIS_STEPS = [
  { icon: '🎙️', label: 'Reading your responses',       sub: 'Parsing audio transcripts…'        },
  { icon: '🧠', label: 'Running AI analysis',           sub: 'Evaluating answer quality…'        },
  { icon: '😊', label: 'Analysing facial expressions',  sub: 'Detecting emotional signals…'      },
  { icon: '📊', label: 'Scoring each question',         sub: 'Calculating performance metrics…'  },
  { icon: '💡', label: 'Generating recommendations',    sub: 'Tailoring feedback for you…'       },
  { icon: '✨', label: 'Finalising your report',        sub: 'Almost there…'                     },
];

function AnalysisLoadingScreen({ status }: { status: string }) {
  const [stepIndex, setStepIndex] = useState(0);
  const labelRef  = useRef<HTMLParagraphElement>(null);
  const subRef    = useRef<HTMLParagraphElement>(null);
  const iconRef   = useRef<HTMLDivElement>(null);
  const barRef    = useRef<HTMLDivElement>(null);

  /* Auto-advance steps */
  useEffect(() => {
    const id = setInterval(() => {
      setStepIndex((prev) => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  /* GSAP animate on step change */
  useEffect(() => {
    const els = [labelRef.current, subRef.current, iconRef.current].filter(Boolean);
    gsap.fromTo(
      els,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.07 }
    );

    /* Progress bar */
    const pct = ((stepIndex + 1) / ANALYSIS_STEPS.length) * 100;
    if (barRef.current) {
      gsap.to(barRef.current, { width: `${pct}%`, duration: 0.6, ease: 'power2.out' });
    }
  }, [stepIndex]);

  const step = ANALYSIS_STEPS[stepIndex];

  return (
    <div className="min-h-screen bg-[#e1e1db] flex items-center justify-center px-4">
      {/* Decorative background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#034732]/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-400/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md text-center">
        {/* Spinning ring + icon */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          {/* Outer spinning ring */}
          <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '2.5s' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#034732" strokeWidth="2.5"
              strokeDasharray="60 220" strokeLinecap="round" />
          </svg>
          {/* Inner slower counter-spin */}
          <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="36" fill="none" stroke="#b45309" strokeWidth="1.5"
              strokeDasharray="30 200" strokeLinecap="round" opacity="0.5" />
          </svg>
          {/* Icon */}
          <div
            ref={iconRef}
            className="absolute inset-0 flex items-center justify-center text-4xl"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(3,71,50,0.2))' }}
          >
            {step.icon}
          </div>
        </div>

        {/* Step label */}
        <p
          ref={labelRef}
          className="text-2xl font-semibold text-[#034732] mb-2 font-serif"
        >
          {step.label}
        </p>

        {/* Step sub-label (from GSAP step) */}
        <p
          ref={subRef}
          className="text-stone-500 text-sm mb-1"
        >
          {step.sub}
        </p>

        {/* Real backend status */}
        <p className="text-stone-400 text-xs mb-8 italic">{status}</p>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
          <div
            ref={barRef}
            className="h-full bg-[#034732] rounded-full"
            style={{ width: `${((stepIndex + 1) / ANALYSIS_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-4">
          {ANALYSIS_STEPS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-500"
              style={{
                width:  i === stepIndex ? 20 : 6,
                height: 6,
                background: i <= stepIndex ? '#034732' : '#d6d3d1',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function InterviewResultsPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const { currentSession } = useInterviewStore();
  const { accessToken } = useAuthStore();

  // Ref for the printable content area
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');

  // Local state
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Preparing analysis...');
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  /* ---- Fetch & merge all backend data ---- */
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check sessionStorage cache first to avoid re-fetching on refresh
        const cacheKey = `interview_results_v3_${sessionId}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          try {
            setAnalysisData(JSON.parse(cached));
            return; // skip all API calls
          } catch {
            sessionStorage.removeItem(cacheKey);
          }
        }

        const token = accessToken || undefined;

        // Step 1: Try fetching existing results first — analysis may already be done
        setLoadingStatus('Checking for existing results...');
        let analysisResult: any = null;
        try {
          analysisResult = await InterviewService.fetchAnalysisResult(sessionId, token);
        } catch {
          // No results yet — need to trigger analysis
        }

        // Step 2: If no results, trigger analysis then fetch results
        if (!analysisResult || !analysisResult.qna_results?.length) {
          setLoadingStatus('Running AI analysis on your responses...');
          try {
            await InterviewService.triggerAnalysis(sessionId, token);
          } catch (triggerErr: any) {
            console.warn('Trigger analysis response:', triggerErr.message);
          }

          setLoadingStatus('Fetching results...');
          analysisResult = await InterviewService.fetchAnalysisResult(sessionId, token);
        }

        // Step 3: Fetch questions with answers in a single API call
        setLoadingStatus('Fetching results...');
        const questionsWithAnswers = await InterviewService.fetchQuestionsWithAnswers(sessionId, token);

        // Build lookup maps from the combined response
        const questionMap = new Map<number, QuestionData>();
        const questionByOrder = new Map<number, QuestionData>();
        const transcriptMap = new Map<number, string>();
        const transcriptByOrder = new Map<number, string>();
        for (const q of questionsWithAnswers.questions) {
          const qData: QuestionData = {
            id: q.id,
            question_text: q.question_text,
            difficulty_level: q.difficulty_level,
            recommended_answer: q.recommended_answer,
          };
          questionMap.set(q.id, qData);
          questionByOrder.set(q.order, qData);
          if (q.user_response) {
            transcriptMap.set(q.id, q.user_response);
            transcriptByOrder.set(q.order, q.user_response);
          }
        }

        // Merge per-question data
        const questionAnalysis: QuestionAnalysis[] = analysisResult.qna_results.map(
          (qna: QnaResult, idx: number) => {
            // Try matching by question_id first, then fallback to order-based lookup
            const qData = questionMap.get(qna.question_id) || questionByOrder.get(qna.question_id);
            return {
              questionId: String(idx + 1),
              question: qData?.question_text || `Question #${qna.question_id}`,
              difficulty: qData?.difficulty_level || '',
              userAnswer: transcriptMap.get(qna.question_id) || transcriptByOrder.get(qna.question_id) || 'No transcript recorded',
              recommendedAnswer: qData?.recommended_answer || '',
              score: qna.score,
              feedback: qna.feedback || '',
              strengths: qna.strength
                ? qna.strength.split(',').map((s: string) => s.trim()).filter(Boolean)
                : [],
              improvements: qna.weakness
                ? qna.weakness.split(',').map((s: string) => s.trim()).filter(Boolean)
                : [],
            };
          }
        );

        // Compute aggregate scores
        const scores = questionAnalysis.map((q) => q.score);
        const overallScore =
          scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
        const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
        const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

        // Parse emotion result
        const emotionResult: EmotionResult = analysisResult.emotion_analysis;
        const confidenceRaw = parseFloat(emotionResult.confidence) || 0;
        // Backend stores confidence as 0–1 float or a percentage string; normalise to 0–100
        const confidenceLevel = confidenceRaw > 1 ? Math.round(confidenceRaw) : Math.round(confidenceRaw * 100);
        const recommendations = emotionResult.recommendation
          ? emotionResult.recommendation.split(',').map((r: string) => r.trim()).filter(Boolean)
          : [];

        setAnalysisData({
          overallScore,
          highestScore,
          lowestScore,
          confidenceLevel,
          emotionPerception: emotionResult.perception || '',
          recommendations,
          questionAnalysis,
        });

        // Cache results in sessionStorage so refreshes are instant
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({
            overallScore,
            highestScore,
            lowestScore,
            confidenceLevel,
            emotionPerception: emotionResult.perception || '',
            recommendations,
            questionAnalysis,
          }));
        } catch {
          // sessionStorage may be full or unavailable — non-critical
        }
      } catch (err: any) {
        console.error('Failed to load analysis:', err);
        setError(err.message || 'Failed to load analysis results');
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionId) {
      fetchAnalysis();
    }
  }, [sessionId, accessToken]);

  /* ---- Helpers ---- */

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 70) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score >= 60) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  /* ---- PDF Download ---- */
  const handleDownloadPDF = async () => {
    if (!reportRef.current || !analysisData) return;

    setIsDownloading(true);
    setDownloadProgress('Preparing content...');

    // Temporarily expand all questions so the PDF captures everything
    const prevExpanded = expandedQuestion;

    // We need to render all expanded — set a special "all" marker
    setExpandedQuestion('__all__');

    // Wait for React to re-render with all questions expanded
    await new Promise((resolve) => setTimeout(resolve, 400));

    try {
      const element = reportRef.current;

      setDownloadProgress('Capturing content...');
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#e1e1db',
        logging: false,
        windowWidth: 1200,
      });

      setDownloadProgress('Generating PDF...');
      // Use JPEG with compression to keep file size small
      const imgData = canvas.toDataURL('image/jpeg', 0.75);
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margin each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10; // top margin

      // First page
      pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= (pdfHeight - 20);

      // Additional pages if content overflows
      while (heightLeft > 0) {
        position = -(imgHeight - heightLeft) + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= (pdfHeight - 20);
      }

      setDownloadProgress('Saving file...');
      pdf.save(`interview-results-${sessionId}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      // Restore previous expanded state
      setExpandedQuestion(prevExpanded);
      setIsDownloading(false);
      setDownloadProgress('');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-stone-100 text-stone-600';
    }
  };

  /* ---- Loading state ---- */
  if (isLoading) {
    return <AnalysisLoadingScreen status={loadingStatus} />;
  }

  /* ---- Error state ---- */
  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-[#e1e1db] flex items-center justify-center px-4 pt-24">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-black text-lg mb-2">Failed to load results</p>
          <p className="text-stone-600 mb-6">{error}</p>
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-amber-700 hover:bg-amber-800"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div className="min-h-screen bg-[#e1e1db] py-12 px-4 pt-24">
      {/* PDF Download Modal Overlay */}
      {isDownloading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center border border-green-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <Loader className="w-8 h-8 animate-spin text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Generating PDF</h3>
            <p className="text-green-600 font-medium mb-3">{downloadProgress}</p>
            <div className="w-full h-2 bg-green-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full animate-pulse" style={{ width: '80%' }}></div>
            </div>
            <p className="text-gray-400 text-xs mt-3">Please wait, do not close the page</p>
          </div>
        </div>
      )}

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-amber-200/10 rounded-full blur-3xl"></div>
      </div>

      {/* Printable report content — everything inside this ref goes to PDF */}
      <div ref={reportRef} className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">Interview Results</h1>
          <p className="text-stone-600 text-lg">Here&apos;s your detailed performance analysis</p>
        </div>

        {/* ======== Overall Score Card ======== */}
        <div className="mb-12 bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Score Circle */}
            <div className="flex justify-center">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-200" />
                  <circle
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeDasharray={`${(analysisData.overallScore / 100) * 283} 283`}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ${getScoreColor(analysisData.overallScore)}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getScoreColor(analysisData.overallScore)}`}>
                    {analysisData.overallScore}
                  </div>
                  <p className="text-stone-600">Overall Score</p>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-6">
              {/* Highest Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-black font-semibold">Highest Question Score</span>
                  <span className={`text-lg font-bold ${getScoreColor(analysisData.highestScore)}`}>
                    {analysisData.highestScore}
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${analysisData.highestScore}%` }}></div>
                </div>
              </div>

              {/* Lowest Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-black font-semibold">Lowest Question Score</span>
                  <span className={`text-lg font-bold ${getScoreColor(analysisData.lowestScore)}`}>
                    {analysisData.lowestScore}
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all" style={{ width: `${analysisData.lowestScore}%` }}></div>
                </div>
              </div>

              {/* Confidence Level */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-black font-semibold">Emotion Confidence</span>
                  <span className={`text-lg font-bold ${getScoreColor(analysisData.confidenceLevel)}`}>
                    {analysisData.confidenceLevel}%
                  </span>
                </div>
                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 transition-all" style={{ width: `${analysisData.confidenceLevel}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======== Emotion Perception Card ======== */}
        {analysisData.emotionPerception && (
          <div className="mb-12 bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <Smile className="w-6 h-6 text-amber-700" />
              Emotional Analysis
            </h2>
            <p className="text-stone-700 leading-relaxed">{analysisData.emotionPerception}</p>
          </div>
        )}

        {/* ======== Question-by-Question Analysis ======== */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Question-by-Question Analysis</h2>

          <div className="space-y-4">
            {analysisData.questionAnalysis.map((qa) => (
              <div
                key={qa.questionId}
                className={`
                  bg-white/40 backdrop-blur-sm border rounded-xl overflow-hidden transition-all cursor-pointer
                  ${(expandedQuestion === '__all__' || expandedQuestion === qa.questionId) ? 'border-amber-700 bg-white/60' : 'border-amber-700/20 hover:bg-white/60'}
                `}
                onClick={() => setExpandedQuestion(expandedQuestion === qa.questionId ? null : qa.questionId)}
              >
                {/* Question Header */}
                <div className="p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-amber-700">
                        Question {qa.questionId}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${getDifficultyColor(qa.difficulty)}`}>
                        {qa.difficulty}
                      </span>
                      <span className={`text-sm font-bold px-2 py-1 rounded ${getScoreBgColor(qa.score)} border`}>
                        {qa.score}/100
                      </span>
                    </div>
                    <p className="text-black font-semibold">{qa.question}</p>
                  </div>
                  <ArrowRight
                    className={`w-6 h-6 text-stone-400 transition-transform ${expandedQuestion === qa.questionId ? 'rotate-90' : ''}`}
                  />
                </div>

                {/* Question Details - Expanded */}
                {(expandedQuestion === '__all__' || expandedQuestion === qa.questionId) && (
                  <div className="px-6 pb-6 border-t border-amber-700/20 space-y-6 pt-4">
                    {/* User's Answer */}
                    <div>
                      <h4 className="text-stone-700 font-semibold mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Your Answer
                      </h4>
                      <div className="bg-stone-100/60 rounded-lg p-4">
                        <p className="text-stone-600 text-sm italic">&quot;{qa.userAnswer}&quot;</p>
                      </div>
                    </div>

                    {/* Recommended Answer */}
                    {qa.recommendedAnswer && (
                      <div>
                        <h4 className="text-emerald-700 font-semibold mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Recommended Answer
                        </h4>
                        <div className="bg-emerald-50/60 border border-emerald-200/40 rounded-lg p-4">
                          <p className="text-stone-700 text-sm">{qa.recommendedAnswer}</p>
                        </div>
                      </div>
                    )}

                    {/* AI Feedback */}
                    <div>
                      <h4 className="text-stone-700 font-semibold mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        AI Feedback
                      </h4>
                      <p className="text-stone-600">{qa.feedback}</p>
                    </div>

                    {/* Strengths */}
                    {qa.strengths.length > 0 && (
                      <div>
                        <h4 className="text-green-700 font-semibold mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Strengths
                        </h4>
                        <ul className="space-y-1">
                          {qa.strengths.map((strength, idx) => (
                            <li key={idx} className="text-stone-600 text-sm flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Areas for Improvement */}
                    {qa.improvements.length > 0 && (
                      <div>
                        <h4 className="text-amber-700 font-semibold mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-1">
                          {qa.improvements.map((improvement, idx) => (
                            <li key={idx} className="text-stone-600 text-sm flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ======== Recommendations ======== */}
        {analysisData.recommendations.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-amber-700" />
              Recommendations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisData.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl p-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-amber-700 font-bold text-sm">{idx + 1}</span>
                    </div>
                    <p className="text-stone-700">{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>{/* end reportRef */}

        {/* ======== Action Buttons (outside reportRef — not in PDF) ======== */}
        <div className="relative max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 mt-4">
          <Button
            onClick={() => router.push('/interview/prepare')}
            className="bg-[#034732] hover:bg-[#023325] text-white flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Interview
          </Button>

          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="border-[#034732]/30 text-[#034732] hover:bg-white/60 flex items-center gap-2"
          >
            {isDownloading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isDownloading ? 'Generating PDF...' : 'Download Report'}
          </Button>

          <Button
            variant="outline"
            onClick={() => console.log('TODO: Implement share functionality')}
            className="border-[#034732]/30 text-[#034732] hover:bg-white/60 flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share Results
          </Button>
        </div>

        {/* Footer Link */}
        <div className="text-center text-stone-500">
          <p className="mb-4">Want to practice more?</p>
          <Link href="/interview/prepare" className="text-[#034732] hover:text-[#023325] font-semibold">
            Start a new interview session &rarr;
          </Link>
        </div>
        </div>
    </div>
  );
}
