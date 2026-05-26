"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PostEditor from '@/components/editor/PostEditor';
import { Loader2 } from 'lucide-react';

export default function NewVaultEntryPage() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [category, setCategory] = useState('research');
  const [price, setPrice] = useState('2.00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!title || !abstract || !contentHtml) {
        throw new Error('Title, abstract, and content are required.');
      }

      const res = await fetch('/api/vault/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          abstract,
          contentHtml,
          category,
          singleAccessPriceUsdc: parseFloat(price),
        }),
      });

      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg || 'Failed to submit vault entry');
      }

      router.push('/dashboard/vault');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Submit to The Vault</h1>
        <p className="text-zinc-400">
          Your research will be reviewed by the Solscribe editorial team before publication.
          Once approved, it will be permanently available in The Vault.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg mb-8">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a compelling title..."
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Abstract</label>
              <textarea
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                placeholder="Write a 2-3 sentence summary. This is what readers will see before they buy access."
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Full Research Content</label>
              <div className="border border-white/10 rounded-xl overflow-hidden bg-zinc-900 min-h-[500px]">
                <PostEditor
                  initialContent={contentHtml}
                  onChange={(html, _preview) => setContentHtml(html)}
                  onImageUpload={async (file) => {
                    // Placeholder — vault entries can use uploadthing or return data URL
                    return URL.createObjectURL(file);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar Settings Column */}
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-6">Vault Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="research">Research</option>
                    <option value="report">Report</option>
                    <option value="analysis">Analysis</option>
                    <option value="guide">Guide</option>
                    <option value="data">Data</option>
                    <option value="essay">Essay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Single Access Price (USDC)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                    <input
                      type="number"
                      min="0.50"
                      step="0.50"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg pl-7 pr-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    Users can buy permanent access for this price, or read it if they hold a Vault Pass.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit for Review'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
