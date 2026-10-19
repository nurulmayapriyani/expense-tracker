import { useEffect, useState } from 'react';
import { useWindowDimensions } from "react-native";
import { useDispatch, useSelector } from 'react-redux';

import ExpensesOutput from '../components/ExpensesOutput/ExpensesOutput';
import ErrorOverlay from '../components/UI/ErrorOverlay';
import LoadingOverlay from '../components/UI/LoadingOverlay';
// import { ExpensesContext } from '../store/context/expense-context';
import { setExpenses } from '../store/redux/expenses';
import { fetchExpenses } from '../utils/http';

function AllExpenses() {
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState();
  const dispatch = useDispatch();
  const expenses = useSelector(state => state.expenses.expenses);
  // const expensesCtx = useContext(ExpensesContext);
  const { width, height } = useWindowDimensions();

  const paddingTopDistance = height < 400 ? 0 : 20;

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

  return (
    <ExpensesOutput
      expenses={expenses}
      expensesPeriod="Total"
      fallbackText="No registered expenses found!"
      paddingTopDistance={paddingTopDistance}
    />
  );
}

export default AllExpenses;
