import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

export async function configurePushNotifications() {
  console.log('========== CONFIGURE FUNCTION CALLED ==========');

  const { status } = await Notifications.getPermissionsAsync();
  let finalStatus = status;

  if (finalStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert(
        'Permission required',
        'Push notifications need the appropriate permissions.'
    );
    return;
    }

    if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export function registerNotificationListeners() {
  console.log('========== REGISTER FUNCTION CALLED ==========');
  const subscription1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('NOTIFICATION RECEIVED');
        console.log(notification);
        const userName = notification.request.content.data.userName;
        console.log(userName);
      }
    );

  const subscription2 = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('NOTIFICATION RESPONSE RECEIVED');
      console.log(response);
      const userName = response.notification.request.content.data.userName;
      console.log(userName);
    }
  );

  return {
    subscription1,
    subscription2,
  };

}

export async function scheduleNotification(title, body, data) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data
    },
    trigger: {
        type: 'timeInterval',
        seconds: 5,
        repeats: false,
      },
  });
}
