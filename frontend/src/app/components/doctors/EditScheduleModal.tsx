import React, { useState } from "react";
import { X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { doctorScheduleApi } from "../../services/doctorScheduleApi";
import type { Doctor } from "../../types/doctor.types";
import type {
  DoctorScheduleItem,
  DayOfWeek,
} from "../../types/doctorSchedule.types";
import {
  isoOrTimeStringToHHMM,
  localHHMMToUTCHHMM,
  DEFAULT_TIMEZONE,
} from "../../utils/time";

interface EditScheduleModalProps {
  doctor: Doctor;
  onClose: () => void;
  onSuccess: () => void;
}

interface ScheduleFormItem extends DoctorScheduleItem {
  id: string;
  // startTime and endTime here are in "HH:mm" (local timezone shown in UI)
  startTime: string;
  endTime: string;
}

interface LegacyWorkingHours {
  start?: string;
  end?: string;
}

const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  doctor,
  onClose,
  onSuccess,
}) => {
  const allDays: DayOfWeek[] = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  // Build initial schedules safely: convert incoming ISO times to HH:mm for inputs
  const initialSchedules: ScheduleFormItem[] = (doctor.workingHours || []).map(
    (wh, idx) => ({
      id: `${wh.id ?? `${wh.dayOfWeek}-${idx}`}`,
      dayOfWeek: wh.dayOfWeek as DayOfWeek,
      startTime: isoOrTimeStringToHHMM(
        wh.startTime ?? (wh as LegacyWorkingHours).start ?? "00:00",
        DEFAULT_TIMEZONE
      ),
      endTime: isoOrTimeStringToHHMM(
        wh.endTime ?? (wh as LegacyWorkingHours).end ?? "00:00",
        DEFAULT_TIMEZONE
      ),
    })
  );

  const [schedules, setSchedules] = useState<ScheduleFormItem[]>(
    initialSchedules.length > 0 ? initialSchedules : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addSchedule = () => {
    const newSchedule: ScheduleFormItem = {
      id: `new-${Date.now()}`,
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "17:00",
    };
    setSchedules((prev) => [...prev, newSchedule]);
  };

  const removeSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const updateSchedule = (
    id: string,
    field: keyof Pick<ScheduleFormItem, "startTime" | "endTime" | "dayOfWeek">,
    value: string
  ) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
    setApiError(null);
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const validateSchedules = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (schedules.length === 0) {
      setApiError("Please add at least one schedule");
      return false;
    }

    schedules.forEach((schedule) => {
      if (!schedule.startTime || !schedule.endTime) {
        newErrors[schedule.id] = "Both start and end times are required";
        return;
      }

      const [sh, sm] = schedule.startTime.split(":").map(Number);
      const [eh, em] = schedule.endTime.split(":").map(Number);
      const startMinutes = sh * 60 + sm;
      const endMinutes = eh * 60 + em;

      if (endMinutes <= startMinutes) {
        newErrors[schedule.id] = "End time must be after start time";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSchedules()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      // Normalize HH:mm format
      const normalizeHHMM = (s: string) => {
        const [h = "00", m = "00"] = s.split(":");
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      };

      // Convert local time (IST) to UTC time before sending to backend
      const schedulesToSubmit = schedules.map(
        ({ dayOfWeek, startTime, endTime }) => ({
          dayOfWeek,
          startTime: localHHMMToUTCHHMM(normalizeHHMM(startTime)),
          endTime: localHHMMToUTCHHMM(normalizeHHMM(endTime)),
        })
      );

      await doctorScheduleApi.upsertDoctorSchedule(doctor.id, {
        schedules: schedulesToSubmit,
      });
      onSuccess();
    } catch (err: unknown) {
      setApiError(
        err instanceof Error ? err.message : "Failed to update schedule"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedSchedules = allDays.reduce((acc, day) => {
    acc[day] = schedules.filter((s) => s.dayOfWeek === day);
    return acc;
  }, {} as Record<DayOfWeek, ScheduleFormItem[]>);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Edit Schedule</h3>
            <p className="text-sm text-gray-600 mt-1">{doctor.user.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {apiError}
            </div>
          )}

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Times are displayed in {DEFAULT_TIMEZONE} timezone. 
              They will be automatically converted to UTC when saved.
            </p>
          </div>

          <div className="space-y-6">
            {allDays.map((day) => {
              const daySchedules = groupedSchedules[day];
              const dayName = day.charAt(0) + day.slice(1).toLowerCase();

              return (
                <div
                  key={day}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-gray-800 text-lg">
                      {dayName}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const newSchedule: ScheduleFormItem = {
                          id: `${day}-${Date.now()}`,
                          dayOfWeek: day,
                          startTime: "09:00",
                          endTime: "17:00",
                        };
                        setSchedules((prev) => [...prev, newSchedule]);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Plus size={16} /> Add Shift
                    </button>
                  </div>

                  {daySchedules.length === 0 ? (
                    <p className="text-gray-500 italic text-sm">
                      No shifts scheduled
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {daySchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex items-center gap-3"
                        >
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Start Time ({DEFAULT_TIMEZONE})
                              </label>
                              <input
                                type="time"
                                value={schedule.startTime}
                                onChange={(e) =>
                                  updateSchedule(
                                    schedule.id,
                                    "startTime",
                                    e.target.value
                                  )
                                }
                                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none text-gray-700 ${
                                  errors[schedule.id]
                                    ? "border-red-300 focus:border-red-500"
                                    : "border-gray-300 focus:border-blue-500"
                                }`}
                                disabled={isSubmitting}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                End Time ({DEFAULT_TIMEZONE})
                              </label>
                              <input
                                type="time"
                                value={schedule.endTime}
                                onChange={(e) =>
                                  updateSchedule(
                                    schedule.id,
                                    "endTime",
                                    e.target.value
                                  )
                                }
                                className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none text-gray-700 ${
                                  errors[schedule.id]
                                    ? "border-red-300 focus:border-red-500"
                                    : "border-gray-300 focus:border-blue-500"
                                }`}
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSchedule(schedule.id)}
                            disabled={isSubmitting}
                            className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors mt-5"
                            title="Remove shift"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                      {errors[daySchedules[0]?.id] && (
                        <p className="text-red-500 text-xs">
                          {errors[daySchedules[0].id]}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {schedules.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No schedules added yet</p>
              <button
                type="button"
                onClick={addSchedule}
                className="bg-blue-100 text-blue-700 px-6 py-3 rounded-lg flex items-center gap-2 font-medium hover:bg-blue-200 transition-colors mx-auto"
              >
                <Plus size={20} />
                Add First Schedule
              </button>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || schedules.length === 0}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Schedule
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditScheduleModal;