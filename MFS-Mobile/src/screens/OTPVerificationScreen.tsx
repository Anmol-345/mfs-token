import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../theme';
import OTPInput from '../components/OTPInput';
import { otpService } from '../services/otpService';
import { useUIStore } from '../stores/uiStore';

interface Props {
  navigation: any;
  route: any;
}

export default function OTPVerificationScreen({ navigation, route }: Props) {
  const { recipient, purpose, onVerified } = route.params || {};
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const showToast = useUIStore((s) => s.showToast);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
    setCanResend(true);
  }, [timer]);

  const handleResend = async () => {
    try {
      await otpService.send({ recipient, purpose });
      setTimer(60);
      setCanResend(false);
      showToast('OTP resent to all channels', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to resend', 'error');
    }
  };

  const handleComplete = useCallback(async (code: string) => {
    try {
      await otpService.verify({ recipient, purpose, otp: code });
      showToast('Verified successfully', 'success');
      if (onVerified) onVerified();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Invalid OTP', 'error');
    }
  }, [recipient, purpose, onVerified]);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to your email, SMS, and WhatsApp
        </Text>
        <OTPInput length={6} onComplete={handleComplete} />
        <TouchableOpacity
          onPress={handleResend}
          disabled={!canResend}
          style={[styles.resendButton, !canResend && styles.disabled]}
        >
          <Text style={[styles.resendText, !canResend && styles.disabledText]}>
            {canResend ? 'Resend Code' : `Resend in ${timer}s`}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
  content: { padding: spacing.xl, alignItems: 'center', gap: spacing.xl },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  resendButton: { marginTop: spacing.md },
  resendText: { ...typography.button, color: colors.primary },
  disabled: { opacity: 0.5 },
  disabledText: { color: colors.textMuted },
});
