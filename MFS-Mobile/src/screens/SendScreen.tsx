import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../theme';
import { walletService } from '../services/walletService';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import TopAppBar from '../components/TopAppBar';
import { MaterialIcons } from '@expo/vector-icons';

export default function SendScreen({ navigation, route }: any) {
  const [toAddress, setToAddress] = useState(route.params?.scannedAddress || '');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const showToast = useUIStore((s) => s.showToast);
  const biometricEnabled = useAuthStore((s) => s.biometricEnabled);

  // Countdown timer for cooldown
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const t = setInterval(() => {
      setCooldownSeconds((s) => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [cooldownSeconds > 0]);

  useEffect(() => {
    if (route.params?.scannedAddress) {
      setToAddress(route.params.scannedAddress);
    }
  }, [route.params?.scannedAddress]);

  const numericAmount = parseFloat(amount) || 0;
  const fee = 1.24; // Network fee from design
  const total = numericAmount + fee;

  const handleInitiate = async () => {
    if (cooldownSeconds > 0) return;
    if (!toAddress || !amount) { showToast('Fill in all fields', 'error'); return; }
    if (!toAddress.match(/^0x[a-fA-F0-9]{40}$/) && !toAddress.endsWith('.eth')) { showToast('Invalid address', 'error'); return; }

    if (biometricEnabled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm transfer',
        fallbackLabel: 'Use passcode',
      });
      if (!result.success) {
        showToast('Biometric authentication required', 'error');
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await walletService.initiateSend({
        toAddress, amount: numericAmount, memo: memo || undefined,
      });
      navigation.navigate('SendOTP', { toAddress, amount: numericAmount, memo, message: res.message });
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.remaining) {
        setCooldownSeconds(data.remaining);
        showToast(`OTP already sent. Wait ${data.remaining}s before requesting again.`, 'error');
      } else {
        showToast(data?.error || 'Send failed', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = () => {
    navigation.navigate('QRScanner', { returnTo: 'Send' });
  };

  return (
    <View style={styles.container}>
      <TopAppBar 
        title="SEND ASSETS"
        leftIcon="arrow-back" 
        onLeftPress={() => navigation.goBack()}
        rightIcon="notifications-none"
      />
      
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeIn.duration(600)}>
            
            {/* Recipient Section */}
            <View style={styles.section}>
              <Text style={styles.label}>RECIPIENT ADDRESS</Text>
              <View style={styles.inputWrapperBorder}>
                <TextInput 
                  style={styles.inputAddress} 
                  value={toAddress} 
                  onChangeText={setToAddress} 
                  placeholder="0x... or ENS name" 
                  placeholderTextColor={colors.textMuted} 
                  autoCapitalize="none" 
                />
                <TouchableOpacity style={styles.scanBtnInside} onPress={handleScan} activeOpacity={0.7}>
                  <MaterialIcons name="qr-code-scanner" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Amount Section */}
            <View style={styles.section}>
              <Text style={styles.label}>AMOUNT (MFS)</Text>
              <View style={styles.amountBox}>
                <TextInput 
                  style={styles.amountInput} 
                  value={amount} 
                  onChangeText={setAmount} 
                  placeholder="0.00" 
                  placeholderTextColor={colors.textMuted} 
                  keyboardType="decimal-pad" 
                />
                <Text style={styles.usdText}>≈ ${(numericAmount * 1.0).toFixed(2)} USD</Text>
              </View>
              <View style={styles.amountPresets}>
                {['25%', '50%', 'MAX'].map(p => (
                  <TouchableOpacity key={p} style={styles.presetBtn} activeOpacity={0.7}>
                    <Text style={styles.presetText}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Transaction Details (Hairline Grid) */}
            <View style={styles.section}>
              <Text style={styles.label}>TRANSACTION DETAILS</Text>
              <View style={styles.hairlineGrid}>
                {/* Row 1 */}
                <View style={[styles.gridCell, styles.gridCellBorderRight, styles.gridCellBorderBottom]}>
                  <Text style={styles.gridLabel}>SUBTOTAL</Text>
                </View>
                <View style={[styles.gridCell, styles.gridCellBorderBottom]}>
                  <Text style={styles.gridValueRight}>{numericAmount.toFixed(2)} MFS</Text>
                </View>
                {/* Row 2 */}
                <View style={[styles.gridCell, styles.gridCellBorderRight, styles.gridCellBorderBottom]}>
                  <Text style={styles.gridLabel}>NETWORK FEE</Text>
                </View>
                <View style={[styles.gridCell, styles.gridCellBorderBottom]}>
                  <Text style={styles.gridValueRight}>{fee.toFixed(2)} MFS</Text>
                </View>
                {/* Row 3 */}
                <View style={[styles.gridCell, styles.gridCellBorderRight, { backgroundColor: colors.bgElevated }]}>
                  <Text style={[styles.gridLabel, { color: colors.primary }]}>TOTAL TO PAY</Text>
                </View>
                <View style={[styles.gridCell, { backgroundColor: colors.bgElevated }]}>
                  <Text style={[styles.gridValueRight, { color: colors.primary }]}>{total.toFixed(2)} MFS</Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <TouchableOpacity 
              style={[styles.button, (isLoading || cooldownSeconds > 0) && styles.buttonDisabled]} 
              onPress={handleInitiate} 
              activeOpacity={0.8}
              disabled={isLoading || cooldownSeconds > 0}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.bg} size="small" />
              ) : cooldownSeconds > 0 ? (
                <Text style={styles.buttonText}>WAIT {cooldownSeconds}s</Text>
              ) : (
                <Text style={styles.buttonText}>INITIATE TRANSFER</Text>
              )}
            </TouchableOpacity>

            {/* Aesthetic Filler Card */}
            <View style={styles.fillerCard}>
              <MaterialIcons name="security" size={48} color={colors.textSecondary} />
              <View style={styles.fillerTextCol}>
                <Text style={styles.fillerTitle}>SECURE PROTOCOL</Text>
                <Text style={styles.fillerBody}>This transaction is protected by multi-sig cold storage and biometric verification.</Text>
              </View>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 100 },
  
  section: { marginBottom: spacing.xl },
  label: { ...typography.caption, color: colors.textSecondary, letterSpacing: 1.5, marginBottom: spacing.sm },
  
  inputWrapperBorder: {
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  inputAddress: {
    color: colors.primary,
    ...typography.numberMd,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingRight: 48,
  },
  scanBtnInside: {
    position: 'absolute',
    right: spacing.sm,
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },

  amountBox: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    minHeight: 80,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  usdText: {
    ...typography.numberSm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  amountPresets: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  presetBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  presetText: {
    ...typography.caption,
    color: colors.primary,
  },

  hairlineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.borderLight, // gaps
  },
  gridCell: {
    width: '49.8%', // To allow for 1px gap from border (simulate grid gap)
    flexGrow: 1,
    backgroundColor: colors.bg,
    padding: spacing.md,
    justifyContent: 'center',
  },
  gridCellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
  },
  gridCellBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  gridLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  gridValueRight: {
    ...typography.numberMd,
    color: colors.textSecondary,
    textAlign: 'right',
  },

  button: { 
    backgroundColor: colors.primary, 
    borderRadius: borderRadius.sm, 
    paddingVertical: 20, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: { ...typography.h3, fontSize: 16, color: colors.bg, fontWeight: '800', letterSpacing: 2 },
  
  fillerCard: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgElevated,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  fillerTextCol: {
    flex: 1,
  },
  fillerTitle: {
    ...typography.caption,
    color: colors.primary,
  },
  fillerBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
