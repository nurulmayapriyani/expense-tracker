import { useNavigation } from '@react-navigation/native';
import {
  Accuracy,
  getCurrentPositionAsync,
  getForegroundPermissionsAsync,
  getLastKnownPositionAsync,
  hasServicesEnabledAsync,
  requestForegroundPermissionsAsync,
} from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { GlobalStyles } from '../../constants/styles';
import { ensurePermission } from '../../utils/permissions';
import OutlinedButton from '../UI/OutlinedButton';

// OpenStreetMap tile servers reject requests without a Referer.
// Replace with your own site/app URL (required by OSM's tile usage policy).
const APP_BASE_URL = 'https://your-domain.com';

function LocationPicker({ onPickLocation, existingLocation, expenseId }) {
  const navigation = useNavigation();

  const [pickedLocation, setPickedLocation] = useState(
    existingLocation ?? null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  // Keep local location synchronized with the parent form.
  useEffect(() => {
    setPickedLocation(existingLocation ?? null);
    setPreviewFailed(false);
  }, [existingLocation]);

  async function getLocationHandler() {
    try {
      const hasPermission = await ensurePermission(
        getForegroundPermissionsAsync,
        requestForegroundPermissionsAsync,
        'Location'
      );

      if (!hasPermission) {
        return;
      }

      const servicesEnabled = await hasServicesEnabledAsync();

      if (!servicesEnabled) {
        Alert.alert(
          'Location is turned off',
          'Please turn on location services (GPS) on your device and try again.'
        );
        return;
      }

      // Only show the spinner once we're actually fetching the position.
      setIsLoading(true);

      let location;

      try {
        location = await getCurrentPositionAsync({
          accuracy: Accuracy.Balanced,
        });
      } catch (positionError) {
        // Fall back to the last known position if a fresh fix fails.
        location = await getLastKnownPositionAsync();

        if (!location) {
          throw positionError;
        }
      }

      const newLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      setPickedLocation(newLocation);
      setPreviewFailed(false);
      onPickLocation(newLocation);
    } catch (error) {
      Alert.alert(
        'Location Error',
        error?.message || 'Could not get your current location.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  function pickOnMapHandler() {
    navigation.navigate('Map', {
      mode: 'pick',
      expenseId,
      latitude: pickedLocation?.lat,
      longitude: pickedLocation?.lng,
    });
  }

  const mapHtml = useMemo(() => {
    const lat = Number(pickedLocation?.lat);
    const lng = Number(pickedLocation?.lng);

    // Guards against null, undefined and NaN before injecting into the script.
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
            crossorigin=""
          />
          <style>
            html, body, #map {
              height: 100%;
              width: 100%;
              margin: 0;
              padding: 0;
            }
            body { overflow: hidden; }
            .leaflet-container { font-family: Arial, sans-serif; }
            .leaflet-control-attribution { font-size: 9px; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script
            src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
            crossorigin=""
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
            }).setView([latitude, longitude], 15);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '&copy; OpenStreetMap contributors',
            }).addTo(map);

            L.marker([latitude, longitude]).addTo(map);
          </script>
        </body>
      </html>
    `;
  }, [pickedLocation?.lat, pickedLocation?.lng]);

  let locationPreview;

  if (isLoading) {
    locationPreview = (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  } else if (pickedLocation && mapHtml) {
    locationPreview = (
      <>
        {previewFailed ? (
          <View style={[styles.map, styles.emptyContainer]}>
            <Text style={styles.emptyText}>Map preview unavailable</Text>
            <Text style={styles.emptySubText}>
              Check your internet connection. Your location is still saved.
            </Text>
          </View>
        ) : (
          <WebView
            style={styles.map}
            originWhitelist={['about:blank', 'https://*']}
            source={{ html: mapHtml, baseUrl: APP_BASE_URL }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            scrollEnabled={false}
            nestedScrollEnabled={false}
            onError={() => setPreviewFailed(true)}
            onHttpError={() => setPreviewFailed(true)}
          />
        )}

        <View style={styles.coordinatesContainer}>
          <Text style={styles.locationTitle}>Location selected</Text>
          <Text style={styles.coordinates}>
            Latitude: {Number(pickedLocation.lat).toFixed(6)}
          </Text>
          <Text style={styles.coordinates}>
            Longitude: {Number(pickedLocation.lng).toFixed(6)}
          </Text>
        </View>
      </>
    );
  } else {
    locationPreview = (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No location picked yet.</Text>
        <Text style={styles.emptySubText}>
          Choose your current location or select a point on the map.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapPreview}>{locationPreview}</View>

      <View style={styles.actions}>
        <OutlinedButton icon="location" onPress={getLocationHandler}>
          Use current location
        </OutlinedButton>

        <OutlinedButton icon="map" onPress={pickOnMapHandler}>
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
    backgroundColor: GlobalStyles.colors.primary100,
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
    backgroundColor: GlobalStyles.colors.primary100,
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