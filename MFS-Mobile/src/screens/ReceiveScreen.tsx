import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing, typography } from '../theme';
import { useWalletStore } from '../stores/walletStore';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import TopAppBar from '../components/TopAppBar';
import { MaterialIcons } from '@expo/vector-icons';

export default function ReceiveScreen({ navigation }: any) {
  const walletAddress = useWalletStore((s) => s.address);
  const userAddress = useAuthStore((s) => s.user?.mfsAddress);
  const address = userAddress || walletAddress;
  const showToast = useUIStore((s) => s.showToast);

  const copyAddress = async () => {
    if (address) {
      await Clipboard.setStringAsync(address);
      showToast('Address copied to clipboard', 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <View style={styles.container}>
      <TopAppBar 
        title="RECEIVE ASSETS"
        leftIcon="arrow-back" 
        onLeftPress={() => navigation.goBack()}
        rightIcon="qr-code"
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeIn.duration(600)}>
          
          <View style={styles.qrSection}>
            <View style={styles.qrContainer}>
              {address ? (
                <QRCode value={address} size={200} backgroundColor={colors.white} color={colors.black} />
              ) : (
                <View style={styles.qrPlaceholder}><Text style={styles.qrPlaceholderText}>NO ADDRESS</Text></View>
              )}
            </View>

            <View style={styles.addressBox}>
              <View style={styles.addressTextCol}>
                <Text style={styles.addressLabel}>YOUR MFS ADDRESS</Text>
                <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">{address || '—'}</Text>
              </View>
              <TouchableOpacity style={styles.copyButton} onPress={copyAddress} activeOpacity={0.7}>
                <MaterialIcons name="content-copy" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.warningBox}>
            <MaterialIcons name="warning" size={16} color={colors.error} style={{ marginTop: 2 }} />
            <Text style={styles.warningText}>
              SEND ONLY MFS-COMPATIBLE TOKENS TO THIS ADDRESS. SENDING OTHER ASSETS MAY RESULT IN PERMANENT LOSS.
            </Text>
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 100 },
  
  qrSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  qrContainer: { 
    backgroundColor: colors.white, 
    padding: spacing.md, 
    borderWidth: 1, 
    borderColor: colors.borderLight,
    marginBottom: spacing.xl,
  },
  qrPlaceholder: { 
    width: 200, 
    height: 200, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.black 
  },
  qrPlaceholderText: { 
    ...typography.label,
    color: colors.white 
  },
  
  addressBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgElevated,
    padding: spacing.md,
  },
  addressTextCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  addressLabel: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  addressText: {
    ...typography.numberSm,
    color: colors.primary,
    letterSpacing: 1.5,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 51, 0.3)', // error border
    backgroundColor: 'rgba(255, 51, 51, 0.05)', // error bg
    padding: spacing.md,
  },
  warningText: {
    flex: 1,
    ...typography.caption,
    color: colors.error,
    lineHeight: 18,
  }
});
