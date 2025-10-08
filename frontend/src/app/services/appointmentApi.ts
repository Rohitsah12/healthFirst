import apiClient from "../lib/axiosClient";
import type { Visit } from "../types/visit.types";
import type { Doctor } from "../types/doctor.types";
import type { ApiResponse } from "../store/types";

export interface BookAppointmentData {
    patientId: string;
    doctorId: string;
    scheduledTime: string;
    priority?: "NORMAL" | "URGENT";
    notes?: string;
}

export interface RescheduleAppointmentData {
    newScheduledTime: string;
}

export interface DoctorAvailability {
    availableSlots: string[];
    workingHours: {
        dayOfWeek: string;
        startTime: string;
        endTime: string;
    } | null;
}

export const appointmentApi = {
    getAppointmentsByDate: async (date: string): Promise<Visit[]> => {
        const { data } = await apiClient.get<ApiResponse<{ appointments: Visit[] }>>(
            `/visits/appointments?date=${date}`
        );
        return data.data.appointments;
    },

    bookAppointment: async (appointmentData: BookAppointmentData): Promise<Visit> => {
        const { data } = await apiClient.post<ApiResponse<{ appointment: Visit }>>(
            "/visits/appointments",
            appointmentData
        );
        return data.data.appointment;
    },

    rescheduleAppointment: async (
        visitId: string,
        rescheduleData: RescheduleAppointmentData
    ): Promise<Visit> => {
        const { data } = await apiClient.patch<ApiResponse<{ appointment: Visit }>>(
            `/visits/appointments/${visitId}/reschedule`,
            rescheduleData
        );
        return data.data.appointment;
    },

    cancelAppointment: async (visitId: string, reason?: string): Promise<Visit> => {
        const { data } = await apiClient.patch<ApiResponse<{ appointment: Visit }>>(
            `/visits/appointments/${visitId}/cancel`,
            { reason }
        );
        return data.data.appointment;
    },

    checkInAppointment: async (visitId: string): Promise<Visit> => {
        const { data } = await apiClient.post<ApiResponse<{ appointment: Visit }>>(
            `/visits/appointments/${visitId}/checkin`
        );
        return data.data.appointment;
    },

    getDoctorAvailability: async (
        doctorId: string,
        date: string
    ): Promise<DoctorAvailability> => {
        const { data } = await apiClient.get<ApiResponse<DoctorAvailability>>(
            `/doctor/${doctorId}/availability?date=${date}`
        );
        return data.data;
    },

    getDoctorsAvailableOnDate: async (date: string): Promise<Doctor[]> => {
        const { data } = await apiClient.get<ApiResponse<{ doctors: Doctor[] }>>(
            `/doctor/available-on-date?date=${date}`
        );
        return data.data.doctors;
    },
};