import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../theme';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import TopAppBar from '../components/TopAppBar';
import { MaterialIcons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referral, setReferral] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isReferralFocused, setIsReferralFocused] = useState(false);

  const setUser = useAuthStore((s) => s.setUser);
  const setTokens = useAuthStore((s) => s.setTokens);
  const showToast = useUIStore((s) => s.showToast);

  const handleRegister = async () => {
    if (!termsAccepted) {
      showToast('You must accept the Protocols', 'error');
      return;
    }
    try {
      let fullPhone = phone ? phone.trim().replace(/\s+/g, '') : undefined;
      if (fullPhone && !fullPhone.startsWith('+')) {
        fullPhone = '+' + fullPhone;
      }
      const data = await authService.register({ email: email || undefined, phone: fullPhone, password, referralCode: referral || undefined });
      setUser(data.user);
      setTokens(data.accessToken, data.refreshToken);
      navigation.replace('BiometricSetup');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Registration failed', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <TopAppBar 
        leftIcon="arrow-back" 
        onLeftPress={() => navigation.goBack()} 
        rightText="V2.4.0" 
      />
      
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeIn.duration(600)}>
            {/* Header */}
            <View style={styles.headerBox}>
              <Text style={styles.title}>INITIALIZE</Text>
              <Text style={styles.subtitle}>Secure your identity on the MFS network.</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>EMAIL ADDRESS</Text>
                <TextInput
                  style={[styles.input, isEmailFocused && styles.inputFocused]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="USER@PROVIDER.COM"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>PHONE NUMBER</Text>
                <View style={[styles.input, styles.phoneInputContainer, isPhoneFocused && styles.inputFocused]}>
                  <Text style={styles.phonePrefix}>+</Text>
                  <TextInput
                    style={styles.phoneInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="000 000 0000"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    onFocus={() => setIsPhoneFocused(true)}
                    onBlur={() => setIsPhoneFocused(false)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>SECURITY KEY</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, isPasswordFocused && styles.inputFocused]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••••••"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                  />
                  <TouchableOpacity 
                    style={styles.inputIcon} 
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons 
                      name={showPassword ? "visibility-off" : "visibility"} 
                      size={18} 
                      color={isPasswordFocused ? colors.primary : colors.textMuted} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>REFERRAL CODE (OPTIONAL)</Text>
                <TextInput
                  style={[styles.input, isReferralFocused && styles.inputFocused]}
                  value={referral}
                  onChangeText={setReferral}
                  placeholder="MFS-XXXX-XXXX"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                  onFocus={() => setIsReferralFocused(true)}
                  onBlur={() => setIsReferralFocused(false)}
                />
              </View>

              <TouchableOpacity style={styles.termsBox} onPress={() => setTermsAccepted(!termsAccepted)} activeOpacity={0.8}>
                <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                  {termsAccepted && <MaterialIcons name="check" size={14} color={colors.bg} />}
                </View>
                <Text style={styles.termsText}>
                  I acknowledge the decentralized nature of this wallet and accept all <Text style={styles.link}>Protocols</Text>.
                </Text>
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.actionBox}>
              <TouchableOpacity style={styles.button} onPress={handleRegister} activeOpacity={0.8}>
                <Text style={styles.buttonText}>CREATE WALLET</Text>
              </TouchableOpacity>

              <View style={styles.dividerBox}>
                <Text style={styles.footerText}>
                  ALREADY REGISTERED?{' '}
                  <Text style={styles.link} onPress={() => navigation.navigate('Login')}>SIGN IN</Text>
                </Text>
              </View>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Security Badges */}
      <View style={styles.footerSecurityBox}>
        <View style={styles.securityBadge}>
          <MaterialIcons name="lock" size={24} color={colors.textSecondary} style={{ marginBottom: 4 }} />
          <Text style={styles.badgeText}>AES-256</Text>
        </View>
        <View style={styles.securityBadge}>
          <MaterialIcons name="security" size={24} color={colors.textSecondary} style={{ marginBottom: 4 }} />
          <Text style={styles.badgeText}>NON-CUSTODIAL</Text>
        </View>
        <View style={styles.securityBadge}>
          <MaterialIcons name="verified-user" size={24} color={colors.textSecondary} style={{ marginBottom: 4 }} />
          <Text style={styles.badgeText}>SECURE NODE</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl, paddingTop: spacing.xl },
  
  headerBox: { marginBottom: 32 },
  title: { ...typography.h1, color: colors.primary, marginBottom: spacing.xs, letterSpacing: -1 },
  subtitle: { ...typography.body, color: colors.textSecondary },
  
  form: { gap: 32 },
  inputGroup: { gap: spacing.xs },
  label: { ...typography.caption, color: colors.textSecondary, letterSpacing: 1.5 },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  input: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    color: colors.primary,
    ...typography.numberMd,
    paddingVertical: 8,
    height: 48,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0,
  },
  phonePrefix: {
    ...typography.numberMd,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  phoneInput: {
    flex: 1,
    color: colors.primary,
    ...typography.numberMd,
    height: '100%',
  },
  inputFocused: {
    borderBottomColor: colors.primary,
  },
  inputIcon: {
    position: 'absolute',
    right: 0,
    bottom: 12,
    padding: spacing.xs,
  },
  
  termsBox: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginTop: spacing.xs },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  termsText: { flex: 1, ...typography.body, color: colors.textSecondary, lineHeight: 20 },
  link: { color: colors.primary, textDecorationLine: 'underline' },

  actionBox: { marginTop: spacing.xl, paddingTop: spacing.md, gap: spacing.xl },
  button: { 
    backgroundColor: colors.primary, 
    borderRadius: borderRadius.sm, 
    paddingVertical: spacing.md, 
    alignItems: 'center', 
    height: 56, 
    justifyContent: 'center' 
  },
  buttonText: { ...typography.button, color: colors.bg, fontWeight: '800', letterSpacing: 2 },
  
  dividerBox: { alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.xl },
  footerText: { ...typography.body, color: colors.textSecondary },

  footerSecurityBox: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: spacing.xl,
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.bg,
  },
  securityBadge: { alignItems: 'center' },
  badgeText: { ...typography.caption, fontSize: 9, color: colors.textSecondary },
});
