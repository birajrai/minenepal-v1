'use client';

import { useCallback, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faUser, faClock } from '@fortawesome/free-solid-svg-icons';

interface VoteRecord {
  username: string;
  timestamp: string;
}

interface VoteHistoryProps {
  serverSlug: string;
}

export interface VoteHistoryRef {
  refresh: () => void;
}

// Simple time-ago function
const timeAgo = (date: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};


const VoteHistorySkeleton = () => (
  <div className="space-y-3 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
        </div>
      </div>
    ))}
  </div>
);

const VoteHistory = forwardRef<VoteHistoryRef, VoteHistoryProps>(({ serverSlug }, ref) => {
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vote/history/${serverSlug}?limit=10`);
      if (!response.ok) {
        throw new Error('Failed to load vote history.');
      }
      const data = await response.json();
      setVotes(data.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [serverSlug]);

  useEffect(() => {
    // Only fetch on initial mount
    fetchHistory();
    
    // No auto-refresh interval
  }, [fetchHistory]);

  // Expose refresh method to parent components
  useImperativeHandle(ref, () => ({
    refresh: fetchHistory
  }));

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-dark-navy-secondary p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <FontAwesomeIcon icon={faHistory} className="mr-2 text-gray-500" />
        Recent Votes
      </h2>
      {loading ? (
        <VoteHistorySkeleton />
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : votes.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No recent votes recorded for this server.</p>
      ) : (
        <ul className="space-y-4">
          {votes.map((vote, index) => (
            <li key={index} className="flex items-center space-x-4">
              <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600">
                <img
                  src={`https://mc-heads.net/head/${vote.username}`}
                  alt={`${vote.username}'s avatar`}
                  className="w-full h-full object-cover"
                  width={40}
                  height={40}
                  onError={(e) => {
                    // Fallback to default Minecraft Steve head if username not found
                    e.currentTarget.src = 'https://mc-heads.net/head/steve';
                  }}
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 dark:text-gray-200">{vote.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <FontAwesomeIcon icon={faClock} className="mr-1.5" />
                  {timeAgo(vote.timestamp)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

VoteHistory.displayName = 'VoteHistory';

export default VoteHistory;
