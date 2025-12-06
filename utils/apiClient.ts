import { useAuth } from '@/contexts/AuthContext';

/**
 * Helper function to make authenticated API calls with Clerk token
 * Usage example:
 * 
 * const { getToken } = useAuth();
 * const data = await fetchWithAuth('/api/endpoint', {
 *   method: 'POST',
 *   body: JSON.stringify({ ... })
 * }, getToken);
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  getToken: () => Promise<string | null>
): Promise<Response> {
  const token = await getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Example usage in a component:
 * 
 * import { useAuth } from '@/contexts/AuthContext';
 * import { fetchWithAuth } from '@/utils/apiClient';
 * 
 * function MyComponent() {
 *   const { getToken } = useAuth();
 *   
 *   const callAPI = async () => {
 *     try {
 *       const response = await fetchWithAuth(
 *         'https://api.example.com/data',
 *         { method: 'GET' },
 *         getToken
 *       );
 *       const data = await response.json();
 *       // Handle data
 *     } catch (error) {
 *       // Handle error
 *     }
 *   };
 * }
 */














