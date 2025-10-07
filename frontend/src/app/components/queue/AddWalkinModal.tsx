'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../../store/store';
import { closeModal, openModal } from '../../store/uiSlice';
import { fetchQueueThunk } from '../../store/queueSlice';
import { UserPlus, X, Check, RefreshCw } from 'lucide-react';
import { getAvailableDoctors } from '../../services/doctorApi'; 
import { patientApi } from '../../services/patientApi';
import { createVisit } from '../../services/visitApi';
import {  PriorityLevel, VisitType } from '../../store/types';
import { Doctor } from '@/app/types/doctor.types';
import { Patient } from '@/app/types/patient.types';


export const AddWalkinModal = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>(PriorityLevel.NORMAL);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch doctors and patients when the modal opens
  useEffect(() => {
    const loadData = async () => {
      setIsDataLoading(true);
      try {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        const [availableDoctors, patientsRes] = await Promise.all([
          getAvailableDoctors(today),
          patientApi.getPatients({ page: 1, limit: 1000 }) // Fetch a large number of patients for the dropdown
        ]);
        
        setDoctors(availableDoctors);
        setPatients(patientsRes.patients);
      } catch (err) {
        setError('Failed to load necessary data.');
      } finally {
        setIsDataLoading(false);
      }
    };
    loadData();
  }, []);

  const handleCheckIn = async () => {
    if (!selectedPatientId || !selectedDoctorId) {
      setError('Please select a patient and a doctor.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await createVisit({
        patientId: selectedPatientId,
        doctorId: selectedDoctorId,
        priority: priority,
        visitType: VisitType.WALK_IN,
      });
      dispatch(closeModal());
      dispatch(fetchQueueThunk());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to check-in patient.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-2xl font-bold text-gray-800">Add Walk-in Patient</h3>
          <button onClick={() => dispatch(closeModal())} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {isDataLoading ? (
            <div className="p-12 flex items-center justify-center">
                <RefreshCw className="animate-spin text-blue-600" size={32} />
            </div>
        ) : (
            <>
                <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
                    <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-800"
                    >
                    <option value="">-- Search Patient --</option>
                    {patients.map((p) => <option key={p.id} value={p.id}>{p.name} - {p.phone}</option>)}
                    </select>
                    <p className="text-sm text-gray-500 mt-2">
                    Patient not found?
                    <button onClick={() => {
                        dispatch(closeModal());
                        router.push('/patients');
                        }}
                        className="text-blue-600 font-medium hover:underline ml-1"
                    >
                        Create New Patient
                    </button>
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign Doctor</label>
                    <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-800"
                    >
                        <option value="">-- Select an available doctor --</option>
                        {doctors.map((d) => <option key={d.id} value={d.id}>{d.user.name} - {d.specialisation}</option>)}
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 ">Priority</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value as PriorityLevel)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-800">
                        <option value={PriorityLevel.NORMAL}>Normal</option>
                        <option value={PriorityLevel.URGENT} className='bg-red-500 text-white'>Urgent</option>
                    </select>
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                <button onClick={() => dispatch(closeModal())} className="px-6 py-3 border-2 rounded-lg font-medium">Cancel</button>
                <button onClick={handleCheckIn} disabled={isLoading} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2">
                    {isLoading ? 'Checking in...' : <><Check size={20} /> Check-in Patient</>}
                </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};