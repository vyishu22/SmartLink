import { useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import {
  HiClipboard,
  HiClipboardDocumentCheck,
  HiTrash,
  HiPencil,
  HiChartBar,
  HiClock,
  HiCursorArrowRays,
  HiQrCode,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from '../utils/date';

const UrlCard = ({ url, onDelete, onEdit }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const shortUrl = url.shortUrl || `${import.meta.env.VITE_BASE_URL || ''}/${url.shortCode}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy.');
    }
  };

  const isExpired = url.expiryDate && new Date(url.expiryDate) < new Date();

  const downloadQrCode = () => {
    try {
      const canvas = document.querySelector(`#qr-${url._id} canvas`);
      if (!canvas) throw new Error('QR canvas missing');
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${(url.title || url.shortCode || 'smartlink').replace(/\s+/g, '-').toLowerCase()}.png`;
      link.click();
      toast.success('QR code downloaded.');
    } catch {
      toast.error('QR download failed.');
    }
  };

  return (
    <div className="card group transition-all hover:border-surface-700 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {url.title && (
            <p className="text-xs font-medium text-zinc-400 mb-1 truncate">{url.title}</p>
          )}
          <div className="flex items-center gap-2 mb-1">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors truncate"
            >
              {shortUrl.replace(/^https?:\/\//, '')}
            </a>
            <button onClick={copy} className="flex-shrink-0 rounded p-0.5 text-zinc-500 hover:text-zinc-300 transition-colors">
              {copied ? <HiClipboardDocumentCheck className="h-3.5 w-3.5 text-emerald-400" /> : <HiClipboard className="h-3.5 w-3.5" />}
            </button>
          </div>
          <p className="text-xs text-zinc-500 truncate">
            → {url.originalUrl.length > 60 ? url.originalUrl.slice(0, 60) + '…' : url.originalUrl}
          </p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="flex flex-col items-center px-3 py-1.5 rounded-lg bg-surface-800 min-w-[52px]">
            <span className="text-lg font-bold text-zinc-100 leading-none">{url.totalClicks}</span>
            <span className="text-[10px] text-zinc-500 mt-0.5">clicks</span>
          </div>
        </div>
      </div>

      {/* QR Code */}
      {showQR && (
        <div className="mt-3 flex items-center gap-4 p-3 rounded-lg bg-surface-800 animate-fade-in">
          <div id={`qr-${url._id}`} className="p-2 bg-white rounded-lg">
            <QRCodeCanvas value={shortUrl} size={128} level="H" includeMargin />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-300 mb-1">QR Code</p>
            <p className="text-xs text-zinc-500">Scan to open link</p>
            <button
              onClick={downloadQrCode}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-brand-500/30 bg-brand-500/10 px-3 py-2 text-[11px] font-semibold text-brand-100 hover:bg-brand-500/20"
            >
              Download QR Code
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <HiClock className="h-3 w-3" />
            {formatDistanceToNow(url.createdAt)}
          </span>
          {url.expiryDate && (
            <span className={`badge ${isExpired ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {isExpired ? 'Expired' : `Expires ${formatDistanceToNow(url.expiryDate)}`}
            </span>
          )}
          {url.customAlias && (
            <span className="badge bg-brand-500/20 text-brand-400">Custom</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowQR((v) => !v)}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-surface-800 hover:text-zinc-300 transition-colors"
            title="Show QR code"
          >
            <HiQrCode className="h-4 w-4" />
          </button>
          <Link
            to={`/analytics/${url._id}`}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-surface-800 hover:text-zinc-300 transition-colors"
            title="View analytics"
          >
            <HiChartBar className="h-4 w-4" />
          </Link>
          <button
            onClick={() => onEdit(url)}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-surface-800 hover:text-zinc-300 transition-colors"
            title="Edit"
          >
            <HiPencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(url)}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-surface-800 hover:text-red-400 transition-colors"
            title="Delete"
          >
            <HiTrash className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UrlCard;
