import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiLink, HiCursorArrowRays, HiClock, HiCalendar } from 'react-icons/hi2';
import { urlsApi } from '../api/urls';
import { formatDistanceToNow, formatDate, formatNumber } from '../utils/date';
import { Skeleton } from '../components/ui/Skeletons';

const PublicStats = () => {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    urlsApi.publicStats(shortCode)
      .then((res) => setData(res.data.data))
      .catch(() => setError('Link not found or stats unavailable.'))
      .finally(() => setLoading(false));
  }, [shortCode]);

  return (
    <div className="min-h-screen bg-surface-950 text-zinc-100">
      {/* Nav */}
      <nav className="border-b border-surface-800 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
            <HiLink className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold">SmartLink</span>
        </Link>
        <Link to="/register" className="btn-primary py-2 px-3.5 text-sm">Get started</Link>
      </nav>

      <div className="mx-auto max-w-xl px-6 py-16">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-800 mx-auto mb-4">
              <HiLink className="h-7 w-7 text-zinc-500" />
            </div>
            <h2 className="text-lg font-bold text-zinc-200 mb-2">Link not found</h2>
            <p className="text-sm text-zinc-500">{error}</p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Public statistics</p>
              <h1 className="text-2xl font-bold text-zinc-100 mb-1 font-mono">
                /{shortCode}
              </h1>
              <a
                href={data.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                {data.shortUrl}
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card text-center">
                <HiCursorArrowRays className="h-5 w-5 text-brand-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-zinc-100">{formatNumber(data.totalClicks)}</p>
                <p className="text-xs text-zinc-500 mt-1">Total clicks</p>
              </div>
              <div className="card text-center">
                <HiClock className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-zinc-100">
                  {data.lastVisitedAt ? formatDistanceToNow(data.lastVisitedAt) : 'Never'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">Last visited</p>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <HiCalendar className="h-4 w-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-300">Created</span>
              </div>
              <p className="text-sm text-zinc-400">{formatDate(data.createdAt)}</p>
            </div>

            {/* Recent visits */}
            {data.recentVisits?.length > 0 && (
              <div className="card overflow-hidden p-0">
                <div className="px-5 py-4 border-b border-surface-800">
                  <h3 className="text-sm font-semibold text-zinc-200">Recent activity</h3>
                </div>
                <div className="divide-y divide-surface-800">
                  {data.recentVisits.map((v, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3 text-xs">
                      <span className="text-zinc-400">{formatDistanceToNow(v.visitedAt)}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-500">{v.browser}</span>
                        <span className={`badge ${v.device === 'Mobile' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {v.device}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center">
              <p className="text-xs text-zinc-600 mb-3">Want analytics for your own links?</p>
              <Link to="/register" className="btn-primary gap-2">
                Create free account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicStats;
