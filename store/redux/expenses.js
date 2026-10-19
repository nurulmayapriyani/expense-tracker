import { createSlice } from '@reduxjs/toolkit';

const expensesSlice = createSlice({
  name: 'expenses',
  initialState: {
    expenses: []
  },
  reducers: {
    setExpenses: (state, action) => {
      state.expenses = action.payload;
    },
    addExpense: (state, action) => {
      state.expenses.unshift(action.payload);
    },
    removeExpense: (state, action) => {
      state.expenses = state.expenses.filter(expense => expense.id !== action.payload.id);
    },
    updateExpense: (state, action) => {
    const { id, data } = action.payload;

    const expenseIndex = state.expenses.findIndex(
      expense => expense.id === id
    );

    if (expenseIndex !== -1) {
      state.expenses[expenseIndex] = {
        ...state.expenses[expenseIndex],
        ...data,
      };
    }
  },
  },
});

export const {
  setExpenses,
  addExpense,
  removeExpense,
  updateExpense,
} = expensesSlice.actions;

export default expensesSlice.reducer;