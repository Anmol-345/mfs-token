import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';
import type { Transaction } from '../types';

interface TransactionItemProps {
  transaction: Transaction;
  index: number;
  onPress?: () => void;
}

export default function TransactionItem({ transaction, index, onPress }: TransactionItemProps) {
  const isSend = transaction.type === 'send';
  const isFailed = transaction.status === 'failed';
  const isPending = transaction.status === 'pending';
  const sign = isSend ? '-' : '+';
  
  const shortAddress = transaction.toAddress 
    ? `${transaction.toAddress.slice(0, 4)}...${transaction.toAddress.slice(-4)}`
    : 'System';
    
  const dateStr = new Date(transaction.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  }).toUpperCase();
  const timeStr = new Date(transaction.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  const dateFormatted = `${dateStr}, ${timeStr}`;
  
  const isZebra = index % 2 === 0;

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        isZebra ? styles.zebraEven : styles.zebraOdd,
        isPending && styles.pending
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{isSend ? 'S' : 'R'}</Text>
        </View>
        <View>
          <Text style={styles.addressText}>{shortAddress}</Text>
          <Text style={styles.dateText}>{dateFormatted}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: isFailed ? colors.textMuted : colors.textPrimary }]}>
          {sign}{parseFloat(transaction.amount).toFixed(2)}
        </Text>
        <Text style={styles.statusText}>
          {isFailed ? 'FAILED' : isPending ? 'PENDING' : isSend ? 'SENT' : 'RECEIVED'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  zebraEven: { backgroundColor: colors.bgSecondary },
  zebraOdd: { backgroundColor: colors.bg },
  pending: { opacity: 0.7 },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatarBox: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.numberSm,
    color: colors.primary,
  },
  addressText: { 
    ...typography.numberSm, 
    color: colors.primary 
  },
  dateText: { 
    ...typography.caption, 
    fontSize: 9,
    color: colors.textSecondary, 
    marginTop: 2 
  },
  right: { alignItems: 'flex-end' },
  amount: { 
    ...typography.numberMd, 
    color: colors.primary 
  },
  statusText: { 
    ...typography.caption, 
    fontSize: 9,
    color: colors.textSecondary, 
    marginTop: 2 
  },
});
