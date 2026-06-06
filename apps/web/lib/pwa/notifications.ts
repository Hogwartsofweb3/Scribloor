export function getVapidPublicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToWebPush(): Promise<PushSubscription | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Web Push] Browser does not support service workers or push notifications');
    return null;
  }

  try {
    // 1. Check & request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[Web Push] Notification permission not granted:', permission);
      return null;
    }

    // 2. Await service worker readiness
    const registration = await navigator.serviceWorker.ready;

    // 3. Retrieve VAPID Key
    const vapidKey = getVapidPublicKey();
    if (!vapidKey) {
      console.error('[Web Push] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured');
      return null;
    }

    // 4. Subscribe client to push cluster
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    // 5. Send subscription info to database endpoint
    const res = await fetch('/api/notifications/web-push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription }),
    });

    if (!res.ok) {
      throw new Error(`Failed to store subscription: ${res.statusText}`);
    }

    return subscription;
  } catch (err) {
    console.error('[Web Push] Error during subscription registration:', err);
    return null;
  }
}
