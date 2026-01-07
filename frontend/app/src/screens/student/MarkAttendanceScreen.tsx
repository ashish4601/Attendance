import { markAttendanceByImage } from '@/app/src/api/attendance.api';
// Server-side vision only; local embedding removed
import type { StudentStackParamList } from '@/app/src/navigation/StudentStack';
import { getErrorMessage } from '@/app/src/utils/errors';
import { getCurrentLocation } from '@/app/src/utils/permissions';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraView } from 'expo-camera';
import React, { useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function MarkAttendanceScreen() {
  const route = useRoute<RouteProp<StudentStackParamList, 'MarkAttendance'>>();
  const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const { classId, sessionId } = route.params;
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'idle' | 'locating' | 'preparing' | 'submitting' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const pendingLocationRef = useRef<any>(null);

  const stepInfo = useMemo(() => {
    switch (step) {
      case 'locating':
        return { title: 'Verifying Location', icon: 'location-outline', desc: 'Checking if you are within range of the classroom...', color: '#4F46E5', bg: '#EEF2FF' };
      case 'preparing':
        return { title: 'Verifying Identity', icon: 'scan-outline', desc: 'Center your face and tap Capture.', color: '#F59E0B', bg: '#FFFBEB' };
      case 'submitting':
        return { title: 'Recording', icon: 'cloud-upload-outline', desc: 'Syncing your attendance record with the server...', color: '#6366F1', bg: '#EEF2FF' };
      case 'done':
        return { title: 'Check-In Complete', icon: 'checkmark-circle-outline', desc: 'Your attendance has been verified and recorded successfully.', color: '#10B981', bg: '#ECFDF5' };
      case 'error':
        return { title: 'Check-In Failed', icon: 'alert-circle-outline', desc: 'We couldn\'t verify your attendance.', color: '#EF4444', bg: '#FEF2F2' };
      default:
        return { title: 'Ready to Check In', icon: 'finger-print-outline', desc: 'Ensure you are in the classroom before starting.', color: '#4F46E5', bg: '#EEF2FF' };
    }
  }, [step]);

  const handleMark = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      setStep('locating');
      const location = await getCurrentLocation();
      if (!location) {
        setStep('error');
        setErrorMsg('Location permission is required to verify your presence in class.');
        return;
      }

      setStep('preparing');
      setShowScanner(true);
      // Store location to use after capture
      pendingLocationRef.current = location;
    } catch (e) {
      const msg = getErrorMessage(e);
      setStep('error');
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const captureAndSubmit = async () => {
    try {
      if (!cameraRef.current) return;
      const photo = await (cameraRef.current as any).takePictureAsync?.({ base64: true, quality: 0.6 });
      if (!photo?.base64) throw new Error('Failed to capture image');
      setStep('submitting');
      // Send raw base64 to server for face verification
      await markAttendanceByImage({
        classId,
        sessionId,
        faceImgBase64: photo.base64,
        blinkVerified: true,
        location: pendingLocationRef.current,
      });
      setShowScanner(false);
      setStep('done');
    } catch (e) {
      const msg = getErrorMessage(e);
      setErrorMsg(msg);
      setShowScanner(false);
      setStep('error');
    }
  };

  const isProcessing = ['locating', 'preparing', 'submitting'].includes(step);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <View style={styles.container}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attendance Check-In</Text>
          <View style={{ width: 40 }} /> 
        </View>

        <View style={styles.content}>
          {showScanner ? (
            <View style={{ width: '100%', height: 300, borderRadius: 24, overflow: 'hidden', marginBottom: 16 }}>
              <CameraView
                style={{ flex: 1 }}
                facing="front"
                ref={cameraRef}
              />
              <TouchableOpacity onPress={captureAndSubmit} style={{ position: 'absolute', bottom: 12, alignSelf: 'center', backgroundColor: '#111827', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 9999 }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Capture</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <View style={[styles.statusCard, { backgroundColor: stepInfo.bg, borderColor: stepInfo.color }]}> 
            <View style={[styles.iconContainer, { backgroundColor: '#ffffff' }]}>
              {/* @ts-ignore */}
              <Ionicons name={stepInfo.icon} size={48} color={stepInfo.color} />
            </View>
            <Text style={styles.stepTitle}>{stepInfo.title}</Text>
            <Text style={styles.stepDesc}>{showScanner && step === 'preparing' ? 'Center your face and tap Capture.' : stepInfo.desc}</Text>

            {step === 'error' && errorMsg && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {isProcessing && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={stepInfo.color} />
              </View>
            )}
          </View>
        </View>

        {/* Local embedding removed; server-side verification in use */}

        <View style={styles.footer}>
          {step === 'done' ? (
            <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.popToTop()}>
              <Text style={styles.buttonText}>Return to Dashboard</Text>
            </TouchableOpacity>
          ) : step === 'error' ? (
            <TouchableOpacity style={[styles.primaryButton, styles.errorButton]} onPress={handleMark}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.primaryButton, isProcessing && styles.disabledButton]} 
              onPress={handleMark}
              disabled={isProcessing}
            >
              <Text style={styles.buttonText}>{isProcessing ? 'Processing...' : (showScanner ? 'Scanning...' : 'Verify & Check In')}</Text>
              {!isProcessing && <Ionicons name="arrow-forward" size={20} color="#ffffff" style={{marginLeft: 8}} />}
            </TouchableOpacity>
          )}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    width: '100%',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDesc: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  loaderContainer: {
    marginTop: 20,
  },
  footer: {
    marginTop: 40,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  errorButton: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

//
