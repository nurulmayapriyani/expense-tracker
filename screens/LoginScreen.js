import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';

import AuthContent from '../components/Auth/AuthContent';
import LoadingOverlay from '../components/UI/LoadingOverlay';

import { authenticate } from '../store/redux/auth';
import { login } from '../utils/auth';

function LoginScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const dispatch = useDispatch();

  async function loginHandler({ email, password }) {
    setIsAuthenticating(true);

    try {
      const {
        token,
        uid,
        refreshToken,
        expiresIn,
      } = await login(email, password);

      console.log('LOGIN UID:', uid);
      console.log('LOGIN TOKEN EXISTS:', !!token);

      // Store authentication information
      await AsyncStorage.multiSet([
        ['token', token],
        ['uid', uid],
        ['refreshToken', refreshToken],
        ['expiresIn', expiresIn.toString()],
        ['tokenTimestamp', Date.now().toString()],
      ]);

      // Store token + UID in Redux
      dispatch(
        authenticate({
          token,
          uid,
        })
      );
    } catch (error) {
      console.log('Login error:', error);

      Alert.alert(
        'Authentication failed!',
        'Could not log you in. Please check your credentials or try again later!'
      );

      setIsAuthenticating(false);
    }
  }

  if (isAuthenticating) {
    return <LoadingOverlay message="Logging you in..." />;
  }

  return <AuthContent isLogin onAuthenticate={loginHandler} />;
}

export default LoginScreen;