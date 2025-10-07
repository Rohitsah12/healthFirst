import { Visit } from '../../store/types';
import { QueueCard } from './QueueCard';

interface QueueColumnProps {
  title: string;
  visits: Visit[];
  color: 'blue' | 'yellow';
  movingVisitId: string | null;
}

export const QueueColumn = ({ title, visits, color, movingVisitId }: QueueColumnProps) => (
  <div className={`border-2 rounded-xl p-4 min-h-96 ${color === 'blue' ? 'bg-blue-50 border-blue-300' : 'bg-yellow-50 border-yellow-300'}`}>
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      <span className="bg-white px-3 py-1 rounded-full text-sm font-bold text-gray-700 shadow-sm">{visits.length}</span>
    </div>
    <div className="space-y-3">
      {visits.map(visit => (
        <QueueCard key={visit.id} visit={visit} isMoving={movingVisitId === visit.id} />
      ))}
    </div>
  </div>
);