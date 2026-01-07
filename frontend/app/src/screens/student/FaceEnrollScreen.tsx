import { enrollFaceByImage, getFaceEnrollmentStatus } from '@/app/src/api/faceData.api';
import { getErrorMessage } from '@/app/src/utils/errors';
import { Ionicons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function FaceEnrollScreen() {
  const [checking, setChecking] = useState(false);
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const cameraRef = useRef<CameraView>(null);


  const checkStatus = useCallback(async () => {
    setChecking(true);
    try {
      const res = await getFaceEnrollmentStatus();
      setEnrolled(res.isEnrolled);
    } catch (e) {
      console.log('Check status error', e);
      setEnrolled(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleEnroll = () => {
    if (enrolled) {
      Alert.alert('Already Enrolled', 'Your face data is already registered.');
      return;
    }
    setShowScanner(true);
    setEnrolling(true);
  };

  const captureAndEnroll = async () => {
    try {
      if (!cameraRef.current) return;
      const photo = await (cameraRef.current as any).takePictureAsync?.({ base64: true, quality: 0.6 });
      if (!photo?.base64) throw new Error('Failed to capture image');
      await enrollFaceByImage(photo.base64);
      setEnrolled(true);
      setShowScanner(false);
      Alert.alert('Success', 'Face enrolled successfully!');
    } catch (e) {
      Alert.alert('Enrollment Failed', getErrorMessage(e));
      setShowScanner(false);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <View style={styles.container}>
        <View style={styles.contentCard}>
          {showScanner ? (
            <View style={{ width: '100%', height: 300, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
              <CameraView style={{ flex: 1 }} facing="front" ref={cameraRef} />
              <TouchableOpacity onPress={captureAndEnroll} style={{ position: 'absolute', bottom: 12, alignSelf: 'center', backgroundColor: '#111827', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 9999 }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Capture</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Local embedding removed; server-side enrollment in use */}

          <View style={[styles.iconContainer, enrolled ? styles.iconContainerSuccess : styles.iconContainerNeutral]}>
            <Ionicons name={enrolled ? 'checkmark-circle' : 'scan-outline'} size={64} color={enrolled ? '#059669' : '#4F46E5'} />
          </View>

          <Text style={styles.title}>
            {checking ? 'Checking Status...' : enrolled ? 'Face Data Registered' : showScanner ? 'Align Your Face' : 'Face Enrollment'}
          </Text>

          <Text style={styles.description}>
            {enrolled
              ? 'You are all set! You can now use your face to check in to classes automatically.'
              : showScanner
              ? 'Center your face and tap Capture.'
              : 'Register your face data to enable automated attendance.'}
          </Text>

          {checking ? (
            <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.actionContainer}>
              {enrolled ? (
                <View style={styles.statusBadge}>
                  <Ionicons name="shield-checkmark" size={16} color="#059669" />
                  <Text style={styles.statusText}>Biometrics Active</Text>
                </View>
              ) : (
                <TouchableOpacity style={[styles.enrollButton, enrolling && styles.enrollButtonDisabled]} onPress={handleEnroll} disabled={enrolling}>
                  {enrolling ? (
                    <View style={styles.buttonContent}>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={styles.enrollButtonText}>Opening Camera...</Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Ionicons name="camera-outline" size={20} color="#fff" />
                      <Text style={styles.enrollButtonText}>Start Face Scan</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Ionicons name="lock-closed-outline" size={14} color="#9CA3AF" />
          <Text style={styles.footerText}>Your face data is encrypted and stored securely.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentCard: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconContainerNeutral: {
    backgroundColor: '#EEF2FF',
  },
  iconContainerSuccess: {
    backgroundColor: '#D1FAE5',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  enrollButton: {
    backgroundColor: '#4F46E5',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  enrollButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
