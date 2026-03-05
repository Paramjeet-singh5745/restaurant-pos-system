import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authReducer";

const store = configureStore({
  reducer: {
    auth: authReducer, // ✅ reducer MUST be function
  },
});

export default store;
