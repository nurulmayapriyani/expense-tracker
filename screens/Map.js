import {
  getCurrentPositionAsync,
  PermissionStatus,
  useForegroundPermissions,
} from 'expo-location';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import IconButton from '../components/UI/IconButton';

function Map({ navigation, route }) {
  const mode = route.params?.mode;

  const latitude = route.params?.latitude;
  const longitude = route.params?.longitude;

  const expenseId = route.params?.expenseId;

  const [locationPermissionInformation, requestPermission] =
    useForegroundPermissions();

  const [currentLocation, setCurrentLocation] = useState(null);

  const [selectedLocation, setSelectedLocation] = useState(
    latitude != null && longitude != null
      ? {
          lat: Number(latitude),
          lng: Number(longitude),
        }
      : null
  );

  /*
   * ----------------------------------------------------
   * Initial location
   * ----------------------------------------------------
   */
  const initialLocation = useMemo(() => {
    if (latitude == null || longitude == null) {
      return null;
    }

    return {
      lat: Number(latitude),
      lng: Number(longitude),
    };
  }, [latitude, longitude]);

  /*
   * ----------------------------------------------------
   * Request location permission
   * ----------------------------------------------------
   */
  const verifyPermissions = useCallback(async () => {
    if (
      locationPermissionInformation?.status ===
      PermissionStatus.UNDETERMINED
    ) {
      const permissionResponse = await requestPermission();

      return permissionResponse.granted;
    }

    if (
      locationPermissionInformation?.status ===
      PermissionStatus.DENIED
    ) {
      Alert.alert(
        'Insufficient Permissions',
        'You need to allow location permission to use your current location.'
      );

      return false;
    }

    return true;
  }, [locationPermissionInformation, requestPermission]);

  /*
   * ----------------------------------------------------
   * Get current location
   * ----------------------------------------------------
   */
  const getCurrentLocation = useCallback(async () => {
    const hasPermission = await verifyPermissions();

    if (!hasPermission) {
      return;
    }

    try {
      const location = await getCurrentPositionAsync({
        accuracy: 5,
      });

      const newLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      setCurrentLocation(newLocation);

      /*
       * Only use current location as selected location
       * when there isn't already an existing location.
       */
      if (!initialLocation) {
        setSelectedLocation(newLocation);
      }
    } catch (error) {
      Alert.alert(
        'Could not get location',
        'Please make sure your device location is turned on.'
      );
    }
  }, [verifyPermissions, initialLocation]);

  /*
   * ----------------------------------------------------
   * Get current location when opening map
   * ----------------------------------------------------
   */
  useEffect(() => {
    if (mode === 'view') {
      return;
    }

    /*
     * If we already have an existing location,
     * don't automatically replace it with GPS.
     */
    if (initialLocation) {
      return;
    }

    getCurrentLocation();
  }, [mode, initialLocation, getCurrentLocation]);

  /*
   * ----------------------------------------------------
   * Handle messages from Leaflet WebView
   * ----------------------------------------------------
   */
  const handleWebViewMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'locationSelected') {
        const newLocation = {
          lat: Number(data.latitude),
          lng: Number(data.longitude),
        };

        setSelectedLocation(newLocation);
      }
    } catch (error) {
      console.log('Error parsing map message:', error);
    }
  }, []);

  /*
   * ----------------------------------------------------
   * Save selected location
   * ----------------------------------------------------
   */
  const saveLocationHandler = useCallback(() => {
    if (
      selectedLocation?.lat == null ||
      selectedLocation?.lng == null
    ) {
      Alert.alert(
        'No location selected',
        'Please select a location on the map first.'
      );

      return;
    }

    navigation.popTo('ManageExpense', {
      expenseId,
      pickedLat: selectedLocation.lat,
      pickedLng: selectedLocation.lng,
    });
  }, [navigation, expenseId, selectedLocation]);

  /*
   * ----------------------------------------------------
   * Header
   * ----------------------------------------------------
   */
  useLayoutEffect(() => {
    if (mode === 'pick') {
      navigation.setOptions({
        headerRight: () => (
          <IconButton
            icon="save"
            size={24}
            color="white"
            onPress={saveLocationHandler}
          />
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: undefined,
      });
    }
  }, [navigation, mode, saveLocationHandler]);

  /*
   * ----------------------------------------------------
   * Map coordinates
   * ----------------------------------------------------
   *
   * Priority:
   * 1. selected location
   * 2. existing location
   * 3. current GPS location
   */
  const mapLatitude =
    selectedLocation?.lat ??
    initialLocation?.lat ??
    currentLocation?.lat ??
    null;

  const mapLongitude =
    selectedLocation?.lng ??
    initialLocation?.lng ??
    currentLocation?.lng ??
    null;

  /*
   * ----------------------------------------------------
   * Leaflet HTML
   * ----------------------------------------------------
   *
   * IMPORTANT:
   * useMemo is BEFORE the conditional return.
   * This prevents:
   *
   * "React Hook useMemo is called conditionally"
   */
  const mapHtml = useMemo(() => {
    if (mapLatitude == null || mapLongitude == null) {
      return null;
    }

    const initialLat = Number(mapLatitude);
    const initialLng = Number(mapLongitude);

    const existingLat =
      selectedLocation?.lat ??
      initialLocation?.lat ??
      null;

    const existingLng =
      selectedLocation?.lng ??
      initialLocation?.lng ??
      null;

    const isViewMode = mode === 'view';

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
            const initialLatitude = ${initialLat};
            const initialLongitude = ${initialLng};
            const isViewMode = ${isViewMode};

            const map = L.map('map').setView(
              [initialLatitude, initialLongitude],
              15
            );

            L.tileLayer(
              'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
              {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap contributors'
              }
            ).addTo(map);

            let marker = null;

            /*
             * Show existing/selected marker.
             */
            ${
              existingLat != null && existingLng != null
                ? `
                  marker = L.marker([
                    ${existingLat},
                    ${existingLng}
                  ]).addTo(map);

                  marker.bindPopup(
                    'Selected Location'
                  );
                `
                : ''
            }

            /*
             * Allow selecting a location only in pick mode.
             */
            map.on('click', function(event) {
              if (isViewMode) {
                return;
              }

              const lat = event.latlng.lat;
              const lng = event.latlng.lng;

              /*
               * Remove previous marker.
               */
              if (marker) {
                map.removeLayer(marker);
              }

              /*
               * Add new marker.
               */
              marker = L.marker([lat, lng]).addTo(map);

              marker
                .bindPopup(
                  'Latitude: ' +
                  lat.toFixed(6) +
                  '<br>' +
                  'Longitude: ' +
                  lng.toFixed(6)
                )
                .openPopup();

              /*
               * Send selected coordinates
               * back to React Native.
               */
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  type: 'locationSelected',
                  latitude: lat,
                  longitude: lng
                })
              );
            });
          </script>
        </body>
      </html>
    `;
  }, [
    mapLatitude,
    mapLongitude,
    selectedLocation,
    initialLocation,
    mode,
  ]);

  /*
   * ----------------------------------------------------
   * Loading state
   * ----------------------------------------------------
   *
   * This return comes AFTER all hooks.
   */
  if (mapHtml == null) {
    return <View style={styles.loadingContainer} />;
  }

  /*
   * ----------------------------------------------------
   * Render
   * ----------------------------------------------------
   */
  return (
    <View style={styles.container}>
      <WebView
        source={{ html: mapHtml }}
        style={styles.map}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onMessage={handleWebViewMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;

          console.log(
            'WebView error:',
            nativeEvent
          );
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;

          console.log(
            'WebView HTTP error:',
            nativeEvent.statusCode,
            nativeEvent.description
          );
        }}
      />
    </View>
  );
}

export default Map;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
  },
});