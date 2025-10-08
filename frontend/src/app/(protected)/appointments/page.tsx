"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Plus, RefreshCw, Clock, User } from "lucide-react";
import { appointmentApi } from "../../services/appointmentApi";
import type { Visit } from "../../types/visit.types";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import ErrorMessage from "../../components/shared/ErrorMessage";
import AppointmentCard from "../../components/appointments/AppointmentCard";
import BookAppointmentModal from "../../components/appointments/BookAppointment";
import RescheduleModal from "../../components/appointments/ResheduleModal";
import CancelModal from "../../components/appointments/CancelModal";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Visit[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showBookModal, setShowBookModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Visit | null>(
    null
  );

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await appointmentApi.getAppointmentsByDate(selectedDate);
      setAppointments(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch appointments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async (visitId: string) => {
    try {
      await appointmentApi.checkInAppointment(visitId);
      fetchAppointments(); // Refresh list
      // Show success toast (implement your toast system)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to check in patient");
    }
  };

  const handleReschedule = (appointment: Visit) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleCancel = (appointment: Visit) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleRescheduleSuccess = () => {
    setShowRescheduleModal(false);
    setSelectedAppointment(null);
    fetchAppointments();
  };

  const handleCancelSuccess = () => {
    setShowCancelModal(false);
    setSelectedAppointment(null);
    fetchAppointments();
  };

  const handleBookSuccess = () => {
    setShowBookModal(false);
    fetchAppointments();
  };

  return (
    <div className="min-h-screen p-6 bg-[#f8f9fb]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
          <p className="text-gray-600 mt-1">
            Schedule and manage patient appointments
          </p>
        </div>
        <button
          onClick={() => setShowBookModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-colors font-medium"
        >
          <Plus size={20} />
          Book Appointment
        </button>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline mr-2" size={16} />
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400"
            />
          </div>
          <button
            onClick={fetchAppointments}
            disabled={isLoading}
            className="mt-7 px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2 font-medium disabled:opacity-50"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Appointments for{" "}
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h2>
          <span className="text-sm text-gray-600">
            {appointments.length} appointment(s)
          </span>
        </div>

        {error && (
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        )}

        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No appointments scheduled
            </h3>
            <p className="text-gray-600 mb-4">
              Book a new appointment to get started
            </p>
            <button
              onClick={() => setShowBookModal(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Book Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onCheckIn={handleCheckIn}
                onReschedule={handleReschedule}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showBookModal && (
        <BookAppointmentModal
          onClose={() => setShowBookModal(false)}
          onSuccess={handleBookSuccess}
          preSelectedDate={selectedDate}
        />
      )}

      {showRescheduleModal && selectedAppointment && (
        <RescheduleModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedAppointment(null);
          }}
          onSuccess={handleRescheduleSuccess}
        />
      )}

      {showCancelModal && selectedAppointment && (
        <CancelModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedAppointment(null);
          }}
          onSuccess={handleCancelSuccess}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;
