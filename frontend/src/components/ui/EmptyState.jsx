import { HiLink } from 'react-icons/hi2';

const EmptyState = ({ icon: Icon = HiLink, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-800 mb-4">
      <Icon className="h-7 w-7 text-zinc-500" />
    </div>
    <h3 className="text-base font-semibold text-zinc-300 mb-1">{title}</h3>
    <p className="text-sm text-zinc-500 max-w-xs mb-6">{description}</p>
    {action}
  </div>
);

export default EmptyState;
