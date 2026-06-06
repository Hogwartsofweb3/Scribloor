'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Check,
  Play,
  Pause,
  Download,
  Mail,
  Users,
  Percent,
  Eye,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores/uiStore';

interface Contact {
  email: string;
  name: string | null;
  sourceSubscriptionStatus: string | null;
  status: 'pending' | 'sent' | 'opened' | 'converted' | 'bounced';
  inviteSentAt: string | null;
  inviteOpenedAt: string | null;
  convertedAt: string | null;
}

interface JobData {
  id: string;
  sourcePlatform: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalContacts: number;
  emailsSent: number;
  emailsOpened: number;
  conversions: number;
  csvFileUrl: string;
  createdAt: string;
  contacts: Contact[];
}

export default function MigrationClient() {
  const { addToast } = useUIStore();
  const [screen, setScreen] = useState<'info' | 'setup' | 'active'>('info');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    opened: 0,
    converted: 0,
    conversionRate: 0,
  });

  // Setup Form state
  const [platform, setPlatform] = useState<'substack' | 'beehiiv' | 'ghost' | 'other'>('substack');
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [includeFree, setIncludeFree] = useState(false);
  const [setupStep, setSetupStep] = useState<1 | 2 | 3 | 4>(1);
  const [validating, setValidating] = useState(false);
  const [previewContacts, setPreviewContacts] = useState<any[]>([]);
  const [totalContactsCount, setTotalContactsCount] = useState(0);

  // Active Job states
  const [loadingJob, setLoadingJob] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [contactsFilter, setContactsFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'email' | 'status'>('email');
  const [sortAsc, setSortAsc] = useState(true);

  // Polling ref
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── 1. Fetch any active migration job on mount ──────────────────────────
  useEffect(() => {
    async function checkExistingJobs() {
      try {
        setLoadingJob(true);
        // Find existing jobs. For simplicity, we search jobs through a generic fetch or we hit the list
        // Since we only run one active migration at a time, let's look for a job.
        // We will do a check via a general fetch (for simplicity we can check /api/migration or query active jobs)
        // Let's check if there is an active job. We will try to load the latest job.
        const res = await fetch('/api/migration/latest');
        if (res.ok) {
          const data = await res.json();
          if (data?.job) {
            setActiveJobId(data.job.id);
            setScreen('active');
          }
        }
      } catch (err) {
        console.error('Error checking existing migration jobs:', err);
      } finally {
        setLoadingJob(false);
      }
    }
    checkExistingJobs();
  }, []);

  // ── 2. Poll job status if screen is active and status is 'processing' ──
  useEffect(() => {
    if (screen !== 'active' || !activeJobId) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    const fetchJobDetails = async () => {
      try {
        const res = await fetch(`/api/migration/${activeJobId}`);
        if (res.ok) {
          const data = await res.json();
          setJobData(data.job);
          setStats(data.stats);

          // Clear polling if job status is completed or failed
          if (data.job.status !== 'processing' && pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      } catch (err) {
        console.error('Error polling migration details:', err);
      }
    };

    fetchJobDetails();

    if (jobData?.status === 'processing' || !jobData) {
      pollIntervalRef.current = setInterval(fetchJobDetails, 3000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [screen, activeJobId, jobData?.status]);

  // ── 3. Handle File Input parsing ────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      addToast({ type: 'error', message: 'Please upload a valid CSV file.' });
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Convert to base64
      const base64 = btoa(unescape(encodeURIComponent(text)));
      setFileBase64(`data:text/csv;base64,${base64}`);
      setSetupStep(3); // Go to Options
    };
    reader.readAsText(file);
  };

  // ── 4. Trigger validation POST ──────────────────────────────────────────
  const handleValidateCsv = async () => {
    if (!fileBase64) return;
    setValidating(true);

    try {
      const res = await fetch('/api/migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          csvFileUrl: fileBase64,
          includeFreeTier: includeFree,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to parse CSV file.');
      }

      const data = await res.json();
      setActiveJobId(data.jobId);
      setTotalContactsCount(data.totalContacts);
      setPreviewContacts(data.previewContacts);
      setSetupStep(4); // Go to Preview
      addToast({ type: 'success', message: 'CSV parsed successfully!' });
    } catch (err: any) {
      addToast({ type: 'error', message: err.message });
    } finally {
      setValidating(false);
    }
  };

  // ── 5. Confirm Job and Start Sending ────────────────────────────────────
  const handleConfirmMigration = async () => {
    if (!activeJobId) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/migration/${activeJobId}/send`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Failed to initiate invite sends.');
      }

      addToast({ type: 'success', message: 'Invites are now being sent!' });
      setScreen('active');
    } catch (err: any) {
      addToast({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // ── 6. Pause / Resume Operations ────────────────────────────────────────
  const handleTogglePause = async () => {
    if (!jobData) return;
    setActionLoading(true);

    try {
      if (jobData.status === 'processing') {
        // Pause by setting to failed
        const res = await fetch(`/api/migration/${jobData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'failed' }),
        });
        if (!res.ok) throw new Error('Failed to pause job.');
        addToast({ type: 'info', message: 'Migration paused.' });
      } else {
        // Resume by calling send again
        const res = await fetch(`/api/migration/${jobData.id}/send`, {
          method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to resume job.');
        addToast({ type: 'success', message: 'Resuming invite sends...' });
      }
      // Trigger instant poll refetch
      const res = await fetch(`/api/migration/${jobData.id}`);
      if (res.ok) {
        const data = await res.json();
        setJobData(data.job);
        setStats(data.stats);
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // ── 7. CSV Exporter ─────────────────────────────────────────────────────
  const handleDownloadReport = () => {
    if (!jobData?.contacts) return;

    const headers = ['Email', 'Name', 'Status', 'Invite Sent At', 'Opened At', 'Converted At'];
    const rows = jobData.contacts.map((c) => [
      c.email,
      c.name || '',
      c.status,
      c.inviteSentAt ? new Date(c.inviteSentAt).toLocaleString() : '',
      c.inviteOpenedAt ? new Date(c.inviteOpenedAt).toLocaleString() : '',
      c.convertedAt ? new Date(c.convertedAt).toLocaleString() : '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `migration-report-${jobData.id.slice(0, 8)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── 8. Table sorting & filtering logic ──────────────────────────────────
  const filteredContacts = jobData?.contacts
    ? jobData.contacts.filter((c) => {
        if (contactsFilter === 'all') return true;
        return c.status === contactsFilter;
      })
    : [];

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    let fieldA = sortField === 'email' ? a.email : a.status;
    let fieldB = sortField === 'email' ? b.email : b.status;
    if (sortAsc) {
      return fieldA.localeCompare(fieldB);
    } else {
      return fieldB.localeCompare(fieldA);
    }
  });

  const toggleSort = (field: 'email' | 'status') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  if (loadingJob) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[var(--color-brand-500)]" />
        <p className="text-sm text-[var(--color-text-muted)] font-mono">Loading subscriber migration details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      
      {/* ── STATE 1: INFO / START PANEL ───────────────────────────────────── */}
      {screen === 'info' && (
        <div className="max-w-xl mx-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-500/10 border border-violet-500/10 rounded-2xl text-violet-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100 font-serif">
                Migrate Subscribers
              </h2>
              <p className="text-xs text-zinc-500 font-mono">
                Import contacts from Substack, Beehiiv, or Ghost
              </p>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-5 space-y-4 text-sm text-zinc-300">
            <p className="text-xs text-zinc-400 leading-relaxed">
              When migrating paid memberships from Stripe-based platforms, readers cannot be automatically rebilled. Use this migration tool to easily onboard them:
            </p>
            <ol className="space-y-3.5 pl-1">
              <li className="flex gap-3 items-start">
                <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-violet-400 shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="font-semibold text-zinc-200 text-xs">Upload your subscriber export CSV</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                    We support native CSV files generated directly by Substack, Beehiiv, and Ghost.
                  </p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-violet-400 shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h4 className="font-semibold text-zinc-200 text-xs">Send personalized invitation emails</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                    Each contact receives a custom invite containing a unique one-click resubscribe link.
                  </p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-violet-400 shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h4 className="font-semibold text-zinc-200 text-xs">Track on-chain USDC conversions</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                    Monitor email delivery, open rates, and resubscribe conversions directly from your creator dashboard.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <Button
            onClick={() => setScreen('setup')}
            className="w-full h-11 bg-violet-500 hover:bg-violet-600 font-bold text-white rounded-xl shadow-lg flex items-center justify-center gap-1.5"
          >
            Start Migration <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* ── STATE 2: SETUP WIZARD FORM ────────────────────────────────────── */}
      {screen === 'setup' && (
        <div className="max-w-2xl mx-auto border border-zinc-800 bg-zinc-950 rounded-2xl p-8 space-y-6 shadow-xl relative">
          
          <button
            onClick={() => setScreen('info')}
            className="absolute top-4 right-4 text-xs font-mono text-zinc-500 hover:text-zinc-300 transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-zinc-100 font-serif">Setup Subscriber Migration</h2>
            <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 ml-auto">
              <span className={cn('w-2 h-2 rounded-full', setupStep >= 1 ? 'bg-violet-500' : 'bg-zinc-800')} />
              <span className={cn('w-2 h-2 rounded-full', setupStep >= 2 ? 'bg-violet-500' : 'bg-zinc-800')} />
              <span className={cn('w-2 h-2 rounded-full', setupStep >= 3 ? 'bg-violet-500' : 'bg-zinc-800')} />
              <span className={cn('w-2 h-2 rounded-full', setupStep >= 4 ? 'bg-violet-500' : 'bg-zinc-800')} />
              <span className="ml-1">Step {setupStep} of 4</span>
            </div>
          </div>

          <hr className="border-zinc-900" />

          {/* STEP 1: Platform Selection */}
          {setupStep === 1 && (
            <div className="space-y-4">
              <label className="text-xs font-bold font-mono text-zinc-500 uppercase tracking-wider block">
                Select your source platform
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['substack', 'beehiiv', 'ghost', 'other'] as const).map((plat) => (
                  <button
                    key={plat}
                    onClick={() => {
                      setPlatform(plat);
                      setSetupStep(2);
                    }}
                    className={cn(
                      'p-4 rounded-xl border text-center transition flex flex-col items-center justify-center gap-2',
                      platform === plat
                        ? 'border-violet-500/40 bg-violet-500/5 text-violet-400'
                        : 'border-zinc-800 bg-zinc-900/35 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                    )}
                  >
                    <span className="text-sm font-semibold capitalize font-sans">{plat}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: CSV Upload */}
          {setupStep === 2 && (
            <div className="space-y-5">
              <label className="text-xs font-bold font-mono text-zinc-500 uppercase tracking-wider block">
                Upload Subscriber CSV
              </label>

              {/* Drag and Drop Zone */}
              <div className="border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10 p-8 text-center relative hover:border-zinc-700 transition">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                <span className="text-xs font-semibold text-zinc-300 block">
                  Click to select or drag your CSV file here
                </span>
                <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                  Only .csv files accepted (Max 10k contacts)
                </span>
              </div>

              {/* Guide links based on platform */}
              <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 text-xs space-y-2 text-zinc-400">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-violet-400" />
                  How to get your CSV file:
                </span>
                {platform === 'substack' && (
                  <p className="leading-relaxed">
                    Go to your Substack settings page, scroll down to the "Export subscribers" button, and download the ZIP file. Extract and upload the <code>subscribers.csv</code> file. 
                    <a href="https://substack.com/publish/settings" target="_blank" rel="noopener noreferrer" className="text-violet-400 ml-1 underline hover:text-violet-300">
                      Open Substack Settings
                    </a>
                  </p>
                )}
                {platform === 'beehiiv' && (
                  <p className="leading-relaxed">
                    Navigate to your Beehiiv dashboard &rarr; Audience &rarr; Subscribers, click the options menu, select "Export Subscribers", and download your active audience list.
                    <a href="https://support.beehiiv.com/hc/en-us/articles/9303531061915-How-do-I-export-subscribers-" target="_blank" rel="noopener noreferrer" className="text-violet-400 ml-1 underline hover:text-violet-300">
                      View Export Guide
                    </a>
                  </p>
                )}
                {platform === 'ghost' && (
                  <p className="leading-relaxed">
                    Go to Ghost Settings &rarr; Members, click Settings, choose "Export all members" to download the member directory.
                  </p>
                )}
                {platform === 'other' && (
                  <p className="leading-relaxed">
                    Ensure your custom CSV file contains at least an <code>email</code> column. Optional <code>name</code> columns will be auto-mapped if available.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Options */}
          {setupStep === 3 && (
            <div className="space-y-5">
              <label className="text-xs font-bold font-mono text-zinc-500 uppercase tracking-wider block">
                Migration Options
              </label>

              <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-zinc-200 block">Include Free Tier Subscribers</span>
                  <span className="text-[10px] text-zinc-500 leading-normal max-w-sm block">
                    If toggled off, we only import active/paid subscribers from the CSV file.Toggled on, we invite all contacts.
                  </span>
                </div>
                <button
                  role="switch"
                  aria-checked={includeFree}
                  onClick={() => setIncludeFree(!includeFree)}
                  className={cn(
                    'relative w-10 h-[22px] rounded-full transition-colors shrink-0',
                    includeFree ? 'bg-violet-500' : 'bg-zinc-700'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                      includeFree ? 'translate-x-4' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              {fileName && (
                <div className="flex items-center gap-2 rounded-xl border border-zinc-900 bg-zinc-950 p-3 text-xs font-mono text-zinc-400">
                  <FileSpreadsheet className="w-4 h-4 text-violet-400" />
                  <span className="truncate flex-1">{fileName}</span>
                  <span className="text-[10px] text-zinc-600">CSV READY</span>
                </div>
              )}

              <Button
                onClick={handleValidateCsv}
                disabled={validating}
                className="w-full h-11 bg-violet-500 hover:bg-violet-600 font-bold text-white rounded-xl shadow-lg flex items-center justify-center gap-1.5"
              >
                {validating ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                Parse & Validate CSV
              </Button>
            </div>
          )}

          {/* STEP 4: Preview */}
          {setupStep === 4 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold font-mono text-zinc-500 uppercase tracking-wider block">
                  Verify Import Preview
                </label>
                <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal">
                  Found <span className="text-violet-400 font-semibold">{totalContactsCount}</span> valid contacts matching options. Review the first 5 entries below.
                </p>
              </div>

              {/* Preview Table */}
              <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl overflow-hidden text-xs">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-950 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                      <th className="p-3 pl-4">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3 pr-4">CSV Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-300">
                    {previewContacts.map((c, i) => (
                      <tr key={i}>
                        <td className="p-3 pl-4 truncate max-w-[120px]">{c.name || '—'}</td>
                        <td className="p-3 font-mono text-[11px] truncate max-w-[200px]">{c.email}</td>
                        <td className="p-3 pr-4 font-semibold text-zinc-400 capitalize">{c.sourceSubscriptionStatus || 'active'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 mt-2">
                <Button
                  onClick={() => setSetupStep(3)}
                  variant="outline"
                  className="flex-1 h-11 border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 rounded-xl"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirmMigration}
                  disabled={actionLoading}
                  className="flex-1 h-11 bg-violet-500 hover:bg-violet-600 font-bold text-white rounded-xl shadow-lg flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  Confirm & Send Invites
                </Button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── STATE 3: ACTIVE MIGRATION STATS ────────────────────────────────── */}
      {screen === 'active' && jobData && (
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 font-serif">Migration Progress</h2>
              <p className="text-xs text-zinc-500 font-mono leading-relaxed mt-0.5">
                Job ID: {jobData.id.slice(0, 8)} • Source: <span className="capitalize">{jobData.sourcePlatform}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 select-none">
              <Button
                onClick={handleTogglePause}
                disabled={actionLoading || jobData.status === 'completed'}
                variant="outline"
                className="h-10 border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 font-bold rounded-xl flex items-center gap-1.5"
              >
                {jobData.status === 'processing' ? (
                  <>
                    <Pause className="w-4 h-4 text-amber-500" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-emerald-500" /> Resume
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownloadReport}
                variant="outline"
                className="h-10 border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 font-bold rounded-xl flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download Report
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="border border-zinc-900 bg-zinc-950 p-5 rounded-2xl space-y-3 shadow-sm">
            <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                {jobData.status === 'processing' && <RefreshCw className="w-3.5 h-3.5 text-violet-400 animate-spin" />}
                {jobData.status === 'completed' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                Job Status: <span className="font-bold uppercase text-zinc-200">{jobData.status}</span>
              </span>
              <span>
                {jobData.emailsSent} of {jobData.totalContacts} invites sent
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden relative">
              <div
                className="h-full bg-violet-500 transition-all duration-500"
                style={{ width: `${(jobData.emailsSent / jobData.totalContacts) * 100}%` }}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Contacts */}
            <div className="border border-zinc-900 bg-zinc-950/40 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider block">
                Total Import
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-sans tracking-tight text-zinc-200">{stats.total}</span>
                <span className="text-[10px] font-mono text-zinc-500">emails</span>
              </div>
            </div>

            {/* Sent */}
            <div className="border border-zinc-900 bg-zinc-950/40 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider block">
                Delivered
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-sans tracking-tight text-zinc-200">{stats.sent}</span>
                <span className="text-[10px] font-mono text-zinc-500">invites</span>
              </div>
            </div>

            {/* Opened */}
            <div className="border border-zinc-900 bg-zinc-950/40 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider block">
                Opened Invites
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-sans tracking-tight text-zinc-200">{stats.opened}</span>
                <span className="text-[10px] font-mono text-zinc-500">readers</span>
              </div>
            </div>

            {/* Converted */}
            <div className="border border-zinc-900 bg-zinc-950/40 rounded-2xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider block">
                Conversion Rate
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-sans tracking-tight text-emerald-400">
                  {stats.conversionRate}%
                </span>
                <span className="text-[10px] font-mono text-zinc-500">({stats.converted} converted)</span>
              </div>
            </div>
          </div>

          {/* Contacts Datatable */}
          <div className="border border-zinc-900 bg-zinc-950/20 rounded-2xl p-5 space-y-4">
            
            {/* Filters bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <span className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider">
                Contacts List
              </span>

              {/* Status Filters */}
              <div className="flex flex-wrap gap-1 text-[10px] font-bold font-mono uppercase tracking-wider">
                {(['all', 'pending', 'sent', 'opened', 'converted'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setContactsFilter(filter)}
                    className={cn(
                      'px-2.5 py-1 rounded-md border transition-all',
                      contactsFilter === filter
                        ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                        : 'border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-zinc-350'
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Datatable */}
            <div className="border border-zinc-900 bg-zinc-950/40 rounded-xl overflow-hidden text-xs">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950 text-zinc-500 font-mono text-[10px] uppercase tracking-wider select-none">
                    <th className="p-3 pl-4 cursor-pointer hover:text-zinc-350" onClick={() => toggleSort('email')}>
                      Email {sortField === 'email' && (sortAsc ? '▲' : '▼')}
                    </th>
                    <th className="p-3">Name</th>
                    <th className="p-3 cursor-pointer hover:text-zinc-350" onClick={() => toggleSort('status')}>
                      Status {sortField === 'status' && (sortAsc ? '▲' : '▼')}
                    </th>
                    <th className="p-3 pr-4">Activity Log</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {sortedContacts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-zinc-500 font-mono">
                        No contacts match the selected status filter.
                      </td>
                    </tr>
                  ) : (
                    sortedContacts.map((c) => (
                      <tr key={c.email}>
                        <td className="p-3 pl-4 font-mono text-[11px] truncate max-w-[200px]">{c.email}</td>
                        <td className="p-3 truncate max-w-[120px]">{c.name || '—'}</td>
                        <td className="p-3">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border',
                              c.status === 'converted' && 'border-emerald-500/25 bg-emerald-500/5 text-emerald-400',
                              c.status === 'opened' && 'border-violet-500/25 bg-violet-500/5 text-violet-400',
                              c.status === 'sent' && 'border-blue-500/25 bg-blue-500/5 text-blue-400',
                              c.status === 'pending' && 'border-zinc-800 bg-zinc-900/40 text-zinc-500',
                              c.status === 'bounced' && 'border-rose-500/25 bg-rose-500/5 text-rose-400'
                            )}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3 pr-4 text-[10px] text-zinc-500 font-mono">
                          {c.status === 'converted' && c.convertedAt && `Converted ${new Date(c.convertedAt).toLocaleDateString()}`}
                          {c.status === 'opened' && c.inviteOpenedAt && `Opened ${new Date(c.inviteOpenedAt).toLocaleDateString()}`}
                          {c.status === 'sent' && c.inviteSentAt && `Sent ${new Date(c.inviteSentAt).toLocaleDateString()}`}
                          {c.status === 'pending' && 'Queued'}
                          {c.status === 'bounced' && 'Delivery Bounced'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
