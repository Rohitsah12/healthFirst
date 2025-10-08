import { PrismaClient, VisitStatus } from '@prisma/client';
import { format } from 'date-fns';

const prisma = new PrismaClient();

const getTodayDateRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return { start, end };
};

export const getDashboardData = async () => {
    const { start, end } = getTodayDateRange();

    // 1. Fetch Stats based on the new schema
    const waitingCount = await prisma.visit.count({
        where: {
            currentStatus: VisitStatus.CHECKED_IN,
            checkInTime: { gte: start, lte: end },
        },
    });

    const withDoctorCount = await prisma.visit.count({
        where: {
            currentStatus: VisitStatus.WITH_DOCTOR,
            withDoctorTime: { gte: start, lte: end },
        },
    });

    const completedTodayCount = await prisma.visit.count({
        where: {
            currentStatus: VisitStatus.COMPLETED,
            completeTime: { gte: start, lte: end },
        },
    });

    const upcomingAppointmentsCount = await prisma.visit.count({
        where: {
            currentStatus: VisitStatus.SCHEDULED,
            scheduledTime: { gte: start, lte: end },
        },
    });

    const stats = {
        waiting: waitingCount,
        withDoctor: withDoctorCount,
        completedToday: completedTodayCount,
        upcomingToday: upcomingAppointmentsCount,
    };

    // 2. Fetch Current Queue (first 5 patients with status CHECKED_IN)
    const queueVisits = await prisma.visit.findMany({
        where: {
            currentStatus: VisitStatus.CHECKED_IN,
            checkInTime: { gte: start, lte: end },
        },
        take: 5,
        orderBy: [{ priority: 'desc' }, { checkInTime: 'asc' }], // URGENT first, then by time
        include: {
            patient: true,
            doctor: {
                include: {
                    user: true, // We need the user relation to get the doctor's name
                },
            },
        },
    });
    
    // 3. Fetch Upcoming Appointments (first 5 visits with status SCHEDULED)
    const upcomingVisits = await prisma.visit.findMany({
        where: {
            currentStatus: VisitStatus.SCHEDULED,
            scheduledTime: { gte: start, lte: end },
        },
        take: 5,
        orderBy: { scheduledTime: 'asc' },
        include: {
            patient: true,
            doctor: {
                include: {
                    user: true,
                },
            },
        },
    });

    // 4. Format data for a consistent frontend experience
    const formattedQueue = queueVisits.map(v => ({
        id: v.id,
        patientName: v.patient.name,
        doctorName: v.doctor.user.name,
        checkInTime: v.checkInTime ? format(v.checkInTime, 'hh:mm a') : 'N/A',
        priority: v.priority,
    }));

    const formattedAppointments = upcomingVisits.map(v => ({
        id: v.id,
        patientName: v.patient.name,
        doctorName: v.doctor.user.name,
        time: v.scheduledTime ? format(v.scheduledTime, 'hh:mm a') : 'N/A',
        type: v.visitType.replace('_', '-'), // e.g., 'WALK-IN'
    }));

    return {
        stats,
        queue: formattedQueue,
        appointments: formattedAppointments,
    };
};