const API_BASE_URL = 'https://staging.futeur.app/api/v1';

// Import mock data
import { mockUserProfile, type MockUserProfile } from '@/data/mockBusinessData';
import { mockExperianScoreData } from '@/data/mockCreditData';

// Flag to use mock data (set to true to use mocks)
const USE_MOCK_DATA = false; // Set to false to show "business not found" errors
const USE_MOCK_CREDIT_DATA = true; // Set to true to use mock credit scores

export interface UserProfileResponse {
  message?: string;
  data?: {
    id: string;
    clerkId?: string;
    email?: string;
    business?: Array<{
      id: string;
      name?: string;
      [key: string]: any;
    }>;
    [key: string]: any;
  };
}

export interface ExperianScoreResponse {
  message?: string;
  data?: {
    scoreInformation?: {
      fsrScore?: {
        score?: number;
        [key: string]: any;
      };
      commercialScore?: {
        score?: number;
        [key: string]: any;
      };
      [key: string]: any;
    };
    expandedCreditSummary?: {
      activeTradelineCount?: number;
      allTradelineBalance?: number;
      currentDbt?: number;
      collectionCount?: number;
      [key: string]: any;
    };
    [key: string]: any;
  };
  businessId?: string;
  score?: number;
  creditScore?: number;
  experianData?: any;
  [key: string]: any;
}

export interface RecommendationResponse {
  message?: string;
  recommendations?: any[];
  businessId?: string;
  [key: string]: any;
}

/**
 * Fetch user profile to get businessId
 * Requires authentication token
 */
export async function getUserProfile(token: string): Promise<UserProfileResponse> {
  // Use mock data if enabled
  if (USE_MOCK_DATA) {
    console.log('📋 Using mock business data');
    return {
      message: 'User found',
      data: mockUserProfile as any,
    };
  }

  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // Fallback to mock data on error if enabled
    if (USE_MOCK_DATA) {
      console.log('⚠️ API failed, using mock business data as fallback');
      return {
        message: 'User found',
        data: mockUserProfile as any,
      };
    }
    throw new Error(errorData.message || 'Failed to fetch user profile');
  }

  return await response.json();
}

/**
 * Fetch Experian credit score and profile data
 * Requires authentication token
 */
export async function getExperianScore(token: string): Promise<ExperianScoreResponse> {
  // Use mock credit data if enabled
  if (USE_MOCK_CREDIT_DATA) {
    console.log('📊 Using mock Experian credit score data');
    return mockExperianScoreData;
  }

  console.log('📊 Fetching Experian score...');
  console.log('📍 URL:', `${API_BASE_URL}/crs-credit/experian/score`);
  
  const response = await fetch(`${API_BASE_URL}/crs-credit/experian/score`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ Experian Score API Request Failed:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
    });
    
    // Fallback to mock data on error if enabled
    if (USE_MOCK_CREDIT_DATA) {
      console.log('⚠️ API failed, using mock credit score data as fallback');
      return mockExperianScoreData;
    }
    
    throw new Error(errorData.message || 'Failed to fetch Experian score');
  }

  const responseData = await response.json();
  
  // Log the response structure to debug
  console.log('✅ Experian Score API Response Received:');
  console.log('📥 Response Structure:', {
    hasData: !!responseData.data,
    hasScoreInformation: !!responseData.data?.scoreInformation,
    hasCommercialScore: !!responseData.data?.scoreInformation?.commercialScore,
    hasFsrScore: !!responseData.data?.scoreInformation?.fsrScore,
    commercialScore: responseData.data?.scoreInformation?.commercialScore?.score,
    fsrScore: responseData.data?.scoreInformation?.fsrScore?.score,
    topLevelScore: responseData.score,
    topLevelCreditScore: responseData.creditScore,
    businessId: responseData.businessId,
  });
  
  return responseData;
}

/**
 * Get business card recommendations
 * @param token - Authentication token
 * @param businessId - Optional business ID. If not provided, uses general recommendations endpoint
 */
export async function getRecommendations(
  token: string,
  businessId?: string
): Promise<RecommendationResponse> {
  const url = businessId
    ? `${API_BASE_URL}/recommendations/${businessId}`
    : `${API_BASE_URL}/recommendations`;

  // Log the request
  console.log('📤 Sending Recommendations API Request:');
  console.log('📍 URL:', url);
  console.log('🔧 Method: GET');
  console.log('🔑 Authorization:', `Bearer ${token.substring(0, 20)}...`);
  console.log('📋 Business ID:', businessId || 'Not provided (general recommendations)');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // If business-specific endpoint returns 404, return empty recommendations instead of throwing
    // This allows the app to gracefully fall back to general recommendations or static cards
    if (response.status === 404 && businessId) {
      console.warn('⚠️ Business not found in recommendations service (404). Business may not be set up yet.');
      console.warn('📋 Business ID:', businessId);
      console.warn('💡 Returning empty recommendations - app will use static cards as fallback');
      return {
        message: 'Business not found in recommendations service',
        recommendations: [],
        businessId,
      };
    }
    
    console.error('❌ Recommendations API Request Failed:', {
      status: response.status,
      statusText: response.statusText,
      url,
      businessId,
      error: errorData,
    });
    throw new Error(errorData.message || 'Failed to fetch recommendations');
  }

  const responseData: RecommendationResponse = await response.json();
  
  // Log the response
  console.log('✅ Recommendations API Response Received:');
  console.log('📥 Full Response:', JSON.stringify(responseData, null, 2));
  console.log('📊 Response Summary:', {
    message: responseData.message,
    businessId: responseData.businessId,
    recommendationsCount: responseData.recommendations?.length || 0,
    score: responseData.score,
    recommendations: responseData.recommendations?.map((rec: any) => ({
      cardId: rec.cardId,
      cardName: rec.cardName,
      fitScore: rec.fitScore,
    })),
  });

  return responseData;
}

/**
 * Get both Experian score and recommendations in one call
 * Fetches profile first to get businessId, then uses it for personalized recommendations
 */
export async function getCreditProfileAndRecommendations(
  token: string
): Promise<{
  profile: UserProfileResponse;
  experianData: ExperianScoreResponse;
  recommendations: RecommendationResponse;
  businessId: string | null;
}> {
  console.log('🔄 Starting credit profile and recommendations fetch...');
  
  // First, fetch user profile to get businessId
  const profile = await getUserProfile(token);
  
  // Extract businessId from profile (use first business if multiple)
  const businessId = profile.data?.business?.[0]?.id || null;
  console.log('📋 Profile fetched - Business ID:', businessId);

  // Fetch Experian score and recommendations
  console.log('📊 Fetching Experian score and recommendations...');
  
  // Fetch Experian score (always fetch this)
  const experianDataPromise = getExperianScore(token);
  
  // Try to fetch recommendations
  let recommendations: RecommendationResponse;
  
  if (businessId) {
    try {
      // Try business-specific recommendations first
      recommendations = await getRecommendations(token, businessId);
      
      // If we got empty recommendations (404 was handled gracefully), try general endpoint
      if (!recommendations.recommendations || recommendations.recommendations.length === 0) {
        console.log('🔄 No business-specific recommendations, trying general recommendations...');
        try {
          recommendations = await getRecommendations(token);
          console.log('✅ General recommendations fetched successfully');
        } catch (generalError: any) {
          console.warn('⚠️ Failed to fetch general recommendations:', generalError.message);
          // Keep the empty business-specific response
        }
      }
    } catch (error: any) {
      // If business-specific endpoint fails with non-404 error, try general endpoint
      console.warn('⚠️ Business-specific recommendations failed, trying general recommendations:', error.message);
      try {
        recommendations = await getRecommendations(token);
        console.log('✅ General recommendations fetched successfully');
      } catch (generalError: any) {
        console.error('❌ Both business-specific and general recommendations failed');
        // Return empty recommendations as fallback
        recommendations = {
          message: 'Failed to fetch recommendations',
          recommendations: [],
          businessId,
        };
      }
    }
  } else {
    // No businessId, use general recommendations
    recommendations = await getRecommendations(token);
  }
  
  // Wait for Experian score to complete
  const experianData = await experianDataPromise;

  console.log('✅ Credit profile and recommendations fetch completed');
  return {
    profile,
    experianData,
    recommendations,
    businessId,
  };
}

/**
 * Track when a user applies for a recommended card
 * @param token - Authentication token
 * @param businessId - Business ID (used in the endpoint path)
 * @param cardId - The card ID from the recommendation
 * @param notes - Optional notes about the application
 * @param metadata - Optional metadata object
 */
export interface CardApplicationResponse {
  message: string;
  data: {
    id: string;
    businessId: string;
    cardId: string;
    status: string;
    fitScore?: number;
    reason?: string;
    suggestedUsage?: string;
    notes: string;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    card?: {
      id: string;
      name: string;
      brand?: string;
      network?: string | null;
      annualFee?: number | null;
      createdAt: string;
      updatedAt: string;
    };
  };
}

/**
 * Expected API Response Structure:
 * {
 *   "message": "Card application recorded",
 *   "data": {
 *     "id": "ffe5c44f-b061-4f59-9cb7-86f46b2bb0c2",
 *     "businessId": "5b1d0990-d47a-4dc3-8e3f-e81a92bb1f3d",
 *     "cardId": "149e1ee2-d30b-4769-b099-ea2b7b477183",
 *     "status": "APPLIED",
 *     "fitScore": 0.95,
 *     "reason": "...",
 *     "suggestedUsage": "...",
 *     "notes": "string",
 *     "metadata": {},
 *     "createdAt": "2025-11-13T03:11:41.395Z",
 *     "updatedAt": "2025-11-13T03:11:41.395Z",
 *     "card": {
 *       "id": "149e1ee2-d30b-4769-b099-ea2b7b477183",
 *       "name": "Ink Business Premier",
 *       "brand": "Ink",
 *       "network": null,
 *       "annualFee": null,
 *       "createdAt": "2025-11-07T07:50:21.198Z",
 *       "updatedAt": "2025-11-07T07:50:21.198Z"
 *     }
 *   }
 * }
 */

export async function trackCardApplication(
  token: string,
  businessId: string,
  cardId: string,
  notes?: string,
  metadata?: Record<string, any>
): Promise<CardApplicationResponse> {
  const url = `${API_BASE_URL}/recommendations/${businessId}/applications`;

  const requestBody = {
    cardId,
    status: 'APPLIED',
    notes: notes || '',
    metadata: metadata || {},
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to track card application');
  }

  const responseData: CardApplicationResponse = await response.json();
  return responseData;
}

