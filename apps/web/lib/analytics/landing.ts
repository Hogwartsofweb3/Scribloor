"use server";

import { db, landingEvents } from '@solscribe/db';
import { headers } from 'next/headers';

export type LandingEventType = 
  | 'hero_cta_click' 
  | 'calculator_interaction' 
  | 'pricing_view' 
  | 'vault_section_view';

/**
 * Tracks landing page events securely.
 * This is executed server-side via Server Actions to keep the frontend payload light and privacy-respecting.
 */
export async function trackLandingEvent(event: LandingEventType, metadata?: object): Promise<void> {
  try {
    const headersList = headers();
    const country = headersList.get('cf-ipcountry') || headersList.get('x-vercel-ip-country') || null;

    await db.insert(landingEvents).values({
      eventType: event,
      country,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
  } catch (error) {
    // We don't want analytics failures to break the UI
    console.error('[Analytics] Failed to track landing event:', error);
  }
}
