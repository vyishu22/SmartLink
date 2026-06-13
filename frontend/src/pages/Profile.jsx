import { useState } from 'react';
import { HiUser, HiEnvelope, HiCalendar, HiShieldCheck } from 'react-icons/hi2';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/date';

const Profile = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Profile</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Your account details.</p>
        </div>

        {/* Avatar + name */}
        <div className="card flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">{user?.name}</h2>
            <p className="text-sm text-zinc-500">{user?.email}</p>
          </div>
        </div>

        {/* Details */}
        <div className="card space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200">Account information</h3>
          <div className="space-y-3">
            {[
              { icon: HiUser, label: 'Full name', value: user?.name },
              { icon: HiEnvelope, label: 'Email address', value: user?.email },
              { icon: HiCalendar, label: 'Member since', value: formatDate(user?.createdAt) },
              { icon: HiShieldCheck, label: 'Account status', value: 'Active' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-lg bg-surface-800 px-4 py-3">
                <item.icon className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-500">{item.label}</p>
                  <p className="text-sm font-medium text-zinc-200 truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security note */}
        <div className="rounded-lg border border-brand-800/40 bg-brand-950/20 p-4">
          <div className="flex items-start gap-3">
            <HiShieldCheck className="h-4 w-4 text-brand-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-brand-300 mb-0.5">Secure account</p>
              <p className="text-xs text-zinc-500">
                Your password is encrypted with bcrypt. We never store plain-text credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
