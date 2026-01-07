import { getMyAttendance } from '@/app/src/api/students.api';
import { formatDateTime } from '@/app/src/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    RefreshControl,
    SectionList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RecordItem {
  _id: string;
  classId: { _id: string; name: string };
  sessionId: { _id: string; startTime: string; endTime: string };
  status: 'accepted' | 'rejected';
  markedAt: string;
  similarityScore: number;
}

export default function AttendanceHistoryScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);

  const presentCount = useMemo(() => items.filter((r) => r.status === 'accepted').length, [items]);
  const totalCount = useMemo(() => items.length, [items]);
  const rate = useMemo(() => totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0, [presentCount, totalCount]);

  const loadData = useCallback(async () => {
      try {
        const data = await getMyAttendance();
        const sorted = data.sort((a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime());
        setItems(sorted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const StatCard = ({ title, value, color, icon }: any) => (
      <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
              <Ionicons name={icon} size={20} color={color} />
          </View>
          <View>
              <Text style={[styles.statValue, { color }]}>{value}</Text>
              <Text style={styles.statLabel}>{title}</Text>
          </View>
      </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance History</Text>
      </View>

      {/* Stats Header */}
      <View style={styles.statsContainer}>
          <StatCard title="Total" value={totalCount} color="#4F46E5" icon="list" />
          <StatCard title="Present" value={presentCount} color="#059669" icon="checkmark-circle" />
          <StatCard title="Rate" value={`${rate}%`} color="#D97706" icon="pie-chart" />
      </View>

      <SectionList
        sections={[{ title: 'History', data: items }]}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={async () => { setLoading(true); await loadData(); }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
                <View style={[styles.statusLine, { backgroundColor: item.status === 'accepted' ? '#059669' : '#DC2626' }]} />
            </View>
            <View style={styles.cardContent}>
                <View style={[styles.statusIcon, { backgroundColor: item.status === 'accepted' ? '#ECFDF5' : '#FEF2F2' }]}>
                    <Ionicons 
                        name={item.status === 'accepted' ? 'checkmark' : 'close'} 
                        size={16} 
                        color={item.status === 'accepted' ? '#059669' : '#DC2626'} 
                    />
                </View>

                <View style={styles.cardDetails}>
                    <Text style={styles.className}>{item.classId?.name || 'Unknown Class'}</Text>
                    <Text style={styles.timeText}>{formatDateTime(item.markedAt)}</Text>
                    
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="scan-circle-outline" size={14} color="#6B7280" />
                            <Text style={styles.metaText}>Match: {Math.round(item.similarityScore * 100)}%</Text>
                        </View>
                        {item.status !== 'accepted' && (
                             <Text style={styles.errorText}>Rejected</Text>
                        )}
                    </View>
                </View>
            </View>
          </View>
        )}
        renderSectionHeader={() => (
           <Text style={styles.sectionHeader}>RECENT ACTIVITY</Text>
        )}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconCircle}>
                <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>No Records Yet</Text>
            <Text style={styles.emptyText}>Mark attendance in a live session to see your history here.</Text>
          </View>
        ) : null}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
      flex: 1, 
      backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },

  /* Stats */
  statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      marginBottom: 24,
      gap: 12,
  },
  statCard: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  statIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
  },
  statValue: {
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 2,
  },
  statLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: '#6B7280',
      textTransform: 'uppercase',
      textAlign: 'center',
  },

  /* List */
  list: { 
      paddingHorizontal: 16,
      paddingBottom: 24,
  },
  sectionHeader: {
      fontSize: 12,
      fontWeight: '700',
      color: '#9CA3AF',
      marginBottom: 16,
      marginLeft: 4,
      letterSpacing: 1,
  },
  
  /* Card */
  card: { 
      backgroundColor: '#fff', 
      borderRadius: 16, 
      padding: 0, 
      marginBottom: 16, 
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      overflow: 'hidden',
  },
  cardLeft: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
  },
  statusLine: {
      flex: 1,
  },
  cardContent: {
      flexDirection: 'row',
      padding: 16,
      paddingLeft: 20, // offset for left line
      alignItems: 'center',
  },
  statusIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
  },
  cardDetails: {
      flex: 1,
  },
  className: { 
      fontSize: 16, 
      fontWeight: '700', 
      color: '#1F2937', 
      marginBottom: 4 
  },
  timeText: {
      fontSize: 13,
      color: '#6B7280',
      marginBottom: 8,
  },
  
  metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
  },
  metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  metaText: {
      fontSize: 12,
      color: '#9CA3AF',
      marginLeft: 4,
      fontWeight: '500',
  },
  errorText: {
      fontSize: 12,
      color: '#DC2626',
      fontWeight: '700',
  },

  /* Empty State */
  emptyBox: { 
    alignItems: 'center', 
    marginTop: 40,
    padding: 24,
  },
  emptyIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#E5E7EB',
  },
  emptyTitle: {
    fontSize: 18, 
    fontWeight: '700', 
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
});
