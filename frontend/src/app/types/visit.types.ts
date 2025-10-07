import { VisitType, PriorityLevel } from '../store/types';

export interface CreateVisitInput {
  patientId: string;
  doctorId: string;
  visitType: VisitType;
  priority: PriorityLevel;
  scheduledTime?: string; 
}

