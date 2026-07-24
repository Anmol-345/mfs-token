import { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../theme';
import BalanceCard from '../components/BalanceCard';
import TransactionItem from '../components/TransactionItem';
import { useWalletStore } from '../stores/walletStore';
import { walletService } from '../services/walletService';
import TopAppBar from '../components/TopAppBar';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotificationStore } from '../stores/notificationStore';

export default function DashboardScreen({ navigation }: any) {
  const balance = useWalletStore((s) => s.balance);
  const transactions = useWalletStore((s) => s.transactions);
  const setBalance = useWalletStore((s) => s.setBalance);
  const setAddress = useWalletStore((s) => s.setAddress);
  const setTransactions = useWalletStore((s) => s.setTransactions);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  
  const { notificationService } = require('../services/notificationService');

  const fetchData = useCallback(async () => {
    try {
      const [bal, txs, notifs] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(5),
        notificationService.list().catch(() => null),
      ]);
      if (bal) { 
        setBalance(bal.balance); 
        useWalletStore.getState().setEthBalance(bal.ethBalance || '0.0000');
        setAddress(bal.address); 
      }
      if (txs) setTransactions(txs.transactions || []);
      if (notifs) setNotifications(notifs.notifications || []);
    } catch {}
  }, []);

  useEffect(() => { fetchData(); const t = setInterval(fetchData, 30000); return () => clearInterval(t); }, []);

  const ethBalance = useWalletStore((s) => s.ethBalance);

  return (
    <View style={styles.container}>
      <TopAppBar 
        rightIcon="notifications-none" 
        onRightPress={() => navigation.navigate('Notifications')}
        hasUnreadNotifications={unreadCount > 0}
      />
      
      <ScrollView 
        contentContainerStyle={styles.content} 
        refreshControl={<RefreshControl refreshing={false} onRefresh={fetchData} tintColor={colors.primary} />}
      >
        <Animated.View entering={FadeIn.duration(600)}>
          <BalanceCard balance={balance} ethBalance={ethBalance} />
        </Animated.View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Send')} activeOpacity={0.7}>
            <MaterialIcons name="north-east" size={14} color={colors.primary} />
            <Text style={styles.actionLabel}>SEND</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Receive')} activeOpacity={0.7}>
            <MaterialIcons name="south-west" size={14} color={colors.primary} />
            <Text style={styles.actionLabel}>RECEIVE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('QRScanner')} activeOpacity={0.7}>
            <MaterialIcons name="qr-code-scanner" size={14} color={colors.primary} />
            <Text style={styles.actionLabel}>SCAN</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.marketsSection}>
          <Text style={styles.sectionTitle}>MARKETS (DEMO)</Text>
          <View style={styles.marketGrid}>
            <View style={styles.marketCard}>
              <Text style={styles.marketCardTitle}>BTC/MFS</Text>
              <Text style={styles.marketCardValue}>+2.4%</Text>
              <View style={[styles.marketSparkline, { borderTopColor: colors.primary, backgroundColor: 'rgba(255,255,255,0.05)' }]} />
            </View>
            <View style={styles.marketCard}>
              <Text style={styles.marketCardTitle}>ETH/MFS</Text>
              <Text style={styles.marketCardValueError}>-1.2%</Text>
              <View style={[styles.marketSparkline, { borderTopColor: colors.error, backgroundColor: 'rgba(255,51,51,0.05)' }]} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TRANSACTION LOG</Text>
            <Text style={styles.sectionLink} onPress={() => navigation.navigate('History')}>SEE ALL</Text>
          </View>
          {transactions.slice(0, 5).map((tx, index) => (
            <TransactionItem key={tx.id} transaction={tx} index={index} onPress={() => navigation.navigate('TransactionDetail', { transaction: tx })} />
          ))}
        </View>

        <View style={styles.networkStatusCard}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>NETWORK STATUS: SYNCED / 128 NODES</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 100 },
  
  quickActions: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    gap: spacing.sm, 
    marginVertical: spacing.lg 
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'transparent',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  actionLabel: { ...typography.caption, color: colors.primary },
  
  marketsSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  marketGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.borderLight,
    gap: 1,
    marginTop: spacing.md,
  },
  marketCard: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.md,
  },
  marketCardTitle: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textSecondary,
  },
  marketCardValue: {
    ...typography.numberMd,
    color: colors.primary,
    marginTop: 2,
  },
  marketCardValueError: {
    ...typography.numberMd,
    color: colors.error,
    marginTop: 2,
  },
  marketSparkline: {
    height: 32,
    marginTop: spacing.sm,
    borderTopWidth: 1,
  },

  section: { marginTop: spacing.md },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: spacing.md, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border, 
    paddingBottom: spacing.sm 
  },
  sectionTitle: { ...typography.caption, color: colors.textSecondary, letterSpacing: 1.5 },
  sectionLink: { ...typography.caption, color: colors.primary },

  networkStatusCard: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgElevated,
    marginBottom: spacing.xl,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981', // Tailwind green-500
  },
  statusText: {
    ...typography.caption,
    color: colors.primary,
  }
});
