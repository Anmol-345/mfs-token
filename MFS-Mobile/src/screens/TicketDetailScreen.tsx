import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import io from 'socket.io-client/dist/socket.io.js';
import { colors, spacing, borderRadius, typography } from '../theme';
import { supportService } from '../services/supportService';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import type { SupportTicket } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';

export default function TicketDetailScreen({ route, navigation }: any) {
  const ticket: SupportTicket = route.params?.ticket;
  
  const initialMessages = (() => {
    let raw = ticket.messages || [];
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (e) { raw = []; }
    }
    return Array.isArray(raw) ? raw : [];
  })();

  const [messages, setMessages] = useState(initialMessages);
  const [newMsg, setNewMsg] = useState('');
  const user = useAuthStore((s) => s.user);
  const showToast = useUIStore((s) => s.showToast);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const socket = io(API_URL);
    socket.emit('join_ticket', ticket.id);
    
    socket.on('new_message', (msg: any) => {
      setMessages((prev: any) => {
        // Prevent duplicate local messages if socket echoes our own message
        if (prev.find((m: any) => m.body === msg.body && m.from === msg.from)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [ticket.id]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    try {
      const msgText = newMsg;
      setNewMsg('');
      setMessages((prev: any) => [...prev, { from: user?.id || '', body: msgText, createdAt: new Date().toISOString() }]);
      await supportService.addMessage(ticket.id, msgText);
    } catch (err: any) { showToast(err.response?.data?.error || 'Failed', 'error'); }
  };

  const handleClose = async () => {
    try {
      await supportService.close(ticket.id);
      showToast('Ticket closed', 'success');
      navigation.goBack();
    } catch (err: any) { showToast(err.response?.data?.error || 'Failed', 'error'); }
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
        <Text style={styles.subject}>{ticket.subject}</Text>
        <View style={[styles.badge, { backgroundColor: ticket.status === 'open' ? colors.warning : colors.success }]}>
          <Text style={styles.badgeText}>{ticket.status}</Text>
        </View>
      </Animated.View>

      <FlatList
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={true}
        indicatorStyle="black"
        ref={flatListRef}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
        onLayout={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
          }
        }}
        renderItem={({ item }) => {
          const isMe = item.from === user?.id;
          return (
            <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
              <Text style={[styles.msgText, isMe ? styles.myMsgText : styles.theirMsgText]}>{item.body}</Text>
              <Text style={[styles.msgTime, isMe ? styles.myMsgTime : styles.theirMsgTime]}>{item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : ''}</Text>
            </View>
          );
        }}
      />

      {ticket.status !== 'closed' && ticket.status !== 'resolved' ? (
        <View style={styles.inputRow}>
          <TextInput style={styles.input} value={newMsg} onChangeText={setNewMsg} placeholder="Type a message..." placeholderTextColor={colors.textMuted} />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.8}><Text style={styles.sendBtnText}>Send</Text></TouchableOpacity>
        </View>
      ) : null}

      {ticket.status === 'open' ? (
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
          <Text style={styles.closeBtnText}>Close Ticket</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.xl, paddingTop: spacing.xxl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subject: { ...typography.h3, color: colors.textPrimary, flex: 1 },
  badge: { borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  badgeText: { ...typography.caption, color: colors.white },
  messagesList: { padding: spacing.lg, flexGrow: 1 },
  bubble: { maxWidth: '80%', borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm },
  myBubble: { alignSelf: 'flex-end', backgroundColor: colors.white },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: colors.primaryLight },
  msgText: { ...typography.body },
  myMsgText: { color: colors.black },
  theirMsgText: { color: colors.black },
  msgTime: { ...typography.caption, marginTop: 4 },
  myMsgTime: { color: 'rgba(0,0,0,0.6)' },
  theirMsgTime: { color: 'rgba(0,0,0,0.6)' },
  inputRow: { flexDirection: 'row', padding: spacing.sm, gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bgCard },
  input: { flex: 1, backgroundColor: colors.bg, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, color: colors.textPrimary, padding: spacing.sm, height: 44 },
  sendBtn: { backgroundColor: colors.white, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, justifyContent: 'center' },
  sendBtnText: { ...typography.button, color: colors.black },
  closeBtn: { margin: spacing.lg, backgroundColor: colors.error, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center' },
  closeBtnText: { ...typography.button, color: colors.white },
});
