import api from '../lib/axiosClient';
import { ApiResponse } from '../store/types';

export interface DashboardData {
  stats: {
    waiting: number;
    withDoctor: number;
    completedToday: number;
    upcomingToday: number;
  };
  queue: {
    id: string;
    patientName: string;
    doctorName: string;
    checkInTime: string;
    priority: 'NORMAL' | 'URGENT';
  }[];
  appointments: {
    id: string;
    patientName: string;
    doctorName: string;
    time: string;
    type: string;
  }[];
}


export const getDashboardData = async (): Promise<DashboardData> => {
    const { data } = await api.get<ApiResponse<DashboardData>>('/dashboard');
    return data.data;
};