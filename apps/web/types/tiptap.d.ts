import '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paywallBreak: {
      /**
       * Inserts a paywall break divider.
       */
      insertPaywallBreak: () => ReturnType;
    };
    twitter: {
      /**
       * Inserts an X/Twitter embed card.
       */
      setTweet: (options: { url: string }) => ReturnType;
    };
  }
}
