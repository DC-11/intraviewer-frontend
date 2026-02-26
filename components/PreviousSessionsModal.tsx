/**
 * Previous Sessions Modal Component
 * 
 * Displays a modal showing previous interview sessions with:
 * - Session cards fetched by probing session IDs
 * - Click to view results for completed sessions
 * - Create new session button
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle, 
  Plus, 
  Calendar,
  Loader,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { InterviewService } from '@/lib/services/interview.service';
import { useAuthStore } from '@/lib/stores/authStore';

interface SessionCard {
  session_id: number;
  hasResults: boolean;
  qna_count: number;
  emotion_perception: string | null;
  created_at: string | null;
}

interface PreviousSessionsModalProps {
  sessions?: SessionCard[];
  isLoading?: boolean;
  onCreateNew: () => void;
  onClose?: () => void;
}

export default function PreviousSessionsModal({
  sessions: externalSessions,
  isLoading: externalLoading,
  onCreateNew,
  onClose
}: PreviousSessionsModalProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionCard[]>(externalSessions || []);
  const [isLoading, setIsLoading] = useState(externalLoading ?? true);

  // If no external sessions provided, fetch them ourselves
  useEffect(() => {
    if (externalSessions) {
      setSessions(externalSessions);
      setIsLoading(false);
      return;
    }

    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const accessToken = useAuthStore.getState().accessToken;
        const results = await InterviewService.fetchSessionsByProbing(accessToken || undefined, 10);
        setSessions(results);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [externalSessions]);

  // Sync external loading state
  useEffect(() => {
    if (externalLoading !== undefined) {
      setIsLoading(externalLoading);
    }
  }, [externalLoading]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown date';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/40 backdrop-blur-md rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-amber-700/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Your Interview Sessions</h2>
          <p className="text-amber-100">
            View results from a previous session or start a new interview
          </p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-amber-700" />
              <span className="ml-3 text-stone-700">Loading sessions...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-stone-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-black mb-2">
                No Previous Sessions
              </h3>
              <p className="text-stone-700 mb-6">
                Start your first interview practice session now
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.session_id}
                  onClick={() => router.push(`/interview/results/${session.session_id}`)}
                  className="border border-amber-700/20 rounded-xl p-5 hover:bg-white/70 transition-all bg-white/50 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100/80 rounded-lg flex items-center justify-center group-hover:bg-emerald-200/80 transition-colors">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-black">
                          Interview Session #{session.session_id}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-stone-600 mt-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(session.created_at)}
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-700 border-green-300">
                      completed
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-stone-600 mb-2">
                    <BarChart3 className="w-4 h-4 text-amber-700" />
                    <span>{session.qna_count} questions evaluated</span>
                  </div>

                  {session.emotion_perception && (
                    <p className="text-sm text-stone-500 line-clamp-2 mb-3">
                      {session.emotion_perception}
                    </p>
                  )}

                  <div className="flex items-center justify-end">
                    <Button
                      size="sm"
                      className="bg-amber-700 hover:bg-amber-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/interview/results/${session.session_id}`);
                      }}
                    >
                      View Results
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-amber-700/20 p-6 bg-white/50 backdrop-blur-sm">
          <div className="flex gap-3">
            <Button
              onClick={onCreateNew}
              className="flex-1 bg-amber-700 hover:bg-amber-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Interview
            </Button>
            {onClose && (
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 border-amber-700/30 text-black hover:bg-white/60"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
