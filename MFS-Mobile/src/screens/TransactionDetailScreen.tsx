import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../theme';
import type { Transaction } from '../types';

export default function TransactionDetailScreen({ route }: any) {
  const tx: Transaction = route.params?.transaction;

  if (!tx) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textSecondary }}>Transaction not found</Text>
      </View>
    );
  }

  const statusColor = tx.status === 'confirmed' ? colors.success : tx.status === 'failed' ? colors.error : colors.warning;

  const rows = [
    { label: 'Status', value: tx.status, valueColor: statusColor },
    { label: 'Type', value: tx.type },
    { label: 'Amount', value: `${parseFloat(tx.amount).toFixed(8)} MFS` },
    { label: 'Fee', value: `${parseFloat(tx.fee).toFixed(8)} MFS` },
    { label: 'From', value: tx.fromAddress },
    { label: 'To', value: tx.toAddress },
    { label: 'TX Hash', value: tx.txHash || 'Pending' },
    { label: 'Block', value: tx.blockNumber?.toString() || '—' },
    { label: 'Date', value: new Date(tx.createdAt).toLocaleString() },
    { label: 'Memo', value: tx.memo || '—' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
        <Text style={[styles.statusBadge, { color: statusColor, borderColor: statusColor }]}>{tx.status.toUpperCase()}</Text>
        <Text style={styles.amount}>{parseFloat(tx.amount).toFixed(4)} MFS</Text>
        <Text style={styles.type}>{tx.type.toUpperCase()}</Text>
      </Animated.View>

      <View style={styles.card}>
        {rows.map((r, i) => (
          <View key={i} style={[styles.row, i < rows.length - 1 && styles.rowBorder]}>
            <Text style={styles.label}>{r.label}</Text>
            <Text style={[styles.value, r.valueColor ? { color: r.valueColor } : null]} selectable>{r.value}</Text>
          </View>
        ))}
      </View>

      {tx.txHash ? (
        <TouchableOpacity 
          style={styles.etherscanBtn} 
          onPress={() => Linking.openURL(`https://sepolia.basescan.org/tx/${tx.txHash}`)}
          activeOpacity={0.7}
        >
          <Text style={styles.etherscanText}>View on Basescan</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, paddingTop: spacing.xxl },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  statusBadge: { borderWidth: 1, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, ...typography.caption, fontWeight: '700', marginBottom: spacing.sm },
  amount: { ...typography.number, color: colors.textPrimary, fontSize: 36 },
  type: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  card: { backgroundColor: colors.bgCard, borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  value: { ...typography.bodySmall, color: colors.textPrimary, flex: 1.5, textAlign: 'right' },
  etherscanBtn: { backgroundColor: colors.bgCard, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border },
  etherscanText: { ...typography.button, color: colors.primary },
});
