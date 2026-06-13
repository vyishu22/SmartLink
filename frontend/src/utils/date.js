export const formatDistanceToNow = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;

  if (diff < 0) {
    const future = -diff;
    if (future < 60000) return 'in a few seconds';
    if (future < 3600000) return `in ${Math.floor(future / 60000)}m`;
    if (future < 86400000) return `in ${Math.floor(future / 3600000)}h`;
    return `in ${Math.floor(future / 86400000)}d`;
  }

  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

export const formatNumber = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};
