import { getActiveSession } from '@/app/src/api/students.api';
import type { StudentStackParamList } from '@/app/src/navigation/StudentStack';
import { formatDateTime } from '@/app/src/utils/date';
import { getErrorMessage } from '@/app/src/utils/errors';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function ActiveSessionScreen() {
  const route = useRoute<RouteProp<StudentStackParamList, 'ActiveSession'>>();
  const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const { classId, name } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<null | {
    _id: string;
    startTime: string;
    endTime: string;
    geofence: { lat: number; lng: number; radius: number };
  }>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  const load = useCallback(async () => {
    setError(null);
    try {
      const s = await getActiveSession(classId);
      setSession(s);
    } catch (e) {
      const msg = getErrorMessage(e);
      setSession(null);
      setError(msg);
    
      if (refreshing) Alert.alert('Status could not be updated', msg);
    } finally {
      setLoading(false);
    }
  }, [classId, refreshing]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);


  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const countdown = useMemo(() => {
    if (!session) return null;
    const endMs = new Date(session.endTime).getTime();
    const diff = endMs - now;
    const clamped = Math.max(diff, 0);
    const totalSeconds = Math.floor(clamped / 1000);
    const h = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, '0');
    return `${h}:${m}:${s}`;
  }, [session, now]);

  if (loading) {
    return (
      <View style={styles.containerCenter}><Text style={styles.muted}>Checking for active session...</Text></View>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
        <ScrollView
          contentContainerStyle={styles.centerContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
        >
          <View style={styles.emptyCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="time-outline" size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No Active Session</Text>
            <Text style={styles.emptySubtitle}>{name}</Text>
            <Text style={styles.emptyDesc}>
              There is no class in session right now. Pull down to refresh or check back detailed class schedule.
            </Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity style={styles.secondaryButton} onPress={onRefresh}>
              <Ionicons name="refresh" size={18} color="#4F46E5" style={{ marginRight: 8 }} />
              <Text style={styles.secondaryButtonText}>Check Again</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
      >
        <View style={styles.header}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE SESSION</Text>
          </View>
          <Text style={styles.className}>{name}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownLabel}>TIME REMAINING</Text>
            <Text style={styles.countdownValue}>{countdown}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="time-outline" size={18} color="#6B7280" />
              <Text style={styles.infoLabel}>Started</Text>
            </View>
            <Text style={styles.infoValue}>{formatDateTime(session.startTime)}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="location-outline" size={18} color="#6B7280" />
              <Text style={styles.infoLabel}>Location Check</Text>
            </View>
            <Text style={styles.infoValue}>Geofence Active</Text>
          </View>

          <View style={styles.warningBox}>
            <Ionicons name="information-circle" size={20} color="#2563EB" style={{marginRight: 8}} />
            <Text style={styles.warningText}>
              You must be within {session.geofence.radius}m of the classroom to check in.
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('MarkAttendance', { classId, sessionId: session._id })}
        >
          <Text style={styles.primaryButtonText}>Mark Attendance Now</Text>
          <Ionicons name="arrow-forward" size={20} color="#ffffff" style={{marginLeft: 8}} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  centerContent: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  muted: {
    color: '#6B7280',
    fontSize: 14,
  },

  /* Empty State */
  emptyState: { 
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptyDesc: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 24,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 99,
    backgroundColor: '#EEF2FF',
  },
  secondaryButtonText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  /* Header Section */
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  liveText: {
    color: '#B91C1C',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  className: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  sessionTime: { 
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },

  /* Card */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  countdownLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  countdownValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#111827',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#F3F4F6',
    marginBottom: 24,
  },

  /* Info Rows */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 15,
    color: '#4B5563',
    marginLeft: 10,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },

  /* Warning Section */
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  warningText: {
    color: '#B45309',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
  },

  /* Buttons */
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
    marginBottom: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
});
