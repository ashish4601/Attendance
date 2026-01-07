import { AuthContext } from '@/app/src/auth/context';
import { Button } from '@/app/src/components/Button';
import { useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AdminHomeScreen() {
  const navigation = useNavigation();
  const { signOut, user } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      Alert.alert('Logout Failed', 'An error occurred while logging out.');
    }
  };

  const ActionCard = ({ title, icon, color, onPress, variant = 'primary' }: any) => (
    <TouchableOpacity 
        style={[styles.card, variant === 'secondary' && styles.cardSecondary]} 
        onPress={onPress}
        activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: color }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <Text style={[styles.cardTitle, variant === 'secondary' && styles.cardTitleSecondary]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
            <Text style={styles.welcomeLabel}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name || 'Administrator'}</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile' as never)}>
             <Text style={styles.profileInitials}>{user?.name?.charAt(0) || 'A'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>Quick Actions</Text>
      <View style={styles.grid}>
        <ActionCard 
            title="Create User" 
            icon="👤" 
            color="#E0E7FF" 
            onPress={() => navigation.navigate('CreateUser' as never)} 
        />
        <ActionCard 
            title="Create Class" 
            icon="📚" 
            color="#FEF3C7" 
            onPress={() => navigation.navigate('CreateClass' as never)} 
        />
        <ActionCard 
            title="Start Session" 
            icon="📡" 
            color="#D1FAE5" 
            onPress={() => navigation.navigate('CreateSession' as never)} 
        />
        <ActionCard 
            title="Add Students" 
            icon="🔗" 
            color="#F3E8FF" 
            onPress={() => navigation.navigate('AddStudentToClass' as never)} 
        />
      </View>

      <Text style={styles.sectionHeader}>Management</Text>
      <View style={styles.listSection}>
        <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('ForceEndSession' as never)}>
            <View style={[styles.listIcon, { backgroundColor: '#FEE2E2' }]}>
                <Text>🛑</Text>
            </View>
            <View style={styles.listContent}>
                <Text style={styles.listTitle}>Force End Session</Text>
                <Text style={styles.listSub}>Manually stop an active session</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('SessionAttendance' as never)}>
             <View style={[styles.listIcon, { backgroundColor: '#E0F2FE' }]}>
                <Text>📊</Text>
            </View>
            <View style={styles.listContent}>
                <Text style={styles.listTitle}>View Attendance</Text>
                <Text style={styles.listSub}>Check records for past sessions</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Sign Out"
        onPress={handleLogout}
        variant="secondary"
        style={styles.logoutButton}
      />
      <Text style={styles.version}>Version 1.0.0 • Admin Console</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
      flex: 1, 
      backgroundColor: '#F3F4F6' 
  },
  content: { 
      padding: 24,
      paddingBottom: 48,
  },
  
  // Header
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 32,
  },
  welcomeLabel: {
      fontSize: 14,
      color: '#6B7280',
      marginBottom: 4,
  },
  name: {
      fontSize: 24,
      fontWeight: '700',
      color: '#111827',
  },
  profileBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#4F46E5',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#4F46E5',
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 4,
  },
  profileInitials: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '700',
  },

  // Grid
  sectionHeader: {
      fontSize: 18,
      fontWeight: '700',
      color: '#374151',
      marginBottom: 16,
      marginLeft: 4,
  },
  grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 32,
  },
  card: {
      width: '48%',
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      alignItems: 'center',
  },
  cardSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#D1D5DB',
      shadowOpacity: 0,
  },
  iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
  },
  iconText: {
      fontSize: 24,
  },
  cardTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#1F2937',
      textAlign: 'center',
  },
  cardTitleSecondary: {
      color: '#4B5563',
  },

  // List Section
  listSection: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 8,
      marginBottom: 32,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 1,
  },
  listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
  },
  listIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
  },
  listContent: {
      flex: 1,
  },
  listTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#111827',
      marginBottom: 2,
  },
  listSub: {
      fontSize: 12,
      color: '#6B7280',
  },
  chevron: {
      fontSize: 20,
      color: '#9CA3AF',
      fontWeight: '400',
  },
  divider: {
      height: 1,
      backgroundColor: '#F3F4F6',
      marginLeft: 72,
  },

  logoutButton: {
      marginTop: 8,
  },
  version: {
      marginTop: 24, 
      textAlign: 'center',
      color: '#9CA3AF',
      fontSize: 12,
  }
});
