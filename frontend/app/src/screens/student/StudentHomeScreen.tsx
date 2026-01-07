import { AuthContext } from '@/app/src/auth/context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';

export default function StudentHomeScreen() {
  const navigation = useNavigation();
  const { signOut, user } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      Alert.alert('Logout Failed', 'An error occurred while logging out.');
    }
  };

  const MenuCard = ({ title, icon, color, onPress, badge }: any) => (
    <TouchableOpacity
      style={styles.menuCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name || 'Student'}</Text>
          </View>
        </View>
         

        {/* Featured Card */}
        <View style={styles.featuredCard}>
          <View style={styles.featuredContent}>
            <View>
              <Text style={styles.featuredLabel}>NEXT CLASS</Text>
              <Text style={styles.featuredTitle}>Check your schedule</Text>
              <Text style={styles.featuredSubtitle}>View upcoming sessions</Text>
            </View>
            <View style={styles.featuredIcon}>
              <Ionicons name="calendar" size={32} color="#FFFFFF" />
            </View>
          </View>
          <TouchableOpacity
            style={styles.featuredButton}
            onPress={() => navigation.navigate('MyClasses' as never)}
          >
            <Text style={styles.featuredButtonText}>Go to Classes</Text>
            <Ionicons name="arrow-forward" size={16} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* Menu Grid */}
        <Text style={styles.sectionTitle}>ACADEMIC</Text>
        <View style={styles.menuGrid}>
          <MenuCard
            title="My Classes"
            icon="school"
            color="#4F46E5"
            onPress={() => navigation.navigate('MyClasses' as never)}
          />
          <MenuCard
            title="Attendance History"
            icon="time"
            color="#059669"
            onPress={() => navigation.navigate('AttendanceHistory' as never)}
          />
        </View>

        <Text style={styles.sectionTitle}>SETTINGS</Text>
        <View style={styles.menuContainer}>
          <MenuCard
            title="Face Enrollment"
            icon="scan-circle"
            color="#D97706"
            badge="Required"
            onPress={() => navigation.navigate('FaceEnroll' as never)}
          />
          <View style={styles.divider} />
          <MenuCard
            title="My Profile"
            icon="person"
            color="#6B7280"
            onPress={() => navigation.navigate('Profile' as never)}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  profileButton: {
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4F46E5',
  },

  /* Featured Card */
  featuredCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    boxShadow: '0 8px 16px rgba(79, 70, 229, 0.25)',
  },
  featuredContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  featuredLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  featuredSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  featuredIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 12,
  },
  featuredButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  featuredButtonText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 14,
    marginRight: 8,
  },

  /* Section Headers */
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },

  /* Menu Grid */
  menuGrid: {
    gap: 16,
    marginBottom: 32,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    marginBottom: 32,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 80,
  },
});
