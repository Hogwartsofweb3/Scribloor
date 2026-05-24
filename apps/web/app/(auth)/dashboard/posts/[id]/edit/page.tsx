"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import PostEditor from '@/components/editor/PostEditor';
import { useAutoSave } from '@/hooks/useAutoSave';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Lock,
  Globe,
  Save,
  Check,
  AlertCircle,
  ImageIcon,
  X,
  Send,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  // Post states
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [html, setHtml] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [isPaywalled, setIsPaywalled] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  
  // Track original publish state
  const [originalStatus, setOriginalStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');

  // Action states
  const [publishing, setPublishing] = useState(false);
  const [savingManual, setSavingManual] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Helper to format ISO date to datetime-local format (YYYY-MM-DDTHH:MM)
  const formatDateTimeLocal = (dateString: string | null) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Load target post on mount
  useEffect(() => {
    async function loadPost() {
      if (!postId) return;
      try {
        setLoading(true);
        setErrorState(null);
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          throw new Error('Failed to load post data');
        }
        const data = await response.json();
        if (data.post) {
          setTitle(data.post.title || '');
          setSubtitle(data.post.subtitle || '');
          setCoverImageUrl(data.post.coverImageUrl || '');
          setHtml(data.post.contentHtml || '');
          setPreviewHtml(data.post.previewHtml || '');
          setIsPaywalled(data.post.isPaywalled || false);
          setStatus(data.post.status || 'draft');
          setOriginalStatus(data.post.status || 'draft');
          setScheduledAt(formatDateTimeLocal(data.post.scheduledAt));
        }
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || 'Error loading post for editing.');
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [postId]);

  const setErrorState = (msg: string | null) => {
    setErrorMessage(msg);
  };

  // Hook up Auto-Save: only active if we are editing a draft
  const { status: autoSaveStatus } = useAutoSave({
    postId,
    html,
    previewHtml,
    enabled: !!postId && status === 'draft',
  });

  // Combine auto-save state with manual save states
  const activeSaveStatus = autoSaveStatus !== 'idle' ? autoSaveStatus : saveStatus;

  // Handle visual title sizing
  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // Saves current changes (PATCH)
  const handleManualSave = async () => {
    setSavingManual(true);
    setSaveStatus('saving');
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Untitled Post',
          subtitle: subtitle || null,
          cover_image_url: coverImageUrl || null,
          content_html: html,
          preview_html: previewHtml,
          is_paywalled: isPaywalled,
          status,
          scheduled_at: scheduledAt || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save post changes');
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error saving post draft.');
      setSaveStatus('error');
    } finally {
      setSavingManual(false);
    }
  };

  // Coordinates draft saving and execution of publishing triggers
  const handlePublish = async () => {
    setPublishing(true);
    setErrorMessage(null);

    try {
      // 1. Commit final content changes via PATCH
      const patchResponse = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Untitled Post',
          subtitle: subtitle || null,
          cover_image_url: coverImageUrl || null,
          content_html: html,
          preview_html: previewHtml,
          is_paywalled: isPaywalled,
          status: 'published',
          scheduled_at: null, // Wipe schedule
        }),
      });

      if (!patchResponse.ok) {
        const patchData = await patchResponse.json();
        throw new Error(patchData.error || 'Failed to save final post changes before publishing');
      }

      // 2. Trigger publishing routing
      const response = await fetch(`/api/posts/${postId}/publish`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish post');
      }

      setStatus('published');
      setOriginalStatus('published');
      alert(`Post published successfully! Distributed newsletter to ${data.sentEmails} active subscribers.`);
      router.push('/dashboard/posts');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during publishing.');
    } finally {
      setPublishing(false);
    }
  };

  const handleImageUploadMock = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-6 text-zinc-500">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-4" />
        <span className="text-sm font-mono uppercase tracking-widest">Loading post content...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Editor Header Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-8 select-none">
        <Link href="/dashboard/posts">
          <button className="flex items-center text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to posts
          </button>
        </Link>

        {/* Save/Sync Status Indicator */}
        <div className="flex items-center gap-2">
          {activeSaveStatus === 'saving' && (
            <span className="text-xs font-mono text-zinc-500 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" /> Saving changes...
            </span>
          )}
          {activeSaveStatus === 'saved' && (
            <span className="text-xs font-mono text-emerald-500 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Changes saved
            </span>
          )}
          {activeSaveStatus === 'error' && (
            <span className="text-xs font-mono text-red-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Save failed
            </span>
          )}
        </div>
      </div>

      {/* Already Published Warning Banner */}
      {originalStatus === 'published' && (
        <div className="mb-6 p-4 rounded-xl border border-amber-500/20 bg-amber-950/20 text-amber-400 text-sm leading-normal flex items-start gap-3 select-none">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
          <div className="flex flex-col gap-1">
            <span className="font-bold">You are editing a live published post</span>
            <span className="text-zinc-400 text-xs">
              Saving updates or edits will instantly affect the online readers on Solscribe. Be cautious of making breakages to the layout, text, or elements.
            </span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-normal flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Editorial Canvas */}
        <div className="lg:col-span-8 flex flex-col">
          {/* Borderless Title */}
          <textarea
            rows={1}
            placeholder="An Editorial Title..."
            value={title}
            onChange={handleTitleChange}
            className="w-full text-4xl sm:text-5xl font-extrabold bg-transparent border-none outline-none resize-none text-zinc-100 placeholder:text-zinc-800 leading-tight mb-2 focus:ring-0 focus:outline-none"
          />

          {/* Borderless Subtitle */}
          <input
            type="text"
            placeholder="Add an optional subtitle..."
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full text-lg bg-transparent border-none outline-none text-zinc-400 placeholder:text-zinc-800 leading-relaxed mb-6 focus:ring-0 focus:outline-none"
          />

          {/* Cover Photo URL input */}
          <div className="mb-6">
            {coverImageUrl ? (
              <div className="relative rounded-xl border border-zinc-800 overflow-hidden group select-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImageUrl}
                  alt="Post Cover"
                  className="w-full max-h-[300px] object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverImageUrl('')}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-zinc-400 hover:text-zinc-200 border border-zinc-700/50 transition shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 select-none">
                <div className="relative flex-grow">
                  <ImageIcon className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                  <input
                    type="text"
                    placeholder="Paste cover photo URL..."
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    className="w-full p-2.5 pl-9 rounded-lg border border-zinc-800 bg-zinc-950 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/60 transition"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Post Tiptap Editor Component */}
          {html !== undefined && (
            <PostEditor
              initialContent={html}
              onChange={(htmlContent, previewContent) => {
                setHtml(htmlContent);
                setPreviewHtml(previewContent);
              }}
              onImageUpload={handleImageUploadMock}
            />
          )}
        </div>

        {/* Right Dynamic Controls Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-8 select-none">
          {/* Post Status / Metadata Settings */}
          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/10 backdrop-blur-sm shadow-xl flex flex-col gap-5">
            <div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
                Post Controls
              </h3>
              <div className="flex items-center justify-between py-2 border-b border-zinc-800/40">
                <span className="text-xs text-zinc-400">Post Status</span>
                <span className="px-2.5 py-0.5 text-[9px] font-bold text-amber-500 border border-amber-500/20 bg-amber-500/5 rounded-full uppercase tracking-wider">
                  {status}
                </span>
              </div>
            </div>

            {/* Paywall Toggle */}
            <div className="flex items-start justify-between gap-4 p-3 border border-zinc-800/80 rounded-xl bg-zinc-950/40">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-500" /> Subscriber Only
                </span>
                <span className="text-[10px] text-zinc-500 leading-normal">
                  Locks full content behind the paywall boundary.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isPaywalled}
                onChange={(e) => setIsPaywalled(e.target.checked)}
                className="w-9 h-5 bg-zinc-800 rounded-full appearance-none checked:bg-amber-500 relative transition duration-300 cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-zinc-400 checked:before:bg-zinc-950 before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition shrink-0 mt-0.5"
              />
            </div>

            {/* Scheduling Form - only allow if draft or currently scheduled */}
            {originalStatus !== 'published' && (
              <div className="flex flex-col gap-2">
                <label htmlFor="scheduledAt" className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" /> Schedule Post (Optional)
                </label>
                <input
                  id="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => {
                    setScheduledAt(e.target.value);
                    setStatus(e.target.value ? 'scheduled' : 'draft');
                  }}
                  className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 focus:outline-none focus:border-amber-500/60 font-mono text-xs transition"
                />
              </div>
            )}

            {/* Control Actions */}
            <div className="flex flex-col gap-2.5 pt-2">
              <Button
                onClick={handleManualSave}
                disabled={savingManual || publishing}
                className="w-full font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 hover:text-white"
              >
                <Save className="w-4 h-4 mr-2" /> Save Post Changes
              </Button>

              <Button
                onClick={() => setShowPreviewModal(true)}
                disabled={!title && !html}
                className="w-full font-bold bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-zinc-200"
              >
                <Eye className="w-4 h-4 mr-2" /> Live Layout Preview
              </Button>

              {originalStatus !== 'published' && (
                <Button
                  onClick={handlePublish}
                  disabled={publishing || savingManual}
                  className="w-full font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/10"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {publishing ? 'Publishing...' : 'Publish & Email Post 🚀'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/90 backdrop-blur-sm p-4 sm:p-6 md:p-8 flex justify-center">
          <div className="w-full max-w-3xl border border-zinc-800 bg-zinc-950 rounded-2xl shadow-2xl p-6 relative h-fit">
            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-900 text-zinc-500 hover:text-zinc-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block mb-4 border-b border-zinc-900 pb-2 select-none">
              👁️ Preview Modal
            </span>

            {/* Simulated Live Post Layout */}
            <div className="max-w-none prose prose-invert prose-amber leading-relaxed">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 leading-tight mb-2">
                {title || 'Untitled Post'}
              </h1>
              {subtitle && (
                <p className="text-lg text-zinc-400 font-medium leading-relaxed mb-6">
                  {subtitle}
                </p>
              )}
              {coverImageUrl && (
                <img
                  src={coverImageUrl}
                  alt="Cover"
                  className="rounded-xl border border-zinc-800 mx-auto my-6 shadow-md max-w-full max-h-[350px] object-cover"
                />
              )}

              {/* Render either contentHtml or preview Teaser if Paywalled */}
              {isPaywalled ? (
                <div>
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                  {/* Simulated locked subscription gate */}
                  <div className="flex flex-col items-center justify-center p-8 mt-8 border border-amber-500/20 rounded-xl bg-gradient-to-b from-zinc-900/50 to-zinc-950 select-none">
                    <Lock className="w-6 h-6 text-amber-500 mb-2" />
                    <h3 className="text-base font-bold text-zinc-200 mb-1">Subscriber Locked Content</h3>
                    <p className="text-xs text-zinc-500 text-center max-w-xs leading-normal">
                      The rest of this post is paywalled. Subscribing unlocks this article and creator archives.
                    </p>
                  </div>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: html }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
