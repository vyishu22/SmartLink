import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { HiArrowLeft, HiCursorArrowRays, HiClock, HiGlobeAlt, HiDeviceTablet } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import { urlsApi } from '../api/urls';
import { Skeleton } from '../components/ui/Skeletons';
import { formatDistanceToNow, formatNumber } from '../utils/date';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 text-xs shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      <p className="font-semibold text-brand-400">{payload[0].value} clicks</p>
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-surface-700 bg-surface-900 px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-zinc-200">{payload[0].name}</p>
      <p className="text-brand-400">{payload[0].value} clicks</p>
    </div>
  );
};

const PieChartCard = ({ title, data, icon: Icon }) => (
  <div className="card">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-4 w-4 text-zinc-500" />
      <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
    </div>
    {!data || data.length === 0 ? (
      <p className="text-xs text-zinc-500 py-4 text-center">No data yet</p>
    ) : (
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-1.5 min-w-0">
          {data.slice(0, 5).map((item, i) => (
            <div key={item.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-zinc-400 truncate">{item.name}</span>
              </div>
              <span className="text-xs font-medium text-zinc-200 flex-shrink-0">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const Analytics = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [analyticsRes, dailyRes] = await Promise.all([
          urlsApi.analytics(id),
          urlsApi.dailyClicks(id, days),
        ]);
        setData(analyticsRes.data.data);
        setDaily(dailyRes.data.data.dailyClicks);
      } catch {
        toast.error('Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, days]);

  const shortUrl = data?.url?.shortUrl || '';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="rounded-lg p-2 text-zinc-500 hover:bg-surface-800 hover:text-zinc-300 transition-colors">
            <HiArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-zinc-100">Analytics</h1>
            {loading ? (
              <Skeleton className="h-3 w-48 mt-1" />
            ) : (
              <a href={shortUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm font-mono text-brand-400 hover:text-brand-300 transition-colors truncate block">
                {shortUrl}
              </a>
            )}
          </div>
        </div>

        {/* Stats Row */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="card"><Skeleton className="h-14" /></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total clicks', value: formatNumber(data?.totalClicks || 0), icon: HiCursorArrowRays, color: 'text-brand-400' },
              { label: 'Last click', value: data?.url?.lastVisitedAt ? formatDistanceToNow(data.url.lastVisitedAt) : 'Never', icon: HiClock, color: 'text-emerald-400' },
              { label: 'Top browser', value: data?.browsers?.[0]?.name || '—', icon: HiGlobeAlt, color: 'text-amber-400' },
              { label: 'Top device', value: data?.devices?.[0]?.name || '—', icon: HiDeviceTablet, color: 'text-purple-400' },
            ].map((s) => (
              <div key={s.label} className="card">
                <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
                <div className="flex items-center gap-2">
                  <s.icon className={`h-4 w-4 ${s.color} flex-shrink-0`} />
                  <p className="text-lg font-bold text-zinc-100 truncate">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Daily clicks chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-200">Daily clicks</h3>
            <div className="flex rounded-lg border border-surface-700 p-0.5 bg-surface-800">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${days === d ? 'bg-brand-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : daily.every((d) => d.clicks === 0) ? (
            <div className="h-48 flex items-center justify-center text-sm text-zinc-500">No click data in this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={daily} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => v.slice(5)} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#71717a' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2}
                  fill="url(#clickGrad)" dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Breakdowns */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => <div key={i} className="card"><Skeleton className="h-36" /></div>)}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <PieChartCard title="Browsers" data={data?.browsers} icon={HiGlobeAlt} />
            <PieChartCard title="Devices" data={data?.devices} icon={HiDeviceTablet} />
            <PieChartCard title="Operating systems" data={data?.operatingSystems} icon={HiGlobeAlt} />
          </div>
        )}

        {/* Recent visits */}
        <div className="card">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">Recent visits</h3>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : !data?.recentVisits?.length ? (
            <p className="text-sm text-zinc-500 py-4 text-center">No visits recorded yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-surface-800">
                    {['Time', 'Browser', 'Device', 'OS'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800">
                  {data.recentVisits.map((v, i) => (
                    <tr key={i} className="hover:bg-surface-800/50">
                      <td className="px-3 py-2.5 text-zinc-400">{formatDistanceToNow(v.visitedAt)}</td>
                      <td className="px-3 py-2.5 text-zinc-300">{v.browser}</td>
                      <td className="px-3 py-2.5">
                        <span className={`badge ${v.device === 'Mobile' ? 'bg-purple-500/20 text-purple-400' : v.device === 'Tablet' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {v.device}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-zinc-400">{v.operatingSystem}</td>
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

export default Analytics;
