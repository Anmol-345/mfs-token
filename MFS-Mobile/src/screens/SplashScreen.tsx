import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors, spacing, typography } from '../theme';
import { useAuthStore } from '../stores/authStore';

export default function SplashScreen({ navigation }: any) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingComplete = useAuthStore((s) => s.onboardingComplete);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        // AppNavigator handles switch to MainTabs automatically via isAuthenticated
        return;
      } else if (onboardingComplete) {
        navigation.replace('Login');
      } else {
        navigation.replace('Onboarding');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(800)} exiting={FadeOut.duration(400)} style={{ alignItems: 'center' }}>
        <Text style={styles.logo}>MFS</Text>
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>CRYPTO WALLET</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 64,
    lineHeight: 64,
    letterSpacing: -3.2,
    fontWeight: '800',
    color: colors.primary,
    fontFamily: 'Inter',
  },
  subtitleContainer: {
    marginTop: spacing.md,
    opacity: 0.6,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
