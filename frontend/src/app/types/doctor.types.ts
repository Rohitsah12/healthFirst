import { User } from "../store/types";

export interface WorkingHour {
  id: string;
  doctorId: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  userId: string;
  specialisation: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  isActive: boolean;
  createdAt: string;
  user: User;
  workingHours: WorkingHour[];
  _count: {
    visits: number;
  };
}

export interface DoctorsPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface DoctorsResponse {
  doctors: Doctor[];
  pagination: DoctorsPagination;
}

export interface CreateDoctorInput {
  name: string;
  email: string;
  phone: string;
  specialisation: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}