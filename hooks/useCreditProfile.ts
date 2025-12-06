import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as profileService from '@/services/profileService';

interface UseCreditProfileReturn {
  profile: profileService.UserProfileResponse | null;
  experianData: profileService.ExperianScoreResponse | null;
  recommendations: profileService.RecommendationResponse | null;
  businessId: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCreditProfile(): UseCreditProfileReturn {
  const { getToken, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<profileService.UserProfileResponse | null>(null);
  const [experianData, setExperianData] = useState<profileService.ExperianScoreResponse | null>(null);
  const [recommendations, setRecommendations] = useState<profileService.RecommendationResponse | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!isAuthenticated) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

      try {
        const tokenToUse = await getToken();

        if (!tokenToUse) {
          throw new Error('No authentication token available. Please log in again.');
        }

        const data = await profileService.getCreditProfileAndRecommendations(tokenToUse);
      
        console.log('✅ Credit profile data received:', {
          hasProfile: !!data.profile,
          hasExperianData: !!data.experianData,
          hasRecommendations: !!data.recommendations,
          businessId: data.businessId,
          experianDataStructure: data.experianData ? {
            hasData: !!data.experianData.data,
            hasScore: !!data.experianData.score,
            hasCreditScore: !!data.experianData.creditScore,
            topLevelKeys: Object.keys(data.experianData),
          } : null,
        });
      
        setProfile(data.profile);
        setExperianData(data.experianData);
        setRecommendations(data.recommendations);
        setBusinessId(data.businessId);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch credit profile';
      console.error('❌ Error fetching credit profile:', errorMessage, err);
      setError(errorMessage);
      // Don't prevent the app from working - set empty data
      setProfile(null);
      setExperianData(null);
      setRecommendations(null);
      setBusinessId(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  return {
    profile,
    experianData,
    recommendations,
    businessId,
    isLoading,
    error,
    refresh: fetchData,
  };
}

