import { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { colors, spacing, typography } from '../theme';
import { supportService } from '../services/supportService';
import type { SupportTicket } from '../types';
import { useUIStore } from '../stores/uiStore';
import TopAppBar from '../components/TopAppBar';
import { MaterialIcons } from '@expo/vector-icons';

export default function SupportScreen({ navigation }: any) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const showToast = useUIStore((s) => s.showToast);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const load = async () => {
    try {
      const data = await supportService.list();
      setTickets(data.tickets || []);
    } catch {}
  };

  const handleCreate = async () => {
    if (!subject || !message) { showToast('Fill all fields', 'error'); return; }
    try {
      await supportService.create({ subject, category: 'general', message });
      showToast('Ticket created', 'success');
      setShowForm(false);
      setSubject('');
      setMessage('');
      load();
    } catch (err: any) { showToast(err.response?.data?.error || 'Failed', 'error'); }
  };

  return (
    <View style={styles.container}>
      <TopAppBar 
        title="SUPPORT TICKET"
        leftIcon="arrow-back" 
        onLeftPress={() => navigation.goBack()}
        rightIcon="support-agent"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeIn.duration(600)}>
          
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>MFS SUPPORT</Text>
            <Text style={styles.subtitle}>PRIORITY ASSISTANCE PROTOCOL</Text>
          </View>

          {/* New Ticket Form / Button */}
          {showForm ? (
            <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.formContainer}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>OPEN NEW TICKET</Text>
                <TouchableOpacity onPress={() => setShowForm(false)} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                  <MaterialIcons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>SUBJECT</Text>
                <TextInput 
                  style={styles.input} 
                  value={subject} 
                  onChangeText={setSubject} 
                  placeholder="Brief summary of issue" 
                  placeholderTextColor={colors.textMuted} 
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>DESCRIPTION</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  value={message} 
                  onChangeText={setMessage} 
                  placeholder="Provide detailed information..." 
                  placeholderTextColor={colors.textMuted} 
                  multiline 
                  numberOfLines={4} 
                />
              </View>
              
              <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} activeOpacity={0.8}>
                <Text style={styles.submitBtnText}>SUBMIT TICKET</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <TouchableOpacity style={styles.newTicketBtn} onPress={() => setShowForm(true)} activeOpacity={0.8}>
              <MaterialIcons name="add" size={20} color={colors.primary} />
              <Text style={styles.newTicketBtnText}>CREATE NEW TICKET</Text>
            </TouchableOpacity>
          )}

          {/* Ticket List */}
          <Text style={styles.sectionTitle}>YOUR TICKETS</Text>
          {tickets.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="history" size={32} color={colors.textMuted} />
              <Text style={styles.emptyText}>NO ACTIVE TICKETS</Text>
            </View>
          ) : (
            tickets.map((item) => {
              const isOpen = item.status === 'open';
              const isResolved = item.status === 'resolved';
              let badgeColor = colors.textMuted;
              if (isOpen) badgeColor = colors.warning;
              if (isResolved) badgeColor = colors.success;

              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.ticketCard} 
                  onPress={() => navigation.navigate('TicketDetail', { ticket: item })} 
                  activeOpacity={0.7}
                >
                  <View style={[styles.activeIndicator, { backgroundColor: badgeColor }]} />
                  <View style={styles.cardInner}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.statusBadge, { borderColor: badgeColor }]}>
                        <Text style={[styles.statusText, { color: badgeColor }]}>{item.status.toUpperCase()}</Text>
                      </View>
                      <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <Text style={styles.cardSubject} numberOfLines={1}>{item.subject}</Text>
                    <Text style={styles.cardMessage} numberOfLines={2}>{item.messages?.[0]?.content || 'No message content'}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 100 },
  
  headerSection: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 2,
  },

  newTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    marginBottom: spacing.xxl,
  },
  newTicketBtnText: {
    ...typography.caption,
    color: colors.primary,
    letterSpacing: 1.5,
  },

  formContainer: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgElevated,
    padding: spacing.md,
    marginBottom: spacing.xxl,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  formTitle: {
    ...typography.caption,
    color: colors.primary,
    letterSpacing: 1.5,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderLight,
    color: colors.primary,
    ...typography.body,
    padding: spacing.sm,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  submitBtnText: {
    ...typography.caption,
    color: colors.bg,
    letterSpacing: 1.5,
  },

  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    letterSpacing: 1.5,
  },

  ticketCard: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bg,
    marginBottom: spacing.md,
    flexDirection: 'row',
  },
  activeIndicator: {
    width: 4,
    backgroundColor: colors.borderLight,
  },
  cardInner: {
    flex: 1,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    ...typography.caption,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  cardDate: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textSecondary,
  },
  cardSubject: {
    ...typography.h3,
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
  },
  cardMessage: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
