import React, { createContext, useContext, ReactNode, useState, useEffect, useRef, useCallback } from 'react';
// CLERK CODE COMMENTED OUT - Using internal API only
// import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as internalAuthService from '@/services/internalAuthService';
import { getUserProfile } from '@/services/profileService';
import { mockUserProfile } from '@/data/mockBusinessData';

const TOKEN_KEY = '@internal_auth_token';
const USER_KEY = '@internal_auth_user';
const TOKEN_TIMESTAMP_KEY = '@internal_auth_token_timestamp';
const TOKEN_EXPIRY_MINUTES = 11; // Token expires after 11 minutes
const REFRESH_INTERVAL_MINUTES = 10; // Refresh token every 10 minutes (1 minute before expiry)

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null | undefined;
  user: any;
  token: string | null;
  getToken: () => Promise<string | null>;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // CLERK CODE COMMENTED OUT
  // const { isSignedIn, userId, signOut: clerkSignOut, getToken: clerkGetToken } = useClerkAuth();
  // const { user, isLoaded } = useUser();
  
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tokenRef = useRef<string | null>(null);

  // Setup automatic token refresh
  const setupTokenRefresh = useCallback((currentToken: string) => {
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Update token ref
    tokenRef.current = currentToken;
    
    // Set up new interval to refresh token every REFRESH_INTERVAL_MINUTES
    refreshIntervalRef.current = setInterval(async () => {
      // Use the token from ref, which will be updated when token changes
      if (tokenRef.current) {
        try {
          const newToken = await refreshTokenSilently(tokenRef.current);
          // Update the ref with the new token
          if (newToken) {
            tokenRef.current = newToken;
          }
        } catch (error) {
          console.error('❌ Automatic token refresh failed:', error);
        }
      }
    }, REFRESH_INTERVAL_MINUTES * 60 * 1000);
  }, []);

  // Function to refresh token silently
  const refreshTokenSilently = async (currentToken: string) => {
    try {
      console.log('🔄 Refreshing authentication token...');
      const data = await internalAuthService.refreshToken(currentToken);
      
      const newToken =
        data.token ||
        data.accessToken ||
        data.access_token ||
        data.data?.token ||
        data.data?.accessToken ||
        data.data?.access_token ||
        null;

      if (!newToken) {
        throw new Error('Token refresh succeeded but no token returned');
      }

      setToken(newToken);
      tokenRef.current = newToken; // Update token ref
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      await AsyncStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
      
      console.log('✅ Token refreshed successfully');
      
      // Set up next refresh
      setupTokenRefresh(newToken);
      
      return newToken;
    } catch (error: any) {
      console.error('❌ Token refresh failed:', error);
      // If refresh fails, clear token and state (avoid calling signOut to prevent circular dependency)
      setToken(null);
      setUser(null);
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      try {
        await Promise.all([
          AsyncStorage.removeItem(TOKEN_KEY),
          AsyncStorage.removeItem(USER_KEY),
          AsyncStorage.removeItem(TOKEN_TIMESTAMP_KEY),
        ]);
      } catch (storageError) {
        console.error('⚠️ Failed to clear stored auth state:', storageError);
      }
      throw error;
    }
  };

  // Load stored token on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const [storedToken, storedUser, tokenTimestamp] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(TOKEN_TIMESTAMP_KEY),
        ]);

        if (storedToken) {
          setToken(storedToken);
          tokenRef.current = storedToken; // Update token ref
          
          // Check if token needs immediate refresh
          if (tokenTimestamp) {
            const timestamp = parseInt(tokenTimestamp, 10);
            const now = Date.now();
            const elapsedMinutes = (now - timestamp) / (1000 * 60);
            
            if (elapsedMinutes >= TOKEN_EXPIRY_MINUTES) {
              // Token expired, try to refresh
              console.log('🔄 Token expired, attempting refresh...');
              try {
                await refreshTokenSilently(storedToken);
              } catch (error) {
                console.error('❌ Failed to refresh expired token:', error);
              }
            } else {
              // Token still valid, set up refresh timer
              const minutesUntilRefresh = REFRESH_INTERVAL_MINUTES - elapsedMinutes;
              if (minutesUntilRefresh > 0) {
                const msUntilRefresh = minutesUntilRefresh * 60 * 1000;
                setTimeout(() => {
                  refreshTokenSilently(storedToken).catch(err => {
                    console.error('❌ Scheduled token refresh failed:', err);
                  });
                }, msUntilRefresh);
              } else {
                // Refresh immediately
                refreshTokenSilently(storedToken).catch(err => {
                  console.error('❌ Immediate token refresh failed:', err);
                });
              }
              // Also set up interval for future refreshes
              setupTokenRefresh(storedToken);
            }
          } else {
            // No timestamp, set up refresh from now
            await AsyncStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
            setupTokenRefresh(storedToken);
          }
        }
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('❌ Failed to load stored auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // CLERK CODE COMMENTED OUT
  // // Get and cache the token when authenticated
  // useEffect(() => {
  //   if (isSignedIn && clerkGetToken) {
  //     clerkGetToken()
  //       .then((t) => {
  //         setToken(t);
  //         if (t) {
  //           console.log('🔑 Authentication Token Retrieved:');
  //           console.log('Token:', t);
  //           console.log('Token Length:', t.length);
  //           console.log('Token Preview:', t.substring(0, 50) + '...');
  //         }
  //       })
  //       .catch((error) => {
  //         console.error('❌ Error retrieving token:', error);
  //         setToken(null);
  //       });
  //   } else {
  //     setToken(null);
  //     if (!isSignedIn) {
  //       console.log('🔓 User signed out - token cleared');
  //     }
  //   }
  // }, [isSignedIn, clerkGetToken]);

  const getToken = async (): Promise<string | null> => {
    if (!token) {
      return null;
    }

    // Check if token needs refresh before returning
    try {
      const tokenTimestamp = await AsyncStorage.getItem(TOKEN_TIMESTAMP_KEY);
      if (tokenTimestamp) {
        const timestamp = parseInt(tokenTimestamp, 10);
        const now = Date.now();
        const elapsedMinutes = (now - timestamp) / (1000 * 60);
        
        // If token is close to expiry (within 1 minute), refresh it
        if (elapsedMinutes >= REFRESH_INTERVAL_MINUTES) {
          console.log('🔄 Token close to expiry, refreshing before use...');
          const newToken = await refreshTokenSilently(token);
          return newToken;
        }
      }
    } catch (error) {
      console.error('❌ Error checking token expiry:', error);
      // Return current token even if refresh check fails
    }

    return token;
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('🔐 Logging into internal API...');
      const data = await internalAuthService.loginInternal(email, password);
      const internalTokenValue =
        data.token ||
        data.accessToken ||
        data.access_token ||
        data.data?.token ||
        data.data?.accessToken ||
        data.data?.access_token ||
        null;

      if (!internalTokenValue) {
        throw new Error('Login succeeded but no token returned from internal API');
      }

      setToken(internalTokenValue);
      tokenRef.current = internalTokenValue; // Update token ref
      await AsyncStorage.setItem(TOKEN_KEY, internalTokenValue);
      await AsyncStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
      
      // Set up automatic token refresh
      setupTokenRefresh(internalTokenValue);
      
      console.log('✅ Internal API login successful. Token length:', internalTokenValue.length);
      console.log('Token preview:', internalTokenValue.substring(0, 50) + '...');

      // Fetch user profile
      try {
        const profile = await getUserProfile(internalTokenValue);
        setUser(profile.data || null);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(profile.data || null));
        console.log('👤 Profile loaded for user:', profile.data?.email || email);
        console.log('🏢 Business data:', profile.data?.business?.[0]?.name || 'No business data');
      } catch (profileError) {
        console.warn('⚠️ Unable to fetch user profile after login, using mock data:', profileError);
        // Use mock data as fallback
        setUser(mockUserProfile as any);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(mockUserProfile));
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    console.log('🔓 Signing out user...');
    if (token) {
      console.log('Token before signout:', token.substring(0, 50) + '...');
    }
    
    // Clear refresh interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
        AsyncStorage.removeItem(TOKEN_TIMESTAMP_KEY),
      ]);
    } catch (error) {
      console.error('⚠️ Failed to clear stored auth state:', error);
    }
    
    setToken(null);
    setUser(null);
    console.log('✅ User signed out successfully - token cleared');
    
    // CLERK CODE COMMENTED OUT
    // await clerkSignOut();
  };

  // CLERK CODE COMMENTED OUT
  // const loginInternal = async (email: string, password: string): Promise<string | null> => {
  //   try {
  //     console.log('🔐 Logging into internal API...');
  //     const data = await internalAuthService.loginInternal(email, password);
  //     const internalTokenValue =
  //       data.token ||
  //       data.accessToken ||
  //       data.access_token ||
  //       data.data?.token ||
  //       data.data?.accessToken ||
  //       data.data?.access_token ||
  //       null;
  //
  //     if (!internalTokenValue) {
  //       console.warn('⚠️ Internal login did not return a token. Response:', data);
  //       return null;
  //     }
  //
  //     setInternalToken(internalTokenValue);
  //     console.log('✅ Internal API token stored (length:', internalTokenValue.length, ')');
  //     console.log('Token preview:', internalTokenValue.substring(0, 50) + '...');
  //     return internalTokenValue;
  //   } catch (error) {
  //     console.error('❌ Internal login failed:', error);
  //     throw error;
  //   }
  // };
  //
  // const getInternalToken = async (): Promise<string | null> => {
  //   if (!internalToken) {
  //     console.warn('⚠️ Internal token not available. Ensure internal login has completed.');
  //   }
  //   return internalToken;
  // };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        isLoading,
        userId: user?.id || null,
        user,
        token,
        getToken,
        login,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
