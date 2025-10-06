
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  DOCTOR = 'DOCTOR',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | unknown; 
}