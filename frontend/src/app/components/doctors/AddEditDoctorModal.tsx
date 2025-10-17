import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { doctorApi } from '../../services/doctorApi';
import type { CreateDoctorInput, Doctor } from '../../types/doctor.types';

interface AddEditDoctorModalProps {
  doctor?: Doctor | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AddEditDoctorModal: React.FC<AddEditDoctorModalProps> = ({ doctor, onClose, onSuccess }) => {
  const isEditMode = !!doctor;

  const [formData, setFormData] = useState<CreateDoctorInput>({
    name: doctor?.user.name || '',
    email: doctor?.user.email || '',
    phone: doctor?.user.phone || '',
    specialisation: doctor?.specialisation || '',
    gender: doctor?.gender || 'MALE',
    location: doctor?.location || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.specialisation.trim()) {
      newErrors.specialisation = 'Specialization is required';
    }
    if(!formData.location.trim()){
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      if (isEditMode && doctor) {
        await doctorApi.updateDoctor(doctor.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialisation: formData.specialisation,
          gender: formData.gender,
          location: formData.location
        });
      } else {
        await doctorApi.createDoctor(formData);
      }
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError(`Failed to ${isEditMode ? 'update' : 'create'} doctor`);
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
            {isEditMode ? 'Edit Doctor' : 'Add New Doctor'}
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
                placeholder="e.g., Dr. Anil Sharma"
                className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 transition-all text-gray-700 ${
                  errors.name 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="doctor@medicare.com"
                className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 transition-all text-gray-900 placeholder-gray-400 ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g., +977-9851012345"
                className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 transition-all text-gray-900 placeholder-gray-400 ${
                  errors.phone 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 placeholder-gray-400 mb-2">
                Specialization <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                name="specialisation"
                value={formData.specialisation}
                onChange={handleChange}
                placeholder="e.g., Cardiology"
                className={`w-full px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 transition-all text-gray-900 placeholder-gray-400 ${
                  errors.specialisation 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
                disabled={isSubmitting}
              />
              {errors.specialisation && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.specialisation}</p>
              )}
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
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <input 
                type="text"
                name="location" 
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Delhi, India"
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all text-gray-700"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {!isEditMode && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4 mt-4 shadow-sm">
              <p className="text-sm text-blue-900">
                <strong className="font-semibold">Note:</strong> A default password <code className="bg-blue-200/50 px-2 py-1 rounded font-mono text-blue-900">Doctor@123</code> will be set for this doctor. They can change it after first login.
              </p>
            </div>
          )}

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
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save size={20} />
                  {isEditMode ? 'Update Doctor' : 'Create Doctor'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditDoctorModal;