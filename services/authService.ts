const API_BASE_URL = 'https://staging.futeur.app/api/v1';

export interface LoginRequest {
  clerkId?: string;
  email: string;
  password: string;
  businessName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  yearFounded?: number;
  legalStruct?: string;
  empCount?: number;
  ownerFname?: string;
  ownerMname?: string;
  ownerLname?: string;
  ownerTitle?: string;
  userFname?: string;
  userLname?: string;
  phoneNum?: string;
  taxId?: string;
}

export interface SignupRequest {
  clerkId?: string;
  email: string;
  password: string;
  businessName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  yearFounded: number;
  legalStruct: string;
  empCount: number;
  ownerFname?: string;
  ownerMname?: string;
  ownerLname?: string;
  ownerTitle?: string;
  userFname?: string;
  userLname?: string;
  phoneNum?: string;
  taxId?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    email: string;
    clerkId?: string;
    [key: string]: any;
  };
}

export async function login(
  email: string,
  password: string,
  clerkId?: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      ...(clerkId && { clerkId }),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed');
  }

  const data = await response.json();
  return {
    token: data.token || data.accessToken || data.access_token,
    user: data.user || { email, clerkId },
  };
}

export async function signup(data: SignupRequest): Promise<AuthResponse> {
  // Use the login endpoint for signup since it accepts all signup fields
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Signup failed');
  }

  const responseData = await response.json();
  return {
    token: responseData.token || responseData.accessToken || responseData.access_token,
    user: responseData.user || { email: data.email, clerkId: data.clerkId },
  };
}

