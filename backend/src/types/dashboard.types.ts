export interface DashboardStats {
  waiting: number;
  withDoctor: number;
  completedToday: number;
  upcomingToday: number;
}

export interface QueuePatient {
  id: number;
  patientName: string;
  doctorName: string;
  checkInTime: string; // Formatted time string
  priority: 'NORMAL' | 'URGENT';
}

export interface UpcomingAppointment {
  id: number;
  patientName: string;
  doctorName: string;
  time: string; // Formatted time string
  type: string; // Or your appointment type enum
}

export interface DashboardData {
  stats: DashboardStats;
  queue: QueuePatient[];
  appointments: UpcomingAppointment[];
}