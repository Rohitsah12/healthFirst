import React from 'react';
import { Stethoscope, Calendar, ChevronRight, Phone, Mail, Edit, Trash2 } from 'lucide-react';
import type { Doctor } from '../../types/doctor.types';

interface DoctorCardProps {
  doctor: Doctor;
  onViewSchedule: (doctorId: string) => void;
  onEdit: (doctor: Doctor) => void;
  onDelete: (doctor: Doctor) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onViewSchedule, onEdit, onDelete }) => {
  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
  };

  const getGenderBadge = (gender: string) => {
    const colors = {
      MALE: 'bg-blue-100 text-blue-700',
      FEMALE: 'bg-pink-100 text-pink-700',
      OTHER: 'bg-purple-100 text-purple-700'
    };
    return colors[gender as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(doctor);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(doctor);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Stethoscope className="text-blue-600" size={32} />
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-1 rounded-full font-bold ${getStatusColor(doctor.isActive)}`}>
            {doctor.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2">{doctor.user.name}</h3>
      <p className="text-gray-600 mb-1">{doctor.specialisation}</p>
      
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getGenderBadge(doctor.gender)}`}>
          {doctor.gender}
        </span>
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Mail size={14} />
          <span className="truncate">{doctor.user.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} />
          <span>{doctor.user.phone}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mb-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleEdit}
          className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-1 font-medium text-sm"
        >
          <Edit size={14} />
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-1 font-medium text-sm"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>

      <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>{doctor?.workingHours?.length || 0} days/week</span>
        </div>
        <button 
          onClick={() => onViewSchedule(doctor.id)}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 transition-colors"
        >
          Schedule <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;