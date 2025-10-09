"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  User,
  Stethoscope,
  Clock,
  AlertCircle,
} from "lucide-react";
import { appointmentApi } from "../../services/appointmentApi";
import { patientApi } from "../../services/patientApi";
import type { Patient } from "../../types/patient.types";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import { Doctor } from "@/app/types/doctor.types";
import { formatISOToLocalTime, DEFAULT_TIMEZONE } from "../../utils/time";

interface BookAppointmentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  preSelectedDate?: string;
}

const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  onClose,
  onSuccess,
  preSelectedDate,
}) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [selectedDate, setSelectedDate] = useState(
    preSelectedDate || new Date().toISOString().split("T")[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [priority, setPriority] = useState<"NORMAL" | "URGENT">("NORMAL");
  const [notes, setNotes] = useState("");

  // Search patients
  useEffect(() => {
    const searchPatients = async () => {
      if (searchQuery.length < 2) {
        setPatients([]);
        return;
      }

      try {
        const data = await patientApi.getPatients({
          search: searchQuery,
          limit: 1000,
          page: 1,
        });
        setPatients(data.patients);
      } catch (err) {
        console.error("Failed to search patients:", err);
      }
    };

    const debounce = setTimeout(searchPatients, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Load available doctors when date is selected
  useEffect(() => {
    const loadDoctors = async () => {
      if (!selectedDate) return;

      setIsLoading(true);
      try {
        const doctors = await appointmentApi.getDoctorsAvailableOnDate(
          selectedDate
        );
        setAvailableDoctors(doctors);
      } catch (err: unknown) {
        setError((err as Error).message || "Failed to load available doctors");
      } finally {
        setIsLoading(false);
      }
    };

    loadDoctors();
  }, [selectedDate]);

  // Load available slots when doctor is selected
  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDoctor || !selectedDate) return;

      setIsLoading(true);
      try {
        const data = await appointmentApi.getDoctorAvailability(
          selectedDoctor.id,
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
  }, [selectedDoctor, selectedDate]);

  const handleBookAppointment = async () => {
    if (!selectedPatient || !selectedDoctor || !selectedSlot) {
      setError("Please complete all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await appointmentApi.bookAppointment({
        patientId: selectedPatient.id,
        doctorId: selectedDoctor.id,
        scheduledTime: selectedSlot,
        priority,
        notes: notes || undefined,
      });

      onSuccess();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to book appointment");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedToStep2 = selectedPatient && selectedDate;
  const canProceedToStep3 = canProceedToStep2 && selectedDoctor;
  const canBook = canProceedToStep3 && selectedSlot;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Book Appointment
            </h2>
            <p className="text-sm text-gray-600 mt-1">Step {step} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div
            className={`flex items-center gap-2 ${
              step >= 1 ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              1
            </div>
            <span className="font-medium">Patient & Date</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
          <div
            className={`flex items-center gap-2 ${
              step >= 2 ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              2
            </div>
            <span className="font-medium">Select Doctor</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
          <div
            className={`flex items-center gap-2 ${
              step >= 3 ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              3
            </div>
            <span className="font-medium">Time & Details</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Patient & Date */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline mr-2" size={16} />
                  Appointment Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline mr-2" size={16} />
                  Search Patient
                </label>
                <input
                  type="text"
                  placeholder="Type patient name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400"
                />

                {/* Patient Search Results */}
                {patients.length > 0 && (
                  <div className="mt-2 border-2 border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                    {patients.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => {
                          setSelectedPatient(patient);
                          setSearchQuery(patient.name);
                          setPatients([]);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <p className="font-medium text-gray-800">
                          {patient.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {patient.phone} • {patient.gender} •{" "}
                          {new Date().getFullYear() -
                            new Date(patient.dob).getFullYear()}{" "}
                          years
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Patient Display */}
                {selectedPatient && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-medium text-gray-800">
                      Selected: {selectedPatient.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedPatient.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Select Doctor */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Available Doctors on{" "}
                {new Date(selectedDate).toLocaleDateString()}
              </h3>

              {isLoading ? (
                <LoadingSpinner />
              ) : availableDoctors.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    No doctors available on this date
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {availableDoctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        selectedDoctor?.id === doctor.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Stethoscope className="text-blue-600" size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">
                            {doctor.user.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {doctor.specialisation}
                          </p>
                          {doctor.workingHours[0] && (
                            <p className="text-xs text-gray-500 mt-1">
                              {formatISOToLocalTime(
                                doctor.workingHours[0].startTime,
                                DEFAULT_TIMEZONE
                              )}{" "}
                              -{" "}
                              {formatISOToLocalTime(
                                doctor.workingHours[0].endTime,
                                DEFAULT_TIMEZONE
                              )}
                            </p>
                          )}
                        </div>
                        {selectedDoctor?.id === doctor.id && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Time & Details */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Clock className="inline mr-2" size={16} />
                  Available Time Slots ({DEFAULT_TIMEZONE})
                </label>

                {isLoading ? (
                  <LoadingSpinner />
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">
                      No available slots for this doctor on selected date
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {availableSlots.map((slot) => {
                      // Convert UTC slot to IST for display
                      const displayTime = formatISOToLocalTime(
                        slot,
                        DEFAULT_TIMEZONE
                      );

                      return (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                            selectedSlot === slot
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50"
                          }`}
                        >
                          {displayTime}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setPriority("NORMAL")}
                    className={`flex-1 px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                      priority === "NORMAL"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setPriority("URGENT")}
                    className={`flex-1 px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                      priority === "URGENT"
                        ? "border-red-600 bg-red-50 text-red-700"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    🚨 Urgent
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Add any special notes or instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                ></textarea>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              if (step === 1) {
                onClose();
              } else {
                setStep(step - 1);
              }
            }}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          <button
            onClick={() => {
              if (step === 3) {
                handleBookAppointment();
              } else {
                setStep(step + 1);
              }
            }}
            disabled={
              isLoading ||
              (step === 1 && !canProceedToStep2) ||
              (step === 2 && !canProceedToStep3) ||
              (step === 3 && !canBook)
            }
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : step === 3 ? (
              <>
                <Calendar size={20} />
                <span>Confirm Booking</span>
              </>
            ) : (
              <span>Next</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentModal;