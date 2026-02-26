'use client';

import { RouteGuard } from '@/components/guards/RouteGuard';
import { useAuthStore } from '@/lib/stores/authStore';
import { 
  PlayCircle, 
  Clock,
  FileText,
  ChevronRight,
  Briefcase,
  Plus,
  CheckCircle,
  Loader,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { InterviewService } from '@/lib/services/interview.service';

interface SessionCard {
  session_id: number;
  hasResults: boolean;
  qna_count: number;
  emotion_perception: string | null;
  created_at: string | null;
}

export default function DashboardPage() {
  const { user, refreshAccessToken } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Get time-based greeting
  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, [currentTime]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Refresh access token every 12 minutes
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        await refreshAccessToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, 12 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, refreshAccessToken]);

  // TODO: Replace with actual API data
  const [sessions, setSessions] = useState<SessionCard[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  // Fetch sessions by probing IDs 1-10
  const fetchSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      const accessToken = useAuthStore.getState().accessToken;
      const results = await InterviewService.fetchSessionsByProbing(accessToken || undefined, 10);
      setSessions(results);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, fetchSessions]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown date';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const userName = user?.firstname || user?.email?.split('@')[0] || 'there';

  return (
    <RouteGuard requireAuth={true}>
      <div className="min-h-screen bg-[#e1e1db]">
        <div className="p-6 pt-24 max-w-6xl mx-auto">

          {/* Subtle background accent */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-32 right-16 w-80 h-80 bg-emerald-300/6 rounded-full blur-3xl"></div>
            <div className="absolute bottom-32 left-16 w-64 h-64 bg-amber-200/8 rounded-full blur-3xl"></div>
          </div>

          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            
            {/* Left Column - Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="mb-10">
                <h1 className="text-2xl font-semibold text-stone-900">
                  {greeting}, {userName}
                </h1>
                <p className="text-stone-600 mt-1">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              {/* Main Action */}
              <div className="mb-8">
                <Link href="/interview/prepare">
                  <div className="bg-[#034732] text-white p-6 rounded-xl hover:bg-amber-800 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                          <Plus className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-lg font-medium">New Practice Session</h2>
                          <p className="text-amber-200 text-sm">Start a mock interview</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-amber-200" />
                    </div>
                  </div>
                </Link>
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <Link href="/interview/results">
                  <div className="bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-amber-700/20 hover:bg-emerald-50/50 hover:border-emerald-400/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-amber-700 group-hover:text-emerald-600 transition-colors" />
                      <span className="text-stone-700 font-medium">Past Results</span>
                    </div>
                  </div>
                </Link>
                <Link href="/profile">
                  <div className="bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-amber-700/20 hover:bg-emerald-50/50 hover:border-emerald-400/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-amber-700 group-hover:text-emerald-600 transition-colors" />
                      <span className="text-stone-700 font-medium">Your Profile</span>
                    </div>
                  </div>
                </Link>
              </div>

            </div>

            {/* Right Column - Image */}
            <div className="hidden lg:block w-[350px] shrink-0 sticky top-28">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-amber-700/10">
                <Image
                  src="/interview-1.png"
                  alt="Interview illustration"
                  width={480}
                  height={520}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Recent Sessions - Full Width */}
          <div className="mt-1 h-20" >
            <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-2">
              Recent Sessions
            </h3>
            
            {sessionsLoading ? (
              <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-amber-700/20 p-8 flex items-center justify-center">
                <Loader className="w-6 h-6 animate-spin text-amber-700" />
                <span className="ml-3 text-stone-600">Loading sessions...</span>
              </div>
            ) : sessions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map((session) => (
                  <Link key={session.session_id} href={`/interview/results/${session.session_id}`}>
                    <div className="bg-white/40 backdrop-blur-sm p-5 rounded-xl border border-amber-700/20 hover:bg-white/70 hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-emerald-100/80 rounded-lg flex items-center justify-center group-hover:bg-emerald-200/80 transition-colors">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900">Session #{session.session_id}</p>
                          <p className="text-xs text-stone-500">{formatDate(session.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stone-600 mb-2">
                        <BarChart3 className="w-4 h-4 text-amber-700" />
                        <span>{session.qna_count} questions evaluated</span>
                      </div>
                      {session.emotion_perception && (
                        <p className="text-xs text-stone-500 line-clamp-2">
                          {session.emotion_perception}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-300">
                          completed
                        </span>
                        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-amber-700/20 p-8 text-center">
                <div className="w-12 h-10 bg-emerald-100/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlayCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-stone-600 mb-1">No sessions yet</p>
                <p className="text-sm text-stone-400 mb-4">
                  Complete your first practice interview to see it here
                </p>
                <Link href="/interview/prepare">
                  <Button variant="outline" size="sm" className="border-amber-700/30 text-[#034732] hover:bg-white/60">
                    Start your first session
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
