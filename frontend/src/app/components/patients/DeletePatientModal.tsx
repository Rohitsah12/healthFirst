"use client";

import React, { useState } from "react";
import { X, Trash2, Loader2, AlertTriangle } from "lucide-react";
import type { Patient } from "../../types/patient.types";
import { patientApi } from "../../services/patientApi";

interface Props {
  patient: Patient;
  onClose: () => void;
  onSuccess: () => void;
}

const DeletePatientModal: React.FC<Props> = ({ patient, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setApiErr(null);
    try {
      await patientApi.deletePatient(patient.id);
      onSuccess();
    } catch (err: unknown) {
      setApiErr(err instanceof Error ? err.message : "Failed to delete patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold">Delete patient</h3>
          </div>
          <button onClick={onClose} disabled={loading} className="text-gray-500 hover:text-gray-700 p-2">
            <X />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {apiErr && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">{apiErr}</div>}

          <p className="text-gray-700">Are you sure you want to permanently delete this patient?</p>

          <div className="bg-gray-50 p-4 rounded border">
            <p className="font-semibold">{patient.name}</p>
            <p className="text-sm text-gray-600">{patient.phone}</p>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={onClose} disabled={loading} className="px-4 py-2 rounded border">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={loading} className="px-4 py-2 rounded bg-red-600 text-white flex items-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <Trash2 />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletePatientModal;
