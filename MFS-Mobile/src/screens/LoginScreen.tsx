import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius } from '../theme';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import TopAppBar from '../components/TopAppBar';
import { MaterialIcons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const setUser = useAuthStore((s) => s.setUser);
  const setTokens = useAuthStore((s) => s.setTokens);
  const showToast = useUIStore((s) => s.showToast);

  const handleLogin = async () => {
    if (!email || !password) { showToast('Please fill in all fields', 'error'); return; }
    try {
      const isPhone = /^[+\d][\d\s\-().]{6,}$/.test(email.trim());
      const credentials = isPhone
        ? { phone: email.trim(), password }
        : { email: email.trim(), password };
      const data = await authService.login(credentials);
      setUser(data.user);
      setTokens(data.accessToken, data.refreshToken);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Login failed', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <TopAppBar />
      
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeIn.duration(600)}>
            {/* Header */}
            <View style={styles.headerBox}>
              <Text style={styles.title}>ACCESS TERMINAL</Text>
              <Text style={styles.subtitle}>Institutional Grade Security Protocol</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, isEmailFocused && styles.inputFocused]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@domain.com"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                  />
                  <MaterialIcons 
                    name="alternate-email" 
                    size={18} 
                    color={isEmailFocused ? colors.primary : colors.textMuted} 
                    style={styles.inputIcon} 
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Passphrase</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, isPasswordFocused && styles.inputFocused]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
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
                <TouchableOpacity style={styles.forgotBox}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionBox}>
              <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8}>
                <Text style={styles.buttonText}>SIGN IN</Text>
              </TouchableOpacity>

            </View>

            {/* Footer */}
            <View style={styles.footerBox}>
              <Text style={styles.footerText}>
                Don't have an account?{' '}
                <Text style={styles.link} onPress={() => navigation.navigate('Register')}>REGISTER</Text>
              </Text>
              
              <View style={styles.securityBadges}>
                <Text style={styles.badgeText}>SECURED BY MFS 256-BIT</Text>
                <Text style={styles.badgeText}>•</Text>
                <Text style={styles.badgeText}>EST 2024</Text>
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
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl, paddingTop: spacing.xl },
  
  headerBox: { marginBottom: 48 },
  title: { ...typography.h1, color: colors.primary, marginBottom: spacing.xs, letterSpacing: -1 },
  subtitle: { ...typography.caption, color: colors.textSecondary, letterSpacing: 2 },
  
  form: { gap: 40 },
  inputGroup: { gap: spacing.xs },
  label: { ...typography.caption, color: colors.textSecondary, letterSpacing: 1.5 },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  input: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    color: colors.primary,
    ...typography.numberMd,
    paddingVertical: 12,
    paddingRight: 40,
    height: 52,
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
  forgotBox: { alignItems: 'flex-end', marginTop: spacing.sm },
  forgotText: { ...typography.caption, color: colors.primary },
  
  actionBox: { marginTop: spacing.xl, paddingTop: spacing.xl, gap: spacing.xl },
  button: { 
    backgroundColor: colors.primary, 
    borderRadius: borderRadius.lg, 
    paddingVertical: spacing.md, 
    alignItems: 'center', 
    height: 56, 
    justifyContent: 'center' 
  },
  buttonText: { ...typography.button, color: colors.bg, fontWeight: '800', letterSpacing: 2 },
  
  dividerBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dividerLine: { height: 1, backgroundColor: colors.borderLight, flex: 1 },
  dividerText: { ...typography.caption, fontSize: 9, color: colors.textSecondary, paddingHorizontal: spacing.md, opacity: 0.5 },
  
  authGrid: { flexDirection: 'row', gap: spacing.md },
  authOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.lg,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  authOptionText: { ...typography.caption, color: colors.primary },

  footerBox: { marginTop: 64, alignItems: 'center', gap: spacing.xl },
  footerText: { ...typography.body, color: colors.textSecondary },
  link: { color: colors.primary, fontWeight: '700' },
  securityBadges: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  badgeText: { ...typography.caption, fontSize: 9, color: colors.textMuted },
});
