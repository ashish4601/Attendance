import { addStudentToClass, listAdminClasses, type Class } from '@/app/src/api/classes.api';
import { Button } from '@/app/src/components/Button';
import { Input } from '@/app/src/components/Input';
import { getErrorMessage } from '@/app/src/utils/errors';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AddStudentToClassScreen() {
  const navigation = useNavigation();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [studentEmail, setStudentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const loadClasses = useCallback(async () => {
    const apiClasses = await listAdminClasses();
    setClasses(apiClasses);
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // Reload classes when screen gains focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadClasses();
    });
    return unsubscribe;
  }, [navigation, loadClasses]);

  const handleAdd = async () => {
    if (!selectedClass) {
      Alert.alert('Selection Error', 'Please select a class first.');
      return;
    }
    if (!studentEmail) {
      Alert.alert('Required Field', 'Student email is required.');
      return;
    }

    const emailOk = /.+@.+\..+/.test(studentEmail.trim());
    if (!emailOk) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await addStudentToClass(selectedClass._id, studentEmail.trim());
      Alert.alert('Success', `Student added to "${selectedClass.name}"`);
      setStudentEmail('');
    } catch (e) {
      Alert.alert('Failed', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const renderClassItem = ({ item }: { item: Class }) => (
    <TouchableOpacity
      style={styles.pickerItem}
      onPress={() => {
        setSelectedClass(item);
        setShowPicker(false);
      }}
    >
      <View style={styles.pickerIcon}>
          <Text style={{ fontSize: 18 }}>📚</Text>
      </View>
      <View>
          <Text style={styles.pickerItemTitle}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.pickerItemSub}>{item.description}</Text>
          ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Enroll Student</Text>

      {classes.length === 0 ? (
        <View style={styles.emptyBox}>
            <View style={styles.emptyIcon}>
                <Text style={{ fontSize: 32 }}>🎓</Text>
            </View>
          <Text style={styles.emptyTitle}>No Classes Found</Text>
          <Text style={styles.emptyText}>
            You must create a class before adding students.
          </Text>
          <Button
            title="Create Class Now"
            onPress={() => navigation.navigate('CreateClass' as never)}
            style={{ marginTop: 24 }}
          />
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}><Text>1</Text></View>
              <Text style={styles.label}>Select Class</Text>
          </View>
          
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowPicker(true)}
          >
            {selectedClass ? (
                 <View style={styles.selectedRow}>
                    <Text style={{ marginRight: 8 }}>📚</Text>
                    <Text style={styles.selectorText}>{selectedClass.name}</Text>
                 </View>
            ) : (
                 <Text style={styles.selectorPlaceholder}>Tap to choose a class...</Text>
            )}
            <Text style={styles.chevron}>▼</Text>
          </TouchableOpacity>

          <View style={styles.divider} />
          
           <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}><Text>2</Text></View>
              <Text style={styles.label}>Student Details</Text>
          </View>

          <Input
            label="Email Address"
            value={studentEmail}
            onChangeText={setStudentEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="student@example.com"
            style={{ marginBottom: 0 }}
          />
          
          <View style={styles.infoBox}>
               <Text style={styles.infoText}>The student will be instantly enrolled in the selected class.</Text>
          </View>

          <Button
            title="Enroll Student"
            onPress={handleAdd}
            loading={loading}
            style={{ marginTop: 24 }}
          />
        </View>
      )}

      {/* Class Picker Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowPicker(false)} />
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Class</Text>
                <TouchableOpacity onPress={() => setShowPicker(false)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
                </View>
                <FlatList
                data={classes}
                keyExtractor={(item) => item._id}
                renderItem={renderClassItem}
                contentContainerStyle={{ paddingBottom: 24 }}
                ListEmptyComponent={
                    <View style={{ padding: 24, alignItems: 'center' }}>
                        <Text style={styles.emptyText}>No classes available</Text>
                    </View>
                }
                />
            </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  card: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
  },
  sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
  },
  sectionIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#E0E7FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Selector
  selector: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedRow: { flexDirection: 'row', alignItems: 'center' },
  selectorText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  chevron: { color: '#9CA3AF' },

  divider: {
      height: 1,
      backgroundColor: '#E5E7EB',
      marginVertical: 24,
  },

  infoBox: {
      marginTop: 12,
      padding: 12,
      backgroundColor: '#EFF6FF',
      borderRadius: 8,
  },
  infoText: {
      fontSize: 13,
      color: '#1E40AF',
      textAlign: 'center',
  },

  // Empty State
  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 32,
  },
  emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 240,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
  },
  closeBtnText: {
      fontSize: 14,
      color: '#6B7280',
      fontWeight: 'bold',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
  },
  pickerItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  pickerItemSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
});
