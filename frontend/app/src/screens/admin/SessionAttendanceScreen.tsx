import {
  AttendanceWithDetails,
  getSessionAttendance,
} from '@/app/src/api/attendance.api';
import { listAdminSessions } from '@/app/src/api/sessions.api';
import { formatDateTime } from '@/app/src/utils/date';
import { getErrorMessage } from '@/app/src/utils/errors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type DisplaySession = { _id: string; className: string; startTime: string; endTime: string };

export default function SessionAttendanceScreen() {
  const navigation = useNavigation();
  const [sessions, setSessions] = useState<DisplaySession[]>([]);
  const [selectedSession, setSelectedSession] = useState<DisplaySession | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<AttendanceWithDetails[]>([]);
  const [fetched, setFetched] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      const apiSessions = await listAdminSessions();
      // Sort by start time descending
      apiSessions.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      
      const mapped: DisplaySession[] = apiSessions.map((s: any) => ({
        _id: s._id,
        className: typeof s.classId === 'object' && s.classId?.name ? s.classId.name : 'Unknown Class',
        startTime: s.startTime,
        endTime: s.endTime,
      }));
      setSessions(mapped);
    } catch (error) {
       console.error("Failed to load sessions", error);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSessions();
    });
    return unsubscribe;
  }, [navigation, loadSessions]);

  const handleFetch = async () => {
    const effectiveSessionId = selectedSession?._id || '';
    if (!effectiveSessionId) {
      Alert.alert('Selection Required', 'Please select a session to view attendance.');
      return;
    }

    setLoading(true);
    setRows([]); 
    setFetched(false);

    try {
      const data = await getSessionAttendance(effectiveSessionId);
      setRows(Array.isArray(data) ? data : []);
      setFetched(true);
    } catch (e) {
      Alert.alert('Failed', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const renderAttendanceCard = ({ item }: { item: AttendanceWithDetails }) => {
    const isAccepted = item.status === 'accepted';
    const matchScore = item.similarityScore && typeof item.similarityScore === 'number' 
      ? Math.round(item.similarityScore * 100) 
      : null;

    return (
      <View style={[styles.attendeeCard, !isAccepted && styles.attendeeCardRejected]}>
        <View style={styles.attendeeHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {item.userId?.name ? item.userId.name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          <View style={styles.attendeeInfo}>
            <Text style={styles.attendeeName}>{item.userId?.name || 'Unknown User'}</Text>
            <Text style={styles.attendeeEmail}>{item.userId?.email || 'No Email'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isAccepted ? '#D1FAE5' : '#FEE2E2' }]}>
            <Text style={[styles.statusText, { color: isAccepted ? '#065F46' : '#991B1B' }]}>
              {isAccepted ? 'Present' : 'Flagged'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metaContainer}>
           <View style={styles.metaItem}>
             <Ionicons name="time-outline" size={14} color="#6B7280" />
             <Text style={styles.metaText}>
               {item.markedAt ? formatDateTime(item.markedAt) : 'No time recorded'}
             </Text>
           </View>
           
           {matchScore !== null && (
             <View style={styles.metaItem}>
               <Ionicons 
                  name={matchScore > 80 ? "shield-checkmark-outline" : "warning-outline"} 
                  size={14} 
                  color={matchScore > 80 ? "#10B981" : "#F59E0B"} 
               />
               <Text style={[styles.metaText, { color: matchScore > 80 ? '#4B5563' : '#F59E0B' }]}>
                 Face Match: {matchScore}%
               </Text>
             </View>
           )}
        </View>
      </View>
    );
  };

  const renderSessionPickerItem = ({ item }: { item: DisplaySession }) => (
    <TouchableOpacity
      style={styles.pickerItem}
      onPress={() => {
        setSelectedSession(item);
        setShowPicker(false);
        setFetched(false); 
        setRows([]);
      }}
    >
      <View style={styles.pickerItemIcon}>
         <Text>📅</Text>
      </View>
      <View style={{flex: 1}}>
        <Text style={styles.pickerItemTitle}>{item.className}</Text>
        <Text style={styles.pickerItemSub}>{formatDateTime(item.startTime)}</Text>
      </View>
      {selectedSession?._id === item._id && (
        <Ionicons name="checkmark-circle" size={24} color="#4F46E5" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      <View style={styles.container}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Attendance Report</Text>
          <Text style={styles.subtitle}>Select a session to view the attendee list.</Text>
        </View>

        <View style={styles.selectionSection}>
          <TouchableOpacity
            style={styles.selectorCard}
            onPress={() => setShowPicker(true)}
          >
            <View style={styles.selectorContent}>
              <View style={styles.selectorIconCircle}>
                 <Ionicons name="calendar" size={24} color="#4F46E5" />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.selectorLabel}>Session</Text>
                <Text style={styles.selectorValue} numberOfLines={1}>
                  {selectedSession ? `${selectedSession.className}` : 'Select a Session...'}
                </Text>
                {selectedSession && (
                   <Text style={styles.selectorSubValue}>{formatDateTime(selectedSession.startTime)}</Text>
                )}
              </View>
              <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
             style={[styles.fetchButton, !selectedSession && styles.fetchButtonDisabled]}
             onPress={handleFetch}
             disabled={!selectedSession || loading}
          >
             {loading ? (
                <ActivityIndicator color="#fff" />
             ) : (
                <Text style={styles.fetchButtonText}>Load Attendance</Text>
             )}
          </TouchableOpacity>
        </View>

        {fetched && (
          <View style={styles.statsContainer}>
             <View style={styles.statBox}>
                <Text style={styles.statNumber}>{rows.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
             </View>
             <View style={styles.statDivider} />
             <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: '#059669' }]}>
                  {rows.filter(r => r.status === 'accepted').length}
                </Text>
                <Text style={styles.statLabel}>Present</Text>
             </View>
             <View style={styles.statDivider} />
             <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: '#DC2626' }]}>
                   {rows.filter(r => r.status !== 'accepted').length}
                </Text>
                <Text style={styles.statLabel}>Issues</Text>
             </View>
          </View>
        )}

        <FlatList
          data={rows}
          keyExtractor={(item) => item._id}
          renderItem={renderAttendanceCard}
          contentContainerStyle={styles.listStay}
          ListEmptyComponent={
            fetched ? (
              <View style={styles.emptyState}>
                 <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                 <Text style={styles.emptyStateText}>No attendance records found.</Text>
              </View>
            ) : null
          }
        />

        {/* Modal Picker */}
        <Modal
          visible={showPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalOverlay}>
             <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowPicker(false)} />
             <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                   <Text style={styles.modalTitle}>Select Session</Text>
                   <TouchableOpacity onPress={() => setShowPicker(false)} style={styles.closeButton}>
                      <Ionicons name="close" size={24} color="#6B7280" />
                   </TouchableOpacity>
                </View>
                <FlatList 
                   data={sessions}
                   keyExtractor={item => item._id}
                   renderItem={renderSessionPickerItem}
                   style={{ maxHeight: 400 }}
                />
             </View>
          </View>
        </Modal>

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
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  selectionSection: {
    padding: 16,
  },
  selectorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  selectorValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  selectorSubValue: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  fetchButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fetchButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  fetchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  listStay: {
    padding: 16,
    paddingTop: 0,
  },
  attendeeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  attendeeCardRejected: {
    borderColor: '#FCA5A5', // Light red border
    backgroundColor: '#FEF2F2', // Light red bg mostly white 
  },
  attendeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  attendeeEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyStateText: {
    marginTop: 12,
    color: '#9CA3AF',
    fontSize: 16,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pickerItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  pickerItemSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
