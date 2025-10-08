'use client';

import React from 'react';
import { useAppDispatch } from '../../store/store';
import { openModal } from '../../store/uiSlice';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import  api  from '../../lib/axiosClient'; // Ensure this path is correct for your project
import { Calendar, CheckCircle, Clock, Stethoscope, UserPlus, ChevronRight } from 'lucide-react';
import { StatCard } from '@/app/components/StatCard'; // Ensure you have this component

// Define the type for your API data to ensure TypeScript knows its shape.
interface DashboardData {
  stats: {
    waiting: number;
    withDoctor: number;
    completedToday: number;
    upcomingToday: number;
  };
  queue: {
    id: string;
    patientName: string;
    doctorName: string;
    checkInTime: string;
    priority: 'NORMAL' | 'URGENT';
  }[];
  appointments: {
    id: string;
    patientName: string;
    doctorName: string;
    time: string;
    type: string;
  }[];
}

// A standard, reusable fetcher function for SWR.
const fetcher = async (url: string): Promise<DashboardData> => {
    const response = await api.get<DashboardData>(url);
    return response.data;
};

export default function DashboardPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();

    // Use the SWR hook with the correct type and API endpoint as the key.
    const { data, error, isLoading } = useSWR<DashboardData>('/dashboard', fetcher, {
        refreshInterval: 30000 // Optional: refresh data every 30 seconds
    });

    // Handle the loading state while data is being fetched.
    if (isLoading) return <p className="text-center p-8">Loading Dashboard...</p>;

    // Handle any errors that occur during fetching.
    if (error) return <p className="text-center p-8 text-red-600">Failed to load dashboard data.</p>;
    
    // Handle the case where data is not available after loading.
    if (!data) return <p className="text-center p-8">No data available.</p>;

    // If data is available, destructure it for easy use.
    const { stats, queue, appointments } = data;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
                    <p className="text-gray-600 mt-1">Today&apos;s Clinic Overview</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => dispatch(openModal('addWalkin'))}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-colors font-medium"
                    >
                        <UserPlus size={20} /> Add Walk-in
                    </button>
                    <button 
                        onClick={() => router.push('/appointments')}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-colors font-medium"
                    >
                        <Calendar size={20} /> Book Appointment
                    </button>
                </div>
            </div>
            
            {/* Statistics Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Clock} label="Patients Waiting" value={stats.waiting} color="blue" />
                <StatCard icon={Stethoscope} label="With Doctor" value={stats.withDoctor} color="yellow" />
                <StatCard icon={CheckCircle} label="Completed Today" value={stats.completedToday} color="green" />
                <StatCard icon={Calendar} label="Upcoming Today" value={stats.upcomingToday} color="purple" />
            </div>

            {/* Data Previews Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Queue Preview */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Current Queue</h3>
                        <button onClick={() => router.push('/queue')} className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
                            View All <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {queue && queue.length > 0 ? queue.map(patient => (
                            <div key={patient.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-800">{patient.patientName}</h4>
                                            {patient.priority === 'URGENT' && (
                                                <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold">URGENT</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{patient.doctorName}</p>
                                    </div>
                                    <span className="text-sm text-gray-500">{patient.checkInTime}</span>
                                </div>
                            </div>
                        )) : <p className="text-gray-500 text-center py-4">The queue is empty.</p>}
                    </div>
                </div>

                {/* Upcoming Appointments Preview */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Upcoming Appointments</h3>
                        <button onClick={() => router.push('/appointments')} className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
                            View All <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="space-y-3">
                         {appointments && appointments.length > 0 ? appointments.map(apt => (
                            <div key={apt.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{apt.patientName}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{apt.doctorName} • {apt.type}</p>
                                    </div>
                                    <span className="text-sm font-medium text-blue-600">{apt.time}</span>
                                </div>
                            </div>
                        )) : <p className="text-gray-500 text-center py-4">No appointments scheduled for today.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}