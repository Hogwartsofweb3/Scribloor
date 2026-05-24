'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  User,
  Save,
  RefreshCw,
  Bell,
  BellOff,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Upload,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const WalletManager = dynamic(() => import('@/components/account/WalletManager'), {
  ssr: false,
  loading: () => (
    <div className="h-32 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse" />
  ),
});

interface UserProfile {
  id: string;
  displayName: string | null;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  email: string | null;
  walletAddress: string | null;
  role: string;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function AvatarUpload({
  currentUrl,
  onChange,
}: {
  currentUrl: string | null;
  onChange: (url: string) => void;
}) {
  const initials = '?';

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-16 h-16 shrink-0">
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUrl}
            alt="Avatar"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-zinc-700"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center text-2xl font-bold text-amber-100 border-2 border-zinc-700">
            {initials}
          </div>
        )}
        <label
          className="absolute -bottom-1.5 -right-1.5 p-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 cursor-pointer transition"
          title="Change avatar URL"
        >
          <Upload className="w-3 h-3" />
          <input type="file" className="sr-only" accept="image/*" disabled />
        </label>
      </div>
      <div className="flex-1">
        <label className="block text-xs text-zinc-500 mb-1.5">Avatar URL</label>
        <input
          type="url"
          value={currentUrl ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/avatar.png"
          className="w-full text-xs rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition"
        />
      </div>
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-zinc-800/60 last:border-0">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative w-10 h-5.5 h-[22px] rounded-full transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500/50',
          enabled ? 'bg-amber-500' : 'bg-zinc-700'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
            enabled ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Notification preferences (stored locally — extend with DB later)
  const [notifNewPosts, setNotifNewPosts] = useState(true);
  const [notifRenewals, setNotifRenewals] = useState(true);
  const [notifMarketing, setNotifMarketing] = useState(false);

  // Save state
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Delete account
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const activeTab = useRef<'profile' | 'wallets' | 'notifications'>('profile');
  const [tab, setTab] = useState<'profile' | 'wallets' | 'notifications'>('profile');

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/account/profile');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (!res.ok) return;
      const u = data.user as UserProfile;
      setProfile(u);
      setDisplayName(u.displayName ?? '');
      setUsername(u.username ?? '');
      setBio(u.bio ?? '');
      setAvatarUrl(u.avatarUrl ?? '');
      setLoading(false);
    })();
  }, [router]);

  const handleSaveProfile = async () => {
    setSaveState('saving');
    setSaveError(null);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName || null,
          username,
          bio: bio || null,
          avatarUrl: avatarUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 3000);
    } catch (err: unknown) {
      setSaveState('error');
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const handleDeleteAccount = async () => {
    if (!profile || deleteConfirm !== profile.email) return;
    setDeleting(true);
    // Placeholder: in production this would call DELETE /api/account and clear Privy session
    await new Promise((r) => setTimeout(r, 1500));
    setDeleting(false);
    router.push('/');
  };

  const tabs: { id: typeof tab; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'wallets', label: 'Wallets' },
    { id: 'notifications', label: 'Notifications' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="h-8 w-48 bg-zinc-900 rounded-xl animate-pulse" />
          <div className="h-96 bg-zinc-900 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-8">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-100">Account</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Manage your profile, wallets, and preferences.
            </p>
          </div>
          <a
            href="/account/subscriptions"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
          >
            My Subscriptions <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'text-xs font-semibold px-4 py-2 rounded-lg transition',
                tab === t.id
                  ? 'bg-zinc-700 text-zinc-100 shadow'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-6">
            <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" /> Profile Information
            </h2>

            <AvatarUpload currentUrl={avatarUrl || null} onChange={setAvatarUrl} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  maxLength={60}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="username"
                    maxLength={32}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 pl-7 pr-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">
                Bio{' '}
                <span className={cn('ml-1', bio.length > 180 ? 'text-amber-400' : 'text-zinc-600')}>
                  {bio.length}/200
                </span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="A short bio about yourself..."
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition resize-none"
              />
            </div>

            {/* Email (read-only from Privy) */}
            {profile?.email && (
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Email (via Privy)</label>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-zinc-600 mt-1">
                  Email is managed through your Privy login.
                </p>
              </div>
            )}

            {/* Save button */}
            {saveError && (
              <p className="text-xs text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {saveError}
              </p>
            )}
            <button
              onClick={handleSaveProfile}
              disabled={saveState === 'saving'}
              className={cn(
                'flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition',
                saveState === 'saved'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : saveState === 'error'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
              )}
            >
              {saveState === 'saving' && <RefreshCw className="w-4 h-4 animate-spin" />}
              {saveState === 'saved' && <CheckCircle2 className="w-4 h-4" />}
              {saveState === 'idle' && <Save className="w-4 h-4" />}
              {saveState === 'saving'
                ? 'Saving...'
                : saveState === 'saved'
                ? 'Saved!'
                : saveState === 'error'
                ? 'Failed — retry'
                : 'Save changes'}
            </button>

            {/* Danger Zone */}
            <div className="pt-4 border-t border-zinc-800">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-3">
                Danger Zone
              </h3>
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">Delete account</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Permanently delete your account and all associated data. This cannot be undone.
                  </p>
                </div>
                <button
                  onClick={() => setShowDelete(true)}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── WALLETS TAB ── */}
        {tab === 'wallets' && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <WalletManager />
          </div>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {tab === 'notifications' && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-2">
            <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-amber-500" /> Notification Preferences
            </h2>

            <NotificationToggle
              label="New post notifications"
              description="Get emailed when a publication you subscribe to publishes a new post."
              enabled={notifNewPosts}
              onChange={setNotifNewPosts}
            />
            <NotificationToggle
              label="Renewal reminders"
              description="Receive a reminder 3 days before your subscription term expires."
              enabled={notifRenewals}
              onChange={setNotifRenewals}
            />
            <NotificationToggle
              label="Platform updates & marketing"
              description="Hear about new features, creator spotlights, and platform news."
              enabled={notifMarketing}
              onChange={setNotifMarketing}
            />

            <div className="pt-4 border-t border-zinc-800">
              <p className="text-[10px] text-zinc-600 leading-relaxed">
                Email preferences are tied to your Privy-linked email address. Transactional emails
                (receipts, security alerts) cannot be disabled.
              </p>
            </div>
          </div>
        )}

        {/* Delete account dialog */}
        {showDelete && profile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl border border-rose-500/20 bg-zinc-950 p-6 shadow-2xl flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-100">Delete your account</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    This will permanently delete your account, subscriptions, and all data. This
                    action cannot be undone.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">
                  Type your email address to confirm:{' '}
                  <span className="text-zinc-300 font-mono">{profile.email}</span>
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder={profile.email ?? 'your@email.com'}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50 transition"
                />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== profile.email || deleting}
                  className="w-full h-10 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white font-bold text-sm transition flex items-center justify-center gap-2"
                >
                  {deleting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Permanently delete account
                </button>
                <button
                  onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}
                  className="w-full h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-semibold text-sm border border-zinc-800 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
