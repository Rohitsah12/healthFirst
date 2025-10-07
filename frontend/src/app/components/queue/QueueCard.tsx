import { useAppDispatch } from '../../store/store';
import { updateStatusThunk } from '../../store/queueSlice';
import { Visit, VisitStatus } from '../../store/types';
import { Clock, ChevronRight, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface QueueCardProps {
  visit: Visit;
  isMoving: boolean;
}

export const QueueCard = ({ visit, isMoving }: QueueCardProps) => {
  const dispatch = useAppDispatch();

  const handleUpdateStatus = (newStatus: VisitStatus) => {
    dispatch(updateStatusThunk({ visitId: visit.id, status: newStatus }));
  };

  const isWaiting = visit.currentStatus === VisitStatus.CHECKED_IN;

  return (
    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 relative">
      {isMoving && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-lg">
          <RefreshCw className="animate-spin text-blue-600" size={24} />
        </div>
      )}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-gray-800">{visit.patient.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{visit.doctor.user.name}</p>
        </div>
        {visit.priority === 'URGENT' && (
          <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <AlertCircle size={14} /> URGENT
          </span>
        )}
      </div>
      <div className="flex items-center justify-between pt-3 border-t">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Clock size={14} />
          {visit.checkInTime ? new Date(visit.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
        </span>
        {isWaiting ? (
          <button
            onClick={() => handleUpdateStatus(VisitStatus.WITH_DOCTOR)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
          >
            To Doctor <ChevronRight size={14} />
          </button>
        ) : (
          <button
            onClick={() => handleUpdateStatus(VisitStatus.COMPLETED)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
          >
            <CheckCircle size={14} /> Complete
          </button>
        )}
      </div>
    </div>
  );
};