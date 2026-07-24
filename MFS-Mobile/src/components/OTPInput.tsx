import { useState, useRef, useCallback } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
}

export default function OTPInput({ length = 6, onComplete, disabled = false }: OTPInputProps) {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<TextInput[]>([]);

  const handleChange = useCallback(
    (text: string, index: number) => {
      const digit = text.replace(/[^0-9]/g, '').slice(-1);
      const newCode = [...code];
      newCode[index] = digit;
      setCode(newCode);
      if (digit && index < length - 1) {
        refs.current[index + 1]?.focus();
      }
      if (newCode.every((d) => d !== '') && digit) {
        onComplete(newCode.join(''));
      }
    },
    [code, length, onComplete],
  );

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === 'Backspace' && !code[index] && index > 0) {
        refs.current[index - 1]?.focus();
      }
    },
    [code],
  );

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(ref) => { refs.current[i] = ref as TextInput; }}
          style={[styles.input, code[i] ? styles.inputFilled : null, disabled ? styles.inputDisabled : null]}
          value={code[i]}
          onChangeText={(t) => handleChange(t, i)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          editable={!disabled}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  input: {
    width: 48,
    height: 56,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  inputFilled: {
    borderColor: colors.white,
  },
  inputDisabled: {
    opacity: 0.4,
  },
});
