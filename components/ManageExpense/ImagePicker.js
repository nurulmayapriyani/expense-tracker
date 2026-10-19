import { launchCameraAsync, useCameraPermissions } from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, Linking, StyleSheet, Text, View } from 'react-native';

import { GlobalStyles } from '../../constants/styles';
import OutlinedButton from '../UI/OutlinedButton';

function ImagePicker({onTakeImage, existingImage}) {
  const [pickedImage, setPickedImage] = useState(existingImage ?? null);
  const [cameraPermissionInformation, requestPermission] =
    useCameraPermissions();

  // async function verifyPermissions() {
  //   if (!cameraPermissionInformation) {
  //     return false;
  //   }

  //   if (
  //     cameraPermissionInformation.status ===
  //     PermissionStatus.UNDETERMINED
  //   ) {
  //     const permissionResponse = await requestPermission();
  //     return permissionResponse.granted;
  //   }

  //   if (
  //     cameraPermissionInformation.status === PermissionStatus.DENIED
  //   ) {
  //     Alert.alert(
  //       'Insufficient permissions!',
  //       'You need to grant camera permissions to use this app.'
  //     );
  //     return false;
  //   }

  //   return true;
  // }


async function verifyPermissions() {
  console.log('========== CAMERA PERMISSION CHECK ==========');
  console.log(
    'CAMERA PERMISSION INFORMATION:',
    cameraPermissionInformation
  );

  if (!cameraPermissionInformation) {
    console.log('CAMERA PERMISSION INFO IS NULL');
    return false;
  }

  console.log(
    'CAMERA PERMISSION STATUS:',
    cameraPermissionInformation.status
  );

  console.log(
    'CAMERA PERMISSION GRANTED:',
    cameraPermissionInformation.granted
  );

  console.log(
    'CAMERA CAN ASK AGAIN:',
    cameraPermissionInformation.canAskAgain
  );

  // Permission already granted
  if (cameraPermissionInformation.granted) {
    console.log('CAMERA PERMISSION ALREADY GRANTED');
    return true;
  }

  // Permission can still be requested
  if (cameraPermissionInformation.canAskAgain) {
    console.log('REQUESTING CAMERA PERMISSION...');

    const permissionResponse = await requestPermission();

    console.log(
      'CAMERA PERMISSION RESPONSE:',
      permissionResponse
    );

    console.log(
      'CAMERA PERMISSION RESPONSE STATUS:',
      permissionResponse.status
    );

    console.log(
      'CAMERA PERMISSION RESPONSE GRANTED:',
      permissionResponse.granted
    );

    if (permissionResponse.granted) {
      return true;
    }

    Alert.alert(
      'Camera permission required',
      'Please allow camera access to take a photo.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );

    return false;
  }

  // Permission was denied and Android will not ask again.
  console.log(
    'CAMERA PERMISSION DENIED AND CAN NO LONGER ASK'
  );

  Alert.alert(
    'Camera permission required',
    'Camera access has been denied. Please enable camera permission in your device settings to take a photo.',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => {
          Linking.openSettings();
        },
      },
    ]
  );

  return false;
}

  async function takeImageHandler() {
    const hasPermission = await verifyPermissions();

    if (!hasPermission) {
      return;
    }

    const image = await launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    console.log('Image:', image);

    if (!image.canceled) {
      const imageUri = image.assets[0].uri;
      setPickedImage(imageUri);
      onTakeImage(imageUri);
    }

  }

  let imagePreview = <Text>No image taken yet.</Text>;

  if (pickedImage) {
    imagePreview = (
      <Image
        source={{ uri: pickedImage }}
        style={styles.image}
      />
    );
  }

  return (
    <View>
      <View style={styles.imagePreview}>
        {imagePreview}
      </View>

      <OutlinedButton
        icon="camera"
        onPress={takeImageHandler}
      >
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