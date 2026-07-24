# MFS Crypto — Mobile Wallet Application

## Tech Stack

| Tool | Version |
|---|---|
| React Native / Expo | SDK 57 |
| React Navigation | v6 (native-stack + bottom-tabs) |
| State Management | Zustand + TanStack React Query |
| HTTP Client | Axios with JWT interceptor |
| Biometrics | expo-local-authentication |
| Camera/QR | expo-camera |
| QR Generation | react-native-qrcode-svg |
| Fonts | Inter via @expo-google-fonts/inter |
| Animations | react-native-reanimated |
| Notifications | expo-notifications |
| Secure Storage | expo-secure-store |

## Directory Structure

```
src/
  components/     — Reusable UI components (OTPInput, BalanceCard, etc.)
  navigation/     — AuthStack, MainTabs, AppNavigator
  screens/        — 22 screens (auth, wallet, secondary)
  services/       — API client + all service modules
  stores/         — Zustand stores (auth, wallet, notification, UI)
  theme/          — Colors, spacing, typography constants
  types/          — TypeScript interfaces
```

## 22 Screens Implemented

| # | Screen | Route |
|---|--------|-------|
| 1 | Splash | Splash |
| 2 | Onboarding (3-slide carousel) | Onboarding |
| 3 | Registration | Register |
| 4 | OTP Verification | OTPVerification |
| 5 | Login | Login |
| 6 | Biometric Setup | BiometricSetup |
| 7 | Dashboard/Home | Dashboard |
| 8 | Send (initiate) | Send |
| 9 | Send OTP Verification | SendOTP |
| 10 | Receive (QR code display) | Receive |
| 11 | QR Scanner | QRScanner |
| 12 | Transaction History | TransactionHistory |
| 13 | Transaction Detail | TransactionDetail |
| 14 | Coin Accumulation | CoinAccumulation |
| 15 | Referral (code + share) | Referral |
| 16 | Linked Apps | LinkedApps |
| 17 | Support (ticket list + create) | Support |
| 18 | Ticket Detail | TicketDetail |
| 19 | Notifications | Notifications |
| 20 | Profile | Profile |
| 21 | Settings | Settings |
| 22 | (Auth stack embedded in Send flow) | — |

## Design System

- **Background:** `#0A0A0F` (deep midnight)
- **Primary:** `#7B61FF` (purple accent)
- **Cards:** `#1A1A26` with `#2A2A3E` borders
- **Typography:** Inter, all weights defined in `theme/`
- **Animations:** FadeIn on screen mount via reanimated

## Getting Started

```bash
# Install dependencies
npm install

# Set API URL (default: http://localhost:3000/api)
echo "EXPO_PUBLIC_API_URL=https://api.mfscrypto.com" > .env

# Start Expo dev server
npx expo start

# Run on device
npx expo start --android
npx expo start --ios
```

## Build

```bash
# Android APK/AAB
npx eas build --platform android

# iOS IPA
npx eas build --platform ios
```

## Security

- JWT refresh token stored in `expo-secure-store` (Keychain / EncryptedSharedPreferences)
- Biometric gate on app unlock (configurable in Settings)
- Biometric prompt before send confirmation
- Never console.log() sensitive data
- All API calls go through Axios JWT interceptor with auto-refresh on 401
