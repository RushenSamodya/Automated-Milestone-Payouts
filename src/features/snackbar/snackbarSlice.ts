import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SnackbarState {
  open: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

const initialState: SnackbarState = {
  open: false,
  message: '',
  type: 'info'
};

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    showSnackbar(state, action: PayloadAction<{ message: string; type?: 'success' | 'error' | 'info' }>) {
      state.open = true;
      state.message = action.payload.message;
      state.type = action.payload.type ?? 'info';
    },
    hideSnackbar(state) {
      state.open = false;
      state.message = '';
      state.type = 'info';
    }
  }
});

export const { showSnackbar, hideSnackbar } = snackbarSlice.actions;
export default snackbarSlice.reducer;
