"use client";

import React, { useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Terminal,
  Image as ImageIcon,
  Link as LinkIcon,
  Youtube,
  Twitter as TwitterIcon,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  editor: Editor | null;
  onImageUpload: (file: File) => Promise<string>;
}

export function EditorToolbar({ editor, onImageUpload }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) {
    return null;
  }

  // Check if a paywall break node already exists in the document
  let paywallBreakExists = false;
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'paywallBreak') {
      paywallBreakExists = true;
    }
  });

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate maximum file size of 15MB
    const MAX_SIZE_MB = 15;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`File size exceeds the ${MAX_SIZE_MB}MB limit. Please choose a smaller image.`);
      return;
    }

    try {
      const url = await onImageUpload(file);
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    // Cancelled
    if (url === null) {
      return;
    }

    // Empty -> remove link
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Insert/update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addYoutubeVideo = () => {
    const url = window.prompt('Enter YouTube Video URL:');
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  };

  const addTwitterEmbed = () => {
    const url = window.prompt('Enter Twitter/X Post URL (e.g. https://x.com/user/status/1234):');
    if (url) {
      editor.commands.setTweet({ url });
    }
  };

  const addPaywallBreak = () => {
    if (paywallBreakExists) {
      alert('Only one Paywall Break is allowed per post.');
      return;
    }
    editor.commands.insertPaywallBreak();
  };

  // Character and word counts
  const characters = editor.storage.characterCount?.characters() || 0;
  const words = editor.storage.characterCount?.words() || 0;

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    title,
    children,
    className,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-2 rounded-lg transition-all duration-200 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none',
        isActive && 'text-amber-500 bg-amber-500/10 hover:text-amber-400 hover:bg-amber-500/15',
        className
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-2 border border-zinc-800 rounded-t-xl bg-zinc-950/60 backdrop-blur-md select-none">
      <div className="flex flex-wrap items-center gap-1">
        {/* Basic Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strike"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-[1px] h-6 bg-zinc-800 mx-1" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-[1px] h-6 bg-zinc-800 mx-1" />

        {/* Lists & Blocks */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Terminal className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-[1px] h-6 bg-zinc-800 mx-1" />

        {/* Media & Embeds */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <ToolbarButton onClick={handleImageButtonClick} title="Upload Image">
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} title="Insert Link">
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton onClick={addYoutubeVideo} title="Embed YouTube Video">
          <Youtube className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton onClick={addTwitterEmbed} title="Embed Tweet">
          <TwitterIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-[1px] h-6 bg-zinc-800 mx-1" />

        {/* Paywall Break Node */}
        <ToolbarButton
          onClick={addPaywallBreak}
          disabled={paywallBreakExists}
          isActive={paywallBreakExists}
          title={paywallBreakExists ? "Paywall break already exists" : "Insert Paywall Break"}
          className={cn(
            'text-amber-500/80 hover:text-amber-400',
            !paywallBreakExists && 'border border-amber-500/25 bg-amber-500/5'
          )}
        >
          <Lock className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Character Count */}
      <div className="px-3 py-1 text-[11px] font-mono tracking-wider uppercase text-zinc-500 rounded bg-zinc-900 border border-zinc-800/80">
        <span className="font-semibold text-zinc-400">{words}</span> words
        <span className="mx-1 text-zinc-700">|</span>
        <span className="font-semibold text-zinc-400">{characters}</span> chars
      </div>
    </div>
  );
}
