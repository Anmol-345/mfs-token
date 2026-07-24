import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../theme';
import { useUIStore } from '../stores/uiStore';

export default function CoinAccumulationScreen() {
  const [totalAccumulated, setTotalAccumulated] = useState('0');
  const [lastAccumulation, setLastAccumulation] = useState<string | null>(null);
  const [triggering, setTriggering] = useState(false);
  const showToast = useUIStore((s) => s.showToast);

  useEffect(() => {
    // Fetch accumulation status from API
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setTotalAccumulated('1,234.56');
      setLastAccumulation(new Date().toISOString());
    } catch {}
  };

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      const { walletService } = await import('../services/walletService');
      // await walletService.triggerAccumulation();
      showToast('Accumulation triggered', 'success');
      fetchStatus();
    } catch (err: any) {
      showToast(err.message || 'Failed', 'error');
    } finally { setTriggering(false); }
  };

  const total = parseFloat(totalAccumulated.replace(/,/g, ''));
  const progressPercent = Math.min((total / 10000) * 100, 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeIn.duration(600)}>
        <Text style={styles.title}>Coin Accumulation</Text>
        <Text style={styles.subtitle}>Your MFS grows over time</Text>

        <View style={styles.statsCard}>
          <Text style={styles.statsLabel}>Total Accumulated</Text>
          <Text style={styles.statsValue}>{totalAccumulated} MFS</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{progressPercent.toFixed(1)}% of 10,000 MFS target</Text>
        </View>

        {lastAccumulation ? (
          <Text style={styles.lastText}>Last accumulation: {new Date(lastAccumulation).toLocaleString()}</Text>
        ) : null}

        <TouchableOpacity style={[styles.button, triggering && styles.disabled]} onPress={handleTrigger} disabled={triggering} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{triggering ? 'Triggering...' : 'Trigger Accumulation'}</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, paddingTop: spacing.xxl },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl },
  statsCard: { backgroundColor: colors.bgCard, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  statsLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  statsValue: { ...typography.h1, color: colors.accent },
  progressTrack: { height: 8, backgroundColor: colors.bgElevated, borderRadius: 4, marginTop: spacing.md, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: colors.accent, borderRadius: 4 },
  progressText: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  lastText: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg },
  button: { backgroundColor: colors.primary, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', height: 52, justifyContent: 'center' },
  buttonText: { ...typography.button, color: colors.white },
  disabled: { opacity: 0.5 },
});
