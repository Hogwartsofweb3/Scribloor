"use client";

import React from 'react';
import dynamic from 'next/dynamic';

interface PostEditorProps {
  initialContent?: string;
  onChange: (html: string, previewHtml: string) => void;
  onImageUpload: (file: File) => Promise<string>;
  readOnly?: boolean;
}

// Dynamically import the core client component to prevent Next.js server-side compilation errors on window/document APIs
const PostEditor = dynamic(() => import('./PostEditorClient'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col border border-zinc-800 rounded-xl bg-zinc-900/10 min-h-[500px] animate-pulse select-none">
      {/* Skeleton Toolbar */}
      <div className="h-12 border-b border-zinc-800 bg-zinc-950/40 w-full" />
      {/* Skeleton Canvas */}
      <div className="p-6 flex flex-col gap-4 flex-grow bg-zinc-900/5">
        <div className="h-8 bg-zinc-800/40 rounded w-1/3 mb-2" />
        <div className="h-4 bg-zinc-800/25 rounded w-full" />
        <div className="h-4 bg-zinc-800/25 rounded w-11/12" />
        <div className="h-4 bg-zinc-800/25 rounded w-4/5" />
        <div className="h-4 bg-zinc-800/25 rounded w-full mt-4" />
        <div className="h-4 bg-zinc-800/25 rounded w-5/6" />
      </div>
    </div>
  ),
});

export default PostEditor;
export type { PostEditorProps };
