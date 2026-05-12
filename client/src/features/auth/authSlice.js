import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getUserApi, loginApi, logoutApi, signupApi } from "./authApi";

const getError = (error) =>
  error?.response?.data?.error || error?.response?.data?.message || error.message;

export const login = createAsyncThunk("auth/login", async (payload, thunkApi) => {
  try {
    return await loginApi(payload);
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const signup = createAsyncThunk("auth/signup", async (payload, thunkApi) => {
  try {
    return await signupApi(payload);
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const fetchUser = createAsyncThunk("auth/fetchUser", async (_, thunkApi) => {
  try {
    return await getUserApi();
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

export const logout = createAsyncThunk("auth/logout", async (_, thunkApi) => {
  try {
    await logoutApi();
    return true;
  } catch (error) {
    return thunkApi.rejectWithValue(getError(error));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    initialized: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.loading = false;
        state.initialized = true;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;