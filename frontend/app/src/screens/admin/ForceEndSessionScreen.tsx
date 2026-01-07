import { endSession, listAdminSessions } from '@/app/src/api/sessions.api';
import { formatDateTime } from '@/app/src/utils/date';
import { getErrorMessage } from '@/app/src/utils/errors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface DisplaySession {
  _id: string;
  className: string;
  startTime: string;
  endTime: string;
}

export default function ForceEndSessionScreen() {
  const navigation = useNavigation();
  const [sessions, setSessions] = useState<DisplaySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [endingId, setEndingId] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      const apiSessions = await listAdminSessions();
      const now = new Date();
      
      const mapped: DisplaySession[] = apiSessions.map((s: any) => ({
        _id: s._id,
        className: s.classId?.name || 'Unknown Class',
        startTime: s.startTime,
        endTime: s.endTime,
      }));

      // Filter only active sessions (end time is in future)
      const activeSessions = mapped.filter((s) => new Date(s.endTime) > now);
      
      // Sort by start time (most recent first)
      activeSessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      
      setSessions(activeSessions);
    } catch (error) {
      console.error('Failed to load sessions', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSessions();
    });
    return unsubscribe;
  }, [navigation, loadSessions]);

  const confirmEndSession = async (session: DisplaySession) => {
    setEndingId(session._id);
    try {
      await endSession(session._id);
      Alert.alert('Success', `Session for "${session.className}" has been ended.`);
      loadSessions(); // Reload list
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setEndingId(null);
    }
  };

  const handleEndPress = (session: DisplaySession) => {
    Alert.alert(
      'End Session?',
      `Are you sure you want to force end the session for ${session.className}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: () => confirmEndSession(session),
        },
      ]
    );
  };

  const renderSessionCard = ({ item }: { item: DisplaySession }) => {
    const isEnding = endingId === item._id;
    const now = new Date();
    const start = new Date(item.startTime);
    const end = new Date(item.endTime);
    
    // Calculate progress/status logic if needed, simplify for now
    const isActive = now >= start && now <= end;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.classIcon}>📚</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.className}>{item.className}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: isActive ? '#10B981' : '#F59E0B' }]} />
              <Text style={styles.statusLabel}>{isActive ? 'Live Now' : 'Scheduled'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              Started: {formatDateTime(item.startTime)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="timer-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              Ends: {formatDateTime(item.endTime)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, isEnding && styles.actionButtonDisabled]}
          onPress={() => handleEndPress(item)}
          disabled={isEnding}
        >
          {isEnding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="stop-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.actionButtonText}>End Session</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Active Sessions</Text>
        <Text style={styles.subtitle}>Manage and monitor currently running class sessions.</Text>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item._id}
        renderItem={renderSessionCard}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadSessions} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No Active Sessions</Text>
              <Text style={styles.emptySubtitle}>
                There are currently no sessions running or scheduled for the future.
              </Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => navigation.navigate('CreateSession' as never)}
              >
                <Text style={styles.createButtonText}>Create New Session</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF', // Light Indigo
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  classIcon: {
    fontSize: 24,
  },
  headerTextContainer: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: -16,
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  actionButton: {
    backgroundColor: '#EF4444', // Red
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
