"use client";

import React, { useState } from "react";
import { X, AlertCircle, XCircle } from "lucide-react";
import { appointmentApi } from "../../services/appointmentApi";
import type { Visit } from "../../types/visit.types";

interface CancelModalProps {
    appointment: Visit;
    onClose: () => void;
    onSuccess: () => void;
}

const CancelModal: React.FC<CancelModalProps> = ({
    appointment,
    onClose,
    onSuccess,
}) => {
    const [reason, setReason] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCancel = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await appointmentApi.cancelAppointment(appointment.id, reason || undefined);
            onSuccess();
        } catch (err: unknown) {
            setError((err as Error).message || "Failed to cancel appointment");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="text-red-600" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Cancel Appointment</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                            <AlertCircle className="inline mr-2" size={16} />
                            <strong>Warning:</strong> This action cannot be undone. The appointment
                            will be permanently cancelled.
                        </p>
                    </div>

                    {/* Appointment Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                            Appointment Details:
                        </p>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p>
                                <strong>Patient:</strong> {appointment.patient.name}
                            </p>
                            <p>
                                <strong>Doctor:</strong> {appointment.doctor.user.name}
                            </p>
                            <p>
                                <strong>Date & Time:</strong>{" "}
                                {appointment.scheduledTime
                                    ? new Date(appointment.scheduledTime).toLocaleString("en-US", {
                                          weekday: "long",
                                          month: "long",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                      })
                                    : "N/A"}
                            </p>
                        </div>
                    </div>

                    {/* Reason Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cancellation Reason (Optional)
                        </label>
                        <textarea
                            rows={3}
                            placeholder="e.g., Patient requested cancellation, Schedule conflict..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                        ></textarea>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        Keep Appointment
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Cancelling...</span>
                            </>
                        ) : (
                            <>
                                <XCircle size={20} />
                                <span>Yes, Cancel Appointment</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelModal;