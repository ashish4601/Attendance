import { getCurrentUser } from '@/app/src/api/users.api';
import { login, logout } from '@/app/src/auth/auth.service';
import { clearAuthState, loadAuthState, saveAuthState, updateStoredUser } from '@/app/src/auth/auth.store';
import type { User } from '@/app/src/auth/auth.types';
import { AuthContext, AuthContextValue } from '@/app/src/auth/context';
import { LoadingView } from '@/app/src/components/LoadingView';
import { clearAdminCache } from '@/app/src/utils/adminCache';
import { getErrorMessage } from '@/app/src/utils/errors';
import { NavigationContainer } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import AdminStack from './AdminStack';
import AuthStack from './AuthStack';
import StudentStack from './StudentStack';

export default function RootNavigator() {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const init = useCallback(async () => {
    try {
      const state = await loadAuthState();
      if (state.isAuthenticated && state.user) {
        setUser(state.user);
      }
    } catch (e) {
      console.warn('Failed to bootstrap auth state');
    } finally {
      setBooting(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { user: u, accessToken, refreshToken } = await login({ email, password });
      await saveAuthState(u, accessToken, refreshToken);
      setUser(u);
    } catch (e) {
      Alert.alert('Login Failed', getErrorMessage(e));
      throw e;
    }
  }, []);

  const signOut = useCallback(async () => {
     

  
    
    
    await logout();
    await clearAuthState();
    await clearAdminCache();
    setUser(null);
    
  }, []);


  const refreshUser = useCallback(async () => {
    try {
      const me = await getCurrentUser();
      await updateStoredUser(me);
      setUser(me);
    } catch (e) {
      console.warn('Failed to refresh user:', getErrorMessage(e));
    }
  }, []);

  const ctx = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    signIn,
    signOut,
    refreshUser,
  }), [user, signIn, signOut, refreshUser]);

  if (booting) return <LoadingView />;

  return (
    <AuthContext.Provider value={ctx}>
      <NavigationContainer>
        {!user ? (
          <AuthStack />
        ) : user.role === 'student' ? (
          <StudentStack />
        ) : (
          <AdminStack />
        )}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
