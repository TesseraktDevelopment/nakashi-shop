"use client";

import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? 'https://f3574c959a640fc943141029ba6b4e60@o4506077282762752.ingest.us.sentry.io/4506365263085568',
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    if (window.location.hostname === 'localhost') {
      return null;
    }
    return event;
  },
});
