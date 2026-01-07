import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

import AddStudentToClassScreen from '@/app/src/screens/admin/AddStudentToClassScreen';
import AdminHomeScreen from '@/app/src/screens/admin/AdminHomeScreen';
import CreateClassScreen from '@/app/src/screens/admin/CreateClassScreen';
import CreateSessionScreen from '@/app/src/screens/admin/CreateSessionScreen';
import CreateUserScreen from '@/app/src/screens/admin/CreateUserScreen';
import ForceEndSessionScreen from '@/app/src/screens/admin/ForceEndSessionScreen';
import SessionAttendanceScreen from '@/app/src/screens/admin/SessionAttendanceScreen';
import ProfileScreen from '@/app/src/screens/common/ProfileScreen';
import UpdateProfileScreen from '@/app/src/screens/common/UpdateProfileScreen';

export type AdminStackParamList = {
  AdminHome: undefined;
  CreateUser: undefined;
  CreateClass: undefined;
  AddStudentToClass: undefined;
  CreateSession: undefined;
  ForceEndSession: undefined;
  SessionAttendance: undefined;
  Profile: undefined;
  UpdateProfile: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminStack() {
  return (
    <Stack.Navigator
      initialRouteName="AdminHome"
      screenOptions={({ navigation }) => ({
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '600' },
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Text style={{ color: '#3B82F6', fontWeight: '600' }}>Profile</Text>
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{ title: 'Admin Dashboard' }}
      />
      <Stack.Screen
        name="CreateUser"
        component={CreateUserScreen}
        options={{ title: 'Create User' }}
      />
      <Stack.Screen
        name="CreateClass"
        component={CreateClassScreen}
        options={{ title: 'Create Class' }}
      />
      <Stack.Screen
        name="AddStudentToClass"
        component={AddStudentToClassScreen}
        options={{ title: 'Add Student to Class' }}
      />
      <Stack.Screen
        name="CreateSession"
        component={CreateSessionScreen}
        options={{ title: 'Create Session' }}
      />
      <Stack.Screen
        name="ForceEndSession"
        component={ForceEndSessionScreen}
        options={{ title: 'Force End Session' }}
      />
      <Stack.Screen
        name="SessionAttendance"
        component={SessionAttendanceScreen}
        options={{ title: 'Session Attendance' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="UpdateProfile"
        component={UpdateProfileScreen}
        options={{ title: 'Update Profile' }}
      />
    </Stack.Navigator>
  );
}
