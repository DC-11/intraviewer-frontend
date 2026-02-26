'use client';

import { useEffect, useRef, useState } from 'react';

interface Quote {
  id: number;
  quote: string;
  author: string;
}

export default function CheckoutPage() {
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

  return (
    <div className=" mt-20 bg-[#053828] ">
      {/* Keyframe + transition styles */}
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
  );
}