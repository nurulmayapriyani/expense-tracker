import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider, useDispatch, useSelector } from 'react-redux';
import IconButton from './components/UI/IconButton';
import { GlobalStyles } from './constants/styles';
import AllExpenses from './screens/AllExpenses';
import LoginScreen from './screens/LoginScreen';
import ManageExpense from './screens/ManageExpense';
import Map from './screens/Map';
import RecentExpenses from './screens/RecentExpenses';
import SignupScreen from './screens/SignupScreen';
import { authenticate, logout } from './store/redux/auth';
import { store } from './store/redux/store';
import { configurePushNotifications, registerNotificationListeners } from './utils/notif';

const Stack = createNativeStackNavigator();
const BottomTabs = createBottomTabNavigator();

function ExpensesOverview() {
  const dispatch = useDispatch();

  async function logoutHandler() {
    try {
      await AsyncStorage.removeItem('token');
      dispatch(logout());
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return (
    <BottomTabs.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: GlobalStyles.colors.primary500 },
        headerTintColor: 'white',
        tabBarStyle: { backgroundColor: GlobalStyles.colors.primary500 },
        tabBarActiveTintColor: GlobalStyles.colors.accent500,
        headerRight: ({ tintColor }) => (
          <>
          <IconButton
            icon="add-circle-outline"
            size={24}
            color={tintColor}
            onPress={() => {
              navigation.navigate('ManageExpense');
            }}
          />
          <IconButton
            icon="log-out-outline"
            size={24}
            color={tintColor}
            onPress={async () => {logoutHandler()}}
          />
          </>
        ),
      })}
    >
      <BottomTabs.Screen
        name="RecentExpenses"
        component={RecentExpenses}
        options={{
          title: 'Recent Expenses',
          tabBarLabel: 'Recent',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hourglass" size={size} color={color} />
          ),
        }}
      />
      <BottomTabs.Screen
        name="AllExpenses"
        component={AllExpenses}
        options={{
          title: 'All Expenses',
          tabBarLabel: 'All Expenses',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
    </BottomTabs.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: GlobalStyles.colors.primary500 },
        headerTintColor: 'white',
        contentStyle: { backgroundColor: GlobalStyles.colors.primary100 },
      }}
    >
      <Stack.Screen name="Log In" component={LoginScreen} />
      <Stack.Screen name="Sign Up" component={SignupScreen} />
    </Stack.Navigator>
  );
}

function AuthenticatedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: GlobalStyles.colors.primary500 },
        headerTintColor: 'white',
      }}
    >
      <Stack.Screen
        name="ExpensesOverview"
        component={ExpensesOverview}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ManageExpense"
        component={ManageExpense}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="Map" component={Map} />
    </Stack.Navigator>
  );
}

function Navigation() {
  const isAuthenticated = useSelector(
    (state: any) => !!state.auth.token
  );

  return (
    <NavigationContainer>
      {!isAuthenticated && <AuthStack />}
      {isAuthenticated && <AuthenticatedStack />}
    </NavigationContainer>
  );
}

function Root() {
  const [isTryingLogin, setIsTryingLogin] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchToken() {
      try{
        console.log('Fetching token...');
        const storedToken = await AsyncStorage.getItem('token');
        console.log('Stored token:', storedToken);
        if (storedToken) {
          dispatch(authenticate(storedToken));
        }
      } catch (error) {
        console.error('Error fetching token:', error);
      } finally {
        console.log('Finished loading');
        setIsTryingLogin(false);
      }
    }

    fetchToken();
  }, [dispatch]);

  if (isTryingLogin) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

  return <Navigation />;
}

export default function App() {
    useEffect(() => {
      console.log('========== USE EFFECT RUNNING ==========');
      configurePushNotifications();
      console.log('========== BEFORE REGISTER ==========');
      const subscriptions = registerNotificationListeners();
      console.log('========== AFTER REGISTER ==========');
      return () => {
        console.log('========== CLEANUP ==========');
        subscriptions.subscription1.remove();
        subscriptions.subscription2.remove();
      };
    }, []);
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      {/* <ExpensesContextProvider> */}
      <Provider store={store}>
        <Root />
      </Provider>
      {/* </ExpensesContextProvider> */}
    </GestureHandlerRootView>
  );
}
