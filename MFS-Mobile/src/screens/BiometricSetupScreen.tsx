import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../theme';
import { useAuthStore } from '../stores/authStore';
import * as LocalAuthentication from 'expo-local-authentication';

export default function BiometricSetupScreen({ navigation }: any) {
  const setBiometric = useAuthStore((s) => s.setBiometric);

  const handleEnable = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (compatible) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric unlock',
      });
      if (result.success) {
        setBiometric(true);
      }
    }
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
        <Text style={styles.emoji}>🔒</Text>
        <Text style={styles.title}>Secure Your Wallet</Text>
        <Text style={styles.subtitle}>
          Enable Face ID or fingerprint to quickly access your wallet and authorize transactions.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleEnable} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Enable Biometrics</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setBiometric(false); navigation.replace('MainTabs'); }}>
          <Text style={styles.skip}>Skip for now</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
  content: { padding: spacing.xl, alignItems: 'center', gap: spacing.lg },
  emoji: { fontSize: 64 },
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  button: { backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, width: '100%', alignItems: 'center', height: 52, justifyContent: 'center' },
  buttonText: { ...typography.button, color: colors.white },
  skip: { ...typography.body, color: colors.textMuted, marginTop: spacing.md },
});
