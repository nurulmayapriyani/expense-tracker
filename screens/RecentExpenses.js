import axios from 'axios';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useDispatch, useSelector } from 'react-redux';

import ExpensesOutput from '../components/ExpensesOutput/ExpensesOutput';
import ErrorOverlay from '../components/UI/ErrorOverlay';
import LoadingOverlay from '../components/UI/LoadingOverlay';
// import { ExpensesContext } from '../store/context/expense-context';
import { GlobalStyles } from '../constants/styles';
import { setExpenses } from '../store/redux/expenses';
import { getDateMinusDays } from '../utils/date';
import { fetchExpenses } from '../utils/http';

function RecentExpenses() {
  const [fetchedMessage, setFetchedMesssage] = useState('');
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState();
  const dispatch = useDispatch();
  const expenses = useSelector(state => state.expenses.expenses);
  const token = useSelector(state => state.auth.token);
  // const expensesCtx = useContext(ExpensesContext);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    axios
      .get(
        'https://react-native-udemy-fcfa8-default-rtdb.asia-southeast1.firebasedatabase.app/message.json?auth=' +
          token
      )
      .then((response) => {
        setFetchedMesssage(response.data);
      });
  }, [token]);

  useEffect(() => {
    async function getExpenses() {
      setIsFetching(true);
      try {
        const expenses = await fetchExpenses();
        // expensesCtx.setExpenses(expenses);
        dispatch(setExpenses(expenses));
      } catch (error) {
        console.log("Error:", error)
        setError('Could not fetch expenses!');
      }
      setIsFetching(false);
    }

    getExpenses();
  }, [dispatch]);

  if (error && !isFetching) {
    return <ErrorOverlay message={error} />;
  }

  if (isFetching) {
    return <LoadingOverlay />;
  }

  const paddingTopDistance = height < 400 ? 0 : 20;

  const recentExpenses = expenses.filter((expense) => {
  const today = new Date();
  const date7DaysAgo = getDateMinusDays(today, 7);

  const expenseDate = new Date(expense.date);

  return expenseDate >= date7DaysAgo && expenseDate <= today;
});

  return (
    <>
    <View style={styles.container}>
      <Text style={styles.title}>Welcome! {fetchedMessage}</Text>
      <ExpensesOutput
        expenses={recentExpenses}
        expensesPeriod="Last 7 Days"
        fallbackText="No expenses registered for the last 7 days."
        paddingTopDistance={paddingTopDistance}
      />
    </View>
    </>
  );
}

export default RecentExpenses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GlobalStyles.colors.primary700,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 18,
    marginTop: 8,
  },
});