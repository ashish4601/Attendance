import { Class, createClass } from '@/app/src/api/classes.api';
import { Button } from '@/app/src/components/Button';
import { Input } from '@/app/src/components/Input';
import { addCachedClass } from '@/app/src/utils/adminCache';
import { getErrorMessage } from '@/app/src/utils/errors';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

export default function CreateClassScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<Class | null>(null);

  const handleCreate = async () => {
    if (!name) {
      Alert.alert('Validation Check', 'Class name is required');
      return;
    }

    setLoading(true);
    try {
      const cls = await createClass({ name, description });
      // Cache the created class for use in other screens
      await addCachedClass({
        _id: cls._id,
        name: cls.name,
        description: cls.description,
        createdAt: cls.createdAt,
      });
      setCreated(cls);
      setName('');
      setDescription('');
    } catch (e) {
      Alert.alert('something went wrong', getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = async () => {
    if (!created?._id) return;
    try {
      if (Platform.OS === 'web' && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(created._id);
        Alert.alert('Copied', 'Class ID copied to clipboard');
      } else {
        await Share.share({ message: `Class ID: ${created._id}` });
      }
    } catch {
      Alert.alert('Info', `Class ID: ${created._id}`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Class</Text>
        <Text style={styles.subtitle}>Set up a new class course for student enrollment.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={{ fontSize: 32 }}>📚</Text>
        </View>

        <Input 
            label="Class Name" 
            placeholder="e.g. Computer Science 101"
            value={name} 
            onChangeText={setName} 
            style={styles.input}
        />
        <Input 
            label="Description (Optional)" 
            placeholder="e.g. Fall 2023 Semester"
            value={description} 
            onChangeText={setDescription} 
        />
        
        <Button 
            title="Create Class" 
            onPress={handleCreate} 
            loading={loading} 
            style={styles.button}
        />
      </View>

      {created && (
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
             <Text>✅</Text>
          </View>
          <Text style={styles.resultTitle}>Class Created Successfully</Text>
          
          <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Name</Text>
              <Text style={styles.resultValue}>{created.name}</Text>
          </View>
          <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Class ID</Text>
              <Text style={styles.resultValueID}>{created._id}</Text>
          </View>

          <Button 
            title={Platform.OS === 'web' ? 'Copy Class ID' : 'Share Class ID'} 
            onPress={handleCopyId} 
            style={styles.shareBtn} 
            variant="secondary"
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 24 },
  
  header: {
      marginBottom: 24
  },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280' },

  card: {
      backgroundColor: '#fff',
      padding: 24,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
      marginBottom: 24,
  },
  iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#FEF3C7',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: 24,
  },
  input: {
      marginBottom: 0
  },
  button: { marginTop: 24 },

  successCard: { 
      backgroundColor: '#ECFDF5', 
      borderWidth: 1, 
      borderColor: '#A7F3D0', 
      borderRadius: 16, 
      padding: 24, 
      alignItems: 'center',
  },
  successIcon: {
      width: 40, 
      height: 40,
      borderRadius: 20,
      backgroundColor: '#10B981',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
  },
  resultTitle: { fontSize: 18, fontWeight: '700', color: '#065F46', marginBottom: 16 },
  
  resultRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(6, 95, 70, 0.1)',
      paddingBottom: 8,
  },
  resultLabel: {
      fontSize: 14,
      color: '#047857',
      fontWeight: '600',
  },
  resultValue: {
      fontSize: 14,
      color: '#064E3B',
  },
  resultValueID: {
      fontSize: 12,
      color: '#064E3B',
      fontFamily: 'monospace',
      backgroundColor: 'rgba(255,255,255,0.5)',
      paddingHorizontal: 4,
      borderRadius: 4,
  },

  shareBtn: { 
      marginTop: 16, 
      width: '100%',
      backgroundColor: '#fff',
      borderColor: '#10B981',
      borderWidth: 1,
  },
});
