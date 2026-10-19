import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',

  initialState: {
    token: null,
    uid: null,
    isAuthenticated: false,
  },

  reducers: {
    authenticate(state, action) {
      state.token = action.payload.token;
      state.uid = action.payload.uid;
      state.isAuthenticated = true;
    },

    logout(state) {
      state.token = null;
      state.uid = null;
      state.isAuthenticated = false;
    },
  },
});

export const { authenticate, logout } = authSlice.actions;

export default authSlice.reducer;