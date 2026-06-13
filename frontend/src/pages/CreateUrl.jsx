import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiLink, HiPlus, HiArrowUpTray, HiDocumentArrowUp } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import DashboardLayout from '../layouts/DashboardLayout';
import { urlsApi } from '../api/urls';

const CreateUrl = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    originalUrl: '',
    customAlias: '',
    title: '',
    expiryDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);

  // Bulk
  const [bulkMode, setBulkMode] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { originalUrl: form.originalUrl };
      if (form.customAlias) payload.customAlias = form.customAlias;
      if (form.title) payload.title = form.title;
      if (form.expiryDate) payload.expiryDate = form.expiryDate;

      const res = await urlsApi.create(payload);
      setCreated(res.data.data.url);
      toast.success('Short link created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create link.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulk = async () => {
    const lines = csvText.trim().split('\n').filter(Boolean).slice(1); // skip header
    if (!lines.length) return toast.error('No URLs found in CSV.');
    if (lines.length > 100) return toast.error('Maximum 100 URLs per bulk request.');

    const rows = lines.map((line) => {
      const [originalUrl, customAlias, title] = line.split(',').map((s) => s.trim());
      return { originalUrl, customAlias: customAlias || undefined, title: title || undefined };
    });

    setBulkLoading(true);
    try {
      const res = await urlsApi.bulk(rows);
      setBulkResults(res.data.data);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk processing failed.');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(ev.target.result);
    reader.readAsText(file);
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Create link</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Shorten a URL and start tracking clicks.</p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-lg border border-surface-700 p-1 bg-surface-900 w-fit">
          <button
            onClick={() => setBulkMode(false)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!bulkMode ? 'bg-brand-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Single
          </button>
          <button
            onClick={() => setBulkMode(true)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${bulkMode ? 'bg-brand-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Bulk CSV
          </button>
        </div>

        {!bulkMode ? (
          <>
            {created ? (
              <div className="card space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-400">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-sm font-medium">Link created successfully</span>
                </div>
                <div className="rounded-lg bg-surface-800 px-4 py-3">
                  <p className="text-xs text-zinc-500 mb-1">Short URL</p>
                  <p className="font-mono text-sm text-brand-400 break-all">{created.shortUrl}</p>
                </div>
                <div className="rounded-lg bg-surface-800 px-4 py-3">
                  <p className="text-xs text-zinc-500 mb-1">Original URL</p>
                  <p className="text-sm text-zinc-300 break-all">{created.originalUrl}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(created.shortUrl);
                      toast.success('Copied!');
                    }}
                    className="btn-secondary flex-1"
                  >
                    Copy link
                  </button>
                  <Link to={`/analytics/${created._id}`} className="btn-primary flex-1 text-center">
                    View analytics
                  </Link>
                </div>
                <button
                  onClick={() => { setCreated(null); setForm({ originalUrl: '', customAlias: '', title: '', expiryDate: '' }); }}
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors w-full text-center"
                >
                  Create another link
                </button>
              </div>
            ) : (
              <div className="card">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                      Destination URL <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <HiLink className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        name="originalUrl"
                        type="url"
                        value={form.originalUrl}
                        onChange={handleChange}
                        placeholder="https://your-long-url.com/page"
                        className="input pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Custom alias (optional)</label>
                    <div className="flex rounded-lg border border-surface-700 overflow-hidden focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
                      <span className="flex items-center bg-surface-800 px-3 text-xs text-zinc-500 border-r border-surface-700 flex-shrink-0">
                        sml.ink/
                      </span>
                      <input
                        name="customAlias"
                        type="text"
                        value={form.customAlias}
                        onChange={handleChange}
                        placeholder="my-link"
                        className="flex-1 bg-surface-900 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
                      />
                    </div>
                    <p className="mt-1 text-xs text-zinc-600">Letters, numbers, hyphens, underscores only.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Title (optional)</label>
                    <input
                      name="title"
                      type="text"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Product launch campaign"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Expiry date (optional)</label>
                    <input
                      name="expiryDate"
                      type="datetime-local"
                      value={form.expiryDate}
                      onChange={handleChange}
                      min={new Date().toISOString().slice(0, 16)}
                      className="input"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full gap-2" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Creating…
                      </span>
                    ) : (
                      <><HiPlus className="h-4 w-4" /> Create short link</>
                    )}
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="card space-y-4">
            <div>
              <p className="text-sm font-medium text-zinc-300 mb-1">Upload CSV file</p>
              <p className="text-xs text-zinc-500 mb-3">
                CSV format: <code className="bg-surface-800 px-1.5 py-0.5 rounded text-brand-400">originalUrl, customAlias, title</code>
                <br />First row should be a header row.
              </p>
              <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-surface-600 bg-surface-800/50 p-6 cursor-pointer hover:border-brand-600 transition-colors">
                <HiDocumentArrowUp className="h-5 w-5 text-zinc-500" />
                <span className="text-sm text-zinc-400">Click to upload CSV</span>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`originalUrl,customAlias,title\nhttps://example.com,my-link,My Link\nhttps://google.com,,Google`}
              rows={6}
              className="input font-mono text-xs resize-none"
            />

            <button onClick={handleBulk} className="btn-primary w-full gap-2" disabled={bulkLoading}>
              {bulkLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Processing…
                </span>
              ) : (
                <><HiArrowUpTray className="h-4 w-4" /> Process bulk URLs</>
              )}
            </button>

            {bulkResults && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex gap-3 text-xs">
                  <span className="badge bg-emerald-500/20 text-emerald-400">{bulkResults.summary.succeeded} created</span>
                  {bulkResults.summary.failed > 0 && (
                    <span className="badge bg-red-500/20 text-red-400">{bulkResults.summary.failed} failed</span>
                  )}
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {bulkResults.results.map((r, i) => (
                    <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${r.success ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                      <span className={`truncate mr-2 ${r.success ? 'text-emerald-400' : 'text-red-400'}`}>
                        {r.shortUrl || r.originalUrl}
                      </span>
                      <span className={r.success ? 'text-emerald-600' : 'text-red-500 flex-shrink-0'}>{r.error || '✓'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreateUrl;
