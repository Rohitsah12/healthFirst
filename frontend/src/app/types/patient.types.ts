export interface Patient {
  id: string;
  name: string;
  phone: string;
  gender: string;
  dob: string; // ISO string
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    visits: number;
  };
}

export interface PatientsPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PatientsResponse {
  patients: Patient[];
  pagination: PatientsPagination;
}

export interface CreatePatientInput {
  name: string;
  phone: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob: string; // 'YYYY-MM-DD' etc.
  address?: string;
}
