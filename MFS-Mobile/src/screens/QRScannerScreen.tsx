import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, spacing, borderRadius, typography } from '../theme';

export default function QRScannerScreen({ navigation, route }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const returnTo = route.params?.returnTo;
  const onScanned = route.params?.onScanned;

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  const handleScan = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    if (returnTo === 'Send' || !returnTo) {
      navigation.navigate('Send', { scannedAddress: data });
    } else {
      navigation.goBack();
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera Permission Required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}><Text style={styles.buttonText}>Grant Permission</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFill} onBarcodeScanned={handleScan} />
      <View style={styles.overlay}>
        <View style={styles.frame} />
      </View>
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  title: { ...typography.h3, color: colors.white, textAlign: 'center', marginTop: 100 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  frame: { width: 250, height: 250, borderWidth: 2, borderColor: colors.primary, borderRadius: borderRadius.lg },
  closeBtn: { position: 'absolute', bottom: 60, alignSelf: 'center', backgroundColor: colors.bgCard, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.full },
  closeText: { ...typography.button, color: colors.white },
  button: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.md, margin: spacing.xl, alignItems: 'center' },
  buttonText: { ...typography.button, color: colors.white },
});
