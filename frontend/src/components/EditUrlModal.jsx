import { useState, useEffect } from 'react';
import { HiXMark } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { urlsApi } from '../api/urls';

const EditUrlModal = ({ url, onSave, onClose }) => {
  const [form, setForm] = useState({
    originalUrl: url.originalUrl || '',
    title: url.title || '',
    expiryDate: url.expiryDate ? new Date(url.expiryDate).toISOString().slice(0, 16) : '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { originalUrl: form.originalUrl };
      if (form.title !== undefined) payload.title = form.title;
      payload.expiryDate = form.expiryDate || null;

      await urlsApi.update(url._id, payload);
      toast.success('Link updated.');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md animate-slide-up rounded-xl border border-surface-700 bg-surface-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-surface-800 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-100">Edit link</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:bg-surface-800 hover:text-zinc-300">
            <HiXMark className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Short code
            </label>
            <div className="input bg-surface-800 text-zinc-500 cursor-not-allowed font-mono text-sm">
              /{url.shortCode}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Destination URL <span className="text-red-400">*</span>
            </label>
            <input
              name="originalUrl"
              type="url"
              value={form.originalUrl}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Title (optional)</label>
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Campaign link"
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
              className="input"
            />
            {form.expiryDate && (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, expiryDate: '' }))}
                className="mt-1 text-xs text-zinc-500 hover:text-red-400 transition-colors"
              >
                Remove expiry
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Saving…
                </span>
              ) : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUrlModal;
