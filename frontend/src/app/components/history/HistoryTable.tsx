import React from 'react';
import { Visit } from '../../store/types';

import { StatusBadge } from '../shared/StatusBadge';

interface HistoryTableProps {
  visits: Visit[];
  isLoading: boolean;
}

export const HistoryTable = ({ visits, isLoading }: HistoryTableProps) => {
  if (isLoading) {
    return <div className="p-12 text-center text-gray-600">Loading history...</div>;
  }
  if (visits.length === 0) {
    return <div className="p-12 text-center text-gray-500">No visits found for the selected filters.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="p-4 font-bold text-left text-gray-700">Date</th>
            <th className="p-4 font-bold text-left text-gray-700">Type</th>
            <th className="p-4 font-bold text-left text-gray-700">Patient</th>
            <th className="p-4 font-bold text-left text-gray-700">Doctor</th>
            <th className="p-4 font-bold text-left text-gray-700">Status</th>
            <th className="p-4 font-bold text-left text-gray-700">Time</th>
            <th className="p-4 font-bold text-left text-gray-700">Priority</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((visit) => (
            <React.Fragment key={visit.id}>
              {visit.logs.map((log, index) => (
                <tr key={`${visit.id}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                  {index === 0 && (
                    <>
                      <td rowSpan={visit.logs.length} className="p-4 align-top font-medium text-gray-800">
                        {new Date(visit.createdAt).toLocaleDateString()}
                      </td>
                      <td rowSpan={visit.logs.length} className="p-4 align-top">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          visit.visitType === 'WALK_IN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {visit.visitType}
                        </span>
                      </td>
                      <td rowSpan={visit.logs.length} className="p-4 align-top text-gray-700">
                        {visit.patient.name}
                      </td>
                      <td rowSpan={visit.logs.length} className="p-4 align-top text-gray-700">
                        {visit.doctor.user.name}
                      </td>
                    </>
                  )}
                  <td className="p-4">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="p-4 text-gray-600 text-sm">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  {index === 0 && (
                    <td rowSpan={visit.logs.length} className="p-4 align-top">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        visit.priority === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {visit.priority}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
