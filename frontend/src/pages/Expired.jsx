import { Link } from 'react-router-dom';
import { HiClock, HiArrowLeft } from 'react-icons/hi2';

const Expired = () => (
  <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
    <div className="text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 mx-auto mb-6">
        <HiClock className="h-8 w-8 text-amber-400" />
      </div>
      <p className="text-xs font-medium text-amber-500/70 uppercase tracking-widest mb-2">Link expired</p>
      <h1 className="text-2xl font-bold text-zinc-100 mb-3">This link has expired</h1>
      <p className="text-sm text-zinc-500 max-w-xs mx-auto mb-8">
        The short link you followed has passed its expiry date and is no longer active.
      </p>
      <Link to="/" className="btn-primary gap-2">
        <HiArrowLeft className="h-4 w-4" /> Back to home
      </Link>
    </div>
  </div>
);

export default Expired;
