"use client";

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Youtube from '@tiptap/extension-youtube';
import { createLowlight, common } from 'lowlight';

// Custom Extensions
import { PaywallBreak } from '@/lib/editor/extensions/PaywallBreak';
import { Twitter } from '@/lib/editor/extensions/Twitter';

// Editor Toolbar
import { EditorToolbar } from './EditorToolbar';

// Initialize Lowlight syntax highlighting
const lowlight = createLowlight(common);

interface PostEditorClientProps {
  initialContent?: string;
  onChange: (html: string, previewHtml: string) => void;
  onImageUpload: (file: File) => Promise<string>;
  readOnly?: boolean;
}

export default function PostEditorClient({
  initialContent = '',
  onChange,
  onImageUpload,
  readOnly = false,
}: PostEditorClientProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable default code block to prevent collision with lowlight syntax highlighter
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: 'Tell your story...',
        emptyNodeClass: 'before:content-[attr(data-placeholder)] before:float-left before:text-zinc-600 before:pointer-events-none before:h-0',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-amber-500 hover:text-amber-400 underline transition-colors cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl border border-zinc-800 mx-auto my-6 shadow-md max-w-full hover:border-zinc-700/80 transition-all',
        },
      }),
      CharacterCount,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm my-6 overflow-x-auto text-zinc-300',
        },
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: 'rounded-xl aspect-video w-full border border-zinc-800 my-6 shadow-lg max-w-2xl mx-auto',
        },
      }),
      PaywallBreak,
      Twitter,
    ],
    content: initialContent,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-amber max-w-none focus:outline-none min-h-[450px] p-6 text-zinc-200 font-sans leading-relaxed selection:bg-amber-500/25',
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      // Split the document at the PaywallBreak node representation
      const paywallBreakTag = '<paywall-break></paywall-break>';
      const parts = html.split(paywallBreakTag);
      const previewHtml = parts[0];

      onChange(html, previewHtml);
    },
  });

  // Keep read-only/editability sync'd dynamically
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [editor, readOnly]);

  return (
    <div className="flex flex-col border border-zinc-800 rounded-xl bg-zinc-900/10 backdrop-blur-sm shadow-xl hover:border-zinc-800/80 transition-colors overflow-hidden">
      {!readOnly && (
        <EditorToolbar editor={editor} onImageUpload={onImageUpload} />
      )}
      <div className="relative bg-zinc-900/20">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
