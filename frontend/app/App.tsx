import RootNavigator from '@/app/src/navigation/RootNavigator';
import { NavigationIndependentTree } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import 'react-native-gesture-handler';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      {/* Isolate our NavigationContainer to avoid nesting with Expo Router */}
      <NavigationIndependentTree>
        <RootNavigator />
      </NavigationIndependentTree>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
});
