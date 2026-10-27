// // Import the functions you need from the SDKs you need
// import { getAnalytics } from "firebase/analytics";
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyBtIc0RpwK9o0HtssmQZxiIo7Q0oSnrLWI",
//   authDomain: "react-native-udemy-fcfa8.firebaseapp.com",
//   databaseURL: "https://react-native-udemy-fcfa8-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "react-native-udemy-fcfa8",
//   storageBucket: "react-native-udemy-fcfa8.firebasestorage.app",
//   messagingSenderId: "56071382237",
//   appId: "1:56071382237:web:743ecc999867d157f52734",
//   measurementId: "G-B0X45DVXT7"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);



import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey:
    'AIzaSyBtIc0RpwK9o0HtssmQZxiIo7Q0oSnrLWI',

  authDomain:
    'react-native-udemy-fcfa8.firebaseapp.com',

  databaseURL:
    'https://react-native-udemy-fcfa8-default-rtdb.asia-southeast1.firebasedatabase.app',

  projectId:
    'react-native-udemy-fcfa8',

  storageBucket:
    'react-native-udemy-fcfa8.firebasestorage.app',

  messagingSenderId:
    '56071382237',

  appId:
    '1:56071382237:web:743ecc999867d157f52734',
};

const app = initializeApp(firebaseConfig);

// --------------------------------------------------
// CLOUDINARY CONFIG //
// --------------------------------------------------

const CLOUDINARY_CLOUD_NAME = 'azarzd1o';
const CLOUDINARY_UPLOAD_PRESET = 'expense-tracker';

// --------------------------------------------------
// GET AUTH DATA
// --------------------------------------------------

const STORAGE_BUCKET = 'react-native-udemy-fcfa8.firebasestorage.app';

export async function getAuthData() {
  const values = await AsyncStorage.multiGet([ 'token', 'uid' ]);
  const token = values.find( ([key]) => key === 'token' )?.[1];
  const uid = values.find( ([key]) => key === 'uid' )?.[1];
  console.log('AUTH TOKEN EXISTS:', !!token);
  console.log('AUTH UID:', uid);
  if (!token) {
    throw new Error('Authentication token not found.');
  }
  if (!uid) {
    throw new Error('User UID not found.');
  } return {
    token,
    uid,
  };
}

// --------------------------------------------------
// UPLOAD IMAGE TO CLOUDINARY
// --------------------------------------------------


export async function uploadExpenseImage(imageUri, uid) {
  console.log('========== CLOUDINARY UPLOAD START ==========');
  console.log('LOCAL IMAGE URI:', imageUri);
  console.log('UPLOAD UID:', uid);

  const CLOUDINARY_CLOUD_NAME = 'azarzd1o';
  const CLOUDINARY_UPLOAD_PRESET = 'expense-tracker';

  const uploadUrl =
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  console.log('CLOUDINARY CLOUD NAME:', CLOUDINARY_CLOUD_NAME);
  console.log('CLOUDINARY UPLOAD PRESET:', CLOUDINARY_UPLOAD_PRESET);
  console.log('CLOUDINARY URL:', uploadUrl);

  try {
    const formData = new FormData();

    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `expense-${Date.now()}.jpg`,
    });

    formData.append(
      'upload_preset',
      CLOUDINARY_UPLOAD_PRESET
    );

    console.log('FORM DATA CREATED');
    console.log('IMAGE URI ADDED TO FORM DATA');
    console.log('UPLOADING TO CLOUDINARY...');

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    console.log('CLOUDINARY RESPONSE STATUS:', uploadResponse.status);

    const responseText = await uploadResponse.text();

    console.log('CLOUDINARY RESPONSE BODY:', responseText);

    if (!uploadResponse.ok) {
      throw new Error(
        `Cloudinary upload failed: ${uploadResponse.status} ${responseText}`
      );
    }

    const data = JSON.parse(responseText);

    console.log('CLOUDINARY SECURE URL:', data.secure_url);

    console.log('CLOUDINARY PUBLIC ID:', data.public_id);

    console.log('========== CLOUDINARY UPLOAD FINISHED ==========');

    return data.secure_url;
  } catch (error) {
    console.log('========== CLOUDINARY UPLOAD ERROR ==========');

    console.log('ERROR NAME:', error?.name);
    console.log('ERROR MESSAGE:', error?.message);
    console.log('ERROR:', error);

    throw error;
  }
}


export { app };

