"use client";

import React from "react";
import { Clock, User, Stethoscope, AlertCircle, Edit, XCircle, CheckCircle } from "lucide-react";
import type { Visit } from "../../types/visit.types";

interface AppointmentCardProps {
    appointment: Visit;
    onCheckIn: (visitId: string) => void;
    onReschedule: (appointment: Visit) => void;
    onCancel: (appointment: Visit) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
    appointment,
    onCheckIn,
    onReschedule,
    onCancel,
}) => {
    const isPast = appointment.scheduledTime
        ? new Date(appointment.scheduledTime) < new Date()
        : false;

    const canModify = appointment.currentStatus === "SCHEDULED" && !isPast;

    const statusColors = {
        SCHEDULED: "border-blue-500 bg-blue-50",
        CHECKED_IN: "border-green-500 bg-green-50",
        WITH_DOCTOR: "border-yellow-500 bg-yellow-50",
        CANCELLED: "border-red-500 bg-red-50",
        COMPLETED: "border-gray-500 bg-gray-50",
    };

    const statusLabels = {
        SCHEDULED: "Scheduled",
        CHECKED_IN: "Checked In",
        WITH_DOCTOR: "With Doctor",
        CANCELLED: "Cancelled",
        COMPLETED: "Completed",
    };

    return (
        <div
            className={`border-l-4 rounded-lg p-4 transition-all ${
                statusColors[appointment.currentStatus]
            } ${isPast && appointment.currentStatus === "SCHEDULED" ? "opacity-60" : ""}`}
        >
            <div className="flex justify-between items-start">
                {/* Left Section - Patient & Doctor Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <User size={24} className="text-gray-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">
                                {appointment.patient.name}
                            </h3>
                            <p className="text-sm text-gray-600">{appointment.patient.phone}</p>
                        </div>
                        {appointment.priority === "URGENT" && (
                            <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                                <AlertCircle size={12} />
                                URGENT
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                            <Stethoscope size={16} className="text-blue-600" />
                            <div>
                                <p className="font-medium">{appointment.doctor.user.name}</p>
                                <p className="text-xs text-gray-500">
                                    {appointment.doctor.specialisation}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                            <Clock size={16} className="text-blue-600" />
                            <div>
                                <p className="font-medium">
                                    {appointment.scheduledTime
                                        ? new Date(appointment.scheduledTime).toLocaleTimeString(
                                              "en-US",
                                              {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                              }
                                          )
                                        : "N/A"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {statusLabels[appointment.currentStatus]}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex flex-col gap-2 ml-4">
                    {canModify && (
                        <>
                            <button
                                onClick={() => onCheckIn(appointment.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                                <CheckCircle size={16} />
                                Check-in
                            </button>
                            <button
                                onClick={() => onReschedule(appointment)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                                <Edit size={16} />
                                Reschedule
                            </button>
                            <button
                                onClick={() => onCancel(appointment)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                                <XCircle size={16} />
                                Cancel
                            </button>
                        </>
                    )}
                    {appointment.currentStatus === "SCHEDULED" && isPast && (
                        <span className="text-xs text-red-600 font-medium">Past Appointment</span>
                    )}
                    {appointment.currentStatus === "CANCELLED" && (
                        <span className="text-xs text-red-600 font-bold">CANCELLED</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentCard;