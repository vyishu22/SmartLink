import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { HiChartBar, HiCursorArrowRays, HiLink } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import { urlsApi } from '../api/urls';
import { Skeleton } from '../components/ui/Skeletons';
import { formatNumber, formatDistanceToNow } from '../utils/date';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 text-xs shadow-xl">
      <p className="text-zinc-400 truncate max-w-[140px] mb-1">{label}</p>
      <p className="font-semibold text-brand-400">{payload[0].value} clicks</p>
    </div>
  );
};

const AnalyticsOverview = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    urlsApi.list({ page: 1, limit: 20 })
      .then((res) => setUrls(res.data.data.urls))
      .catch(() => toast.error('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  const totalClicks = urls.reduce((s, u) => s + (u.totalClicks || 0), 0);
  const topLinks = [...urls].sort((a, b) => b.totalClicks - a.totalClicks).slice(0, 5);

  const chartData = topLinks.map((u) => ({
    name: u.customAlias || u.shortCode,
    clicks: u.totalClicks,
  }));

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Analytics</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Overview of all your links.</p>
        </div>

        {/* Summary stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="card"><Skeleton className="h-14" /></div>)
          ) : (
            <>
              <div className="card">
                <p className="text-xs text-zinc-500 mb-1">Total links</p>
                <p className="text-2xl font-bold text-zinc-100">{urls.length}</p>
              </div>
              <div className="card">
                <p className="text-xs text-zinc-500 mb-1">Total clicks</p>
                <p className="text-2xl font-bold text-zinc-100">{formatNumber(totalClicks)}</p>
              </div>
              <div className="card">
                <p className="text-xs text-zinc-500 mb-1">Avg clicks / link</p>
                <p className="text-2xl font-bold text-zinc-100">
                  {urls.length ? Math.round(totalClicks / urls.length) : 0}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Top links bar chart */}
        <div className="card">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">Top links by clicks</h3>
          {loading ? (
            <Skeleton className="h-48" />
          ) : topLinks.length === 0 ? (
            <p className="text-sm text-zinc-500 py-8 text-center">No links yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="clicks" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* All links table */}
        <div className="card overflow-hidden p-0">
          <div className="px-5 py-4 border-b border-surface-800">
            <h3 className="text-sm font-semibold text-zinc-200">All links</h3>
          </div>
          {loading ? (
            <div className="p-5"><Skeleton className="h-40" /></div>
          ) : urls.length === 0 ? (
            <div className="p-8 text-center text-sm text-zinc-500">
              No links yet. <Link to="/create" className="text-brand-400 hover:text-brand-300">Create one</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-surface-800 bg-surface-900/50">
                    {['Link', 'Clicks', 'Created', 'Last click', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800">
                  {urls.map((u) => (
                    <tr key={u._id} className="hover:bg-surface-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-mono text-brand-400">/{u.shortCode}</p>
                        {u.title && <p className="text-zinc-500 truncate max-w-[160px]">{u.title}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <HiCursorArrowRays className="h-3 w-3 text-zinc-500" />
                          <span className="font-semibold text-zinc-200">{formatNumber(u.totalClicks)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{formatDistanceToNow(u.createdAt)}</td>
                      <td className="px-4 py-3 text-zinc-400">
                        {u.lastVisitedAt ? formatDistanceToNow(u.lastVisitedAt) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/analytics/${u._id}`}
                          className="text-brand-400 hover:text-brand-300 transition-colors font-medium"
                        >
                          Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsOverview;
