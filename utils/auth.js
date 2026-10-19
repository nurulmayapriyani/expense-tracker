import axios from 'axios';

const API_KEY = 'AIzaSyBtIc0RpwK9o0HtssmQZxiIo7Q0oSnrLWI';

async function authenticate(mode, email, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:${mode}?key=${API_KEY}`;

  try {
    const response = await axios.post(url, {
      email,
      password,
      returnSecureToken: true,
    });

    console.log('Firebase Auth response:', response.data);

    return {
      token: response.data.idToken,
      uid: response.data.localId,
      refreshToken: response.data.refreshToken,
      expiresIn: response.data.expiresIn,
    };
  } catch (error) {
    console.log('Status:', error.response?.status);
    console.log('Firebase error:', error.response?.data);
    throw error;
  }
}

export function createUser(email, password) {
  return authenticate('signUp', email, password);
}

export function login(email, password) {
  return authenticate('signInWithPassword', email, password);
}


