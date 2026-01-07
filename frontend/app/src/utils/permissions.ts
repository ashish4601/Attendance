import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

/**
 * Request camera permission
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access in settings to use this feature.'
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Camera permission error:', error);
    return false;
  }
}

/**
 * Request location permission
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'Please enable location access in settings to mark attendance.'
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Location permission error:', error);
    return false;
  }
}

/**
 * Get current location
 */
export async function getCurrentLocation(): Promise<{
  lat: number;
  lng: number;
  accuracy: number;
} | null> {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return null;
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    
    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      accuracy: location.coords.accuracy ?? 0,
    };
  } catch (error) {
    console.error('Location error:', error);
    return null;
  }
}
