import { useEffect } from 'react';
import { HiExclamationTriangle } from 'react-icons/hi2';

const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, danger = false }) => {
  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onCancel();
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md animate-slide-up rounded-xl border border-surface-700 bg-surface-900 p-6 shadow-2xl">
        <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full ${danger ? 'bg-red-500/20' : 'bg-brand-500/20'}`}>
          <HiExclamationTriangle className={`h-5 w-5 ${danger ? 'text-red-400' : 'text-brand-400'}`} />
        </div>
        <h3 className="mb-2 text-base font-semibold text-zinc-100">{title}</h3>
        <p className="mb-6 text-sm text-zinc-400">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={danger ? 'inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-500 transition-all active:scale-95' : 'btn-primary'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
