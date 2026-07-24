import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

import DashboardScreen from '../screens/DashboardScreen';
import SendScreen from '../screens/SendScreen';
import SendOTPScreen from '../screens/SendOTPScreen';
import ReceiveScreen from '../screens/ReceiveScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import CoinAccumulationScreen from '../screens/CoinAccumulationScreen';
import ReferralScreen from '../screens/ReferralScreen';
import LinkedAppsScreen from '../screens/LinkedAppsScreen';
import SupportScreen from '../screens/SupportScreen';
import TicketDetailScreen from '../screens/TicketDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const HistoryStack = createNativeStackNavigator();
const ReferralStack = createNativeStackNavigator();
const SupportStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '⌂',
    History: '≡',
    Referral: '◎',
    Support: '?',
    Profile: '⊙',
  };
  return (
    <View style={tabStyles.icon}>
      <Text style={[tabStyles.iconText, focused && tabStyles.iconFocused]}>{icons[label]}</Text>
      {focused && <View style={tabStyles.dot} />}
    </View>
  );
}

const commonScreenOptions = { headerShown: false, animation: 'slide_from_right' as const };

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={commonScreenOptions}>
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} />
      <HomeStack.Screen name="Send" component={SendScreen} />
      <HomeStack.Screen name="SendOTP" component={SendOTPScreen} />
      <HomeStack.Screen name="Receive" component={ReceiveScreen} />
      <HomeStack.Screen name="QRScanner" component={QRScannerScreen} />
      <HomeStack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      <HomeStack.Screen name="CoinAccumulation" component={CoinAccumulationScreen} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
    </HomeStack.Navigator>
  );
}

function HistoryStackScreen() {
  return (
    <HistoryStack.Navigator screenOptions={commonScreenOptions}>
      <HistoryStack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      <HistoryStack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
    </HistoryStack.Navigator>
  );
}

function ReferralStackScreen() {
  return (
    <ReferralStack.Navigator screenOptions={commonScreenOptions}>
      <ReferralStack.Screen name="ReferralHome" component={ReferralScreen} />
    </ReferralStack.Navigator>
  );
}

function SupportStackScreen() {
  return (
    <SupportStack.Navigator screenOptions={commonScreenOptions}>
      <SupportStack.Screen name="SupportHome" component={SupportScreen} />
      <SupportStack.Screen name="TicketDetail" component={TicketDetailScreen} />
    </SupportStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={commonScreenOptions}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="LinkedApps" component={LinkedAppsScreen} />
    </ProfileStack.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  icon: { alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 22, color: colors.textMuted },
  iconFocused: { color: colors.white },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.white, marginTop: 4 },
});

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgSecondary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { ...typography.caption, fontSize: 11 },
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="History" component={HistoryStackScreen} />
      <Tab.Screen name="Referral" component={ReferralStackScreen} />
      <Tab.Screen name="Support" component={SupportStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}
