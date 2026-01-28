// ✅ Profile Screen - Built from Figma
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import {
  Dialog,
  Portal,
  SegmentedButtons,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import figmaTokens from '../../design-system/figmaTokens';
import { FigmaCard } from '../../design-system/FigmaCard';
import { FigmaButton } from '../../design-system/FigmaButton';
import { FigmaInput } from '../../design-system/FigmaInput';
import { HeaderBar } from '../../design-system/HeaderBar';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age?.toString() || '',
    gender: user?.gender || '',
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
    goal: user?.goal || 'Maintain',
  });

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      age: user?.age?.toString() || '',
      gender: user?.gender || '',
      height: user?.height?.toString() || '',
      weight: user?.weight?.toString() || '',
      goal: user?.goal || 'Maintain',
    });
  }, [user]);

  const handleSave = async () => {
    if (!formData.height || !formData.weight) {
      Alert.alert('Error', 'Please enter height and weight');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        goal: formData.goal,
      });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation is handled automatically by AppNavigator when user becomes null
    } catch (err) {
      // Even if logout fails, try again
      await logout();
    }
  };

  const initials = (formData.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const getHealthStatus = () => {
    const h = parseFloat(formData.height);
    const w = parseFloat(formData.weight);
    if (!h || !w) return { status: 'Unknown', color: figmaTokens.colors.gray600 };
    const bmi = +(w / ((h / 100) * (h / 100))).toFixed(1);
    if (bmi < 18.5) return { status: 'Underweight', color: figmaTokens.colors.red600 };
    if (bmi < 25) return { status: 'Normal', color: figmaTokens.colors.green600 };
    if (bmi < 30) return { status: 'Overweight', color: figmaTokens.colors.orange600 };
    return { status: 'Obese', color: figmaTokens.colors.red600 };
  };

  const healthStatus = getHealthStatus();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <HeaderBar
          title="My Profile"
          onBack={() => navigation.goBack()}
          backgroundColor={figmaTokens.colors.white}
        />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.title}>My Profile</Text>
            <Text style={styles.subtitle}>Manage your personal information</Text>
          </View>

          <FigmaCard style={styles.card}>
            <FigmaInput
              label="Full Name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              style={styles.input}
            />
            <FigmaInput
              label="Age (years)"
              value={formData.age}
              onChangeText={(text) => setFormData({ ...formData, age: text })}
              keyboardType="numeric"
              style={styles.input}
            />

            <Text style={styles.label}>Gender</Text>
            <SegmentedButtons
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
              buttons={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
              style={styles.segmentedButtons}
            />

            <FigmaInput
              label="Height (cm)"
              value={formData.height}
              onChangeText={(text) => setFormData({ ...formData, height: text })}
              keyboardType="numeric"
              style={styles.input}
            />

            <FigmaInput
              label="Weight (kg)"
              value={formData.weight}
              onChangeText={(text) => setFormData({ ...formData, weight: text })}
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>Health Status</Text>
              <Text style={[styles.statusValue, { color: healthStatus.color }]}>
                {healthStatus.status}
              </Text>
            </View>

            <View style={styles.goalSection}>
              <Text style={styles.label}>Goal</Text>
              <SegmentedButtons
                value={formData.goal}
                onValueChange={(val) => setFormData({ ...formData, goal: val })}
                buttons={[
                  { value: 'Lose', label: 'Lose' },
                  { value: 'Maintain', label: 'Maintain' },
                  { value: 'Gain', label: 'Gain' },
                ]}
                style={styles.segmentedButtons}
              />
            </View>

            <FigmaButton
              title="Save Changes"
              onPress={handleSave}
              loading={saving}
              fullWidth
              style={styles.saveButton}
            />
          </FigmaCard>

          <FigmaButton
            title="Logout"
            onPress={() => setShowLogout(true)}
            variant="outline"
            fullWidth
            style={styles.logoutButton}
            textStyle={{ color: figmaTokens.colors.destructive }}
          />

          <Portal>
            <Dialog visible={showLogout} onDismiss={() => setShowLogout(false)} style={styles.dialog}>
              <Dialog.Title style={styles.dialogTitle}>Logout</Dialog.Title>
              <Dialog.Content>
                <Text style={styles.dialogText}>Are you sure you want to logout?</Text>
              </Dialog.Content>
              <Dialog.Actions style={styles.dialogActions}>
                <TouchableOpacity
                  style={styles.dialogButton}
                  onPress={() => setShowLogout(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dialogButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dialogButton, styles.dialogButtonDestructive]}
                  onPress={() => {
                    setShowLogout(false);
                    handleLogout();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dialogButtonText, { color: figmaTokens.colors.destructive }]}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: figmaTokens.colors.gray50,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: figmaTokens.spacing['6'],
    paddingTop: figmaTokens.spacing['8'],
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: figmaTokens.colors.blue50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: figmaTokens.spacing['4'],
  },
  avatarText: {
    fontSize: figmaTokens.typography.fontSize['2xl'],
    fontWeight: figmaTokens.typography.fontWeight.bold,
    color: figmaTokens.colors.primary,
  },
  title: {
    fontSize: figmaTokens.typography.fontSize['2xl'],
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
    marginBottom: figmaTokens.spacing['1'],
  },
  subtitle: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray600,
  },
  card: {
    margin: figmaTokens.spacing['6'],
    marginTop: 0,
  },
  input: {
    marginBottom: 0,
  },
  label: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
    marginBottom: figmaTokens.spacing['2'],
    marginTop: figmaTokens.spacing['4'],
  },
  segmentedButtons: {
    marginBottom: figmaTokens.spacing['4'],
  },
  statusCard: {
    backgroundColor: figmaTokens.colors.blue50,
    borderRadius: figmaTokens.borderRadius.xl,
    padding: figmaTokens.spacing['4'],
    marginVertical: figmaTokens.spacing['4'],
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: figmaTokens.typography.fontSize.sm,
    color: figmaTokens.colors.mutedForeground,
    marginBottom: figmaTokens.spacing['1'],
  },
  statusValue: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.bold,
  },
  goalSection: {
    marginTop: figmaTokens.spacing['4'],
  },
  saveButton: {
    marginTop: figmaTokens.spacing['4'],
  },
  logoutButton: {
    marginHorizontal: figmaTokens.spacing['6'],
    marginBottom: figmaTokens.spacing['8'],
    borderColor: figmaTokens.colors.destructive,
  },
  dialog: {
    backgroundColor: figmaTokens.colors.white,
    borderRadius: figmaTokens.borderRadius.xl,
  },
  dialogTitle: {
    fontSize: figmaTokens.typography.fontSize.xl,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.gray900,
  },
  dialogText: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray700,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: figmaTokens.spacing['2'],
    paddingTop: figmaTokens.spacing['4'],
  },
  dialogButton: {
    paddingHorizontal: figmaTokens.spacing['4'],
    paddingVertical: figmaTokens.spacing['2'],
    borderRadius: figmaTokens.borderRadius.base,
  },
  dialogButtonText: {
    fontSize: figmaTokens.typography.fontSize.base,
    fontWeight: figmaTokens.typography.fontWeight.medium,
    color: figmaTokens.colors.primary,
  },
});
