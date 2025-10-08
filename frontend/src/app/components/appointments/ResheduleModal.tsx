"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, AlertCircle } from "lucide-react";
import { appointmentApi } from "../../services/appointmentApi";
import type { Visit } from "../../types/visit.types";
import LoadingSpinner from "../../components/shared/LoadingSpinner";

interface RescheduleModalProps {
    appointment: Visit;
    onClose: () => void;
    onSuccess: () => void;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
    appointment,
    onClose,
    onSuccess,
}) => {
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load available slots when date changes
    useEffect(() => {
        const loadSlots = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await appointmentApi.getDoctorAvailability(
                    appointment.doctorId,
                    selectedDate
                );
                setAvailableSlots(data.availableSlots);
            } catch (err: unknown) {
                setError((err as Error).message || "Failed to load available slots");
            } finally {
                setIsLoading(false);
            }
        };

        loadSlots();
    }, [selectedDate, appointment.doctorId]);

    const handleReschedule = async () => {
        if (!selectedSlot) {
            setError("Please select a time slot");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await appointmentApi.rescheduleAppointment(appointment.id, {
                newScheduledTime: selectedSlot,
            });
            onSuccess();
        } catch (err: unknown) {
            setError((err as Error).message || "Failed to reschedule appointment");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Reschedule Appointment</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Patient: {appointment.patient.name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Current Appointment Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-blue-800 mb-2">
                            Current Appointment:
                        </p>
                        <p className="text-blue-900 font-bold">
                            {appointment.scheduledTime
                                ? new Date(appointment.scheduledTime).toLocaleString("en-US", {
                                      weekday: "long",
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                  })
                                : "N/A"}
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                            Doctor: {appointment.doctor.user.name} ({appointment.doctor.specialisation})
                        </p>
                    </div>

                    {/* New Date Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="inline mr-2" size={16} />
                            Select New Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Available Time Slots */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            <Clock className="inline mr-2" size={16} />
                            Available Time Slots
                        </label>

                        {isLoading ? (
                            <div className="py-8">
                                <LoadingSpinner />
                            </div>
                        ) : availableSlots.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">
                                    No available slots for this doctor on selected date
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-3">
                                {availableSlots.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                                            selectedSlot === slot
                                                ? "border-blue-600 bg-blue-600 text-white"
                                                : "border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50"
                                        }`}
                                    >
                                        {new Date(slot).toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleReschedule}
                        disabled={isLoading || !selectedSlot}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Rescheduling...</span>
                            </>
                        ) : (
                            <>
                                <Calendar size={20} />
                                <span>Confirm Reschedule</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RescheduleModal;