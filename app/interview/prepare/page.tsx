/**
 * Interview Preparation Page
 * 
 * Guides users through interview setup in 3 simple steps:
 * 1. Optional CV upload (drag-drop support)
 * 2. Job description input (required)
 * 3. AI generates interview questions
 * 
 * Features:
 * - Optional CV upload with file validation
 * - Job description textarea
 * - AI question generation
 * - Progress indicators
 * - Responsive design
 * 
 * TODO: Connect to backend for question generation
 */

'use client';

interface Quote {
  id: number;
  quote: string;
  author: string;
}

import React from 'react';
import { useState, useEffect,useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader,
  ArrowRight,
  X,
  Sparkles
} from 'lucide-react';
import { useInterviewStore } from '@/lib/stores/interviewStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { AuthService } from '@/lib/services/auth.service';

/**
 * Interview Preparation Component
 * 
 * Manages the flow of uploading CV, describing job, and generating questions
 */
export default function InterviewPreparePage() {
  const router = useRouter();
  const {
    cvData,
    jobDescription,
    interviewQuestions,
    isGenerating,
    error,
    backendSessionId,
    uploadCV,
    setJobDescription,
    generateQuestions,
    createSession,
    SetUserData
  } = useInterviewStore();

  const [quotes, setQuotes] = useState<Quote[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shine, setShine] = useState(false);
    const [visible, setVisible] = useState(true);
    const textRef = useRef<HTMLDivElement>(null);
  
    // Load quotes from public/quotes.json once
    useEffect(() => {
      fetch('/quotes.json')
        .then((r) => r.json())
        .then((data: Quote[]) => setQuotes(data))
        .catch((e) => console.error('Failed to load quotes.json', e));
    }, []);
  
    // Rotate every 5 seconds with fade-out → swap → fade-in
    useEffect(() => {
      if (quotes.length === 0) return;
  
      const interval = setInterval(() => {
        // Fade out
        setVisible(false);
  
        setTimeout(() => {
          // Swap to next quote
          setCurrentIndex((prev) => (prev + 1) % quotes.length);
          // Trigger gold shine animation
          setShine(true);
          setTimeout(() => setShine(false), 1200);
          // Fade in
          setVisible(true);
        }, 350); // matches transition duration below
      }, 5000);
  
      return () => clearInterval(interval);
    }, [quotes]);
  
    const current = quotes[currentIndex];

  // Local state for managing steps
  const [currentStep, setCurrentStep] = useState<'upload' | 'describe' | 'createSession' |'preview'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [localJobTitle, setLocalJobTitle] = useState('');
  const [localJobDesc, setLocalJobDesc] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Clear only interviewQuestions from persisted storage (one-time cleanup)
  useEffect(() => {
    const stored = localStorage.getItem('interview-storage');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.state && data.state.interviewQuestions) {
          data.state.interviewQuestions = [];
          localStorage.setItem('interview-storage', JSON.stringify(data));
          console.log('🧹 Cleared old interview questions from storage');
        }
      } catch (e) {
        console.error('Failed to parse storage:', e);
      }
    }
  }, []);

  

  /**
   * Handle file upload via input or drag-drop
   */
  const handleFileUpload = (file: File) => {
    try {
      // uploadCV is async now — await to ensure backend parsing completes
      uploadCV(file).then(() => setCurrentStep('describe'));
    } catch (err) {
      console.error('File upload error:', err);
    }
  };

  /**
   * Handle drag and drop
   */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  /**
   * Handle drop event
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  /**
   * Handle generate questions click
   * 
   */
  const handleSetUserData = async () => {
    // Combine job title and description
    const fullJobDescription = `${localJobTitle}\n\n${localJobDesc}`;
    
    // Persist job description in the hook state for later use
    setJobDescription(fullJobDescription);
    // Pass the full job description to avoid relying on the
    // asynchronous state update; the hook accepts an override.
    await SetUserData();
    setCurrentStep('createSession');
  };

  /**
   * Handle start interview
   */
  const handleCreateSession = () => {
    // startInterview is async (calls backend); fire-and-forget and navigate
    createSession().then(() => {
      //router.push('/interview/session');
      console.log('Interview created successfully');
      setCurrentStep('preview');
    }).catch(() => {
      // keep user on page if start failed
      console.log('Interview creation failed');
    });
  };

  /** handle startinterview */
  const handleStartInterview = () => {
    // startInterview is async (calls backend); fire-and-forget and navigate
    if (backendSessionId) {
      router.push('/interview/session');
      console.log('Interview created successfully');
      setCurrentStep('preview');
    }
    else {
      console.log('Interview creation failed');
    }
  };
  console.log("the interview question length is  interviewQuestions", interviewQuestions);

  /**
   * Remove uploaded CV and reset step
   */
  const handleRemoveCV = () => {
    // Clear CV on backend/local state
    uploadCV(null as any).then(() => setCurrentStep('upload'));
  };

  return (
    <div className="min-h-screen bg-[#e1e1db] py-12 px-4 pt-24">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-emerald-300/8 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Start Your Interview Practice
          </h1>
          <p className="text-stone-700 text-lg">
            Tell us about your target role and we'll generate personalized questions
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12 flex justify-between relative">

          {/* Step 1:  CV Upload */}
          <div className="flex flex-col items-center z-10">
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg mb-2 transition-all
                ${(
                  cvData.file
                    ? 'bg-emerald-600 text-white'
                    : currentStep === 'upload'
                      ? 'bg-[#034732] text-white'
                      : 'bg-stone-300 text-stone-500'
                )}
              `}
            >
              {cvData.file ? <CheckCircle className="w-6 h-6" /> : '1'}
            </div>
            <span className="text-sm font-medium text-black">CV </span>
          </div>

          {/* Connector Line */}
          <div
            className={`
              flex-1 h-1 my-auto mx-4 rounded-full transition-all
              ${localJobTitle && localJobDesc ? 'bg-emerald-500' : 'bg-stone-400'}
            `}
            style={{ alignSelf: 'center', height: '2px' }}
          ></div>

          {/* Step 2: Job Description */}
          <div className="flex flex-col items-center z-10">
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg mb-2 transition-all
                ${(
                  localJobTitle && localJobDesc
                    ? 'bg-emerald-600 text-white'
                    : currentStep === 'describe'
                      ? 'bg-[#034732] text-white'
                      : 'bg-stone-300 text-stone-500'
                )}
              `}
            >
              {(localJobTitle && localJobDesc) ? <CheckCircle className="w-6 h-6" /> : '2'}
            </div>
            <span className="text-sm font-medium text-black">Job Description</span>
          </div>

          {/* Connector Line */}
          <div
            className={`
              flex-1 h-1 my-auto mx-4 rounded-full transition-all
              ${interviewQuestions.length > 0 ? 'bg-emerald-500' : 'bg-stone-400'}
            `}
            style={{ alignSelf: 'center', height: '2px' }}
          ></div>

          {/* Step 3: create session */}
          <div className="flex flex-col items-center z-10">
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg mb-2 transition-all
                ${(
                  interviewQuestions.length > 0
                    ? 'bg-emerald-600 text-white'
                    : currentStep === 'createSession'
                      ? 'bg-[#034732] text-white'
                      : 'bg-stone-300 text-stone-500'
                )}
              `}
            >
              {interviewQuestions.length > 0 ? <CheckCircle className="w-6 h-6" /> : '3'}
            </div>
            <span className="text-sm font-medium text-black">create session</span>
          </div>
        
            {/* Connector Line */}
          <div
            className={`
              flex-1 h-1 my-auto mx-4 rounded-full transition-all
              ${interviewQuestions.length > 0 ? 'bg-emerald-500' : 'bg-stone-400'}
            `}
            style={{ alignSelf: 'center', height: '2px' }}
          ></div>

                 {/* Step 4: Start Interview */}
          <div className="flex flex-col items-center z-10">
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg mb-2 transition-all
                ${(
                  currentStep === 'preview'
                    ? 'bg-emerald-600 text-white'
                    : interviewQuestions.length > 0
                      ? 'bg-[#034732] text-white'
                      : 'bg-stone-300 text-stone-500'
                )}
              `}
            >
              {interviewQuestions.length > 0 ? <CheckCircle className="w-6 h-6" /> : '4'}
            </div>
            <span className="text-sm font-medium text-black">Start Interview</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-red-50/60 border border-red-200/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Step 1:  Upload CV */}
        {currentStep === 'upload' && (
          <div className="bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-black mb-2">Upload Your CV (Optional)</h2>
              <p className="text-stone-700">
                Your CV helps us generate more personalized questions. Supported formats: PDF, Images (JPG, PNG, etc.), DOCX (Max 5MB). You can skip this if you prefer.
              </p>
            </div>

            {/* File Upload Area */}
            {!cvData.file ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all mb-6
                  ${(
                    dragActive
                      ? 'border-amber-600/50 bg-amber-50/50'
                      : 'border-amber-700/30 hover:border-amber-700/50 bg-white/30 hover:bg-white/50'
                  )}
                `}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-stone-500" />
                <p className="text-black font-semibold mb-2">Drag and drop your CV here</p>
                <p className="text-stone-600 text-sm mb-4">or click to browse your files</p>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  id="file-input"
                />

                <label htmlFor="file-input">
                  <Button
                    type="button"
                    className="bg-[#034732] hover:bg-[#023325] text-white"
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    Select File
                  </Button>
                </label>
              </div>
            ) : (
              /* CV Uploaded Display */
              <div className="p-6 bg-emerald-50/60 border border-emerald-200/50 rounded-lg flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <FileText className="w-8 h-8 text-emerald-600" />
                  <div>
                    <p className="text-black font-semibold">{cvData.fileName}</p>
                    <p className="text-stone-600 text-sm">Ready for analysis</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveCV}
                  className="text-red-600 hover:text-red-700 border-red-400 hover:border-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Next Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentStep('describe')}
                className="bg-[#034732] hover:bg-[#023325] shadow-md text-white"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Describe Job */}
        {currentStep === 'describe' && (
          <div className="bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-black mb-2">Describe Your Target Role</h2>
              <p className="text-stone-700">
                Tell us about the position you're interviewing for. Include the job title and detailed description.
              </p>
            </div>

            {/* Job Title Input */}
            <div className="mb-6">
              <label htmlFor="job-title" className="block text-sm font-medium text-stone-700 mb-3">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="job-title"
                value={localJobTitle}
                onChange={(e) => setLocalJobTitle(e.target.value)}
                placeholder="E.g., Senior Frontend Engineer"
                className="
                  w-full px-4 py-3 bg-white/50 border border-amber-700/30 rounded-lg
                  text-black placeholder-stone-500
                  focus:outline-none focus:ring-1 focus:ring-amber-600/50 focus:border-amber-600/50 focus:bg-white/70
                  transition-all
                "
              />
            </div>

            {/* Job Description Input */}
            <div className="mb-6">
              <label htmlFor="job-desc" className="block text-sm font-medium text-stone-700 mb-3">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="job-desc"
                value={localJobDesc}
                onChange={(e) => setLocalJobDesc(e.target.value)}
                placeholder="E.g., We're seeking a skilled engineer to lead our frontend team. Required: React, TypeScript, Web Performance. Responsibilities: Lead frontend architecture, mentor junior devs, optimize performance..."
                rows={6}
                className="
                  w-full px-4 py-3 bg-white/50 border border-amber-700/30 rounded-lg
                  text-black placeholder-stone-500 resize-none
                  focus:outline-none focus:ring-1 focus:ring-amber-600/50 focus:border-amber-600/50 focus:bg-white/70
                  transition-all
                "
              />
              <p className="text-stone-600 text-sm mt-2">
                {localJobDesc.length} characters
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('upload')}
                className="border-amber-700/30 text-black hover:bg-white/50"
              >
                Back
              </Button>
              <Button
                onClick={handleSetUserData}
                className="bg-[#034732] hover:bg-[#023325] flex items-center gap-2 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    uploading...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                   Next
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview Questions */}
        {currentStep === 'createSession'&& (
          <div className="bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl p-8">
           

           

            {/* Action Buttons */}
            <div className="flex gap-4 justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('describe')}
                className="border-amber-700/30 text-black hover:bg-white/50"
              >
               back
              </Button>
              <Button
                onClick={handleCreateSession}
                className="bg-[#034732] hover:bg-[#023325] flex items-center gap-2 text-white"
              >
              {isGenerating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    creating session...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                   Create Session
                  </>
                )}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            
          </div>
        )}

         {/* Step 3: Preview Questions */}
        {currentStep === 'preview'&& (
          <div className="bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl p-8">
           

           

            {/* Action Buttons */}
            <div className="flex gap-4 justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('createSession')}
                className="border-amber-700/30 text-black hover:bg-white/50"
              >
               back
              </Button>
              <Button
                onClick={handleStartInterview}
                className="bg-[#034732] hover:bg-[#023325] flex items-center gap-2 text-white"
              >
             Start Interview <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            
          </div>
        )}
      </div>
      {/* quote card */}
      {isGenerating ? (
      
        <div className="mt-4 flex flex-col items-center justify-center px-4">
  {/* Remove bg-[#053828] from here */}
  
  <div className={`
    group mx-auto h-[130px] min-w-[280px] max-w-2xl w-full
    rounded-xl border border-amber-500/15 bg-[#053828] backdrop-blur-md
    px-1 py-1 transition-all duration-500 ease-out
    hover:bg-[#0a4a3a] hover:border-amber-500/40
    ${shine ? 'shine' : ''}
  `}>       {/* Keyframe + transition styles */}
        <style>{`
          @keyframes shine-border {
            0%   { border-color: rgba(217,169,56,0.15); box-shadow: 0 0 0 0 rgba(217,169,56,0); }
            30%  { border-color: rgba(217,169,56,0.7);  box-shadow: 0 0 24px 4px rgba(217,169,56,0.25); }
            100% { border-color: rgba(217,169,56,0.15); box-shadow: 0 0 0 0 rgba(217,169,56,0); }
          }
          .shine { animation: shine-border 1.2s ease-out; }
          .quote-text {
            transition: opacity 0.35s ease, transform 0.35s ease;
          }
          .quote-text.hidden-quote {
            opacity: 0;
            transform: translateY(-10px);
          }
          .quote-text.shown-quote {
            opacity: 1;
            transform: translateY(0);
          }
        `}</style>

        {/* Quote card — same markup/classes as the tip card in page.tsx */}
        <div
          className={`
            group mx-auto h-[120px] min-w-[280px] max-w-2xl w-full
            rounded-xl border border-amber-500/15 bg-white/[0.04] backdrop-blur-md
            px-5 py-4 transition-all duration-500 ease-out
            hover:bg-white/[0.08] hover:border-amber-500/40 hover:shadow-[0_0_24px_rgba(217,169,56,0.12)]
            ${shine ? 'shine' : ''}
          `}
        >
          {/* Badge row */}
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-[10px] font-medium tracking-wide uppercase text-amber-400/80">
              {/* Lightbulb SVG inline — avoids importing lucide */}
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                <path d="M9 18h6"/><path d="M10 22h4"/>
              </svg>
              Worth Noting
            </span>
          
          </div>

          {/* Quote text */}
          <div
            ref={textRef}
            className={`quote-text flex flex-col items-center justify-center flex-1 overflow-hidden ${visible ? 'shown-quote' : 'hidden-quote'}`}
          >
            {current ? (
              <>
                <p className="text-center text-sm md:text-base font-serif text-white/80 leading-relaxed line-clamp-2">
                  &ldquo;{current.quote}&rdquo;
                </p>
                <p className="text-center text-[11px] text-amber-400/60 mt-1 tracking-wide">
                  — {current.author}
                </p>
              </>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
            )}
          </div>
        </div>
          </div>
          </div>
            ):(<></>)}
        
    </div>
  );
}
