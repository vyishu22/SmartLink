import { Link } from 'react-router-dom';
import { HiLink, HiArrowLeft } from 'react-icons/hi2';

const NotFound = () => (
  <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
    <div className="text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-800 mx-auto mb-6">
        <HiLink className="h-8 w-8 text-zinc-500" />
      </div>
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-2">404</p>
      <h1 className="text-2xl font-bold text-zinc-100 mb-3">Page not found</h1>
      <p className="text-sm text-zinc-500 max-w-xs mx-auto mb-8">
        The page you're looking for doesn't exist or the link has expired.
      </p>
      <Link to="/" className="btn-primary gap-2">
        <HiArrowLeft className="h-4 w-4" /> Back to home
      </Link>
    </div>
  </div>
);

export default NotFound;
