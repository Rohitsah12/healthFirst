import api from '../lib/axiosClient';
import type { 
  DoctorScheduleInput, 
  DoctorScheduleResponse,
  GetDoctorScheduleResponse,
  DayOfWeek 
} from '../types/doctorSchedule.types';

export const doctorScheduleApi = {
  // Get doctor schedule (all days or specific day)
  getDoctorSchedule: async (doctorId: string, dayOfWeek?: DayOfWeek) => {
    const params = dayOfWeek ? `?dayOfWeek=${dayOfWeek}` : '';
    const response = await api.get<{ data: GetDoctorScheduleResponse }>(
      `/doctor-schedule/${doctorId}${params}`
    );
    return response.data.data;
  },

  // Create or update doctor schedule (upsert)
  upsertDoctorSchedule: async (doctorId: string, data: DoctorScheduleInput) => {
    const response = await api.put<{ data: DoctorScheduleResponse[] }>(
      `/doctor-schedule/${doctorId}`,
      data
    );
    return response.data.data;
  },

  // Delete doctor schedule (all or specific day)
  deleteDoctorSchedule: async (doctorId: string, dayOfWeek?: DayOfWeek) => {
    const params = dayOfWeek ? `?dayOfWeek=${dayOfWeek}` : '';
    const response = await api.delete<{ data: { deletedCount: number } }>(
      `/doctor-schedule/${doctorId}${params}`
    );
    return response.data.data;
  }
};