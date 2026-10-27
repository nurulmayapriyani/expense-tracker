// import {
//   useLayoutEffect,
//   useState,
// } from 'react';

// import {
//   StyleSheet,
//   View,
//   useWindowDimensions,
// } from 'react-native';

// import {
//   useDispatch,
//   useSelector,
// } from 'react-redux';

// import {
//   addExpense as addExpenseAction,
//   removeExpense as removeExpenseAction,
//   updateExpense as updateExpenseAction,
// } from '@/store/redux/expenses';

// import ExpenseForm from '../components/ManageExpense/ExpenseForm';
// import ErrorOverlay from '../components/UI/ErrorOverlay';
// import IconButton from '../components/UI/IconButton';
// import LoadingOverlay from '../components/UI/LoadingOverlay';

// import { GlobalStyles } from '../constants/styles';

// import {
//   deleteExpense as deleteExpenseHttp,
//   storeExpense as storeExpenseHttp,
//   updateExpense as updateExpenseHttp,
//   uploadExpenseImage,
// } from '../utils/http';

// import { scheduleNotification } from '../utils/notif';

// function ManageExpense({ route, navigation }) {
//   console.log(
//     'MANAGE EXPENSE PARAMS:',
//     route.params
//   );

//   const [isSubmitting, setIsSubmitting] =
//     useState(false);

//   const [error, setError] = useState();

//   const { height } = useWindowDimensions();

//   const paddingTopDistance =
//     height < 400 ? 0 : 20;

//   const dispatch = useDispatch();

//   const editedExpenseId =
//     route.params?.expenseId;

//   const isEditing = !!editedExpenseId;

//   const expenses = useSelector(
//     (state) => state.expenses.expenses
//   );

//   const selectedExpense = expenses.find(
//     (expense) =>
//       expense.id === editedExpenseId
//   );

//   /*
//    * Location returned from Map.
//    */
//   const pickedLat =
//     route.params?.pickedLat;

//   const pickedLng =
//     route.params?.pickedLng;

//   /*
//    * Build the values that will be displayed
//    * in ExpenseForm.
//    *
//    * If a new location was selected on Map,
//    * replace the old location.
//    */

// const expenseToEdit = selectedExpense
//   ? {
//       ...selectedExpense,

//       ...(pickedLat != null &&
//       pickedLng != null
//         ? {
//             location: {
//               lat: Number(pickedLat),
//               lng: Number(pickedLng),
//             },
//           }
//         : {}),
//     }
//   : pickedLat != null &&
//     pickedLng != null
//     ? {
//         location: {
//           lat: Number(pickedLat),
//           lng: Number(pickedLng),
//         },
//       }
//     : undefined;

//     console.log('EDITED EXPENSE ID:', editedExpenseId);
//     console.log('SELECTED EXPENSE:', selectedExpense);
//     console.log('PICKED LAT:', pickedLat);
//     console.log('PICKED LNG:', pickedLng);
//     console.log('EXPENSE TO EDIT:', expenseToEdit);

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       title: isEditing
//         ? 'Edit Expense'
//         : 'Add Expense',
//     });
//   }, [
//     navigation,
//     isEditing,
//   ]);

//   async function deleteExpenseHandler() {
//     setIsSubmitting(true);

//     try {
//       await deleteExpenseHttp(
//         editedExpenseId
//       );

//       dispatch(
//         removeExpenseAction({
//           id: editedExpenseId,
//         })
//       );

//       navigation.goBack();
//     } catch (error) {
//       console.log('Error:', error);

//       setError(
//         'Could not delete expense - please try again later!'
//       );

//       setIsSubmitting(false);
//     }
//   }

//   function cancelHandler() {
//     navigation.goBack();
//   }

//   async function confirmHandler(expenseData) {
//     setIsSubmitting(true);

//     try {
//       if (isEditing) {
//         await updateExpenseHttp(
//           editedExpenseId,
//           expenseData
//         );

//         dispatch(
//           updateExpenseAction({
//             id: editedExpenseId,
//             data: expenseData,
//           })
//         );

//         await scheduleNotification(
//           'Expense Updated',
//           `Your expense ${expenseData.description} was updated successfully.`,
//           {
//             expenseId: editedExpenseId,
//             description:
//               expenseData.description,
//           }
//         );
//       } else {
//         const imageUrl = await uploadExpenseImage(
//           expenseData.imageUri
//         );

//         const id =
//           await storeExpenseHttp({
//             ...expenseData,
//             imageUri: imageUrl,
//             date: new Date(
//               expenseData.date
//             ),
//           });

//         dispatch(
//           addExpenseAction({
//             id,
//             ...expenseData,
//           })
//         );

//         await scheduleNotification(
//           'Expense Added',
//           `Your expense ${expenseData.description} was added successfully.`,
//           {
//             expenseId: id,
//             description:
//               expenseData.description,
//           }
//         );
//       }

//       /*
//        * This goes back to whichever screen
//        * originally opened ManageExpense.
//        */
//       navigation.goBack();
//     } catch (error) {
//       console.log('Error:', error);

//       setError(
//         'Could not save data - please try again later!'
//       );

//       setIsSubmitting(false);
//     }
//   }

//   if (error && !isSubmitting) {
//     return (
//       <ErrorOverlay message={error} />
//     );
//   }

//   if (isSubmitting) {
//     return <LoadingOverlay />;
//   }

//   return (
//     <View
//       style={[
//         styles.container,
//         {
//           paddingTop:
//             paddingTopDistance,
//         },
//       ]}
//     >
//       <ExpenseForm
//         submitButtonLabel={
//           isEditing ? 'Update' : 'Add'
//         }
//         onSubmit={confirmHandler}
//         onCancel={cancelHandler}
//         defaultValues={expenseToEdit}
//         expenseId={editedExpenseId}
//       />

//       {isEditing && (
//         <View
//           style={styles.deleteContainer}
//         >
//           <IconButton
//             icon="trash"
//             color={
//               GlobalStyles.colors.error500
//             }
//             size={36}
//             onPress={
//               deleteExpenseHandler
//             }
//           />
//         </View>
//       )}
//     </View>
//   );
// }

// export default ManageExpense;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: 24,
//     paddingHorizontal: 24,
//     paddingBottom: 70,
//     backgroundColor: GlobalStyles.colors.primary800,
//   },

//   deleteContainer: {
//     paddingTop: 0,
//     margin: 0,
//     borderTopWidth: 2,
//     borderTopColor:
//       GlobalStyles.colors.primary200,
//     alignItems: 'center',
//   },
// });



import { useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import {
  addExpense as addExpenseAction,
  removeExpense as removeExpenseAction,
  updateExpense as updateExpenseAction,
} from '@/store/redux/expenses';

import ExpenseForm from '../components/ManageExpense/ExpenseForm';
import ErrorOverlay from '../components/UI/ErrorOverlay';
import LoadingOverlay from '../components/UI/LoadingOverlay';

import { GlobalStyles } from '../constants/styles';

import {
  deleteExpense as deleteExpenseHttp,
  storeExpense as storeExpenseHttp,
  updateExpense as updateExpenseHttp,
} from '../utils/http';

import { getAuthData, uploadExpenseImage } from '../utils/firebase';

import { scheduleNotification } from '../utils/notif';

function ManageExpense({ route, navigation }) {
  console.log('MANAGE EXPENSE PARAMS:', route.params);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState();

  const { height } = useWindowDimensions();

  const paddingTopDistance = height < 400 ? 0 : 20;

  const dispatch = useDispatch();

  const editedExpenseId = route.params?.expenseId;

  const isEditing = !!editedExpenseId;

  const expenses = useSelector((state) => state.expenses.expenses);

  const selectedExpense = expenses.find((expense) => expense.id === editedExpenseId);

  const pickedLat = route.params?.pickedLat;
  const pickedLng = route.params?.pickedLng;

  /**
   * Build the expense that will be shown
   * when editing.
   */
  const expenseToEdit = selectedExpense
    ? {
        ...selectedExpense,
        ...(pickedLat != null &&
        pickedLng != null
          ? {
              location: {
                lat: Number(pickedLat),
                lng: Number(pickedLng),
              },
            }
          : {}),
      }
    : pickedLat != null &&
      pickedLng != null
    ? {
        location: {
          lat: Number(pickedLat),
          lng: Number(pickedLng),
        },
      }
    : undefined;

  console.log('EDITED EXPENSE ID:', editedExpenseId);

  console.log('SELECTED EXPENSE:', selectedExpense);

  console.log('PICKED LAT:', pickedLat);

  console.log('PICKED LNG:', pickedLng);

  console.log('EXPENSE TO EDIT:', expenseToEdit);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing
        ? 'Edit Expense'
        : 'Add Expense',
    });
  }, [
    navigation,
    isEditing,
  ]);

  /**
   * Delete expense.
   */
  async function deleteExpenseHandler() {
    setIsSubmitting(true);

    // Grab the description BEFORE removing the expense from Redux
    const deletedDescription = selectedExpense?.description ?? 'Expense';

    try {
      await deleteExpenseHttp(editedExpenseId);

      dispatch(
        removeExpenseAction({
          id: editedExpenseId,
        })
      );

      await scheduleNotification(
        'Expense Deleted',
        `Your expense ${deletedDescription} was deleted successfully.`,
        {
          expenseId: editedExpenseId,
          description: deletedDescription,
        }
      );

      navigation.goBack();
    } catch (error) {
      console.log('Delete expense error:', error);
      setError('Could not delete expense - please try again later!');
      setIsSubmitting(false);
    }
  }

  /**
   * Cancel the form.
   */
  function cancelHandler() {
    navigation.goBack();
  }

  /**
   * Add or update expense.
   */
  async function confirmHandler(expenseData) {
    setIsSubmitting(true);

    console.log('========== CONFIRM HANDLER ==========');
    console.log('EXPENSE DATA BEFORE IMAGE UPLOAD:', expenseData);
    console.log('IMAGE URI:', expenseData.imageUri);

    try {
      /**
       * ------------------------------------------------
       * IMAGE UPLOAD
       * ------------------------------------------------
       *
       * If imageUri is a local file:// URI,
       * upload it to Firebase Storage first.
       *
       * After upload, imageUri becomes a permanent
       * https://firebasestorage.googleapis.com/... URL.
       */
      let finalImageUri = expenseData.imageUri ?? null;

      console.log('INITIAL IMAGE URI:', finalImageUri);

      if (
        expenseData.imageUri &&
        expenseData.imageUri.startsWith('file://')
      ) {
        console.log('Local image detected. Uploading to Firebase Storage...');

        const { uid } = await getAuthData();

        console.log('UPLOAD UID:', uid);

        finalImageUri = await uploadExpenseImage(
          expenseData.imageUri,
          uid
        );

        console.log('UPLOAD FINISHED');
        console.log('CLOUDINARY IMAGE URL:', finalImageUri);
      }

      /**
       * Create the final expense object.
       *
       * IMPORTANT:
       * We replace the local file:// URI with
       * the Firebase Storage HTTPS URL.
       */
      const finalExpenseData = {
        ...expenseData,
        imageUri: finalImageUri,
      };

      console.log('========== FINAL EXPENSE DATA ==========', finalExpenseData);

      /**
       * ------------------------------------------------
       * EDIT EXISTING EXPENSE
       * ------------------------------------------------
       */
      if (isEditing) {
        console.log('UPDATING EXPENSE:', editedExpenseId);
        await updateExpenseHttp(
          editedExpenseId,
          finalExpenseData
        );

        console.log('UPDATE HTTP FINISHED');

        dispatch(
          updateExpenseAction({
            id: editedExpenseId,
            data: finalExpenseData,
          })
        );

        await scheduleNotification(
          'Expense Updated',
          `Your expense ${finalExpenseData.description} was updated successfully.`,
          {
            expenseId: editedExpenseId,
            description: finalExpenseData.description,
          }
        );
      }

      /**
       * ------------------------------------------------
       * ADD NEW EXPENSE
       * ------------------------------------------------
       */
      else {
        console.log('ADDING NEW EXPENSE');

        const id = await storeExpenseHttp({
          ...finalExpenseData,
          date: new Date(finalExpenseData.date),
        });

        console.log('STORE HTTP FINISHED:', id);

        dispatch(
          addExpenseAction({
            id,
            ...finalExpenseData,
          })
        );

        await scheduleNotification(
          'Expense Added',
          `Your expense ${finalExpenseData.description} was added successfully.`,
          {
            expenseId: id,
            description: finalExpenseData.description,
          }
        );
      }

      navigation.goBack();
    } catch (error) {
      console.log('SAVE EXPENSE ERROR:', error);
      console.log('SAVE EXPENSE ERROR RESPONSE:', error?.response?.data);
      console.log('SAVE EXPENSE ERROR MESSAGE:', error?.message);
      setError('Could not save data - please try again later!');
      setIsSubmitting(false);
    }
  }

  /**
   * Show error screen.
   */
  if (error && !isSubmitting) {
    return (
      <ErrorOverlay message={error}/>
    );
  }

  /**
   * Show loading screen while:
   *
   * 1. Image is uploading
   * 2. Expense is being saved
   * 3. Notification is being scheduled
   */
  if (isSubmitting) {
    return <LoadingOverlay />;
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop:
            paddingTopDistance,
        },
      ]}
    >
      <ExpenseForm
        submitButtonLabel={
          isEditing
            ? 'Update'
            : 'Add'
        }
        onSubmit={confirmHandler}
        onDelete={deleteExpenseHandler}
        isEditing={isEditing}
        onCancel={cancelHandler}
        defaultValues={expenseToEdit}
        expenseId={editedExpenseId}
      />
    </View>
  );
}

export default ManageExpense;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 0,
    backgroundColor: GlobalStyles.colors.primary800,
  },
});

