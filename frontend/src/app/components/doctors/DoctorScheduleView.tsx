// src/components/DoctorScheduleView.tsx
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Phone, Mail, Stethoscope, Calendar, Clock, Edit, Plus, Trash2 } from 'lucide-react';
import type { Doctor } from '../../types/doctor.types';
import LoadingSpinner from '../shared/LoadingSpinner';
import EditScheduleModal from './EditScheduleModal';
import { doctorScheduleApi } from '../../services/doctorScheduleApi';
import type { DoctorScheduleItem, DayOfWeek } from '../../types/doctorSchedule.types';
import { formatISOToLocalTime, isoOrTimeStringToHHMM, DEFAULT_TIMEZONE } from '../../utils/time';

interface DoctorScheduleViewProps {
  doctor: Doctor;
  onBack: () => void;
  isLoading: boolean;
  onScheduleUpdate?: () => void;
}

const allDays: DayOfWeek[] = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];

// Use timezone constant from utils
const TIMEZONE = DEFAULT_TIMEZONE;

const DoctorScheduleView: React.FC<DoctorScheduleViewProps> = ({ doctor, onBack, isLoading, onScheduleUpdate }) => {
  const [schedules, setSchedules] = useState<DoctorScheduleItem[]>(doctor.workingHours ?? []);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDoctor, setModalDoctor] = useState<Doctor | null>(null);
  const [dayLoading, setDayLoading] = useState<Record<DayOfWeek, boolean>>({} as Record<DayOfWeek, boolean>);

  useEffect(() => {
    setSchedules(doctor.workingHours ?? []);
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor.id]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await doctorScheduleApi.getDoctorSchedule(doctor.id);
      if (res && res.schedules) {
        setSchedules(res.schedules as DoctorScheduleItem[]);
      }
    } catch (err) {
      console.error('Failed to fetch schedules', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    const d: Doctor = { ...doctor, workingHours: schedules } as Doctor;
    setModalDoctor(d);
    setModalOpen(true);
  };

  const handleDeleteDay = async (day: DayOfWeek) => {
    const confirmed = window.confirm(`Delete all schedules for ${day}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setDayLoading(prev => ({ ...prev, [day]: true }));
      await doctorScheduleApi.deleteDoctorSchedule(doctor.id, day);
      await fetchSchedules();
      if (onScheduleUpdate) onScheduleUpdate();
    } catch (err) {
      console.error('Failed to delete schedules for', day, err);
      alert(err instanceof Error ? err.message : 'Failed to delete schedule');
    } finally {
      setDayLoading(prev => ({ ...prev, [day]: false }));
    }
  };

  const handleModalSuccess = async () => {
    setModalOpen(false);
    setModalDoctor(null);
    await fetchSchedules();
    if (onScheduleUpdate) onScheduleUpdate();
  };

  if (isLoading || loading) return <LoadingSpinner />;

  const getScheduleForDay = (day: DayOfWeek) => schedules.filter(s => s.dayOfWeek === day);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
      >
        <ArrowLeft size={20} /> Back to Doctors
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <Stethoscope className="text-blue-600" size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{doctor.user.name}</h2>
              <p className="text-xl text-gray-600 mb-3">{doctor.specialisation}</p>
              <div className="flex gap-4 text-gray-600 text-sm">
                <span className="flex items-center gap-2">
                  <Mail size={16} />
                  {doctor.user.email}
                </span>
                <span className="flex items-center gap-2">
                  <Phone size={16} />
                  {doctor.user.phone}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${doctor.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {doctor.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-sm text-gray-600">{doctor.gender}</span>
                <span className="text-sm text-gray-600">{doctor._count?.visits ?? 0} total visits</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openEditModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Edit size={16} /> Edit Schedule
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="text-blue-600" size={24} />
          <h3 className="text-2xl font-bold text-gray-800">Weekly Schedule</h3>
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Clock className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600 text-lg">No schedule set</p>
            <p className="text-gray-500 text-sm mt-1">This doctor doesn&apos;t have any working hours configured yet.</p>
            <div className="mt-4">
              <button onClick={openEditModal} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Plus size={16} /> Add Schedule
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-4 font-bold text-gray-700 w-1/5">Day</th>
                  <th className="text-left p-4 font-bold text-gray-700">Start Time</th>
                  <th className="text-left p-4 font-bold text-gray-700">End Time</th>
                  <th className="text-center p-4 font-bold text-gray-700">Status</th>
                  <th className="text-center p-4 font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allDays.map(day => {
                  const daySchedules = getScheduleForDay(day);
                  const dayName = day.charAt(0) + day.slice(1).toLowerCase();

                  if (daySchedules.length === 0) {
                    return (
                      <tr key={day} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-semibold text-gray-800">{dayName}</td>
                        <td colSpan={2} className="p-4 text-gray-500 italic">Not Available</td>
                        <td className="p-4 text-center">
                          <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Off Day</span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={openEditModal}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 mx-auto transition-colors"
                          >
                            <Plus size={14} /> Add
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return daySchedules.map((schedule, index) => (
                    <tr key={`${day}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                      {index === 0 && (
                        <td rowSpan={daySchedules.length} className="p-4 font-semibold text-gray-800 align-top">{dayName}</td>
                      )}
                      <td className="p-4 text-gray-700">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-blue-600" />
                          { /* schedule.startTime may be ISO or HH:mm — convert safely */ }
                          {schedule.startTime && schedule.startTime.includes('T')
                            ? formatISOToLocalTime(schedule.startTime, TIMEZONE)
                            : (() => {
                                const hhmm = isoOrTimeStringToHHMM(schedule.startTime, TIMEZONE);
                                // display as 12-hour using a Date constructed with today's date in timezone is tricky;
                                // reuse formatISOToLocalTime by converting local hh:mm -> UTC ISO then format it:
                                const iso = (() => {
                                  // convert hh:mm (local) -> UTC ISO using DEFAULT_TZ_OFFSET_MINUTES (mirrors EditSchedule)
                                  const [h, m] = hhmm.split(':').map(Number);
                                  const localMinutes = h * 60 + m;
                                  const utcMinutes = ((localMinutes - 330) % 1440 + 1440) % 1440; // IST offset 330
                                  const uh = Math.floor(utcMinutes / 60);
                                  const um = utcMinutes % 60;
                                  return `1970-01-01T${String(uh).padStart(2,'0')}:${String(um).padStart(2,'0')}:00.000Z`;
                                })();
                                return formatISOToLocalTime(iso, TIMEZONE);
                              })()
                          }
                        </div>
                      </td>
                      <td className="p-4 text-gray-700">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-blue-600" />
                          {schedule.endTime && schedule.endTime.includes('T')
                            ? formatISOToLocalTime(schedule.endTime, TIMEZONE)
                            : (() => {
                                const hhmm = isoOrTimeStringToHHMM(schedule.endTime, TIMEZONE);
                                const iso = (() => {
                                  const [h, m] = hhmm.split(':').map(Number);
                                  const localMinutes = h * 60 + m;
                                  const utcMinutes = ((localMinutes - 330) % 1440 + 1440) % 1440;
                                  const uh = Math.floor(utcMinutes / 60);
                                  const um = utcMinutes % 60;
                                  return `1970-01-01T${String(uh).padStart(2,'0')}:${String(um).padStart(2,'0')}:00.000Z`;
                                })();
                                return formatISOToLocalTime(iso, TIMEZONE);
                              })()
                          }
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">Available</span>
                      </td>
                      <td className="p-4 text-center">
                        {index === 0 && (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={openEditModal}
                              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 transition-colors"
                            >
                              <Edit size={14} /> Edit
                            </button>
                            <button
                              disabled={!!dayLoading[day]}
                              onClick={() => handleDeleteDay(day)}
                              className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1 disabled:opacity-50 transition-colors"
                            >
                              {dayLoading[day] ? 'Deleting...' : <><Trash2 size={14} /> Delete</>}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && modalDoctor && (
        <EditScheduleModal doctor={modalDoctor} onClose={() => setModalOpen(false)} onSuccess={handleModalSuccess} />
      )}
    </div>
  );
};

export default DoctorScheduleView;
