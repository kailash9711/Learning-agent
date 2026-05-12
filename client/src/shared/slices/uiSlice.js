import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    activeRightTool: null, // 'pomodoro', 'todo', 'persona', 'concept'
  },
  reducers: {
    setRightTool: (state, action) => {
      state.activeRightTool = action.payload;
    },
    closeRightTool: (state) => {
      state.activeRightTool = null;
    },
  },
});

export const { setRightTool, closeRightTool } = uiSlice.actions;
export default uiSlice.reducer;
