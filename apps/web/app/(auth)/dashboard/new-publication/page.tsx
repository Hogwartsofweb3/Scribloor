"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PublicationSchema, PublicationInput } from '@/lib/validations/publication';
import { PublicationCard } from '@/components/shared/PublicationCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper to convert text into URL-friendly slug
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .replace(/[\s_]+/g, '-')     // replace spaces/underscores with hyphens
    .replace(/-+/g, '-')         // collapse duplicate hyphens
    .replace(/^-+|-+$/g, '');    // trim leading/trailing hyphens
};

export default function NewPublicationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugStatus, setSlugStatus] = useState<{
    checked: boolean;
    available: boolean;
    error?: string;
    suggestion?: string;
  }>({ checked: false, available: false });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form Setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<PublicationInput>({
    resolver: zodResolver(PublicationSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      monthlyPriceUsdc: 0,
      freeTierEnabled: true,
      payoutWallet: '',
      coverImageUrl: '',
      accentColor: 'amber',
    },
  });

  const formValues = watch();

  // Step 3 layout presets
  const coverPresets = [
    { name: 'Gold Sparkle', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop' },
    { name: 'Dark Obsidian', url: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=800&auto=format&fit=crop' },
    { name: 'Sunset Gradient', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop' },
    { name: 'Neon Cyber', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=800&auto=format&fit=crop' },
  ];

  // Auto-slugify publication name
  useEffect(() => {
    if (step === 1 && formValues.name && !slugStatus.checked) {
      const generated = slugify(formValues.name);
      setValue('slug', generated, { shouldValidate: true });
    }
  }, [formValues.name, setValue, step, slugStatus.checked]);

  // Handle live slug validation
  const checkSlugAvailability = async () => {
    const slugToCheck = formValues.slug;
    if (!slugToCheck || slugToCheck.length < 3) return;

    setSlugChecking(true);
    try {
      const response = await fetch(`/api/publications/check-slug?slug=${encodeURIComponent(slugToCheck)}`);
      const data = await response.json();

      if (response.ok) {
        setSlugStatus({
          checked: true,
          available: data.available,
          suggestion: data.suggestion,
        });
      } else {
        setSlugStatus({
          checked: true,
          available: false,
          error: data.error || 'Failed to verify availability',
        });
      }
    } catch (err) {
      setSlugStatus({
        checked: true,
        available: false,
        error: 'Network error checking slug availability',
      });
    } finally {
      setSlugChecking(false);
    }
  };

  // Re-check slug whenever user changes it manually
  useEffect(() => {
    setSlugStatus({ checked: false, available: false });
  }, [formValues.slug]);

  // Navigate steps with validation checks
  const handleNextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) {
      fieldsToValidate = ['name', 'slug', 'description'];
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;

      // Force slug checking before advancing
      if (!slugStatus.checked) {
        await checkSlugAvailability();
        return;
      }
      if (!slugStatus.available) return;
    } else if (step === 2) {
      fieldsToValidate = ['monthlyPriceUsdc', 'freeTierEnabled', 'payoutWallet'];
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;
    } else if (step === 3) {
      fieldsToValidate = ['coverImageUrl', 'accentColor'];
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;
    }

    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Create submission
  const onSubmit = async (data: PublicationInput) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to create publication');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard`);
      }, 2500);
    } catch (error: any) {
      console.error(error);
      setSubmitError(error.message || 'An unexpected error occurred during creation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplySuggestion = () => {
    if (slugStatus.suggestion) {
      setValue('slug', slugStatus.suggestion, { shouldValidate: true });
      setSlugStatus({ checked: false, available: false });
    }
  };

  // Preset Colors List
  const colors = [
    { id: 'amber', name: 'Gold', class: 'bg-amber-500 ring-amber-500/20' },
    { id: 'emerald', name: 'Emerald', class: 'bg-emerald-500 ring-emerald-500/20' },
    { id: 'indigo', name: 'Indigo', class: 'bg-indigo-500 ring-indigo-500/20' },
    { id: 'rose', name: 'Rose', class: 'bg-rose-500 ring-rose-500/20' },
    { id: 'violet', name: 'Violet', class: 'bg-violet-500 ring-violet-500/20' },
    { id: 'sky', name: 'Sky', class: 'bg-sky-500 ring-sky-500/20' },
  ];

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[550px] p-6 text-center">
        <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 animate-bounce">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="mb-2 text-3xl font-bold tracking-tight text-zinc-100">
          Publication Created!
        </h2>
        <p className="max-w-md text-zinc-400 text-sm mb-6 leading-relaxed">
          Your new publication <span className="font-semibold text-zinc-200">"{formValues.name}"</span> has been configured and is now live. Redirecting you to your creator dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Wizard Progress Header */}
      <div className="mb-8 select-none">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
          <span>Step {step} of 4</span>
          <span>
            {step === 1 && 'Basic Details'}
            {step === 2 && 'USDC Pricing'}
            {step === 3 && 'Aesthetics'}
            {step === 4 && 'Preview & Publish'}
          </span>
        </div>
        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/40">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-300 shadow-md shadow-amber-500/10"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Panel */}
        <div className="lg:col-span-7 bg-zinc-900/10 border border-zinc-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* STEP 1: Basic Details */}
            {step === 1 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-100 mb-1">Let's start your story</h2>
                  <p className="text-zinc-400 text-xs">Define your publication name and personalized URL.</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-semibold text-zinc-300">
                    Publication Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="e.g. Hogwartsofweb3"
                    className="w-full p-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 focus:outline-none focus:border-amber-500/60 placeholder:text-zinc-600 text-sm transition"
                    {...register('name')}
                  />
                  {errors.name && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="slug" className="text-sm font-semibold text-zinc-300">
                    Publication URL Slug
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <span className="absolute left-3 top-3.5 text-zinc-600 text-sm select-none">
                        solscribe.app/pub/
                      </span>
                      <input
                        id="slug"
                        type="text"
                        placeholder="hogwartsofweb3"
                        className="w-full p-3 pl-32 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 focus:outline-none focus:border-amber-500/60 placeholder:text-zinc-600 text-sm transition"
                        {...register('slug')}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={checkSlugAvailability}
                      disabled={slugChecking || !formValues.slug || formValues.slug.length < 3}
                      className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 rounded-lg shrink-0 disabled:opacity-40"
                    >
                      {slugChecking ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Check'}
                    </Button>
                  </div>

                  {/* Slug availability messaging */}
                  {slugStatus.checked && (
                    <div className="mt-1 text-xs">
                      {slugStatus.available ? (
                        <p className="text-emerald-400 font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> URL slug is available!
                        </p>
                      ) : (
                        <div className="flex flex-col gap-1.5 text-red-400 font-medium">
                          <p className="flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {slugStatus.error || 'This URL slug is taken.'}
                          </p>
                          {slugStatus.suggestion && (
                            <button
                              type="button"
                              onClick={handleApplySuggestion}
                              className="text-amber-500 hover:text-amber-400 text-left hover:underline font-semibold"
                            >
                              💡 Suggestion: Use "{slugStatus.suggestion}" instead
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {errors.slug && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.slug.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="description" className="text-sm font-semibold text-zinc-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    placeholder="What is this publication about? (support up to 500 characters)"
                    className="w-full p-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 focus:outline-none focus:border-amber-500/60 placeholder:text-zinc-600 text-sm transition resize-none"
                    {...register('description')}
                  />
                  {errors.description && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.description.message}</p>}
                </div>
              </div>
            )}

            {/* STEP 2: USDC Pricing */}
            {step === 2 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-100 mb-1">Monetize your writing</h2>
                  <p className="text-zinc-400 text-xs">Set subscription rules and your Solana payout wallet.</p>
                </div>

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
                      placeholder="5.00"
                      className="w-full p-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 focus:outline-none focus:border-amber-500/60 placeholder:text-zinc-600 text-sm transition"
                      {...register('monthlyPriceUsdc')}
                    />
                    <span className="absolute right-3 top-3.5 text-zinc-500 text-xs font-mono font-bold select-none">
                      USDC / month
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    Enter 0 to make all publication tiers completely free, or set a rate (e.g. 5 USDC). Minimum rate is 1 USDC.
                  </p>
                  {errors.monthlyPriceUsdc && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.monthlyPriceUsdc.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="payoutWallet" className="text-sm font-semibold text-zinc-300">
                    Solana Payout Wallet Address
                  </label>
                  <input
                    id="payoutWallet"
                    type="text"
                    placeholder="e.g. 6D8G...7BvF"
                    className="w-full p-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 focus:outline-none focus:border-amber-500/60 placeholder:text-zinc-600 font-mono text-xs transition"
                    {...register('payoutWallet')}
                  />
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    USDC subscriber payments settle instantly. Specify a valid base58 Solana public key.
                  </p>
                  {errors.payoutWallet && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.payoutWallet.message}</p>}
                </div>
              </div>
            )}

            {/* STEP 3: Aesthetics */}
            {step === 3 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-100 mb-1">Make it yours</h2>
                  <p className="text-zinc-400 text-xs">Customize presets, branding, and layouts.</p>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-zinc-300">Accent Color Preset</label>
                  <div className="grid grid-cols-6 gap-3">
                    {colors.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setValue('accentColor', color.id)}
                        className={cn(
                          'h-12 w-full rounded-xl flex items-center justify-center transition-all duration-200 relative ring-offset-zinc-900 border border-zinc-800/80',
                          color.class,
                          formValues.accentColor === color.id && 'ring-2 ring-offset-2 ring-white scale-[1.05]'
                        )}
                        title={color.name}
                      >
                        {formValues.accentColor === color.id && (
                          <Check className={cn('w-5 h-5 font-bold', color.id === 'indigo' || color.id === 'rose' || color.id === 'violet' ? 'text-white' : 'text-zinc-950')} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="coverImageUrl" className="text-sm font-semibold text-zinc-300">
                    Cover Image URL
                  </label>
                  <input
                    id="coverImageUrl"
                    type="text"
                    placeholder="https://example.com/cover.jpg"
                    className="w-full p-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 focus:outline-none focus:border-amber-500/60 placeholder:text-zinc-600 text-sm transition"
                    {...register('coverImageUrl')}
                  />
                  {errors.coverImageUrl && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.coverImageUrl.message}</p>}
                </div>

                {/* Preset suggestions */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-zinc-400">Or choose a layout preset:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {coverPresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setValue('coverImageUrl', preset.url, { shouldValidate: true })}
                        className="group flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/40 text-left hover:border-zinc-700 transition"
                      >
                        <div className="h-14 w-full overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={preset.url} alt={preset.name} className="h-full w-full object-cover group-hover:scale-[1.03] transition" />
                        </div>
                        <span className="p-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Review + Publish */}
            {step === 4 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-100 mb-1">Confirm and Publish</h2>
                  <p className="text-zinc-400 text-xs">Verify your settings are correct before creating.</p>
                </div>

                {submitError && (
                  <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-normal flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-950/40 flex flex-col gap-3 font-sans text-xs">
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500">Name</span>
                    <span className="font-semibold text-zinc-200">{formValues.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500">URL path</span>
                    <span className="font-mono text-zinc-200">/pub/{formValues.slug}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500">Pricing</span>
                    <span className="font-semibold text-zinc-200">
                      {formValues.monthlyPriceUsdc > 0 ? `${formValues.monthlyPriceUsdc} USDC/month` : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-zinc-500">Payout address</span>
                    <span className="font-mono text-zinc-400 break-all select-all text-right">{formValues.payoutWallet}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between gap-4 mt-8 pt-4 border-t border-zinc-800/50">
              {step > 1 ? (
                <Button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 hover:text-white font-bold"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => router.back()}
                  className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-500 hover:text-zinc-400 font-bold"
                >
                  Cancel
                </Button>
              )}

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold hover:shadow-lg hover:shadow-amber-500/10 ml-auto"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 ml-auto disabled:opacity-40"
                >
                  {submitting ? 'Creating Publication...' : 'Publish Publication 🚀'}
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Right Preview Card Panel */}
        <div className="lg:col-span-5 flex flex-col gap-4 select-none sticky top-8">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            Live Preview Card
          </span>
          <PublicationCard
            publication={{
              name: formValues.name || 'Your Publication Name',
              slug: formValues.slug || 'url-slug',
              description: formValues.description || 'Provide a compelling description describing what kind of subscriber content and updates you will offer to your audience...',
              coverImageUrl: formValues.coverImageUrl,
              monthlyPriceUsdc: formValues.monthlyPriceUsdc,
              subscriberCount: 0,
              accentColor: formValues.accentColor,
            }}
            showSubscribeButton={true}
          />
        </div>
      </div>
    </div>
  );
}
