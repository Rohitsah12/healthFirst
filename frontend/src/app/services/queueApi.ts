import api from '../lib/axiosClient';
import { Visit, VisitStatus, ApiResponse} from '../store/types'; // <-- Import the Visit type


export const fetchQueue = async (): Promise<Visit[]> => {
  const response = await api.get<ApiResponse<Visit[]>>('/queue');
  return response.data.data; 
};


export const updateStatus = async (visitId: string, status: VisitStatus): Promise<Visit> => {
  const response = await api.patch<ApiResponse<Visit>>(`/queue/${visitId}/status`, { status });
  return response.data.data;
}