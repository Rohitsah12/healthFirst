import api from "../lib/axiosClient";
import type { PatientsResponse, Patient, CreatePatientInput } from "../types/patient.types";

export const patientApi = {
  getPatients: async (params: { page: number; limit: number; search?: string }) => {
    const qp = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
      ...(params.search ? { search: params.search } : {}),
    });

    const response = await api.get<{ data: PatientsResponse }>(`/patient?${qp}`);
    return response.data.data;
  },

  getPatientById: async (id: string) => {
    const response = await api.get<{ data: Patient }>(`/patient/${id}`);
    return response.data.data;
  },

  createPatient: async (payload: CreatePatientInput) => {
    const response = await api.post<{ data: Patient }>("/patient", payload);
    return response.data.data;
  },

  updatePatient: async (id: string, payload: Partial<CreatePatientInput>) => {
    const response = await api.patch<{ data: Patient }>(`/patient/${id}`, payload);
    return response.data.data;
  },

  deletePatient: async (id: string) => {
    const response = await api.delete(`/patient/${id}`);
    return response.data;
  },

  

  
};

