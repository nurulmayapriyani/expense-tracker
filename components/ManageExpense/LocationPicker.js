import { useNavigation } from '@react-navigation/native';
import {
  getCurrentPositionAsync,
  useForegroundPermissions
} from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { GlobalStyles } from '../../constants/styles';
import OutlinedButton from '../UI/OutlinedButton';

function LocationPicker({
  onPickLocation,
  existingLocation,
  expenseId,
}) {
  const navigation = useNavigation();

  const [pickedLocation, setPickedLocation] = useState(
    existingLocation ?? null
  );

  const [isLoading, setIsLoading] = useState(false);

  const [
    locationPermissionInformation,
    requestPermission,
  ] = useForegroundPermissions();

  // Keep local location synchronized with ExpenseForm.
  useEffect(() => {
    setPickedLocation(existingLocation ?? null);
  }, [existingLocation]);

  console.log(
    'LocationPicker existingLocation:',
    existingLocation
  );

  console.log(
    'LocationPicker pickedLocation:',
    pickedLocation
  );

  /**
   * --------------------------------------------------
   * LOCATION PERMISSION
   * --------------------------------------------------
   */
  // async function verifyPermissions() {
  //   if (!locationPermissionInformation) {
  //     Alert.alert(
  //       'Please wait',
  //       'Location permission information is still loading.'
  //     );

  //     return false;
  //   }

  //   if (
  //     locationPermissionInformation.status ===
  //     PermissionStatus.UNDETERMINED
  //   ) {
  //     const permissionResponse =
  //       await requestPermission();

  //     return permissionResponse.granted;
  //   }

  //   if (
  //     locationPermissionInformation.status ===
  //     PermissionStatus.DENIED
  //   ) {
  //     Alert.alert(
  //       'Insufficient Permissions!',
  //       'You need to grant location permissions to use this app.'
  //     );

  //     return false;
  //   }

  //   return true;
  // }

  async function verifyPermissions() {
    console.log('========== LOCATION PERMISSION CHECK ==========');

    if (!locationPermissionInformation) {
      Alert.alert(
        'Please wait',
        'Location permission information is still loading.'
      );
      return false;
    }

    console.log(
      'LOCATION PERMISSION INFORMATION:',
      locationPermissionInformation
    );

    // Already allowed
    if (locationPermissionInformation.granted) {
      console.log('LOCATION PERMISSION ALREADY GRANTED');
      return true;
    }

    // Android/iOS can still show the native permission dialog
    if (locationPermissionInformation.canAskAgain) {
      console.log('REQUESTING LOCATION PERMISSION...');

      const permissionResponse = await requestPermission();

      console.log(
        'LOCATION PERMISSION RESPONSE:',
        permissionResponse
      );

      // User pressed "Allow"
      if (permissionResponse.granted) {
        console.log('LOCATION PERMISSION GRANTED');
        return true;
      }

      // User pressed "Don't allow"
      console.log('USER DENIED LOCATION PERMISSION');

      Alert.alert(
        'Location Permission Required',
        'Location access is required to use your current location. Please enable it in Settings.',
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

    // Permission was permanently denied / system will no longer ask
    console.log(
      'LOCATION PERMISSION DENIED AND CAN NO LONGER ASK'
    );

    Alert.alert(
      'Location Permission Required',
      'Location access has been denied. Please enable location permission in your device settings.',
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

  /**
   * --------------------------------------------------
   * USE CURRENT LOCATION
   * --------------------------------------------------
   */
  async function getLocationHandler() {
    try {
      console.log(
        '1. Use current location pressed'
      );

      setIsLoading(true);

      const hasPermission =
        await verifyPermissions();

      console.log(
        '2. Permission result:',
        hasPermission
      );

      if (!hasPermission) {
        return;
      }

      console.log(
        '3. Getting current position...'
      );

      const location =
        await getCurrentPositionAsync();

      console.log(
        '4. Location received:',
        location
      );

      const newLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      console.log(
        '5. New location:',
        newLocation
      );

      setPickedLocation(newLocation);

      onPickLocation(newLocation);
    } catch (error) {
      console.log(
        'Error getting current location:',
        error
      );

      Alert.alert(
        'Location Error',
        error?.message ||
          'Could not get your current location.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * --------------------------------------------------
   * CHOOSE LOCATION ON MAP
   * --------------------------------------------------
   */
  function pickOnMapHandler() {
    console.log(
      'Opening Map with:',
      {
        expenseId,
        latitude: pickedLocation?.lat,
        longitude: pickedLocation?.lng,
      }
    );

    navigation.navigate('Map', {
      mode: 'pick',
      expenseId,

      latitude: pickedLocation?.lat,
      longitude: pickedLocation?.lng,
    });
  }

  /**
   * --------------------------------------------------
   * OPENSTREETMAP PREVIEW
   * --------------------------------------------------
   */
  const mapHtml = useMemo(() => {
    if (
      pickedLocation?.lat == null ||
      pickedLocation?.lng == null
    ) {
      return null;
    }

    const lat = Number(pickedLocation.lat);
    const lng = Number(pickedLocation.lng);

    return `
      <!DOCTYPE html>

      <html>
        <head>
          <meta
            name="viewport"
            content="width=device-width,
            initial-scale=1.0,
            maximum-scale=1.0,
            user-scalable=no"
          />

          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          />

          <style>
            html,
            body,
            #map {
              height: 100%;
              width: 100%;
              margin: 0;
              padding: 0;
            }

            body {
              overflow: hidden;
            }

            .leaflet-container {
              font-family: Arial, sans-serif;
            }

            .leaflet-control-attribution {
              font-size: 9px;
            }
          </style>
        </head>

        <body>
          <div id="map"></div>

          <script
            src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          ></script>

          <script>
            const latitude = ${lat};
            const longitude = ${lng};

            const map = L.map('map', {
              zoomControl: false,
              dragging: false,
              scrollWheelZoom: false,
              doubleClickZoom: false,
              boxZoom: false,
              keyboard: false,
              touchZoom: false,
            }).setView(
              [latitude, longitude],
              15
            );

            L.tileLayer(
              'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              {
                maxZoom: 19,
                attribution:
                  '&copy; OpenStreetMap contributors'
              }
            ).addTo(map);

            const marker = L.marker([
              latitude,
              longitude
            ]).addTo(map);

            marker.bindPopup(
              'Selected Location'
            );
          </script>
        </body>
      </html>
    `;
  }, [
    pickedLocation?.lat,
    pickedLocation?.lng,
  ]);

  /**
   * --------------------------------------------------
   * LOCATION PREVIEW
   * --------------------------------------------------
   */
  let locationPreview;

  if (isLoading) {
    locationPreview = (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
        />

        <Text style={styles.loadingText}>
          Getting your location...
        </Text>
      </View>
    );
  } else if (pickedLocation && mapHtml) {
    locationPreview = (
      <>
        <WebView
          style={styles.map}
          originWhitelist={['*']}
          source={{
            html: mapHtml,
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scrollEnabled={false}
          nestedScrollEnabled={false}
          onError={(event) => {
            console.log(
              'Location preview WebView error:',
              event.nativeEvent
            );
          }}
          onHttpError={(event) => {
            console.log(
              'Location preview WebView HTTP error:',
              event.nativeEvent
            );
          }}
        />

        <View style={styles.coordinatesContainer}>
          <Text style={styles.locationTitle}>
            Location selected
          </Text>

          <Text style={styles.coordinates}>
            Latitude:{' '}
            {Number(pickedLocation.lat).toFixed(6)}
          </Text>

          <Text style={styles.coordinates}>
            Longitude:{' '}
            {Number(pickedLocation.lng).toFixed(6)}
          </Text>
        </View>
      </>
    );
  } else {
    locationPreview = (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No location picked yet.
        </Text>

        <Text style={styles.emptySubText}>
          Choose your current location or
          select a point on the map.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapPreview}>
        {locationPreview}
      </View>

      <View style={styles.actions}>
        <OutlinedButton
          icon="location"
          onPress={getLocationHandler}
        >
          Use current location
        </OutlinedButton>

        <OutlinedButton
          icon="map"
          onPress={pickOnMapHandler}
        >
          Choose location on map
        </OutlinedButton>
      </View>
    </View>
  );
}

export default LocationPicker;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  mapPreview: {
    width: '100%',
    height: 280,
    marginVertical: 8,
    backgroundColor:
      GlobalStyles.colors.primary100,
    borderRadius: 8,
    overflow: 'hidden',
  },

  map: {
    width: '100%',
    height: 200,
  },

  coordinatesContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      GlobalStyles.colors.primary100,
  },

  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: GlobalStyles.colors.primary800,
  },

  coordinates: {
    fontSize: 13,
    marginVertical: 1,
    color: GlobalStyles.colors.primary700,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  emptySubText: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.7,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 8,
  },

  actions: {
    width: '100%',
    flexDirection: 'column',
  },
});