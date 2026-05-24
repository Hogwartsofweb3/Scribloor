import { Node, mergeAttributes } from '@tiptap/core';

export const PaywallBreak = Node.create({
  name: 'paywallBreak',
  group: 'block',
  atom: true,
  draggable: true,

  parseHTML() {
    return [
      {
        tag: 'paywall-break',
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ['paywall-break', mergeAttributes(HTMLAttributes)];
  },

  addCommands() {
    return {
      insertPaywallBreak:
        () =>
        ({ commands, state }: { commands: any; state: any }) => {
          let exists = false;
          state.doc.descendants((node: any) => {
            if (node.type.name === this.name) {
              exists = true;
            }
          });
          if (exists) {
            return false;
          }
          return commands.insertContent({ type: this.name });
        },
    };
  },

  addNodeView() {
    return () => {
      const dom = document.createElement('div');
      dom.className = 'paywall-break-node my-8 flex items-center justify-center select-none';
      dom.contentEditable = 'false';

      const wrapper = document.createElement('div');
      wrapper.className = 'flex items-center gap-3 w-full py-2';

      const line1 = document.createElement('div');
      line1.className = 'flex-grow border-t border-dashed border-amber-500/40';

      const text = document.createElement('span');
      text.className = 'px-4 py-1 text-xs font-bold uppercase tracking-widest text-amber-500 bg-zinc-950 border border-amber-500/30 rounded-full whitespace-nowrap shadow-md shadow-amber-500/10';
      text.innerText = '🔒 Subscriber content below this line';

      const line2 = document.createElement('div');
      line2.className = 'flex-grow border-t border-dashed border-amber-500/40';

      wrapper.appendChild(line1);
      wrapper.appendChild(text);
      wrapper.appendChild(line2);
      dom.appendChild(wrapper);

      return {
        dom,
      };
    };
  },
});
