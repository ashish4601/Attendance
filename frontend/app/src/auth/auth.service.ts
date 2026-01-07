import { ENDPOINTS } from '@/app/src/api/endpoints';
import { http } from '@/app/src/api/httpClient';
import { clearAuthState, saveAuthState, updateStoredAccessToken } from './auth.store';
import { LoginCredentials, LoginResponse, RefreshTokenResponse } from './auth.types';

/**
 * Login user
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await http.post<{ data: LoginResponse }>(
    ENDPOINTS.users.login,
    credentials
  );
  
  const { user, accessToken, refreshToken } = response.data.data;
  await saveAuthState(user, accessToken, refreshToken);
  
  return response.data.data;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await http.post(ENDPOINTS.users.logout, {});
  } catch (error) {
    console.error('Logout request failed:', error);
  } finally {
    await clearAuthState();
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const response = await http.post<{ data: RefreshTokenResponse }>(
    ENDPOINTS.users.refresh,
    { refreshToken }
  );
  
  const { accessToken, newrefreshToken } = response.data.data;
  
  // Update stored tokens
  await updateStoredAccessToken(accessToken);
  
 
  if (newrefreshToken) {
    // pass
  }
  
  return accessToken;
}
