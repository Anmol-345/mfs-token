import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

interface TopAppBarProps {
  title?: string;
  leftIcon?: string;
  onLeftPress?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  rightText?: string;
  hasUnreadNotifications?: boolean;
}

export default function TopAppBar({
  title = 'MFS CRYPTO',
  leftIcon,
  onLeftPress,
  rightIcon,
  onRightPress,
  rightText,
  hasUnreadNotifications,
}: TopAppBarProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top, height: 56 + insets.top }]}>
      <View style={styles.leftGroup}>
        {leftIcon && (
          <TouchableOpacity onPress={onLeftPress} style={styles.iconButton} activeOpacity={0.7}>
            <MaterialIcons name={leftIcon as any} size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.rightGroup}>
        {rightText && (
          <Text style={styles.rightText}>{rightText}</Text>
        )}
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={styles.iconButton} activeOpacity={0.7}>
            <View>
              <MaterialIcons name={rightIcon as any} size={24} color={colors.textSecondary} />
              {hasUnreadNotifications && (
                <View style={styles.unreadBadge} />
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    zIndex: 50,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    padding: spacing.xs,
  },
  iconText: {
    fontSize: 24,
    color: colors.primary,
  },
  iconTextSecondary: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  title: {
    ...typography.h3,
    color: colors.primary,
  },
  rightText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.bg,
  },
});
