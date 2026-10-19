// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';

// const BACKEND_URL =
//   'https://react-native-udemy-fcfa8-default-rtdb.asia-southeast1.firebasedatabase.app';

// async function getAuthData() {
//   const values = await AsyncStorage.multiGet([
//     'token',
//     'uid',
//   ]);

//   const token = values[0][1];
//   const uid = values[1][1];

//   console.log('AUTH TOKEN EXISTS:', !!token);
//   console.log('AUTH UID:', uid);

//   if (!token) {
//     throw new Error('Authentication token not found.');
//   }

//   if (!uid) {
//     throw new Error('User UID not found.');
//   }

//   return {
//     token,
//     uid,
//   };
// }

// export async function storeExpense(expenseData) {
//   const { token, uid } = await getAuthData();

//   const response = await axios.post(
//     `${BACKEND_URL}/expenses/${uid}.json?auth=${token}`,
//     expenseData
//   );

//   return response.data.name;
// }

// export async function fetchExpenses() {
//   const { token, uid } = await getAuthData();

//   const response = await axios.get(
//     `${BACKEND_URL}/expenses/${uid}.json?auth=${token}`
//   );

//   if (!response.data) {
//     return [];
//   }

//   const expenses = [];

//   for (const key in response.data) {
//     const expenseObj = {
//       id: key,
//       amount: response.data[key].amount,
//       date: response.data[key].date,
//       description: response.data[key].description,
//       imageUri: response.data[key].imageUri ?? null,
//       location: response.data[key].location ?? null,
//     };

//     expenses.push(expenseObj);
//   }

//   expenses.reverse();

//   return expenses;
// }

// export async function updateExpense(id, expenseData) {
//   const { token, uid } = await getAuthData();

//   return axios.put(
//     `${BACKEND_URL}/expenses/${uid}/${id}.json?auth=${token}`,
//     expenseData
//   );
// }

// export async function deleteExpense(id) {
//   const { token, uid } = await getAuthData();

//   return axios.delete(
//     `${BACKEND_URL}/expenses/${uid}/${id}.json?auth=${token}`
//   );
// }


import axios from 'axios';
import { getAuthData } from './firebase';

const BACKEND_URL =
  'https://react-native-udemy-fcfa8-default-rtdb.asia-southeast1.firebasedatabase.app';

/**
 * Get the Firebase authentication data that was saved
 * when the user logged in.
 */
// export async function getAuthData() {
//   const values = await AsyncStorage.multiGet([
//     'token',
//     'uid',
//   ]);

//   const token = values.find(([key]) => key === 'token')?.[1];
//   const uid = values.find(([key]) => key === 'uid')?.[1];

//   console.log('AUTH TOKEN EXISTS:', !!token);
//   console.log('AUTH UID:', uid);

//   if (!token) {
//     throw new Error('Authentication token not found.');
//   }

//   if (!uid) {
//     throw new Error('User UID not found.');
//   }

//   return { token, uid };
// }

/**
 * Upload a locally stored image to Firebase Storage.
 *
 * The imageUri coming from expo-image-picker looks like:
 *
 * file:///data/user/0/.../cache/...jpg
 *
 * We upload that actual file to Firebase Storage and
 * return a permanent HTTPS URL.
 */
// export async function uploadExpenseImage(
//   imageUri,
//   uid
// ) {
//   const response =
//     await fetch(imageUri);

//   const blob =
//     await response.blob();

//   const fileName =
//     `expenses/${uid}/${Date.now()}.jpg`;

//   const storageRef =
//     ref(storage, fileName);

//   await uploadBytes(
//     storageRef,
//     blob,
//     {
//       contentType: 'image/jpeg',
//     }
//   );

//   const downloadUrl =
//     await getDownloadURL(
//       storageRef
//     );

//   return downloadUrl;
// }

/**
 * Store a new expense in Firebase Realtime Database.
 */
export async function storeExpense(expenseData) {
  const { token, uid } = await getAuthData();

  const response = await axios.post(
    `${BACKEND_URL}/expenses/${uid}.json?auth=${token}`,
    expenseData
  );

  return response.data.name;
}

/**
 * Fetch all expenses belonging to the current user.
 */
export async function fetchExpenses() {
  const { token, uid } = await getAuthData();

  const response = await axios.get(
    `${BACKEND_URL}/expenses/${uid}.json?auth=${token}`
  );

  if (!response.data) {
    return [];
  }

  const expenses = [];

  for (const key in response.data) {
    const expenseObj = {
      id: key,
      amount: response.data[key].amount,
      date: response.data[key].date,
      description: response.data[key].description,
      imageUri: response.data[key].imageUri ?? null,
      location: response.data[key].location ?? null,
    };

    expenses.push(expenseObj);
  }

  expenses.reverse();

  return expenses;
}

/**
 * Update an existing expense.
 */
export async function updateExpense(id, expenseData) {
  const { token, uid } = await getAuthData();

  return axios.put(
    `${BACKEND_URL}/expenses/${uid}/${id}.json?auth=${token}`,
    expenseData
  );
}

/**
 * Delete an existing expense.
 */
export async function deleteExpense(id) {
  const { token, uid } = await getAuthData();

  return axios.delete(
    `${BACKEND_URL}/expenses/${uid}/${id}.json?auth=${token}`
  );
}

