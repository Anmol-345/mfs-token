import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, spacing, typography } from '../theme';
import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import TopAppBar from '../components/TopAppBar';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        if (data && data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };
    fetchProfile();
  }, [setUser]);

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { icon: 'manage-accounts', label: 'ACCOUNT DETAILS', route: 'Settings' },
    { icon: 'api', label: 'LINKED APPLICATIONS', route: 'LinkedApps' },
    { icon: 'support-agent', label: 'SUPPORT', route: 'Support' },
  ];

  return (
    <View style={styles.container}>
      <TopAppBar 
        title="PROFILE CONFIGURATION"
        leftIcon="arrow-back" 
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeIn.duration(600)}>
          
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarBox}>
                <MaterialIcons name="person" size={40} color={colors.textSecondary} />
              </View>
            </View>
            <Text style={styles.username}>{user?.email ? user.email.split('@')[0].toUpperCase() : (user?.phone ? user.phone : 'USER_0X9F')}</Text>
            <Text style={styles.kycText}>KYC LEVEL: {user?.kycLevel ? user.kycLevel.toUpperCase() : 'UNVERIFIED'}</Text>
          </View>

          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity 
                key={item.label} 
                style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]}
                onPress={() => item.route && navigation.navigate(item.route)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <MaterialIcons name={item.icon as any} size={20} color={colors.textSecondary} />
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.logoutSection}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <MaterialIcons name="logout" size={18} color={colors.error} />
              <Text style={styles.logoutBtnText}>TERMINATE SESSION</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 100 },
  
  avatarSection: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatarBox: {
    width: 96,
    height: 96,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 32,
    height: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    ...typography.h1,
    fontSize: 18, // slightly smaller h1
    color: colors.primary,
    letterSpacing: 2,
  },
  kycText: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textSecondary,
    letterSpacing: 3,
    marginTop: 4,
  },

  menuSection: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.bg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemLabel: {
    ...typography.caption,
    color: colors.primary,
    letterSpacing: 1.5,
  },

  logoutSection: {
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 51, 0.5)',
    backgroundColor: 'rgba(255, 51, 51, 0.05)',
    padding: spacing.md,
  },
  logoutBtnText: {
    ...typography.caption,
    color: colors.error,
    letterSpacing: 1.5,
  },
});
