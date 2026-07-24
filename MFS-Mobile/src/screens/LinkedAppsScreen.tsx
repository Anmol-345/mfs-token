import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../theme';
import TopAppBar from '../components/TopAppBar';
import type { IntegratedApp } from '../types';

export default function LinkedAppsScreen({ navigation }: any) {
  const [apps, setApps] = useState<IntegratedApp[]>([]);

  useEffect(() => {
    // Fetch from API
    setApps([
      { id: '1', appName: 'MFS Gaming', apiKey: '...', permissions: ['read', 'write'], active: true },
      { id: '2', appName: 'Crypto Tracker', apiKey: '...', permissions: ['read'], active: true },
    ]);
  }, []);

  return (
    <View style={styles.container}>
      <TopAppBar 
        title="LINKED APPS" 
        leftIcon="arrow-back" 
        onLeftPress={() => navigation.goBack()} 
      />
      <FlatList
        data={apps}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<><Text style={styles.title}>Linked Apps</Text><Text style={styles.subtitle}>Connected applications</Text></>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.icon}><Text style={styles.iconText}>A</Text></View>
              <View><Text style={styles.appName}>{item.appName}</Text><Text style={styles.permissions}>{item.permissions.join(', ')}</Text></View>
            </View>
            <View style={[styles.statusDot, item.active ? styles.active : styles.inactive]} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.xl, paddingTop: spacing.xxl },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.bgCard, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.bgElevated, justifyContent: 'center', alignItems: 'center' },
  iconText: { ...typography.h3, color: colors.primary },
  appName: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  permissions: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  active: { backgroundColor: colors.success },
  inactive: { backgroundColor: colors.textMuted },
});
