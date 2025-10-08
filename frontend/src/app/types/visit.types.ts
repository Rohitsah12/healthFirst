import { VisitType, PriorityLevel } from '../store/types';

export interface CreateVisitInput {
  patientId: string;
  doctorId: string;
  visitType: VisitType;
  priority: PriorityLevel;
  scheduledTime?: string; 
}

export interface Visit {
    id: string;
    patientId: string;
    doctorId: string;
    visitType: "WALK_IN" | "SCHEDULED";
    priority: "NORMAL" | "URGENT";
    scheduledTime: string | null;
    currentStatus: VisitStatus;
    createdAt: string;
    checkInTime: string | null;
    withDoctorTime: string | null;
    completeTime: string | null;
    patient: {
        id: string;
        name: string;
        phone: string;
        gender: "MALE" | "FEMALE" | "OTHER";
        dob: string;
    };
    doctor: {
        id: string;
        specialisation: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
    };
    logs: VisitLog[];
}

export interface VisitLog {
    id: string;
    visitId: string;
    status: VisitStatus;
    timestamp: string;
    notes: string | null;
}

export type VisitStatus =
    | "SCHEDULED"
    | "CANCELLED"
    | "CHECKED_IN"
    | "WITH_DOCTOR"
    | "COMPLETED";

export interface VisitHistoryQuery {
    date?: string;
    startDate?: string;
    endDate?: string;
    patientId?: string;
    doctorId?: string;
    visitType?: "WALK_IN" | "SCHEDULED";
    status?: VisitStatus;
}

export interface VisitHistorySummary {
    totalVisits: number;
    completed: number;
    cancelled: number;
    scheduled: number;
    walkIn: number;
    urgent: number;
}

export interface VisitHistoryResponse {
    visits: Visit[];
    summary: VisitHistorySummary;
}
