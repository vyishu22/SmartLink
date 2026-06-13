import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiHome,
  HiLink,
  HiChartBar,
  HiUser,
  HiPlus,
  HiArrowRightOnRectangle,
  HiBars3,
  HiXMark,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: HiHome, label: 'Dashboard' },
  { to: '/create', icon: HiPlus, label: 'Create Link' },
  { to: '/analytics', icon: HiChartBar, label: 'Analytics' },
  { to: '/profile', icon: HiUser, label: 'Profile' },
];

const NavItem = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
        isActive
          ? 'bg-brand-600/20 text-brand-400'
          : 'text-zinc-400 hover:bg-surface-800 hover:text-zinc-200'
      }`
    }
  >
    <Icon className="h-4.5 w-4.5 flex-shrink-0" />
    <span>{label}</span>
  </NavLink>
);

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out.');
    navigate('/');
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : 'w-60'}`}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
          <HiLink className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold text-zinc-100">SmartLink</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            onClick={() => mobile && setMobileOpen(false)}
          />
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-surface-800 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 mb-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-200">{user?.name}</p>
            <p className="truncate text-xs text-zinc-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:bg-surface-800 hover:text-red-400"
        >
          <HiArrowRightOnRectangle className="h-4.5 w-4.5" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col flex-shrink-0 w-60 border-r border-surface-800 bg-surface-950">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 border-r border-surface-800 bg-surface-950 z-50 animate-slide-up">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-zinc-400 hover:bg-surface-800"
            >
              <HiXMark className="h-5 w-5" />
            </button>
            <Sidebar mobile />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex lg:hidden items-center gap-3 border-b border-surface-800 bg-surface-950 px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-surface-800"
          >
            <HiBars3 className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-600">
              <HiLink className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-zinc-100">SmartLink</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
