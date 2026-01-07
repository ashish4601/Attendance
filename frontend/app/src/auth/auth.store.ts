import { setAccessToken } from '@/app/src/api/httpClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User } from './auth.types';

const STORAGE_KEYS = {
  USER: '@attendance_user',
  ACCESS_TOKEN: '@attendance_access_token',
  REFRESH_TOKEN: '@attendance_refresh_token',
};

/**
 * Save authentication state to AsyncStorage
 */
export async function saveAuthState(
  user: User,
  accessToken: string,
  refreshToken: string
): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
      AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
      AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
    ]);
    setAccessToken(accessToken);
  } catch (error) {
    console.error('Failed to save auth state:', error);
    throw error;
  }
}

/**
 * Load authentication state from AsyncStorage
 */
export async function loadAuthState(): Promise<AuthState> {
  try {
    const [userJson, accessToken, refreshToken] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.USER),
      AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
      AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
    ]);

    if (userJson && accessToken && refreshToken) {
      const user = JSON.parse(userJson) as User;
      setAccessToken(accessToken);
      return {
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      };
    }

    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    };
  } catch (error) {
    console.error('Failed to load auth state:', error);
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    };
  }
}

/**
 * Update user in storage
 */
export async function updateStoredUser(user: User): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
}

/**
 * Update access token in storage
 */
export async function updateStoredAccessToken(accessToken: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    setAccessToken(accessToken);
  } catch (error) {
    console.error('Failed to update access token:', error);
    throw error;
  }
}

/**
 * Clear authentication state from AsyncStorage
 */
export async function clearAuthState(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
      AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
    setAccessToken(null);
  } catch (error) {
    console.error('Failed to clear auth state:', error);
    throw error;
  }
}
