import { Node, mergeAttributes, nodePasteRule } from '@tiptap/core';

export const Twitter = Node.create({
  name: 'twitter',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      url: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'twitter-embed',
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ['twitter-embed', mergeAttributes(HTMLAttributes)];
  },

  addCommands() {
    return {
      setTweet:
        (options: { url: string }) =>
        ({ commands }: { commands: any }) => {
          if (!options.url) {
            return false;
          }
          return commands.insertContent({
            type: this.name,
            attrs: { url: options.url },
          });
        },
    };
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/\w+\/status\/(\d+)(?:\S+)?/g,
        type: this.type,
        getAttributes: (match: any) => ({ url: match[0] }),
      }),
    ];
  },

  addNodeView() {
    return ({ node }: { node: any }) => {
      const url = node.attrs.url;
      const dom = document.createElement('div');
      dom.className = 'twitter-embed-node my-6 max-w-lg mx-auto select-none';
      dom.contentEditable = 'false';

      // Design an incredibly beautiful dark-crypto card representation of the Tweet
      const card = document.createElement('a');
      card.href = url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.className = 'flex flex-col gap-3 p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 hover:border-zinc-700/80 transition-all duration-300 shadow-md decoration-none no-underline block cursor-pointer';

      const header = document.createElement('div');
      header.className = 'flex items-center justify-between';

      const userSection = document.createElement('div');
      userSection.className = 'flex items-center gap-3';

      const icon = document.createElement('div');
      icon.className = 'w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center font-bold text-sm text-zinc-100';
      
      // Try to parse the username from the URL
      let username = 'Tweet';
      try {
        const match = url.match(/(?:twitter|x)\.com\/(\w+)\/status/i);
        if (match && match[1]) {
          username = `@${match[1]}`;
        }
      } catch (e) {}
      icon.innerText = username.charAt(0).toUpperCase();

      const userText = document.createElement('div');
      userText.className = 'flex flex-col';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'text-sm font-semibold text-zinc-200';
      nameSpan.innerText = username;

      const platformSpan = document.createElement('span');
      platformSpan.className = 'text-xs text-zinc-500';
      platformSpan.innerText = 'Post on X';

      userText.appendChild(nameSpan);
      userText.appendChild(platformSpan);
      userSection.appendChild(icon);
      userSection.appendChild(userText);

      // SVG X Logo
      const logo = document.createElement('div');
      logo.className = 'text-zinc-400 w-5 h-5 flex items-center justify-center';
      logo.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" class="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>`;

      header.appendChild(userSection);
      header.appendChild(logo);

      const body = document.createElement('div');
      body.className = 'text-sm text-zinc-300 leading-relaxed break-words font-medium py-1';
      body.innerText = 'Click to open and view the dynamic post on X (formerly Twitter).';

      const footer = document.createElement('div');
      footer.className = 'text-xs text-amber-500/80 font-semibold flex items-center gap-1 border-t border-zinc-800/60 pt-3';
      footer.innerHTML = `<span>🔗</span> <span class="hover:underline">Open original tweet on x.com</span>`;

      card.appendChild(header);
      card.appendChild(body);
      card.appendChild(footer);
      dom.appendChild(card);

      return {
        dom,
      };
    };
  },
});
