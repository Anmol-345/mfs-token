import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';
import Skeleton from './Skeleton';

interface BalanceCardProps {
  balance: string;
  ethBalance?: string;
  address?: string;
}

export default function BalanceCard({ balance, ethBalance }: BalanceCardProps) {
  const isLoading = !balance || balance === '0.00000000';
  const numericValue = parseFloat(balance) || 0;
  const formatted = numericValue.toLocaleString(undefined, { minimumFractionDigits: 8, maximumFractionDigits: 8 });

  if (isLoading) {
    return (
      <View style={styles.card}>
        <View style={styles.contentGroup}>
          <Skeleton width={100} height={10} style={{ marginBottom: 12 }} />
          <Skeleton width={'80%'} height={44} style={{ marginBottom: 8 }} />
          <Skeleton width={140} height={10} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.contentGroup}>
        <Text style={styles.label}>TOTAL ASSETS</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>{formatted}</Text>
          <Text style={styles.currency}>MFS</Text>
        </View>
        {ethBalance !== undefined && (
          <View style={styles.subBalanceRow}>
            <Text style={styles.subBalanceLabel}>TESTNET GAS:</Text>
            <Text style={styles.subBalance}>{parseFloat(ethBalance || '0').toFixed(6)} ETH</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    width: '100%',
  },
  contentGroup: {
    gap: spacing.xs,
  },
  label: { 
    ...typography.caption, 
    color: colors.textSecondary, 
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  balance: { 
    fontSize: 40,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  currency: {
    ...typography.numberMd,
    color: colors.textSecondary,
  },
  subBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  subBalanceLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  subBalance: {
    ...typography.numberSm,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
