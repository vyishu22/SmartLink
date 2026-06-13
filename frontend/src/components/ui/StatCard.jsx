const StatCard = ({ icon: Icon, label, value, sub, color = 'brand' }) => {
  const colorMap = {
    brand: 'text-brand-400 bg-brand-500/10',
    green: 'text-emerald-400 bg-emerald-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    red: 'text-red-400 bg-red-500/10',
  };

  return (
    <div className="card flex items-start gap-4 animate-fade-in">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-zinc-100">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>}
      </div>
    </div>
  );
};

export default StatCard;
