import React, { useState } from 'react';
import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { doctorApi } from '../../services/doctorApi';
import type { Doctor } from '../../types/doctor.types';

interface DeleteDoctorModalProps {
  doctor: Doctor;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteDoctorModal: React.FC<DeleteDoctorModalProps> = ({ doctor, onClose, onSuccess }) => {
  const [deleteType, setDeleteType] = useState<'soft' | 'permanent'>('soft');
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setApiError(null);

    try {
      await doctorApi.deleteDoctor(doctor.id, deleteType === 'permanent');
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError('Failed to delete doctor');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Delete Doctor</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isDeleting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {apiError}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Doctor Details:</p>
            <p className="font-bold text-gray-800">{doctor.user.name}</p>
            <p className="text-sm text-gray-600">{doctor.specialisation}</p>
            <p className="text-sm text-gray-600">{doctor.user.email}</p>
          </div>

          <div className="space-y-3">
            <p className="text-gray-700 font-medium">Choose delete option:</p>
            
            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="deleteType"
                value="soft"
                checked={deleteType === 'soft'}
                onChange={(e) => setDeleteType(e.target.value as 'soft')}
                className="mt-1"
                disabled={isDeleting}
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-800">Deactivate (Recommended)</p>
                <p className="text-sm text-gray-600 mt-1">
                  Doctor will be marked as inactive but data will be preserved. Visit history remains intact.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-red-50 transition-colors">
              <input
                type="radio"
                name="deleteType"
                value="permanent"
                checked={deleteType === 'permanent'}
                onChange={(e) => setDeleteType(e.target.value as 'permanent')}
                className="mt-1"
                disabled={isDeleting}
              />
              <div className="flex-1">
                <p className="font-semibold text-red-700">Permanent Delete</p>
                <p className="text-sm text-gray-600 mt-1">
                  Completely remove doctor from system. Only allowed if doctor has no visit records.
                </p>
              </div>
            </label>
          </div>

          {deleteType === 'permanent' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-semibold text-red-800">Warning!</p>
                  <p className="text-sm text-red-700 mt-1">
                    This action cannot be undone. All doctor data will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button 
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              deleteType === 'permanent'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {deleteType === 'permanent' ? 'Deleting...' : 'Deactivating...'}
              </>
            ) : (
              <>
                <Trash2 size={20} />
                {deleteType === 'permanent' ? 'Delete Permanently' : 'Deactivate Doctor'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDoctorModal;