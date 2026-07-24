import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../theme';
import { useAuthStore } from '../stores/authStore';
import * as LocalAuthentication from 'expo-local-authentication';
import TopAppBar from '../components/TopAppBar';

export default function SettingsScreen({ navigation }: any) {
  const biometricEnabled = useAuthStore((s) => s.biometricEnabled);
  const setBiometric = useAuthStore((s) => s.setBiometric);
  const user = useAuthStore((s) => s.user);
  const [notifEnabled, setNotifEnabled] = useState(true);

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) return;
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Enable biometrics' });
      if (!result.success) return;
    }
    setBiometric(value);
  };

  return (
    <View style={styles.container}>
      <TopAppBar 
        title="SYSTEM CONFIGURATION"
        leftIcon="arrow-back" 
        onLeftPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeIn.duration(600)}>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            <View style={styles.row}><Text style={styles.rowLabel}>Email</Text><Text style={styles.rowValue}>{user?.email ?? 'N/A'}</Text></View>
            <View style={styles.row}><Text style={styles.rowLabel}>Phone</Text><Text style={styles.rowValue}>{user?.phone ?? 'N/A'}</Text></View>
          </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Biometric Unlock</Text>
            <Switch value={biometricEnabled} onValueChange={handleBiometricToggle} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.white} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Push Notifications</Text>
            <Switch value={notifEnabled} onValueChange={setNotifEnabled} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.white} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.row}><Text style={styles.rowLabel}>Version</Text><Text style={styles.rowValue}>1.0.0</Text></View>
          <View style={styles.row}><Text style={styles.rowLabel}>Network</Text><Text style={styles.rowValue}>Sepolia</Text></View>
        </View>
      </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, paddingTop: spacing.xxl },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xl },
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.label, color: colors.primary, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xs },
  rowLabel: { ...typography.body, color: colors.textPrimary },
  rowValue: { ...typography.bodySmall, color: colors.textSecondary },
});
