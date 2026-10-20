import {
  getCameraPermissionsAsync,
  launchCameraAsync,
  requestCameraPermissionsAsync,
} from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';

import { GlobalStyles } from '../../constants/styles';
import { ensurePermission } from '../../utils/permissions';
import OutlinedButton from '../UI/OutlinedButton';

function ImagePicker({ onTakeImage, existingImage }) {
  const [pickedImage, setPickedImage] = useState(existingImage ?? null);

  // Keep local image in sync with the parent form.
  useEffect(() => {
    setPickedImage(existingImage ?? null);
  }, [existingImage]);

  async function takeImageHandler() {
    try {
      const hasPermission = await ensurePermission(
        getCameraPermissionsAsync,
        requestCameraPermissionsAsync,
        'Camera'
      );

      if (!hasPermission) {
        return;
      }

      const image = await launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.5,
      });

      if (!image.canceled) {
        const imageUri = image.assets[0].uri;
        setPickedImage(imageUri);
        onTakeImage(imageUri);
      }
    } catch (error) {
      Alert.alert(
        'Camera Error',
        error?.message || 'Could not open the camera.'
      );
    }
  }

  let imagePreview = <Text>No image taken yet.</Text>;

  if (pickedImage) {
    imagePreview = <Image source={{ uri: pickedImage }} style={styles.image} />;
  }

  return (
    <View>
      <View style={styles.imagePreview}>{imagePreview}</View>

      <OutlinedButton icon="camera" onPress={takeImageHandler}>
        Take Image
      </OutlinedButton>
    </View>
  );
}

export default ImagePicker;

const styles = StyleSheet.create({
  imagePreview: {
    width: '100%',
    height: 200,
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GlobalStyles.colors.primary100,
    borderRadius: 4,
  },

  image: {
    width: '100%',
    height: '100%',
  },
});