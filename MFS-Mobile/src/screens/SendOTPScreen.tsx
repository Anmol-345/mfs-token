import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors, spacing, typography } from '../theme';
import OTPInput from '../components/OTPInput';
import { walletService } from '../services/walletService';
import { useUIStore } from '../stores/uiStore';

export default function SendOTPScreen({ navigation, route }: any) {
  const { toAddress, amount, memo } = route.params || {};
  const showToast = useUIStore((s) => s.showToast);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleComplete = useCallback(async (code: string) => {
    setIsProcessing(true);
    try {
      const result = await walletService.completeSend({
        toAddress, amount, memo: memo || undefined, otp: code,
      });
      showToast('Transfer successful!', 'success');
      navigation.replace('TransactionDetail', { transaction: { ...result, toAddress, amount, status: 'confirmed', type: 'send' } });
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Verification failed', 'error');
      setIsProcessing(false);
    }
  }, [toAddress, amount, memo, navigation, showToast]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Confirm Transfer</Text>
        <Text style={styles.subtitle}>Enter the OTP sent to your email</Text>
        <View style={styles.txPreview}>
          <Text style={styles.txLabel}>Sending {parseFloat(amount).toFixed(4)} MFS</Text>
          <Text style={styles.txAddress}>
            {toAddress && toAddress.length > 12
              ? `${toAddress.substring(0, 6)}...${toAddress.substring(toAddress.length - 6)}`
              : toAddress}
          </Text>
        </View>
        <OTPInput length={6} onComplete={handleComplete} disabled={isProcessing} />
      </View>

      {/* Full-screen processing overlay */}
      {isProcessing && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.overlay}
        >
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.overlayTitle}>Processing Transaction</Text>
            <Text style={styles.overlaySubtitle}>Broadcasting to blockchain...</Text>
            <Text style={styles.overlayHint}>This may take a few seconds</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
  content: { padding: spacing.xl, alignItems: 'center', gap: spacing.lg },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  txPreview: { backgroundColor: colors.bgCard, borderRadius: 12, padding: spacing.md, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  txLabel: { ...typography.label, color: colors.primary },
  txAddress: { ...typography.bodySmall, fontSize: 11.88, color: colors.textMuted, marginTop: spacing.xs },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 36,
    alignItems: 'center',
    gap: 12,
    width: '80%',
  },
  overlayTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: 8,
  },
  overlaySubtitle: {
    ...typography.body,
    color: colors.primary,
    textAlign: 'center',
  },
  overlayHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
