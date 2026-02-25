/**
 * IntraViewer - Landing Page
 * 
 * Modern dark theme landing page inspired by Code Wiki
 * Features hero section, 3D cube, featured sections, and glassmorphism effects.
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Search,
  Brain,
  MessageSquare,
  Zap,
  BarChart3,
  Star,
  Sparkles,
  Grid3X3,
  RefreshCw,
  Code,
  Mic,
  Eye,
  Shield,
  FileText,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// IntraViewer feature cards
const featuredInterviews = [
  {
    name: 'AI Question Generation',
    icon: Brain,
    bg: '#034732',
    description: 'Upload your CV and job description. Our local LLM generates 10 personalised questions — 4 Technical, 3 Behavioural, 3 Situational — tailored specifically to your background.',
  },
  {
    name: 'Live Audio Transcription',
    icon: Mic,
    bg: '#034732',
    description: 'Every word you speak is transcribed in real time using Faster-Whisper ASR. Review your exact answers after each session to spot patterns and improve clarity.',
  },
  {
    name: 'Emotion & Composure Detection',
    icon: Eye,
    bg: '#034732',
    description: 'Computer vision analyses your video feed frame-by-frame during the session, detecting emotions and body language so you can build confidence under pressure.',
  },
  {
    name: 'Instant Session Results',
    icon: BarChart3,
    bg: '#034732',
    description: 'The moment your interview ends, full results appear — transcripts, AI scores, emotion analysis, and model answers — all on a single dashboard.',
  },
  {
    name: 'Private & Local AI',
    icon: Shield,
    bg: '#034732',
    description: 'Whisper, Phi-3 Mini, and SmolVLM2 all run locally on the server. Your CV, audio, and video never leave your environment or touch an external API.',
  },
  {
    name: 'Personalised Preparation',
    icon: FileText,
    bg: '#034732',
    description: 'No generic practice questions. Every session starts from your actual resume and the specific role you are targeting, making every question relevant from the first second.',
  },
];

// Fan carousel card data
const fanCards = [
  { src: '/login.png',       label: 'Personalised Questions',    alt: 'Login screen' },
  { src: '/login.png',       label: 'Secure Registration',    alt: 'Login screen' },
  { src: '/signup.png',      label: 'Private & Local AI',     alt: 'Sign up screen' },
  { src: '/interview-3.png', label: 'Analysis & Feedback',      alt: 'AI feedback' },
  { src: '/emotion.png', label: 'Emotion Analyis',    alt: 'Mock interview' },
  { src: '/speechtotext.png', label: 'speech To Text',    alt: 'Mock interview' },
  { src: '/interview-1.png', label: 'Voice Practice',   alt: 'Voice practice' },
  { src: '/interview-2.png', label: 'Mock Sessions',    alt: 'Mock interview' },
    { src: '/login.png',       label: 'Personalised Questions',    alt: 'Login screen' },
  { src: '/login.png',       label: 'Secure Registration',    alt: 'Login screen' },
  { src: '/signup.png',      label: 'Private & Local AI',     alt: 'Sign up screen' },
  { src: '/interview-3.png', label: 'Analysis & Feedback',      alt: 'AI feedback' },
  { src: '/emotion.png', label: 'Emotion Analyis',    alt: 'Mock interview' },
  { src: '/speechtotext.png', label: 'speech To Text',    alt: 'Mock interview' },
  { src: '/interview-1.png', label: 'Voice Practice',   alt: 'Voice practice' },
  { src: '/interview-2.png', label: 'Mock Sessions',    alt: 'Mock interview' },



];

// Orbit radius — larger = wider, gentler arc
const ORBIT_R = 1000;
// Pivot sits ORBIT_R + 20px below section top → only top arc is visible
const PIVOT_OFFSET = 40;

/**
 * Landing Page Component
 */
export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Refs for GSAP animations
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLDivElement>(null);
  const titleLeftRef = useRef<HTMLSpanElement>(null);
  const titleIconRef = useRef<HTMLSpanElement>(null);
  const titleRightRef = useRef<HTMLSpanElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroSearchRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const fanCarouselRef = useRef<HTMLDivElement>(null);
  const fanRingRef = useRef<HTMLDivElement>(null);
  const fanCardEls = useRef<HTMLDivElement[]>([]);
  const featuredSectionRef = useRef<HTMLElement>(null);
  const featuredCardsRef = useRef<HTMLDivElement>(null);
  const resumeSectionRef = useRef<HTMLElement>(null);
  const aceSectionRef = useRef<HTMLElement>(null);
  const talkSectionRef = useRef<HTMLElement>(null);
  const ctaSectionRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section entrance animation - split title
      const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      heroTimeline
        // Left title slides in from left
        .fromTo(
          titleLeftRef.current,
          { opacity: 0, x: -80 },
          { opacity: 1, x: 0, duration: 0.8 }
        )
        // Right title slides in from right
        .fromTo(
          titleRightRef.current,
          { opacity: 0, x: 80 },
          { opacity: 1, x: 0, duration: 0.8 },
          '-=0.7'
        )
        // Icon spins and scales in
        .fromTo(
          titleIconRef.current,
          { opacity: 0, scale: 0, rotation: -180 },
          { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.7)' },
          '-=0.4'
        )
        // Subtitle fades up
        .fromTo(
          heroSubtitleRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.3'
        )
        // Search bar scales in
        .fromTo(
          heroSearchRef.current,
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7 },
          '-=0.4'
        );
      
      // Continuous icon rotation animation
      gsap.to(titleIconRef.current, {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: 'none',
      });



      // Ferris-wheel orbit: fade cards in immediately, then spin forever
      if (fanCarouselRef.current && fanRingRef.current && fanCardEls.current.length) {
        const fanTl = gsap.timeline({ delay: 0.2 });

        // Stagger-fade the cards in immediately (no scroll trigger)
        fanTl.fromTo(
          fanCardEls.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.4,
            stagger: 0.06,
            ease: 'power2.out',
          }
        );

        // Spin the ring pivot continuously
        fanTl.to(
          fanRingRef.current,
          {
            rotation: 360,
            duration: 55,
            repeat: -1,
            ease: 'none',
            transformOrigin: '0 0',
          },
          '+=0.1'
        );
      }

      // Featured section header
      if (featuredSectionRef.current) {
        gsap.fromTo(
          featuredSectionRef.current.querySelector('h2'),
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: featuredSectionRef.current,
              start: 'top 70%',
              end: 'top top',
              toggleActions: 'play none none reset',
            },
          }
        );
      }

      // Featured cards — each card slides in from below as its track scrolls into view
      if (featuredCardsRef.current) {
        const tracks = featuredCardsRef.current.querySelectorAll<HTMLElement>('.card-track');
        tracks.forEach((track) => {
          const card = track.querySelector<HTMLElement>('.card-sticky');
          if (!card) return;
          gsap.fromTo(
            card,
            { y: 100, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: track,
                start: 'top 85%',
                end: 'top 30%',
                toggleActions: 'play none none reset',
              },
            }
          );
        });
      }

      // Resume section animation
      if (resumeSectionRef.current) {
        const resumeContent = resumeSectionRef.current.querySelectorAll('.grid > div');
        gsap.fromTo(
          resumeContent,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            scrollTrigger: {
              trigger: resumeSectionRef.current,
              start: 'top 75%',
              end: 'top top',
              toggleActions: 'play none none reset',
            },
          }
        );
      }

      // Ace section animation
      if (aceSectionRef.current) {
        const aceContent = aceSectionRef.current.querySelectorAll('.grid > div');
        gsap.fromTo(
          aceContent,
          { opacity: 0, x: (i) => (i === 0 ? -60 : 60) },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.2,
            scrollTrigger: {
              trigger: aceSectionRef.current,
              start: 'top 75%',
              end: 'top top',
              toggleActions: 'play none none reset',
            },
          }
        );
      }

      // Talk section animation
      if (talkSectionRef.current) {
        const talkContent = talkSectionRef.current.querySelectorAll('.grid > div');
        gsap.fromTo(
          talkContent,
          { opacity: 0, x: (i) => (i === 0 ? -60 : 60) },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.2,
            scrollTrigger: {
              trigger: talkSectionRef.current,
              start: 'top 75%',
              end: 'top top',
              toggleActions: 'play none none reset',
            },
          }
        );
      }
      

      // CTA section animation
      if (ctaSectionRef.current) {
        gsap.fromTo(
          ctaSectionRef.current.children,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            scrollTrigger: {
              trigger: ctaSectionRef.current,
              start: 'top 80%',
              end: 'top top',
              toggleActions: 'play none none reset',
            },
          }
        );
      }
    });

    return () => ctx.revert(); // Cleanup
  }, []);

  // Unique images used by the fan carousel (5 uniques, repeated 3×)
  const uniqueCarouselSrcs = ['/login.png', '/interview-2.png', '/interview-3.png', '/interview-1.png', '/signup.png'];

  return (
    <div  className=" px-2 py-5 rounded-4xl  min-h-screen bg-[#e1e1db] text-black overflow-hidden">

      {/* ── Carousel image preloader ─────────────────────────────────────────────
           Renders all 5 unique images off-screen with priority=true so Next.js
           injects <link rel="preload"> tags in <head> and sets loading="eager".
           By the time GSAP fades the carousel in they are already in the cache.
      ─────────────────────────────────────────────────────────────────────── */}
      <div aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {uniqueCarouselSrcs.map((src) => (
          <Image key={src} src={src} alt="" width={240} height={240} priority />
        ))}
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative bg-[#053828] min-h-[50vh] flex flex-col items-center justify-center px-0 pt-30 rounded-sm pb-7">

        {/* Background gradient 
        <div className="absolute inset-0 bg-gradient-to-b from-amber-100/30 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-[120px] pointer-events-none"></div>
        */}

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 text-white">
          {/* Split Title */}
          <div ref={heroTitleRef} className="flex flex-row items-center justify-center gap-3 md:gap-6 mb-8 flex-wrap">
            <span 
              ref={titleLeftRef}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif tracking-tight leading-none opacity-0"
            >
              IntraViewer
            </span>
            <span 
              ref={titleIconRef}
              className="text-3xl sm:text-4xl md:text-5xl text-amber-500 opacity-0 rotate-0 leading-none font-bold"
            >
              ✦
            </span>
            <span 
              ref={titleRightRef}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif tracking-tight leading-none opacity-0"
            >
              View To Self
            </span>
          </div>
          
       

          <p ref={heroSubtitleRef} className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed opacity-0">
            Platform packed with{' '}
            <span className="inline-block px-3 py-1 bg-black/5 rounded-md font-serif">AI-powered</span>
            {' '}&{' '}
            <span className="inline-block px-3 py-1 bg-black/5 rounded-md font-serif">personalized</span>
            {' '}practice,
            <br className="hidden md:block" />
            <span className="inline-block px-3 py-1 bg-black/5 rounded-md font-serif mt-2">feedback</span>
            ,{' '}
            <span className="inline-block px-3 py-1 bg-black/5 rounded-md font-serif mt-2">analytics</span>
            {' '}and interview{' '}
            <span className="inline-block px-3 py-1 bg-black/5 rounded-md font-serif mt-2">mastery</span>
          </p>

          {/* Search Bar */}
         
        </div>
         {/* Center Section - Dashboard Button */}
                    <div className="hidden md:flex flex-1 justify-center mx-8">
                        <Link href="/dashboard">
                            <Button
                                variant="ghost"
                                className="group relative   rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-50/60 via-yellow-50/20 to-amber-50/60 hover:from-amber-100/80 hover:via-yellow-100/80 hover:to-amber-100/80 shadow-[0_0_12px_rgba(217,169,56,0.15)] hover:shadow-[0_0_20px_rgba(217,169,56,0.3)] transition-all duration-300"
                            >
                                <span className="text-white font-serif mx-0 my-0 tracking-wide group-hover:text-green-800 transition-colors duration-300">TRY NOW </span>
                                <span className="ml-2 inline-flex items-center text-emerald-600 group-hover:translate-x-1.5 transition-transform duration-300">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14" />
                                        <path d="m12 5 7 7-7 7" />
                                    </svg>
                                </span>
                            </Button>
                        </Link>
                    </div> 



        {/* Scroll indicator 
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-black/10 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-black/40 rounded-full animate-pulse"></div>
          </div>
        </div>
         */}
      </section>
     

      {/* Ferris-Wheel Card Carousel
          Layout:
            - section clips overflow (overflow-hidden), fixed height
            - fanCarouselRef  = scroll-trigger anchor
            - fanRingRef      = 0×0 pivot div, placed at (50%, ORBIT_R+80px from top)
            - each card:  rotate(arcAngle) translateY(-ORBIT_R) translateX(-120px)
              → places card on circle; card tilts naturally with arc position
            - GSAP spins fanRingRef → all children orbit the pivot
      */}
      <section
        ref={fanCarouselRef}
        className="relative overflow-hidden bg-[#053828] "
        style={{ height: 640 }}
      >
        {/* Central text — sits inside the hollow of the arc, Osmo-style */}
        <div
          className="absolute inset-x-0 pointer-events-none z-10 flex flex-col items-center justify-end px-6"
          style={{ top: 0, bottom: 80 }}
        >
          <p className="text-center text-l md:text-xl font-serif text-white/80 max-w-2xl leading-snug">
            IntraViewer is a complete AI interview
            <br />
            platform. Get exclusive access to personalised
            <br />
            practice, feedback and mastery tools.
          </p>
        </div>

        {/* Ring pivot */}
        <div
          ref={fanRingRef}
          style={{
            position: 'absolute',
            left: '50%',
            top: ORBIT_R + PIVOT_OFFSET,
            width: 0,
            height: 0,
          }}
        >
          {fanCards.map((card, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                transformOrigin: '0 0',
                transform: `rotate(${(360 / fanCards.length) * i}deg) translateY(-${ORBIT_R}px) translateX(-120px)`,
              }}
            >
              <div
                ref={(el) => { if (el) fanCardEls.current[i] = el; }}
                className="cursor-pointer select-none"
                style={{ willChange: 'opacity' }}
              >
                <div
                  className="rounded-sm shadow-2xl overflow-hidden flex flex-col"
                  style={{ width: 240, height: 220, background: '#000' }}
                >
                  <div className="relative overflow-hidden" style={{ flex: 1 }}>
                    <Image
                      src={card.src}
                      alt={card.alt}
                      fill
                      className="object-cover"
                      sizes="240px"
                      loading="eager"
                    />
                  </div>
                  <div className="px-4 py-2.5 border-t border-white/10" style={{ background: '#1a1a1a' }}>
                    <p className="text-white text-sm font-medium">{card.label}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom fade — cards bleed cleanly into the next section 
        <div
          className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to bottom, transparent, #e1e1db)' }}
        />
        */}
      </section>

      {/* Featured Interview Types — sticky stacking cards */}
      <section ref={featuredSectionRef} className="relative ">
        {/* Sticky title pinned at top */}
        <div className="sticky top-0 z-20 pt-10 pb-5 text-center bg-gradient-to-b from-[#e1e1db] via-[#e1e1db]/95 to-transparent px-4">
          <h2 className="text-4xl md:text-5xl font-serif text-black inline-block mx-auto">Everything you get</h2>
        </div>

        {/* Stacking cards — each card-track creates scroll height; card-sticky pins + stacks */}
        <div ref={featuredCardsRef} className="relative scale-[0.9] ">
          {featuredInterviews.map((interview, idx) => {
            const tilts    = ['-5deg', '4.5deg', '-4deg', '5.5deg', '-4.5deg', '3.5deg'];
            const offsetXs = ['-5%',   '5%',    '-4%',   '6%',     '-4%',     '4%'   ];
            const tilt     = tilts[idx]    ?? (idx % 2 === 0 ? '-4deg' : '4deg');
            const offsetX  = offsetXs[idx] ?? (idx % 2 === 0 ? '-4%'  : '4%'  );
            return (
              /* card-track: takes up real scroll height so GSAP trigger fires for each card */
              <div key={idx} className="card-track" style={{ height: '28vh', minHeight: '150px' }}>
                <div
                  className="card-sticky"
                  style={{
                    position: 'sticky',
                    top: `${130 + idx * 16}px`,
                    zIndex: idx + 1,
                    maxWidth: '680px',
                    margin: '0 auto',
                    transform: `rotate(${tilt}) translateX(${offsetX})`,
                    opacity: 0, /* GSAP will reveal */
                  }}
                >
                  <Link
                    href="/auth/signup"
                    className="group flex items-center gap-8 rounded-3xl px-10 py-9 shadow-lg hover:shadow-xl transition-shadow duration-300"
                    style={{ backgroundColor: interview.bg }}
                  >
                    {/* Large icon on the left */}
                    <div className="shrink-0 flex items-center justify-center w-24 h-24 rounded-2xl bg-white/20">
                      <interview.icon className="w-12 h-12 text-white" strokeWidth={1.5} />
                    </div>
                    {/* Content on the right */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-semibold text-white mb-3">
                        {interview.name}
                      </h3>
                      <p className="text-white/80 text-sm leading-relaxed">
                        {interview.description}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
          {/* Extra scroll room so last card stays visible */}
        </div>
      </section>

      {/* Try with Your Profile Section */}
      <section ref={resumeSectionRef} className="py-20 px-30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-2">
                Try it with your own
                <br />
                resume
              </h2>
              <span className="inline-block px-4 py-1 bg-amber-100/70 rounded-full text-sm text-amber-700 mb-6">
                Available
              </span>
              
              <p className="text-black text-lg mb-8 leading-relaxed">
                Stop guessing. Start practicing. Upload your resume and get a fully personalized interview experience that adapts to your background. No more generic questions. Ever.
              </p>
              
              <button className="group flex items-center gap-4 bg-amber-700 text-white px-6 py-4 rounded-xl hover:bg-amber-800 transition font-medium">
                <Sparkles className="w-5 h-5 text-white" />
                Try it Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            </div>
            
            <div className="relative flex items-center justify-center">
              <Image
                src="/interview-2.png"
                alt="Resume Interview Practice"
                width={400}
                height={400}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Read Your Interview Section */}
      <section ref={aceSectionRef} className="py-20 px-30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ace your interview
                <br />
                on the first try
              </h2>
              
              <p className="text-black text-lg mb-10">
                Interview preparation that works for you, not the other way around.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="p-3 bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl w-fit mb-4">
                    <Grid3X3 className="w-6 h-6 text-amber-700" />
                  </div>
                  <h3 className="font-semibold text-black mb-2">Practice question by question</h3>
                  <p className="text-black text-sm">Focus on questions you need most. Pick a category and dive deeper.</p>
                </div>
                
                <div>
                  <div className="p-3 bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl w-fit mb-4">
                    <Zap className="w-6 h-6 text-amber-700" />
                  </div>
                  <h3 className="font-semibold text-black mb-2">AI-powered feedback</h3>
                  <p className="text-black text-sm">Get instant, actionable insights to improve your responses.</p>
                </div>
                
                <div>
                  <div className="p-3 bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl w-fit mb-4">
                    <RefreshCw className="w-6 h-6 text-amber-700" />
                  </div>
                  <h3 className="font-semibold text-black mb-2">Unlimited retries</h3>
                  <p className="text-black text-sm">Practice as many times as you need until you&apos;re confident.</p>
                </div>
                
                <div>
                  <div className="p-3 bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl w-fit mb-4">
                    <Code className="w-6 h-6 text-amber-700" />
                  </div>
                  <h3 className="font-semibold text-black mb-2">Role-specific questions</h3>
                  <p className="text-black text-sm">Questions tailored to your target role and experience level.</p>
                </div>
              </div>
            </div>
            
            <div className="relative flex items-center justify-center">
              {/* Document-style illustration */}
              <div className="relative">
                <div className="absolute inset-0 bg-amber-200/20 blur-[80px] rounded-full"></div>
                <div className="relative w-80 h-80 border border-amber-700/20 rounded-xl bg-white/40 backdrop-blur-sm p-6">
                  <div className="space-y-3">
                    <div className="h-3 bg-amber-700/30 rounded w-3/4"></div>
                    <div className="h-3 bg-amber-700/20 rounded w-full"></div>
                    <div className="h-3 bg-amber-700/20 rounded w-5/6"></div>
                    <div className="h-8 mt-6"></div>
                    <div className="h-3 bg-amber-700/25 rounded w-2/3"></div>
                    <div className="h-3 bg-amber-700/20 rounded w-full"></div>
                    <div className="h-3 bg-amber-700/20 rounded w-4/5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Talk to Your Practice Section */}
      <section ref={talkSectionRef} className="py-20 px-30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Talk through your answers
              </h2>
              
              <p className="text-black text-lg mb-10">
                Practice answering out loud, get real-time transcription, and receive detailed feedback on your communication. It&apos;s like having an interview coach on call, 24/7.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl">
                    <MessageSquare className="w-5 h-5 text-amber-700" />
                  </div>
                  <span className="text-black">Practice with voice recording</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl">
                    <Search className="w-5 h-5 text-amber-700" />
                  </div>
                  <span className="text-black">Get instant feedback analysis</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/40 backdrop-blur-sm border border-amber-700/20 rounded-xl">
                    <Zap className="w-5 h-5 text-amber-700" />
                  </div>
                  <span className="text-black">Low latency, high-quality</span>
                </div>
              </div>
            </div>
            
            <div className="relative flex items-center justify-center">
              <Image
                src="/interview-1.png"
                alt="Voice Interview Practice"
                width={400}
                height={400}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-30">
        <div ref={ctaSectionRef} className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to ace your next interview?
          </h2>
          <p className="text-xl text-black mb-12">
            Join thousands of job seekers who landed their dream jobs with IntraViewer.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-amber-700 text-white hover:bg-amber-800 text-lg px-8 py-6">
                Start Practicing Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-amber-700/30 text-black hover:bg-white/60 text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-amber-700/20 py-12 px-30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-amber-700 rounded"></div>
                <span className="text-lg font-semibold text-black">IntraViewer</span>
              </div>
              <p className="text-black text-sm">
                AI-powered interview preparation for the modern job seeker.
              </p>
            </div>
            
            <div>
              <h3 className="text-black font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-black text-sm">
                <li><Link href="/auth/signup" className="hover:text-amber-700 transition">Interview Practice</Link></li>
                <li><Link href="#" className="hover:text-amber-700 transition">AI Feedback</Link></li>
                <li><Link href="#" className="hover:text-amber-700 transition">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-black font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-black text-sm">
                <li><Link href="#" className="hover:text-amber-700 transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-amber-700 transition">Guides</Link></li>
                <li><Link href="#" className="hover:text-amber-700 transition">Help Center</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-black font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-black text-sm">
                <li><Link href="#" className="hover:text-amber-700 transition">About</Link></li>
                <li><Link href="#" className="hover:text-amber-700 transition">Careers</Link></li>
                <li><Link href="#" className="hover:text-amber-700 transition">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-amber-700/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-black text-sm">
              © 2026 IntraViewer. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="text-black hover:text-amber-700 transition text-sm">Privacy</Link>
              <Link href="#" className="text-black hover:text-amber-700 transition text-sm">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
