import { Alert, Linking } from 'react-native';

/**
 * Shared permission flow for camera and location.
 *
 * It reads the CURRENT permission status from the OS every time instead of
 * trusting hook state, which goes stale after the user changes a permission
 * in system Settings and comes back to the app.
 *
 * @param getPermission      e.g. getCameraPermissionsAsync
 * @param requestPermission  e.g. requestCameraPermissionsAsync
 * @param label              'Camera' or 'Location'
 * @returns                  true if granted, otherwise false (after an alert)
 */
export async function ensurePermission(getPermission, requestPermission, label) {
  const current = await getPermission();

  if (current.granted) {
    return true;
  }

  // Always try the system prompt first. If the OS can't show it
  // (permanently denied) it returns immediately with granted: false.
  // This also covers Android's "Ask every time" setting.
  const result = await requestPermission();

  if (result.granted) {
    return true;
  }

  if (result.canAskAgain) {
    Alert.alert(
      `${label} permission required`,
      `Please allow ${label.toLowerCase()} access to continue.`
    );
  } else {
    Alert.alert(
      `${label} permission required`,
      `${label} access is blocked. Please enable it in your device settings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
  }

  return false;
}