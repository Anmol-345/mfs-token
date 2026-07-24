import { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';
import OTPInput from '../components/OTPInput';
import { walletService } from '../services/walletService';
import { useUIStore } from '../stores/uiStore';

export default function SendOTPScreen({ navigation, route }: any) {
  const { toAddress, amount, memo } = route.params || {};
  const showToast = useUIStore((s) => s.showToast);

  const handleComplete = useCallback(async (code: string) => {
    try {
      const result = await walletService.completeSend({
        toAddress, amount, memo: memo || undefined, otp: code,
      });
      showToast('Transfer successful!', 'success');
      navigation.replace('TransactionDetail', { transaction: { ...result, toAddress, amount, status: 'confirmed', type: 'send' } });
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Verification failed', 'error');
    }
  }, [toAddress, amount, memo, navigation, showToast]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Confirm Transfer</Text>
        <Text style={styles.subtitle}>Enter the OTP sent to your registered channels</Text>
        <View style={styles.txPreview}>
          <Text style={styles.txLabel}>Sending {parseFloat(amount).toFixed(4)} MFS</Text>
          <Text style={styles.txAddress}>
            {toAddress && toAddress.length > 12 
              ? `${toAddress.substring(0, 6)}...${toAddress.substring(toAddress.length - 6)}` 
              : toAddress}
          </Text>
        </View>
        <OTPInput length={6} onComplete={handleComplete} />
      </View>
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
});
