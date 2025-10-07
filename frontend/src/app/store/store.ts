import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './authSlice';
import queueReducer from './queueSlice';
import uiReducer from './uiSlice';
import visitHistoryReducer from './visitHistorySlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    queue: queueReducer,
    ui: uiReducer,
    visitHistory: visitHistoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;