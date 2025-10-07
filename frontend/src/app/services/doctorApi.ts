import api from '../lib/axiosClient';
import { ApiResponse } from '../store/types';
import type { DoctorsResponse, Doctor, CreateDoctorInput } from '../types/doctor.types';

export const doctorApi = {
  getDoctors: async (params: {
    page: number;
    limit: number;
    search?: string;
    isActive?: 'all' | 'true' | 'false';
  }) => {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
      isActive: params.isActive || 'all',
      ...(params.search && { search: params.search })
    });

    const response = await api.get<{ data: DoctorsResponse }>(`/doctor?${queryParams}`);
    return response.data.data;
  },

  getDoctorById: async (doctorId: string) => {
    const response = await api.get<{ data: Doctor }>(`/doctor/${doctorId}`);
    return response.data.data;
  },

  createDoctor: async (data: CreateDoctorInput) => {
    const response = await api.post<{ data: Doctor }>('/doctor', data);
    return response.data.data;
  },

  updateDoctor: async (doctorId: string, data: Partial<CreateDoctorInput>) => {
    const response = await api.patch<{ data: Doctor }>(`/doctor/${doctorId}`, data);
    return response.data.data;
  },

  deleteDoctor: async (doctorId: string, permanent: boolean = false) => {
    const response = await api.delete(`/doctor/${doctorId}?permanent=${permanent}`);
    return response.data;
  },

};

export const getAvailableDoctors = async (dayOfWeek: string): Promise<Doctor[]> => {
  const response = await api.get<ApiResponse<Doctor[]>>(`/doctor/available-by-day?day=${dayOfWeek}`);
  return response.data.data;
};