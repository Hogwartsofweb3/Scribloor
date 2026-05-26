import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  beforeSend(event, hint) {
    const error = hint.originalException;
    if (error) {
      const message = error.toString().toLowerCase();
      
      // Ignore 404s and user-cancelled wallet transactions
      if (
        message.includes('404') || 
        message.includes('user rejected') || 
        message.includes('user cancelled') ||
        message.includes('not found')
      ) {
        return null;
      }

      // Map common Solana errors
      if (message.includes('0x1') || message.includes('insufficient funds')) {
        if (event.exception?.values?.[0]) {
          event.exception.values[0].value = 'Solana Error: Insufficient funds for transaction';
        }
      }
      
      if (message.includes('0x1771') || message.includes('exceeded maximum number of instructions')) {
        if (event.exception?.values?.[0]) {
          event.exception.values[0].value = 'Solana Error: Transaction exceeded max instructions';
        }
      }
    }
    return event;
  },
});
