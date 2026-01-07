import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '@/app/src/screens/auth/LoginScreen';
import RegisterStudentScreen from '@/app/src/screens/auth/RegisterStudentScreen';

export type AuthStackParamList = {
  Login: undefined;
  RegisterStudent: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RegisterStudent"
        component={RegisterStudentScreen}
        options={{ title: 'Register' }}
      />
    </Stack.Navigator>
  );
}