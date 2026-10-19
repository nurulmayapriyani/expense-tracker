import { configureStore } from '@reduxjs/toolkit';

import authReducer from './auth';
import expensesReducer from './expenses';

export const store = configureStore({
  reducer: {
    expenses: expensesReducer,
    auth: authReducer,
  }
});