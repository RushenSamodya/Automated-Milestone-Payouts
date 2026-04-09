import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id?: string;
  name?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserState | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<UserState>) {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
    }
  }
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
