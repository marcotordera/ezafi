import { configureStore, combineReducers } from '@reduxjs/toolkit';
import systemReducer from '@/features/system/systemSlice';
import chatReducer from '@/features/chat/chatSlice';

export const rootReducer = combineReducers({
  system: systemReducer,
  chat: chatReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
