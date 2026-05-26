import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  beforeSend(event, hint) {
    const error = hint.originalException;
    if (error) {
      const message = error.toString().toLowerCase();
      
      if (message.includes('404') || message.includes('not found')) {
        return null;
      }
    }
    return event;
  },
});
