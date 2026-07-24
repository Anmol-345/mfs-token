import { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { useAuthStore } from '../stores/authStore';
import TopAppBar from '../components/TopAppBar';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'SECURE ASSETS',
    subtitle: 'Military-grade encryption for your digital wealth.',
    icon: 'security',
  },
  {
    title: 'EARN & GROW',
    subtitle: 'Accumulate rewards, build your referral tree, and watch your portfolio thrive.',
    icon: 'trending-up',
  },
  {
    title: 'ONE WALLET',
    subtitle: 'Connect with apps, track transactions, and manage everything in one place.',
    icon: 'account-balance-wallet',
  },
];

export default function OnboardingScreen({ navigation }: any) {
  const [index, setIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const setOnboardingComplete = useAuthStore((s) => s.setOnboardingComplete);

  const onView = useCallback(({ viewableItems }: any) => {
    if (viewableItems[0]) setIndex(viewableItems[0].index);
  }, []);

  const handleNext = () => {
    if (index < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      setOnboardingComplete();
      navigation.replace('Register');
    }
  };

  const handleSkip = () => {
    setOnboardingComplete();
    navigation.replace('Register');
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.slide}>
      {/* Icon Area */}
      <View style={styles.iconContainer}>
        <View style={styles.bgCircle} />
        <View style={styles.bgSquare} />
        <MaterialIcons name={item.icon as any} size={84} color={colors.primary} />
        <View style={styles.iconDivider} />
      </View>
      
      {/* Text Area */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.subtitleWrapper}>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TopAppBar 
        rightText="SKIP" 
        onRightPress={handleSkip}
      />
      <FlatList
        ref={flatRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onView}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === index ? styles.dotActive : styles.dotInactive]} />
          ))}
        </View>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.7}>
          <Text style={styles.nextText}>{index < slides.length - 1 ? 'NEXT' : 'START'}</Text>
          <MaterialIcons name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  slide: { width, flex: 1, paddingBottom: 64 },
  
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: colors.border,
    opacity: 0.1,
  },
  bgSquare: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: colors.border,
    transform: [{ rotate: '45deg' }],
    opacity: 0.1,
  },
  iconDivider: {
    height: 1,
    width: 64,
    backgroundColor: colors.primary,
    opacity: 0.2,
    marginTop: spacing.xl,
  },

  textContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: { 
    ...typography.h1, 
    color: colors.primary, 
    marginBottom: spacing.sm,
  },
  subtitleWrapper: {
    borderLeftWidth: 1,
    borderLeftColor: colors.borderLight,
    paddingLeft: spacing.md,
  },
  subtitle: { 
    ...typography.bodyLg, 
    color: colors.textSecondary,
  },

  footer: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingBottom: spacing.xxl,
  },
  dots: { flexDirection: 'row', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: colors.primary },
  dotInactive: { borderWidth: 1, borderColor: colors.border, backgroundColor: 'transparent' },
  
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nextText: {
    ...typography.button,
    color: colors.primary,
  }
});
