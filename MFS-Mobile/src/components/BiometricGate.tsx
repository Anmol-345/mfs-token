import { useState, useEffect, useRef, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, AppState } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { colors, spacing, borderRadius, typography } from '../theme';
import { useAuthStore } from '../stores/authStore';

interface BiometricGateProps {
  children: ReactNode;
}

export default function BiometricGate({ children }: BiometricGateProps) {
  const [locked, setLocked] = useState(false);
  const bgTimestamp = useRef<number>(0);
  const biometricEnabled = useAuthStore((s) => s.biometricEnabled);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocked(false);
      return;
    }

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        bgTimestamp.current = Date.now();
      } else if (state === 'active') {
        if (!biometricEnabled) return;
        const elapsed = Date.now() - bgTimestamp.current;
        if (bgTimestamp.current > 0 && elapsed > 120000) {
          setLocked(true);
        }
      }
    });

    return () => sub.remove();
  }, [isAuthenticated, biometricEnabled]);

  const handleUnlock = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock MFS Wallet',
        fallbackLabel: 'Use passcode',
      });
      if (result.success) {
        setLocked(false);
      }
    } catch {
      setLocked(true);
    }
  };

  if (!locked) return <>{children}</>;

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>MFS</Text>
      <Text style={styles.subtitle}>Wallet Locked</Text>
      <TouchableOpacity style={styles.button} onPress={handleUnlock} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Unlock with Biometrics</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  logo: {
    fontSize: 56,
    color: colors.primary,
    fontWeight: '800',
    letterSpacing: 12,
  },
  subtitle: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  buttonText: {
    ...typography.button,
    color: colors.black,
  },
});
