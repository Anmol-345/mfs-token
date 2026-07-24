import { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../theme';
import { useNotificationStore } from '../stores/notificationStore';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types';

export default function NotificationsScreen() {
  const notifications = useNotificationStore((s) => s.notifications);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const removeNotification = useNotificationStore((s) => s.removeNotification);

  useEffect(() => {
    notificationService.list().then((data) => setNotifications(data.notifications || [])).catch(() => {});
  }, []);

  const handleMarkAll = async () => {
    try {
      await notificationService.markRead();
      markAllRead();
    } catch {}
  };

  const handleMark = async (id: string) => {
    try {
      await notificationService.markOneRead(id);
      markRead(id);
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.delete(id);
      removeNotification(id);
    } catch {}
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            {notifications.some((n) => !n.read) ? (
              <TouchableOpacity onPress={handleMarkAll}><Text style={styles.markAll}>Mark All Read</Text></TouchableOpacity>
            ) : null}
          </View>
        }
        renderItem={({ item }: { item: Notification }) => (
          <TouchableOpacity style={[styles.card, !item.read && styles.unread]} onPress={() => handleMark(item.id)} activeOpacity={0.7}>
            <View style={[styles.typeDot, { backgroundColor: item.type === 'transaction' ? colors.accent : item.type === 'security' ? colors.error : colors.primary }]} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody} numberOfLines={2}>{item.body}</Text>
              <Text style={styles.cardTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.rightActions}>
              {!item.read ? <View style={styles.unreadDot} /> : null}
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <MaterialIcons name="close" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.xl, paddingTop: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { ...typography.h2, color: colors.textPrimary },
  markAll: { ...typography.bodySmall, color: colors.primary },
  card: { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, alignItems: 'center' },
  unread: { borderColor: colors.primary },
  typeDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.md },
  cardContent: { flex: 1 },
  cardTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  cardBody: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  cardTime: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  rightActions: { flexDirection: 'row', alignItems: 'center', marginLeft: spacing.sm },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, marginRight: spacing.sm },
  deleteButton: { padding: spacing.xs },
});
