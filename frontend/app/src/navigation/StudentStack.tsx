import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

import ProfileScreen from '@/app/src/screens/common/ProfileScreen';
import UpdateProfileScreen from '@/app/src/screens/common/UpdateProfileScreen';
import ActiveSessionScreen from '@/app/src/screens/student/ActiveSessionScreen';
import AttendanceHistoryScreen from '@/app/src/screens/student/AttendanceHistoryScreen';
import ClassDetailScreen from '@/app/src/screens/student/ClassDetailScreen';
import FaceEnrollScreen from '@/app/src/screens/student/FaceEnrollScreen';
import MarkAttendanceScreen from '@/app/src/screens/student/MarkAttendanceScreen';
import MyClassesScreen from '@/app/src/screens/student/MyClassesScreen';
import StudentHomeScreen from '@/app/src/screens/student/StudentHomeScreen';

export type StudentStackParamList = {
  StudentHome: undefined;
  MyClasses: undefined;
  ClassDetail: { classId: string; name: string; description?: string };
  ActiveSession: { classId: string; name: string };
  FaceEnroll: undefined;
  MarkAttendance: { classId: string; sessionId: string };
  AttendanceHistory: undefined;
  Profile: undefined;
  UpdateProfile: undefined;
};

const Stack = createNativeStackNavigator<StudentStackParamList>();

export default function StudentStack() {
  return (
    <Stack.Navigator
      initialRouteName="StudentHome"
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
        name="StudentHome"
        component={StudentHomeScreen}
        options={{ title: 'Home' }}
      />
      <Stack.Screen
        name="MyClasses"
        component={MyClassesScreen}
        options={{ title: 'My Classes' }}
      />
      <Stack.Screen
        name="ClassDetail"
        component={ClassDetailScreen}
        options={({ route }) => ({ title: route.params.name })}
      />
      <Stack.Screen
        name="ActiveSession"
        component={ActiveSessionScreen}
        options={{ title: 'Active Session' }}
      />
      <Stack.Screen
        name="FaceEnroll"
        component={FaceEnrollScreen}
        options={{ title: 'Face Enrollment' }}
      />
      <Stack.Screen
        name="MarkAttendance"
        component={MarkAttendanceScreen}
        options={{ title: 'Mark Attendance' }}
      />
      <Stack.Screen
        name="AttendanceHistory"
        component={AttendanceHistoryScreen}
        options={{ title: 'Attendance History' }}
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
