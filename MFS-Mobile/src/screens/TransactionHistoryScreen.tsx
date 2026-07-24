import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import TransactionItem from '../components/TransactionItem';
import TopAppBar from '../components/TopAppBar';
import Skeleton from '../components/Skeleton';
import { walletService } from '../services/walletService';
import type { Transaction } from '../types';

export default function TransactionHistoryScreen({ navigation }: any) {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'SENT' | 'RECEIVED'>('ALL');

  const load = async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await walletService.getTransactions(20, pageNum * 20);
      if (data.transactions?.length < 20) setHasMore(false);
      setTxs(prev => pageNum === 0 ? (data.transactions || []) : [...prev, ...(data.transactions || [])]);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(0); }, []);

  const filteredTxs = txs.filter(tx => {
    if (filter === 'ALL') return true;
    if (filter === 'SENT') return tx.type === 'send';
    if (filter === 'RECEIVED') return tx.type === 'receive';
    return true;
  });

  const renderFilterTab = (label: 'ALL' | 'SENT' | 'RECEIVED') => {
    const isActive = filter === label;
    return (
      <TouchableOpacity 
        style={[styles.filterTab, isActive && styles.filterTabActive]} 
        onPress={() => setFilter(label)}
        activeOpacity={0.7}
      >
        <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TopAppBar 
        title="TRANSACTION LOG"
        leftIcon="arrow-back" 
        onLeftPress={() => navigation.goBack()}
      />

      <View style={styles.filterContainer}>
        {renderFilterTab('ALL')}
        {renderFilterTab('RECEIVED')}
        {renderFilterTab('SENT')}
      </View>

      {loading && txs.length === 0 ? (
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Skeleton width={40} height={40} borderRadius={20} />
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton width={'60%'} height={12} />
                <Skeleton width={'40%'} height={10} />
              </View>
              <Skeleton width={80} height={14} />
            </View>
          ))}
        </View>
      ) : (<FlatList
        data={filteredTxs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem transaction={item} onPress={() => navigation.navigate('TransactionDetail', { transaction: item })} />}
        contentContainerStyle={styles.list}
        onEndReached={() => { if (hasMore && !loading) { const next = page + 1; setPage(next); load(next); } }}
        ListFooterComponent={loading ? <View style={styles.loader}><ActivityIndicator color={colors.primary} /></View> : null}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="receipt-long" size={32} color={colors.borderLight} />
              <Text style={styles.emptyTitle}>NO TRANSACTIONS</Text>
              <Text style={styles.emptySubtitle}>AWAITING NETWORK ACTIVITY...</Text>
            </View>
          ) : null
        }
      />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  
  filterContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgSecondary,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterTabActive: {
    borderColor: colors.borderLight,
    backgroundColor: colors.bgCard,
  },
  filterTabText: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 1.5,
  },
  filterTabTextActive: {
    color: colors.primary,
  },

  list: { 
    paddingHorizontal: spacing.md, 
    paddingTop: spacing.md,
    paddingBottom: 100, 
  },
  loader: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  
  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 60, 
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    marginTop: spacing.xl,
  },
  emptyTitle: { 
    ...typography.caption, 
    color: colors.textSecondary, 
    letterSpacing: 2,
    marginTop: spacing.sm,
  },
  emptySubtitle: { 
    ...typography.bodySmall, 
    color: colors.textMuted, 
    letterSpacing: 1.5, 
  },
});
