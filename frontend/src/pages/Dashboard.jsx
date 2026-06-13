import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { HiPlus, HiLink, HiCursorArrowRays, HiCalendar, HiFolderOpen, HiCubeTransparent, HiClipboardDocument, HiArrowTopRightOnSquare, HiPencil, HiTrash, HiQrCode, HiArrowDownTray } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EditUrlModal from '../components/EditUrlModal';
import { CardSkeleton } from '../components/ui/Skeletons';
import { urlsApi } from '../api/urls';
import { useAuth } from '../context/AuthContext';
import { formatNumber } from '../utils/date';

const Dashboard = () => {
  const { user } = useAuth();
  const [view, setView] = useState('single');
  const [singleUrls, setSingleUrls] = useState([]);
  const [bulkUrls, setBulkUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUrl, setEditingUrl] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [qrTargetId, setQrTargetId] = useState(null);
  const qrRefs = useRef({});

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [singleRes, bulkRes] = await Promise.all([
        urlsApi.list({ page: 1, limit: 10, source: 'single' }),
        urlsApi.list({ page: 1, limit: 10, source: 'bulk' }),
      ]);
      setSingleUrls(singleRes.data.data.urls || []);
      setBulkUrls(bulkRes.data.data.urls || []);
    } catch {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const singleTotalClicks = singleUrls.reduce((sum, item) => sum + (item.totalClicks || 0), 0);
  const bulkTotalClicks = bulkUrls.reduce((sum, item) => sum + (item.totalClicks || 0), 0);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Short URL copied.');
    } catch {
      toast.error('Copy failed.');
    }
  };

  const downloadQrCode = (item) => {
    try {
      const canvas = qrRefs.current[item._id]?.querySelector('canvas');
      if (!canvas) {
        toast.error('QR code preview is not ready yet.');
        return;
      }

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${(item.title || item.shortCode || 'smartlink').replace(/\s+/g, '-').toLowerCase()}.png`;
      link.click();
      toast.success('QR code downloaded.');
    } catch {
      toast.error('QR download failed.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await urlsApi.delete(deleteTarget._id);
      toast.success('Link deleted.');
      setDeleteTarget(null);
      fetchDashboardData();
    } catch {
      toast.error('Failed to delete link.');
    }
  };

  const handleEditSave = () => {
    setEditingUrl(null);
    fetchDashboardData();
  };

  const getFavicon = (url) => {
    try {
      return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
    } catch {
      return 'https://www.google.com/s2/favicons?domain=example.com&sz=64';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Welcome back, {user?.name?.split(' ')[0]}</p>
          </div>
          <Link to="/create" className="btn-primary gap-2">
            <HiPlus className="h-4 w-4" /> New link
          </Link>
        </div>

        <div className="rounded-2xl border border-surface-800 bg-surface-900/80 p-3 shadow-lg shadow-black/10">
          <div className="flex flex-wrap gap-2">
            {['single', 'bulk'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setView(type)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${view === type ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'bg-surface-800 text-zinc-300 hover:bg-surface-700'}`}
              >
                {type === 'single' ? <HiLink className="h-4 w-4" /> : <HiCubeTransparent className="h-4 w-4" />}
                {type === 'single' ? 'Single Link' : 'Bulk Link'}
              </button>
            ))}
          </div>
        </div>

        {view === 'single' ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {loading ? (
                <><CardSkeleton /><CardSkeleton /><CardSkeleton /></>
              ) : (
                <>
                  <StatCard icon={HiLink} label="Total Single Links" value={singleUrls.length} color="brand" />
                  <StatCard icon={HiCursorArrowRays} label="Total Clicks" value={formatNumber(singleTotalClicks)} color="green" />
                  <StatCard icon={HiCalendar} label="Latest Single Link" value={singleUrls[0] ? new Date(singleUrls[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'} color="amber" />
                </>
              )}
            </div>

            <div className="card p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-100">Latest Single Links</h2>
                  <p className="text-xs text-zinc-500">Recent single-link URLs created by you.</p>
                </div>
                <HiFolderOpen className="h-4 w-4 text-zinc-500" />
              </div>
              {loading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}</div>
              ) : singleUrls.length === 0 ? (
                <div className="rounded-xl border border-dashed border-surface-700 p-5 text-sm text-zinc-400">No single links yet.</div>
              ) : (
                <div className="space-y-3">
                  {singleUrls.map((item) => (
                    <article key={item._id} className="group rounded-2xl border border-surface-800 bg-surface-950/70 p-4 shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-1 hover:border-brand-500/60 hover:bg-surface-900">
                      <div className="flex items-start gap-3">
                        <img src={getFavicon(item.originalUrl)} alt="favicon" className="mt-1 h-9 w-9 rounded-lg border border-surface-700 bg-surface-800 object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-zinc-100">{item.title || 'Untitled Link'}</h3>
                          <p className="mt-1 text-xs text-zinc-500">Original URL</p>
                          <p className="truncate text-sm text-zinc-300">{item.originalUrl}</p>
                          <p className="mt-2 text-xs text-zinc-500">Short URL</p>
                          <a href={item.shortUrl} target="_blank" rel="noreferrer" className="text-sm text-brand-300 hover:text-brand-200">{item.shortUrl}</a>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                            <span>Created: {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span>Clicks: {formatNumber(item.totalClicks || 0)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setQrTargetId(qrTargetId === item._id ? null : item._id)} className="rounded-lg border border-surface-700 bg-surface-800 p-2 text-zinc-300 transition hover:border-brand-500 hover:text-white" aria-label="Toggle QR code"><HiQrCode className="h-4 w-4" /></button>
                          <button type="button" onClick={() => setEditingUrl(item)} className="rounded-lg border border-surface-700 bg-surface-800 p-2 text-zinc-300 transition hover:border-brand-500 hover:text-white" aria-label="Edit link"><HiPencil className="h-4 w-4" /></button>
                          <button type="button" onClick={() => setDeleteTarget(item)} className="rounded-lg border border-surface-700 bg-surface-800 p-2 text-zinc-300 transition hover:border-brand-500 hover:text-red-300" aria-label="Delete link"><HiTrash className="h-4 w-4" /></button>
                          <button type="button" onClick={() => copyToClipboard(item.shortUrl)} className="rounded-lg border border-surface-700 bg-surface-800 p-2 text-zinc-300 transition hover:border-brand-500 hover:text-white" aria-label="Copy short URL"><HiClipboardDocument className="h-4 w-4" /></button>
                          <a href={item.shortUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-surface-700 bg-surface-800 p-2 text-zinc-300 transition hover:border-brand-500 hover:text-white" aria-label="Open short URL"><HiArrowTopRightOnSquare className="h-4 w-4" /></a>
                        </div>
                      </div>
                      {qrTargetId === item._id && (
                        <div className="mt-4 rounded-xl border border-surface-800 bg-surface-900/80 p-3">
                          <div className="flex items-start gap-4">
                            <div ref={(el) => (qrRefs.current[item._id] = el)} className="rounded-xl bg-white p-2 shadow-inner">
                              <QRCodeCanvas value={item.shortUrl} size={128} level="H" includeMargin />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-zinc-100">QR code</p>
                              <p className="text-xs text-zinc-500">Scan this link on the go.</p>
                              <button
                                type="button"
                                onClick={() => downloadQrCode(item)}
                                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-brand-500/40 bg-brand-500/10 px-3 py-2 text-xs font-semibold text-brand-100 hover:bg-brand-500/20"
                              >
                                <HiArrowDownTray className="h-4 w-4" /> Download QR Code
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {loading ? (
                <><CardSkeleton /><CardSkeleton /><CardSkeleton /></>
              ) : (
                <>
                  <StatCard icon={HiCubeTransparent} label="Total Bulk Links" value={bulkUrls.length} color="brand" />
                  <StatCard icon={HiCursorArrowRays} label="Total Clicks" value={formatNumber(bulkTotalClicks)} color="green" />
                  <StatCard icon={HiCalendar} label="Latest Bulk Link" value={bulkUrls[0] ? new Date(bulkUrls[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'} color="amber" />
                </>
              )}
            </div>

            <div className="card p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-100">Latest Bulk Links</h2>
                  <p className="text-xs text-zinc-500">Recent bulk-created URL entries.</p>
                </div>
                <HiFolderOpen className="h-4 w-4 text-zinc-500" />
              </div>
              {loading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}</div>
              ) : bulkUrls.length === 0 ? (
                <div className="rounded-xl border border-dashed border-surface-700 p-5 text-sm text-zinc-400">No bulk links yet.</div>
              ) : (
                <div className="space-y-3">
                  {bulkUrls.map((item) => {
                    const bulkCount = item.bulkItemsCount || 1;
                    const bulkLabel = `${bulkCount} URL${bulkCount === 1 ? '' : 's'}`;

                    return (
                      <article
                        key={item._id}
                        className="group rounded-2xl border border-surface-800 bg-surface-950/70 p-4 shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-1 hover:border-brand-500/60 hover:bg-surface-900"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={getFavicon(item.originalUrl)}
                            alt="favicon"
                            className="mt-1 h-9 w-9 rounded-lg border border-surface-700 bg-surface-800 object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <HiCubeTransparent className="h-4 w-4 text-brand-300" />
                              <h3 className="text-base font-semibold text-zinc-100">{item.title || 'Bulk Link'}</h3>
                              <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-2 py-0.5 text-[11px] font-medium text-brand-200">{bulkLabel}</span>
                            </div>
                            <p className="mt-1 text-xs text-zinc-500">Original URL</p>
                            <p className="truncate text-sm text-zinc-300">{item.originalUrl}</p>
                            <p className="mt-2 text-xs text-zinc-500">Short URL</p>
                            <a href={item.shortUrl} target="_blank" rel="noreferrer" className="text-sm text-brand-300 hover:text-brand-200">{item.shortUrl}</a>
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                              <span>Created: {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              <span>Clicks: {formatNumber(item.totalClicks || 0)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setQrTargetId(qrTargetId === item._id ? null : item._id)} className="rounded-lg border border-surface-700 bg-surface-800 p-2 text-zinc-300 transition hover:border-brand-500 hover:text-white" aria-label="Toggle QR code"><HiQrCode className="h-4 w-4" /></button>
                            <button type="button" onClick={() => setEditingUrl(item)} className="rounded-lg border border-surface-700 bg-surface-800 p-2 text-zinc-300 transition hover:border-brand-500 hover:text-white" aria-label="Edit link"><HiPencil className="h-4 w-4" /></button>
                            <button type="button" onClick={() => setDeleteTarget(item)} className="rounded-lg border border-surface-700 bg-surface-800 p-2 text-zinc-300 transition hover:border-brand-500 hover:text-red-300" aria-label="Delete link"><HiTrash className="h-4 w-4" /></button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(item.shortUrl)}
                              className="rounded-lg border border-surface-700 bg-surface-800 p-2 text-zinc-300 transition hover:border-brand-500 hover:text-white"
                              aria-label="Copy short URL"
                            >
                              <HiClipboardDocument className="h-4 w-4" />
                            </button>
                            <a
                              href={item.shortUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border border-surface-700 bg-surface-800 p-2 text-zinc-300 transition hover:border-brand-500 hover:text-white"
                              aria-label="Open short URL"
                            >
                              <HiArrowTopRightOnSquare className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                        {qrTargetId === item._id && (
                          <div className="mt-4 rounded-xl border border-surface-800 bg-surface-900/80 p-3">
                            <div className="flex items-start gap-4">
                              <div className="rounded-xl bg-white p-2 shadow-inner">
                                <QRCodeCanvas value={item.shortUrl} size={128} level="H" includeMargin />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-zinc-100">QR code</p>
                                <p className="text-xs text-zinc-500">Scan this link on the go.</p>
                                <button
                                  type="button"
                                  onClick={() => downloadQrCode(item)}
                                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-brand-500/40 bg-brand-500/10 px-3 py-2 text-xs font-semibold text-brand-100 hover:bg-brand-500/20"
                                >
                                  <HiArrowDownTray className="h-4 w-4" /> Download QR Code
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {editingUrl && (
        <EditUrlModal
          url={editingUrl}
          onSave={handleEditSave}
          onClose={() => setEditingUrl(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this link?"
        message="This action will remove the short URL and its click history."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
