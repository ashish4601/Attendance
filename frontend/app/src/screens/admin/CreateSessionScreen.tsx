import { listAdminClasses, type Class } from '@/app/src/api/classes.api';
import { createSession } from '@/app/src/api/sessions.api';
import { Button } from '@/app/src/components/Button';
import { Input } from '@/app/src/components/Input';
import { getErrorMessage } from '@/app/src/utils/errors';
import { getCurrentLocation } from '@/app/src/utils/permissions';
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

export default function CreateSessionScreen() {
  const navigation = useNavigation();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showClassPicker, setShowClassPicker] = useState(false);

  // Duration in minutes
  const [durationMinutes, setDurationMinutes] = useState('60');

  // Geofence
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [radius, setRadius] = useState('100');
  const [locationLoading, setLocationLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  const loadClasses = useCallback(async () => {
    const apiClasses = await listAdminClasses();
    setClasses(apiClasses);
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadClasses();
    });
    return unsubscribe;
  }, [navigation, loadClasses]);

  const handleUseMyLocation = async () => {
    setLocationLoading(true);
    try {
      const loc = await getCurrentLocation();
      if (loc) {
        setLat(loc.lat.toFixed(6));
        setLng(loc.lng.toFixed(6));
      } else {
        Alert.alert('Error', 'Could not get your location. Please check permissions.');
      }
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setLocationLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedClass) {
      Alert.alert('Validation Error', 'Please select a class first.');
      return;
    }
    if (!lat || !lng) {
      Alert.alert('Location Missing', 'Please set the geofence location using the button.');
      return;
    }
    if (!radius || Number(radius) <= 0) {
      Alert.alert('Invalid Radius', 'Please enter a valid radius in meters.');
      return;
    }
    if (!durationMinutes || Number(durationMinutes) <= 0) {
      Alert.alert('Invalid Duration', 'Please enter a valid duration.');
      return;
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + Number(durationMinutes) * 60 * 1000);

    setLoading(true);
    try {
      await createSession(selectedClass._id, {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        geofence: {
          lat: Number(lat),
          lng: Number(lng),
          radius: Number(radius),
        },
      });

      Alert.alert(
        'Success',
        `Live Session started for ${selectedClass.name}. Students can now mark attendance.`
      );

      // Reset form
      setSelectedClass(null);
      setLat('');
      setLng('');
      setDurationMinutes('60');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Failed to Start', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const renderClassItem = ({ item }: { item: Class }) => (
    <TouchableOpacity
      style={styles.pickerItem}
      onPress={() => {
        setSelectedClass(item);
        setShowClassPicker(false);
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

  const DurationPill = ({ val }: { val: string }) => (
    <TouchableOpacity 
       style={[styles.pill, durationMinutes === val && styles.pillActive]}
       onPress={() => setDurationMinutes(val)}
    >
       <Text style={[styles.pillText, durationMinutes === val && styles.pillTextActive]}>{val} min</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Start New Session</Text>
      
      {classes.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No Classes Available</Text>
          <Text style={styles.emptyText}>
            You need to create a class before starting a session.
          </Text>
          <Button
            title="Create Class"
            onPress={() => navigation.navigate('CreateClass' as never)}
            style={{ marginTop: 16 }}
          />
        </View>
      ) : (
        <View style={styles.card}>
          {/* Class Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Select Class</Text>
            <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowClassPicker(true)}
            >
                {selectedClass ? (
                    <View style={styles.selectedRow}>
                        <View style={styles.selectedIcon}><Text>📚</Text></View>
                        <Text style={styles.selectorText}>{selectedClass.name}</Text>
                    </View>
                ) : (
                    <Text style={styles.selectorPlaceholder}>Tap to choose...</Text>
                )}
                <Text style={styles.chevron}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Duration */}
          <View style={styles.section}>
            <Text style={styles.label}>Duration</Text>
            <View style={styles.pillRow}>
                <DurationPill val="45" />
                <DurationPill val="60" />
                <DurationPill val="90" />
            </View>
            <View style={styles.customDuration}>
                <Input
                    label="Custom Minutes"
                    value={durationMinutes}
                    onChangeText={setDurationMinutes}
                    keyboardType="number-pad"
                    placeholder="60"
                    style={{ backgroundColor: '#F9FAFB' }}
                />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Geofence */}
          <View style={styles.section}>
            <Text style={styles.label}>Location & Radius</Text>
            <Text style={styles.helperText}>Used to verify student presence.</Text>
            
            <View style={styles.locationBox}>
                {!lat ? (
                    <View style={styles.locationPlaceholder}>
                        <Text style={styles.locationPlaceholderText}>Location not set</Text>
                    </View>
                ) : (
                    <View style={styles.locationActive}>
                        <Text style={{ fontSize: 24, marginBottom: 4 }}>📍</Text>
                        <Text style={styles.locationCoords}>{lat}, {lng}</Text>
                        <Text style={styles.locationStatus}>Location Set</Text>
                    </View>
                )}
                
                <Button
                    title={locationLoading ? 'Locating...' : 'Update Location'}
                    onPress={handleUseMyLocation}
                    loading={locationLoading}
                    variant="secondary"
                    style={styles.locationBtn}
                />
            </View>

            <View style={{ marginTop: 12 }}>
                <Input
                    label="Geofence Radius (meters)"
                    value={radius}
                    onChangeText={setRadius}
                    keyboardType="number-pad"
                    placeholder="100"
                    style={{ backgroundColor: '#F9FAFB' }}
                />
            </View>
          </View>
          
          <View style={styles.footer}>
             <Button
                title="Start Live Session"
                onPress={handleCreate}
                loading={loading}
                style={styles.mainBtn}
            />
          </View>
        </View>
      )}

      {/* Class Picker Modal */}
      <Modal
        visible={showClassPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowClassPicker(false)}
      >
        <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowClassPicker(false)} />
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Class</Text>
                <TouchableOpacity onPress={() => setShowClassPicker(false)}>
                    <View style={styles.closeBtn}>
                        <Text style={styles.closeBtnText}>✕</Text>
                    </View>
                </TouchableOpacity>
                </View>
                <FlatList
                data={classes}
                keyExtractor={(item) => item._id}
                renderItem={renderClassItem}
                contentContainerStyle={{ paddingBottom: 24 }}
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
    padding: 20,
    paddingBottom: 48,
  },
  pageTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 20,
  },
  card: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
  },
  
  section: {
      marginBottom: 0,
  },
  label: {
      fontSize: 14,
      fontWeight: '700',
      color: '#374151',
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
  },
  divider: {
      height: 1,
      backgroundColor: '#E5E7EB',
      marginVertical: 24,
  },
  helperText: {
      fontSize: 13,
      color: '#6B7280',
      marginBottom: 12,
      marginTop: -8,
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
  selectedRow: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  selectedIcon: {
      marginRight: 12,
  },
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

  // Pills
  pillRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  pill: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: '#F3F4F6',
      borderWidth: 1,
      borderColor: '#E5E7EB',
  },
  pillActive: {
      backgroundColor: '#EEF2FF',
      borderColor: '#818CF8',
  },
  pillText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#4B5563',
  },
  pillTextActive: {
      color: '#4F46E5',
  },
  customDuration: {
      marginTop: 0,
  },

  // Location
  locationBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  locationPlaceholder: {
      flex: 1,
      height: 64,
      backgroundColor: '#F9FAFB',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderStyle: 'dashed',
  },
  locationPlaceholderText: {
      fontSize: 13,
      color: '#9CA3AF',
  },
  locationActive: {
      flex: 1,
      height: 80,
      backgroundColor: '#ECFDF5',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#D1FAE5',
  },
  locationCoords: {
      fontSize: 12,
      fontFamily: 'monospace',
      color: '#047857',
  },
  locationStatus: {
      fontSize: 10,
      color: '#059669',
      fontWeight: '700',
      textTransform: 'uppercase',
      marginTop: 4,
  },
  locationBtn: {
      width: 120,
      height: 40,
  },

  footer: {
      marginTop: 32,
  },
  mainBtn: {
      height: 56,
  },

  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
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
  },

  // Modal
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
