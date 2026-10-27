import { useHeaderHeight } from '@react-navigation/elements';
import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { GlobalStyles } from '../../constants/styles';
import { getFormattedDate } from '../../utils/date';

import Button from '../UI/Button';
import FlatButton from '../UI/FlatButton';
import IconButton from '../UI/IconButton';
import ImagePicker from './ImagePicker';
import Input from './Input';
import LocationPicker from './LocationPicker';

function ExpenseForm({
  submitButtonLabel,
  onCancel,
  onDelete,
  onSubmit,
  isEditing,
  defaultValues,
  expenseId,
}) {
  const [imageUri, setImageUri] = useState(defaultValues?.imageUri ?? null);

  const [pickedLocation, setPickedLocation] = useState(defaultValues?.location ?? null);

  useEffect(() => {
    console.log('ExpenseForm defaultValues:', defaultValues);

    const location = defaultValues?.location ?? null;

    console.log('ExpenseForm location:', location);

    setPickedLocation(location);
  }, [defaultValues]);

  const headerHeight = useHeaderHeight();

  const [inputs, setInputs] = useState({
    amount: {
      value: defaultValues?.amount
        ? defaultValues.amount.toString()
        : '',
      isValid: true,
    },

    date: {
      value: defaultValues?.date
        ? getFormattedDate(new Date(defaultValues.date))
        : '',
      isValid: true,
    },

    description: {
      value: defaultValues?.description ?? '',
      isValid: true,
    },
  });

  function inputChangedHandler(inputIdentifier, enteredValue) {
    setInputs((curInputs) => ({
      ...curInputs,
      [inputIdentifier]: {
        value: enteredValue,
        isValid: true,
      },
    }));
  }

  const pickLocationHandler = useCallback(
    (location) => {
      console.log('ExpenseForm received location:', location);

      setPickedLocation(location);
    },
    []
  );

  function submitHandler() {
    const expenseData = {
      amount: +inputs.amount.value,
      date: inputs.date.value,
      description: inputs.description.value,
      imageUri: imageUri,
      location: pickedLocation,
    };

    console.log('ExpenseForm submitHandler:', expenseData);

    const amountIsValid = !isNaN(expenseData.amount) && expenseData.amount > 0;

    const dateIsValid = expenseData.date.toString() !== 'Invalid Date' && expenseData.date.trim().length > 0;

    const descriptionIsValid = expenseData.description.trim().length > 0;

    if (
      !amountIsValid ||
      !dateIsValid ||
      !descriptionIsValid
    ) {
      setInputs((curInputs) => ({
        amount: {
          value: curInputs.amount.value,
          isValid: amountIsValid,
        },
        date: {
          value: curInputs.date.value,
          isValid: dateIsValid,
        },
        description: {
          value: curInputs.description.value,
          isValid: descriptionIsValid,
        },
      }));

      return;
    }

    onSubmit(expenseData);
  }

  const formIsInvalid =
    !inputs.amount.isValid ||
    !inputs.date.isValid ||
    !inputs.description.isValid;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.form,
          { flexGrow: 1 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          Your Expense
        </Text>

        <View style={styles.inputsRow}>
          <Input
            style={styles.rowInput}
            label="Amount"
            invalid={!inputs.amount.isValid}
            textInputConfig={{
              keyboardType: 'decimal-pad',
              onChangeText: inputChangedHandler.bind(this, 'amount'),
              value: inputs.amount.value,
            }}
          />

          <Input
            style={styles.rowInput}
            label="Date"
            invalid={!inputs.date.isValid}
            textInputConfig={{
              placeholder: 'YYYY-MM-DD',
              maxLength: 10,
              onChangeText: inputChangedHandler.bind(this, 'date'),
              value: inputs.date.value,
            }}
          />
        </View>

        <Input
          label="Description"
          invalid={!inputs.description.isValid}
          textInputConfig={{
            multiline: true,
            onChangeText: inputChangedHandler.bind(this, 'description'),
            value: inputs.description.value,
          }}
        />

        {formIsInvalid && (
          <Text style={styles.errorText}>
            Invalid input values - please check your
            entered data!
          </Text>
        )}

        <ImagePicker
          onTakeImage={setImageUri}
          existingImage={imageUri}
        />

        <LocationPicker
          existingLocation={pickedLocation}
          onPickLocation={pickLocationHandler}
          expenseId={expenseId}
        />

        <View style={styles.buttons}>
          <FlatButton
            style={styles.button}
            onPress={onCancel}
          >
            Cancel
          </FlatButton>

          <Button
            style={styles.button}
            onPress={submitHandler}
          >
            {submitButtonLabel}
          </Button>
        </View>

         {isEditing && (
            <View
              style={styles.deleteContainer}
            >
              <IconButton
                icon="trash"
                color={GlobalStyles.colors.error500}
                size={36}
                onPress={onDelete}
              />
            </View>
          )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default ExpenseForm;

const styles = StyleSheet.create({
  form: {
    paddingTop: 0,
    paddingBottom: 120,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 24,
    textAlign: 'center',
  },

  inputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  rowInput: {
    flex: 1,
  },

  errorText: {
    textAlign: 'center',
    color: GlobalStyles.colors.error500,
    margin: 8,
  },

  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },

  button: {
    minWidth: 120,
    marginHorizontal: 8,
    borderRadius: 8,
  },

  deleteContainer: {
    marginTop: 24,
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: GlobalStyles.colors.primary200,
    alignItems: 'center',
  },
});