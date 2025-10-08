"use client";

import React, { useEffect, useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import type { CreatePatientInput, Patient } from "../../types/patient.types";
import { patientApi } from "../../services/patientApi";

interface Props {
  patient?: Patient | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AddEditPatientModal: React.FC<Props> = ({ patient, onClose, onSuccess }) => {
  const isEditMode = !!patient;

  const [formData, setFormData] = useState<CreatePatientInput>({
    name: patient?.name ?? "",
    phone: patient?.phone ?? "",
    gender: (patient?.gender as "MALE" | "FEMALE" | "OTHER") ?? "MALE",
    dob: patient?.dob ? patient.dob.split("T")[0] : "",
    address: patient?.address ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name,
        phone: patient.phone,
        gender: patient.gender as "MALE" | "FEMALE" | "OTHER",
        dob: patient.dob ? patient.dob.split("T")[0] : "",
        address: patient.address ?? "",
      });
    }
  }, [patient]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.dob.trim()) newErrors.dob = "Date of birth is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setApiError(null);
    if (errors[name]) {
      setErrors(prev => {
        const c = { ...prev };
        delete c[name];
        return c;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      if (isEditMode && patient) {
        await patientApi.updatePatient(patient.id, {
          name: formData.name,
          phone: formData.phone,
          gender: formData.gender,
          dob: formData.dob,
          address: formData.address,
        });
      } else {
        await patientApi.createPatient({
          name: formData.name,
          phone: formData.phone,
          gender: formData.gender,
          dob: formData.dob,
          address: formData.address,
        });
      }

      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError(isEditMode ? "Failed to update patient" : "Failed to create patient");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-300 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
          <h3 className="text-2xl font-bold text-white">
            {isEditMode ? "Edit Patient" : "Add New Patient"}
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {apiError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-sm">
              <p className="font-medium">{apiError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Rajesh Kumar"
                className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 transition-all text-gray-700 ${
                  errors.name
                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                }`}
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-red-600 text-xs mt-1 font-medium">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="xxxxxxxxxx"
                className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 transition-all text-gray-900 placeholder-gray-400 ${
                  errors.phone
                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                }`}
                disabled={isSubmitting}
              />
              {errors.phone && <p className="text-red-600 text-xs mt-1 font-medium">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 transition-all text-gray-900 placeholder-gray-400 ${
                  errors.dob
                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                }`}
                disabled={isSubmitting}
              />
              {errors.dob && <p className="text-red-600 text-xs mt-1 font-medium">{errors.dob}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 placeholder-gray-400 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
                disabled={isSubmitting}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 placeholder-gray-400 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-400 "
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-300">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save size={20} />
                  {isEditMode ? "Update Patient" : "Create Patient"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditPatientModal;
