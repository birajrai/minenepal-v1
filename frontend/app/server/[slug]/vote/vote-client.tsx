'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '@/lib/user-context';
import LoginModal from '@/components/login-modal';
import { ServerDetailSkeleton } from '@/components/server-detail-skeleton';
import VoteHistory, { VoteHistoryRef } from '@/components/vote-history';
import { submitVote } from '@/lib/vote';
import { Server } from '@/types';
import { Turnstile } from '@marsidev/react-turnstile';

interface ServerVoteClientProps {
  slug: string;
}

type CooldownState = number | null;

const formatDuration = (ms: number) => {
  if (!ms || ms <= 0) return 'now';
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (!hours && !minutes) parts.push(`${seconds}s`);
  return parts.join(' ');
};

export default function ServerVoteClient({ slug }: ServerVoteClientProps) {
  const { user, login } = useUser();
  const voteHistoryRef = useRef<VoteHistoryRef>(null);
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<CooldownState>(null);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldownLoading, setCooldownLoading] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const turnstileRef = useRef<any>(null);

  useEffect(() => {
    const fetchServer = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(`/api/server/${slug}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setServer({
          ...data.data,
          online: data.data.online,
          players: data.data.players || undefined,
        });
      } catch (err: any) {
        if (err.name === 'AbortError') {
          setError('Request timeout - server took too long to respond');
        } else {
          setError(err.message || 'Failed to load server');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchServer();
  }, [slug]);

  const fetchCooldown = useCallback(async () => {
    if (!user) {
      setCooldown(null);
      setCooldownActive(false);
      setCooldownRemaining(0);
      return;
    }
    try {
      setCooldownLoading(true);
      const params = new URLSearchParams({
        username: user.username,
        server: slug,
        _t: Date.now().toString() // Cache buster
      });
      const response = await fetch(`/api/vote/cooldown?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch cooldown');
      }
      const data = await response.json();
      setCooldown(data.serverCooldownMs || 12 * 60 * 60 * 1000);
      if (data.cooldownMs && data.cooldownMs > 0) {
        setCooldownActive(true);
        setCooldownRemaining(data.cooldownMs);
      } else {
        setCooldownActive(false);
        setCooldownRemaining(0);
      }
    } catch (err) {
      console.error('Error fetching cooldown:', err);
    } finally {
      setCooldownLoading(false);
    }
  }, [user, slug]);
  // Countdown timer for cooldown
  useEffect(() => {
    if (!cooldownActive || cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1000) {
          setCooldownActive(false);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownActive, cooldownRemaining]);

  useEffect(() => {
    fetchCooldown();
  }, [fetchCooldown]);

  const handleVote = async () => {
    setStatus(null);
    if (!user) {
      setLoginModalOpen(true);
      return;
    }

    if (!turnstileToken) {
      setStatus({ type: 'error', message: 'Please complete the security check.' });
      return;
    }

    try {
      setSubmitting(true);
      await submitVote({
        username: user.username,
        server: slug,
        token: turnstileToken,
      });
      setStatus({ type: 'success', message: 'Thanks! Your vote was recorded.' });
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      await fetchCooldown();
      // Refresh vote history to show the new vote
      voteHistoryRef.current?.refresh();
    } catch (err: any) {
      // Backend will return specific error messages including cooldown info
      setStatus({ type: 'error', message: err?.message || 'Unable to submit vote right now.' });
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      await fetchCooldown();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ServerDetailSkeleton />;
  }

  if (error || !server) {
    return (
      <div className="min-h-screen bg-white dark:bg-dark-navy px-4 py-12 max-w-4xl mx-auto">
        <div className="bg-gray-50 dark:bg-dark-navy-secondary rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Server Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The server you're trying to vote for isn't available.</p>
          <Link
            href="/servers"
            className="px-6 py-2.5 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 hover:bg-blue-700 dark:hover:bg-blue-800"
          >
            Back to Servers
          </Link>
        </div>
      </div>
    );
  }

  const serverStatus = server.online ? 'Online' : 'Offline';
  const cooldownLabel = !user
    ? 'Login required'
    : cooldownActive && cooldownRemaining > 0
      ? formatDuration(cooldownRemaining)
      : 'Ready';

  return (
    <div className="min-h-screen bg-white dark:bg-dark-navy px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Link href={`/server/${slug}`} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          ← Back to {server.name}
        </Link>

        <div className="mt-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vote for {server.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Voting keeps the community thriving. Complete the security check to record your vote.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-dark-navy-secondary p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Server Status</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{serverStatus}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{server.display_address || `${server.ip}${server.port ? `:${server.port}` : ''}`}</p>
              </div>
              <div>
                {user ? (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Logged in as <span className="font-semibold">{user.username}</span>
                  </p>
                ) : (
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition"
                  >
                    Login to vote
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="rounded-lg bg-white dark:bg-dark-navy border border-gray-200 dark:border-slate-700 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Vote cooldown</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{cooldownLabel}</p>
              </div>
            </div>
            {cooldownLoading && <p className="text-xs text-gray-500 mt-2">Refreshing cooldown…</p>}
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-dark-navy-secondary p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security Check</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Please verify you are human.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-center py-4">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                  onSuccess={setTurnstileToken}
                  onError={() => setStatus({ type: 'error', message: 'Security check failed. Please try again.' })}
                  onExpire={() => setTurnstileToken(null)}
                />
              </div>
            </div>

            <button
              onClick={handleVote}
              disabled={submitting || cooldownActive || !turnstileToken}
              className="mt-6 w-full rounded-lg bg-blue-600 text-white font-semibold py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting
                ? 'Submitting vote…'
                : cooldownActive && cooldownRemaining > 0
                  ? `Vote available in ${formatDuration(cooldownRemaining)}`
                  : `Vote for ${server.name}`}
            </button>
            {status && (
              <p
                className={`mt-3 text-sm font-semibold ${status.type === 'success' ? 'text-green-600' : 'text-red-500'}`}
              >
                {status.message}
              </p>
            )}
          </div>

          <VoteHistory ref={voteHistoryRef} serverSlug={slug} />
        </div>
      </div>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={(username: string) => {
          login(username);
          setLoginModalOpen(false);
        }}
      />
    </div>
  );
}
