import type { StudentStackParamList } from '@/app/src/navigation/StudentStack';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import React from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ClassDetailScreen() {
  const route = useRoute<RouteProp<StudentStackParamList, 'ClassDetail'>>();
  const navigation = useNavigation<NavigationProp<StudentStackParamList, 'ClassDetail'>>();
  const { classId, name, description } = route.params;

  // Generate a consistent color based on class name
  const getClassColor = (name: string) => {
    const colors = [
      '#2563EB', // Blue
      '#7C3AED', // Purple
      '#DB2777', // Pink
      '#059669', // Emerald
      '#D97706', // Amber
      '#DC2626', // Red
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const bannerColor = getClassColor(name);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        {/* Banner Section */}
        <View style={[styles.banner, { backgroundColor: bannerColor }]}>
           <SafeAreaView edges={['top']} style={styles.bannerSafeArea}>
              <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoButton}>
                  <Ionicons name="information-circle-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.bannerContent}>
                 <Text style={styles.title}>{name}</Text>
                 {!!description && <Text style={styles.desc}>{description}</Text>}
              </View>
           </SafeAreaView>
        </View>

        {/* Action Section */}
        <View style={styles.mainContent}>
            <TouchableOpacity 
              style={styles.actionCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ActiveSession', { classId, name })}
            >
               <View style={styles.actionIconContainer}>
                  <Ionicons name="location" size={32} color="#4F46E5" />
               </View>
               <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Active Session</Text>
                  <Text style={styles.actionDesc}>Check for ongoing classes and mark attendance.</Text>
               </View>
               <Ionicons name="chevron-forward" size={24} color="#D1D5DB" />
            </TouchableOpacity>

            <View style={styles.divider} />

           
            <Text style={styles.sectionHeader}>STREAM</Text>
            
            <View style={styles.streamInput}>
               <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{name.charAt(0)}</Text>
               </View>
               <Text style={styles.placeholderText}>Announce something to your class...</Text>
            </View>

            <View style={styles.emptyUpdate}>
               <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
               <Text style={styles.emptyText}>No announcements yet</Text>
               <Text style={styles.emptySubText}>Assignments and questions will appear here.</Text>
            </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF',
  },
  content: { 
    paddingBottom: 40,
    flexGrow: 1,
  },
  
  /* Banner */
  banner: {
    minHeight: 200,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  bannerSafeArea: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  infoButton: {
    padding: 8,
    marginRight: -8,
  },
  bannerContent: {
    paddingBottom: 8,
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  desc: { 
    fontSize: 16, 
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },

  /* Main Content */
  mainContent: {
    padding: 16,
    top: -20, // Overlap effect if we used rounded banner, but here distinct
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24, // Pull up to overlap banner
    flex: 1,
  },
  
  /* Actions */
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.1)',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },

  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 24,
  },

  /* Stream */
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 16,
    letterSpacing: 1.2,
  },
  streamInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  emptyUpdate: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
