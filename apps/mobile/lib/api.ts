import { usePrivy } from '@privy-io/expo';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Custom hook to use an authenticated API client.
 * Automatically attaches the user's Privy authorization token if they are logged in.
 */
export function useApiClient() {
  const { getAccessToken } = usePrivy();

  const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    
    // Automatically attach auth token if available
    try {
      const token = await getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    } catch (e) {
      console.log('Failed to get access token for API request', e);
    }

    headers.set('Content-Type', 'application/json');

    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    return response.json();
  };

  return { fetchApi };
}
