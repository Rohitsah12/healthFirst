'use client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useEffect } from 'react';
import { checkAuthStatus } from './store/authSlice';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(checkAuthStatus());
  }, []);
  return <>{children}</>;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}