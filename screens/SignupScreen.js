import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';

import AuthContent from '../components/Auth/AuthContent';
import LoadingOverlay from '../components/UI/LoadingOverlay';

import { authenticate } from '../store/redux/auth';
import { createUser } from '../utils/auth';

function SignupScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const dispatch = useDispatch();

  async function signupHandler({ email, password }) {
    setIsAuthenticating(true);

    try {
      const {
        token,
        uid,
        refreshToken,
        expiresIn,
      } = await createUser(email, password);

      console.log('SIGNUP UID:', uid);
      console.log('SIGNUP TOKEN EXISTS:', !!token);

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
      console.log('Signup error:', error);

      Alert.alert(
        'Authentication failed',
        'Could not create user, please check your input and try again later.'
      );

      setIsAuthenticating(false);
    }
  }

  if (isAuthenticating) {
    return <LoadingOverlay message="Signing up..." />;
  }

  return <AuthContent onAuthenticate={signupHandler} />;
}

export default SignupScreen;