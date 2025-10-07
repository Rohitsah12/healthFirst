
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  DOCTOR = 'DOCTOR',
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T; 
  message: string;
  success: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null | unknown; 
}


export enum VisitStatus {
  SCHEDULED = 'SCHEDULED',
  CANCELLED = 'CANCELLED',
  CHECKED_IN = 'CHECKED_IN',
  WITH_DOCTOR = 'WITH_DOCTOR',
  COMPLETED = 'COMPLETED',
}

export enum VisitType {
  SCHEDULED = 'SCHEDULED',
  WALK_IN = 'WALK_IN',
}

export enum PriorityLevel {
  NORMAL = 'NORMAL',
  URGENT = 'URGENT',
}

export interface VisitLog {
  id: string;
  status: VisitStatus;
  timestamp: string; 
  notes?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  doctorId: string;
  visitType: VisitType;
  priority: PriorityLevel;
  scheduledTime?: string; // ISO date string from the backend
  checkInTime?: string;   // ISO date string from the backend
  currentStatus: VisitStatus;
  createdAt: string;      // ISO date string from the backend
  
  patient: {
    id: string;
    name: string;
  };
  doctor: {
    id: string;
    user: {
      name: string;
    }
  };
  logs: VisitLog[];
}