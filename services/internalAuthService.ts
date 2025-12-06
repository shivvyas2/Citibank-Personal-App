const API_BASE_URL = 'https://staging.futeur.app/api/v1';

export interface InternalLoginResponse {
  message?: string;
  token?: string;
  accessToken?: string;
  access_token?: string;
  data?: {
    token?: string;
    accessToken?: string;
    access_token?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export async function loginInternal(email: string, password: string): Promise<InternalLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Internal login failed');
  }

  return response.json();
}

export interface RefreshTokenResponse {
  token?: string;
  accessToken?: string;
  access_token?: string;
  data?: {
    token?: string;
    accessToken?: string;
    access_token?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export async function refreshToken(currentToken: string): Promise<RefreshTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${currentToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Token refresh failed');
  }

  return response.json();
}




