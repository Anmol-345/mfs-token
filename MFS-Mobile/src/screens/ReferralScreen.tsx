import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Share, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../theme';
import { referralService } from '../services/referralService';
import { useAuthStore } from '../stores/authStore';
import * as Haptics from 'expo-haptics';

import TopAppBar from '../components/TopAppBar';

export default function ReferralScreen({ navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await referralService.getStats();
      setStats(data);
    } catch (err) {}
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const handleShare = async () => {
    if (!user?.referralCode) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Share.share({
      message: `Join MFS Crypto with my referral code: ${user.referralCode}\nDownload the app and start earning!`,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopAppBar 
        title="REFERRALS"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.canGoBack() ? navigation.goBack() : null}
      />
      <ScrollView 
        style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Animated.View entering={FadeIn.duration(600)}>
        <Text style={styles.title}>Referral Program</Text>
        <Text style={styles.subtitle}>Invite friends and earn rewards</Text>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <Text style={styles.referralCode}>{user?.referralCode || '—'}</Text>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
            <Text style={styles.shareBtnText}>Share Code</Text>
          </TouchableOpacity>
        </View>

        {stats && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalReferrals}</Text>
              <Text style={styles.statLabel}>Referrals</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{parseFloat(stats.totalReward || '0').toFixed(2)}</Text>
              <Text style={styles.statLabel}>MFS Earned</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={styles.steps}>
          {[
            { step: 1, text: 'Share your unique referral code with friends' },
            { step: 2, text: 'They sign up using your code' },
            { step: 3, text: 'You earn rewards when they transact' },
          ].map((s) => (
            <View key={s.step} style={styles.stepRow}>
              <View style={styles.stepCircle}><Text style={styles.stepNumber}>{s.step}</Text></View>
              <Text style={styles.stepText}>{s.text}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, paddingTop: spacing.xxl },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl },
  codeCard: { backgroundColor: colors.bgCard, borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  codeLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  referralCode: { ...typography.h2, color: colors.primary, letterSpacing: 4 },
  shareBtn: { marginTop: spacing.md, backgroundColor: colors.primary, borderRadius: borderRadius.full, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  shareBtnText: { ...typography.button, color: colors.black },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.bgCard, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statNumber: { ...typography.h2, color: colors.textPrimary },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
  steps: { gap: spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  stepNumber: { ...typography.button, color: colors.black },
  stepText: { ...typography.body, color: colors.textSecondary, flex: 1 },
});
