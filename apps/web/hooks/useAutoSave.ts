"use client";

import { useEffect, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveProps {
  postId: string | null | undefined;
  html: string;
  previewHtml: string;
  enabled?: boolean;
}

export function useAutoSave({
  postId,
  html,
  previewHtml,
  enabled = true,
}: UseAutoSaveProps) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Keep refs of the active values to access in async intervals without retriggering effect hook setups
  const htmlRef = useRef(html);
  const previewHtmlRef = useRef(previewHtml);
  const lastSavedHtmlRef = useRef('');
  const isInitializedRef = useRef(false);

  // Synchronize refs with changing state values
  useEffect(() => {
    htmlRef.current = html;
    previewHtmlRef.current = previewHtml;

    // Initialize the baseline save state on first content initialization
    if (!isInitializedRef.current && html) {
      lastSavedHtmlRef.current = html;
      isInitializedRef.current = true;
    }
  }, [html, previewHtml]);

  // Core save executor
  const saveDraft = async () => {
    if (!postId || !enabled) return;

    const currentHtml = htmlRef.current;
    const currentPreviewHtml = previewHtmlRef.current;

    // Avoid redundant saves if the document content is unchanged
    if (currentHtml === lastSavedHtmlRef.current) {
      return;
    }

    try {
      setStatus('saving');

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_html: currentHtml,
          preview_html: currentPreviewHtml,
          status: 'draft',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to auto-save post draft');
      }

      lastSavedHtmlRef.current = currentHtml;
      setStatus('saved');
      setLastSavedAt(new Date());
    } catch (error) {
      console.error('Auto-save background sync error:', error);
      setStatus('error');
    }
  };

  // 1. Debounced save trigger: executes 2s after last keystroke/change
  useEffect(() => {
    if (!postId || !enabled || !html) {
      return;
    }

    // Set saving state early to give immediate user response
    if (html !== lastSavedHtmlRef.current) {
      setStatus('saving');
    }

    const timer = setTimeout(() => {
      saveDraft();
    }, 2000);

    return () => clearTimeout(timer);
  }, [html, postId, enabled]);

  // 2. Interval save trigger: background cleanup save every 30 seconds
  useEffect(() => {
    if (!postId || !enabled) {
      return;
    }

    const interval = setInterval(() => {
      saveDraft();
    }, 30000);

    return () => clearInterval(interval);
  }, [postId, enabled]);

  return {
    status,
    lastSavedAt,
    saveDraft,
  };
}
