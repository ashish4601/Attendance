import { getMyClasses } from '@/app/src/api/students.api';
import { StudentStackParamList } from '@/app/src/navigation/StudentStack';
import { getErrorMessage } from '@/app/src/utils/errors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ClassItem {
  _id: string;
  name: string;
  description: string;
}

export default function MyClassesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const [items, setItems] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const classes = await getMyClasses();
      setItems(classes);
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const getClassColor = (name: string) => {
    const colors = [
      '#2563EB', // Blue
      '#7C3AED', // Purple
      '#DB2777', // Pink
      '#059669', // Emerald
      '#D97706', // Amber
      '#DC2626', // Red
      '#4F46E5', // Indigo
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const renderItem = ({ item }: { item: ClassItem }) => {
    const bannerColor = getClassColor(item.name);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('ClassDetail', {
            classId: item._id,
            name: item.name,
            description: item.description,
          })
        }
      >
        <View style={[styles.cardHeader, { backgroundColor: bannerColor }]}>
          <View style={styles.headerTop}>
             <Text style={styles.className} numberOfLines={1}>{item.name}</Text>
             <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.8)" />
          </View>
          <Text style={styles.sectionText} numberOfLines={1}>{item.description}</Text>
        </View>
        
        <View style={styles.cardBody}>
           
            <View style={styles.teacherRow}>
               <View style={styles.avatarPlaceholder}>
                   <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
               </View>
            </View>
            <View style={styles.footer}>
                <Text style={styles.footerText}>Tap to view details</Text>
            </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Classes</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchClasses}
        renderItem={renderItem}
        ListEmptyComponent={!loading ? (
             <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="school-outline" size={48} color="#9CA3AF" />
                </View>
                <Text style={styles.emptyTitle}>No Classes Yet</Text>
                <Text style={styles.emptySub}>You haven't shortened any classes yet.</Text>
             </View>
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
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
  list: { 
    padding: 16,
    paddingBottom: 24,
  },
  
  /* Card Design */
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    marginBottom: 16, 
    overflow: 'hidden', 
    borderWidth: 1,
    borderColor: '#E5E7EB',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  cardHeader: {
    height: 100,
    padding: 16,
    justifyContent: 'space-between',
  },
  headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
  },
  className: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#fff',
    flex: 1,
    marginRight: 8,
  },
  sectionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },

  cardBody: {
    padding: 16,
    position: 'relative',
    height: 60, // Fixed height for footer area
    justifyContent: 'center',
  },
  teacherRow: {
      position: 'absolute',
      right: 16,
      top: -24, // Overlap the header
  },
  avatarPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#FFFFFF',
  },
  avatarText: {
      fontSize: 20,
      fontWeight: '600',
      color: '#4B5563',
  },
  footer: {
      marginTop: 12,
  },
  footerText: {
      fontSize: 12,
      color: '#9CA3AF',
      textAlign: 'right', // Or left if preferred
  },

  /* Empty State */
  emptyContainer: { 
    alignItems: 'center', 
    marginTop: 80,
    padding: 24,
  },
  emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#E5E7EB',
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
  emptySub: {
    fontSize: 14, 
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});
