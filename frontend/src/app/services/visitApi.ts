import api from '../lib/axiosClient';
import { Visit, ApiResponse } from '../store/types'; 
import { CreateVisitInput } from '../types/visit.types'; // Keep API input types separate


export const createVisit = async (data: CreateVisitInput): Promise<Visit> => {
  const response = await api.post<ApiResponse<Visit>>('/visits', data);
  return response.data.data;
};

export interface VisitHistoryQuery {
  date?: string;       // For filtering by a single day
  patientId?: string;  // For filtering by a specific patient
}

export interface VisitHistoryResponse {
  visits: Visit[];
  summary: {
    totalVisits: number;
    completed: number;
    cancelled: number;
    scheduled: number;
    walkIn: number;
    urgent: number;
  };
}


export const getVisitHistory = async (params: VisitHistoryQuery): Promise<VisitHistoryResponse> => {
  const response = await api.get<ApiResponse<VisitHistoryResponse>>('/visits/history', { params });
  return response.data.data;
};

export const exportVisitHistory = async (params: VisitHistoryQuery): Promise<Blob> => {
    const response = await api.get('/visits/history/export', { 
        params,
        responseType: 'blob',
    });
    return response.data as Blob;
};