"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Stethoscope } from 'lucide-react';
import { doctorApi } from '../../services/doctorApi';
import type { Doctor } from '../../types/doctor.types';
import DoctorCard from '../../components/doctors/DoctorCard';
import DoctorScheduleView from '../../components/doctors/DoctorScheduleView';
import AddEditDoctorModal from '../../components/doctors/AddEditDoctorModal';
import DeleteDoctorModal from '../../components/doctors/DeleteDoctorModal';
import Pagination from '../../components/shared/Pagination';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';

type ViewMode = 'list' | 'schedule';

const DoctorsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 9,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'true' | 'false'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await doctorApi.getDoctors({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchQuery,
        isActive: filterStatus
      });
      setDoctors(data.doctors);
      setPagination(data.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch doctors');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctorById = async (doctorId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const doctor = await doctorApi.getDoctorById(doctorId);
      setSelectedDoctor(doctor);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch doctor details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [pagination.currentPage, filterStatus]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (pagination.currentPage === 1) {
        fetchDoctors();
      } else {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleViewSchedule = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    fetchDoctorById(doctorId);
    setViewMode('schedule');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedDoctorId(null);
    setSelectedDoctor(null);
    fetchDoctors();
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleDoctorAdded = () => {
    setIsAddModalOpen(false);
    setEditingDoctor(null);
    fetchDoctors();
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
  };

  const handleDeleteDoctor = (doctor: Doctor) => {
    setDeletingDoctor(doctor);
  };

  const handleDeleteSuccess = () => {
    setDeletingDoctor(null);
    fetchDoctors();
  };

  if (viewMode === 'schedule' && selectedDoctor) {
    return (
      <DoctorScheduleView 
        doctor={selectedDoctor} 
        onBack={handleBackToList}
        isLoading={isLoading}
        onScheduleUpdate={() => fetchDoctorById(selectedDoctor.id)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Doctors</h2>
          <p className="text-gray-600 mt-1">Manage doctor profiles and schedules</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg font-medium transition-colors"
        >
          <Plus size={20} /> Add New Doctor
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, email, phone, or specialization..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 placeholder-gray-400" 
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'true' | 'false')}
            className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none text-gray-800"
          >
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {isLoading ? (
          <LoadingSpinner />
        ) : doctors.length === 0 ? (
          <div className="text-center py-12">
            <Stethoscope className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No doctors found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map(doctor => (
                <DoctorCard 
                  key={doctor.id} 
                  doctor={doctor}
                  onViewSchedule={handleViewSchedule}
                  onEdit={handleEditDoctor}
                  onDelete={handleDeleteDoctor}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination 
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalCount={pagination.totalCount}
                onPageChange={handlePageChange}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
              />
            )}
          </>
        )}
      </div>

      {/* Add/Edit Doctor Modal */}
      {(isAddModalOpen || editingDoctor) && (
        <AddEditDoctorModal 
          doctor={editingDoctor}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingDoctor(null);
          }}
          onSuccess={handleDoctorAdded}
        />
      )}

      {/* Delete Doctor Modal */}
      {deletingDoctor && (
        <DeleteDoctorModal
          doctor={deletingDoctor}
          onClose={() => setDeletingDoctor(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default DoctorsPage;