"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PublicationSchema, PublicationInput } from '@/lib/validations/publication';
import { Button } from '@/components/ui/button';
import {
  Settings,
  DollarSign,
  Bell,
  Trash2,
  Check,
  AlertCircle,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PublicationCard } from '@/components/shared/PublicationCard';

type TabType = 'general' | 'monetization' | 'notifications' | 'danger';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [publication, setPublication] = useState<any>(null);

  // Danger zone verification
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Form Setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PublicationInput>({
    resolver: zodResolver(PublicationSchema),
    mode: 'onTouched',
  });

  const formValues = watch();

  // Load publication details on mount
  const fetchPublication = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/publications');
      const data = await response.json();

      if (response.ok && data.publication) {
        setPublication(data.publication);
        reset({
          name: data.publication.name,
          slug: data.publication.slug,
          description: data.publication.description || '',
          monthlyPriceUsdc: Number(data.publication.monthlyPriceUsdc) || 0,
          freeTierEnabled: data.publication.freeTierEnabled,
          payoutWallet: data.publication.payoutWallet,
          coverImageUrl: data.publication.coverImageUrl || '',
          accentColor: 'amber', // Preset fallback
        });
      } else if (response.ok && !data.publication) {
        // No publication created yet -> redirect to onboarding wizard
        router.push('/dashboard/new-publication');
      } else {
        setError(data.error || 'Failed to fetch publication settings');
      }
    } catch (err) {
      setError('Network error retrieving publication settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublication();
  }, []);

  // Update Settings
  const onSubmit = async (data: PublicationInput) => {
    if (!publication) return;
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch(`/api/publications/${publication.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to update publication settings');
      }

      setPublication(resData.publication);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while updating settings.');
    } finally {
      setSaving(false);
    }
  };

  // Danger Zone Soft Delete
  const handleDeletePublication = async () => {
    if (!publication || deleteConfirmText !== publication.name) return;
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/publications/${publication.slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete publication');
      }

      // Success -> redirect to wizard onboarding
      router.push('/dashboard/new-publication');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during soft-deletion.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-6 text-zinc-500">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-4" />
        <span className="text-sm font-mono uppercase tracking-widest">Loading Settings...</span>
      </div>
    );
  }

  const tabClass = (tab: TabType) =>
    cn(
      'flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition select-none text-left w-full',
      activeTab === tab
        ? 'text-amber-500 bg-amber-500/10 border-l-2 border-amber-500 font-bold'
        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Settings Header */}
      <div className="mb-8 border-b border-zinc-800 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100 mb-1">
          Publication Settings
        </h1>
        <p className="text-sm text-zinc-400">
          Manage your branding parameters, payout channels, and configurations.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-normal flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 text-sm leading-normal flex items-start gap-3">
          <Check className="w-5 h-5 shrink-0 mt-0.5" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="md:col-span-3 flex flex-col gap-1">
          <button type="button" onClick={() => setActiveTab('general')} className={tabClass('general')}>
            <Settings className="w-4 h-4" />
            General Branding
          </button>
          <button type="button" onClick={() => setActiveTab('monetization')} className={tabClass('monetization')}>
            <DollarSign className="w-4 h-4" />
            Monetization Settings
          </button>
          <button type="button" onClick={() => setActiveTab('notifications')} className={tabClass('notifications')}>
            <Bell className="w-4 h-4" />
            Email Toggles
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('danger')}
            className={cn(
              tabClass('danger'),
              activeTab === 'danger'
                ? 'text-red-400 bg-red-500/10 border-l-2 border-red-500'
                : 'text-red-500/60 hover:text-red-400 hover:bg-red-950/10'
            )}
          >
            <Trash2 className="w-4 h-4" />
            Danger Zone
          </button>
        </div>

        {/* Dynamic Settings Forms */}
        <div className="md:col-span-5 bg-zinc-900/10 border border-zinc-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="flex flex-col gap-5">
                <h2 className="text-xl font-bold text-zinc-100 border-b border-zinc-800 pb-2">General Info</h2>

                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-semibold text-zinc-300">
                    Publication Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full p-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 focus:outline-none focus:border-amber-500/60 text-sm transition"
                    {...register('name')}
                  />
                  {errors.name && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="slug" className="text-sm font-semibold text-zinc-300">
                    URL Slug
                  </label>
                  <input
                    id="slug"
                    type="text"
                    className="w-full p-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 focus:outline-none focus:border-amber-500/60 text-sm transition font-mono"
                    {...register('slug')}
                  />
                  {errors.slug && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.slug.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="description" className="text-sm font-semibold text-zinc-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className="w-full p-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 focus:outline-none focus:border-amber-500/60 text-sm transition resize-none leading-relaxed"
                    {...register('description')}
                  />
                  {errors.description && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.description.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="coverImageUrl" className="text-sm font-semibold text-zinc-300">
                    Cover Image URL
                  </label>
                  <input
                    id="coverImageUrl"
                    type="text"
                    className="w-full p-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 focus:outline-none focus:border-amber-500/60 text-sm transition"
                    {...register('coverImageUrl')}
                  />
                  {errors.coverImageUrl && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.coverImageUrl.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full mt-4 font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 disabled:opacity-45"
                >
                  {saving ? 'Saving...' : 'Save General Details'}
                </Button>
              </div>
            )}

            {/* MONETIZATION TAB */}
            {activeTab === 'monetization' && (
              <div className="flex flex-col gap-5">
                <h2 className="text-xl font-bold text-zinc-100 border-b border-zinc-800 pb-2">Monetization</h2>

                <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-xl bg-zinc-950/40">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-zinc-300">Enable Free Tier</span>
                    <span className="text-xs text-zinc-500">Allows non-subscribers to access public articles.</span>
                  </div>
                  <input
                    type="checkbox"
                    className="w-9 h-5 bg-zinc-800 rounded-full appearance-none checked:bg-amber-500 relative transition duration-300 cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-zinc-400 checked:before:bg-zinc-950 before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition"
                    {...register('freeTierEnabled')}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="monthlyPriceUsdc" className="text-sm font-semibold text-zinc-300">
                    Monthly Price (USDC)
                  </label>
                  <div className="relative">
                    <input
                      id="monthlyPriceUsdc"
                      type="number"
                      step="0.01"
                      className="w-full p-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 focus:outline-none focus:border-amber-500/60 text-sm transition"
                      {...register('monthlyPriceUsdc')}
                    />
                    <span className="absolute right-3 top-3.5 text-zinc-500 text-xs font-mono font-bold select-none">
                      USDC / month
                    </span>
                  </div>
                  {errors.monthlyPriceUsdc && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.monthlyPriceUsdc.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="payoutWallet" className="text-sm font-semibold text-zinc-300">
                    Solana Payout Wallet Address
                  </label>
                  <input
                    id="payoutWallet"
                    type="text"
                    className="w-full p-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 focus:outline-none focus:border-amber-500/60 font-mono text-xs transition"
                    {...register('payoutWallet')}
                  />
                  {errors.payoutWallet && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.payoutWallet.message}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full mt-4 font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 disabled:opacity-45"
                >
                  {saving ? 'Saving...' : 'Save Monetization Settings'}
                </Button>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="flex flex-col gap-5">
                <h2 className="text-xl font-bold text-zinc-100 border-b border-zinc-800 pb-2">Email Notifications</h2>

                <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-xl bg-zinc-950/40 select-none">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-zinc-300">USDC Payment Alerts</span>
                    <span className="text-xs text-zinc-500">Get notified instantly when new readers subscribe.</span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="w-9 h-5 bg-zinc-800 rounded-full appearance-none checked:bg-amber-500 relative transition duration-300 cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-zinc-400 checked:before:bg-zinc-950 before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-xl bg-zinc-950/40 select-none">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-zinc-300">Weekly Performance Digest</span>
                    <span className="text-xs text-zinc-500">Receive summary statistics regarding active subscribers.</span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="w-9 h-5 bg-zinc-800 rounded-full appearance-none checked:bg-amber-500 relative transition duration-300 cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-zinc-400 checked:before:bg-zinc-950 before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition"
                  />
                </div>

                <Button
                  type="button"
                  onClick={() => alert('Preferences saved!')}
                  className="w-full mt-4 font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                >
                  Save Notification Toggles
                </Button>
              </div>
            )}

            {/* DANGER ZONE TAB */}
            {activeTab === 'danger' && (
              <div className="flex flex-col gap-5">
                <h2 className="text-xl font-bold text-red-500 border-b border-red-950/30 pb-2">Danger Zone</h2>

                <div className="p-4 border border-red-500/20 bg-red-950/10 rounded-xl text-red-400 text-xs leading-normal">
                  <p className="font-bold uppercase tracking-wider mb-1">⚠️ Warning: Delete Publication</p>
                  Deleting your publication is a soft-delete. It immediately sets your publication status to offline, releases your custom URL slug namespace, and prevents further client subscriptions. This action cannot be easily undone.
                </div>

                <div className="flex flex-col gap-2.5">
                  <label htmlFor="confirmDelete" className="text-xs font-semibold text-zinc-400">
                    To confirm, type the name of your publication <span className="font-bold text-zinc-200">"{publication.name}"</span> below:
                  </label>
                  <input
                    id="confirmDelete"
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={publication.name}
                    className="w-full p-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 focus:outline-none focus:border-red-500/50 text-sm transition"
                  />
                </div>

                <Button
                  type="button"
                  disabled={deleting || deleteConfirmText !== publication.name}
                  onClick={handleDeletePublication}
                  className="w-full mt-4 font-bold bg-red-600 hover:bg-red-500 text-white disabled:opacity-40"
                >
                  {deleting ? 'Deleting Publication...' : 'Confirm Soft Delete Publication'}
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Right Preview Card Panel */}
        <div className="md:col-span-4 flex flex-col gap-4 select-none sticky top-8">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest">
            <span>Visual Card Feed View</span>
            <span className="flex items-center gap-1 text-[10px] text-zinc-600 font-normal normal-case">
              <Eye className="w-3 h-3" /> Live Sync
            </span>
          </div>
          <PublicationCard
            publication={{
              name: formValues.name || publication.name,
              slug: formValues.slug || publication.slug,
              description: formValues.description !== undefined ? formValues.description : publication.description,
              coverImageUrl: formValues.coverImageUrl !== undefined ? formValues.coverImageUrl : publication.coverImageUrl,
              monthlyPriceUsdc: formValues.monthlyPriceUsdc !== undefined ? formValues.monthlyPriceUsdc : publication.monthlyPriceUsdc,
              subscriberCount: publication.subscriberCount,
              accentColor: formValues.accentColor || 'amber',
            }}
            showSubscribeButton={true}
          />
        </div>
      </div>
    </div>
  );
}
