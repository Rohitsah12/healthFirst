'use client';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchVisitHistory } from '../../store/visitHistorySlice';
import { exportVisitHistory, VisitHistoryQuery } from '../../services/visitApi';
import { Download } from 'lucide-react';
import { HistoryTable } from '../../components/history/HistoryTable'; // Assuming this component exists

// Helper to get today's date in YYYY-MM-DD format
const getTodayString = () => new Date().toISOString().split('T')[0];

export default function VisitHistoryPage() {
  const dispatch = useAppDispatch();
  const { visits, summary, status } = useAppSelector((state) => state.visitHistory);

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  useEffect(() => {
    // Fetch history whenever the selectedDate changes
    if (selectedDate) {
      dispatch(fetchVisitHistory({ date: selectedDate }));
    }
  }, [selectedDate, dispatch]);

  const handleExport = async () => {
    try {
      const blob = await exportVisitHistory({ date: selectedDate });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visit-history-${selectedDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Failed to export Excel file:", error);
      // You can show a notification to the user here
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Visit History</h1>
        <p className="text-gray-600 mt-1">Detailed audit log of all patient visits</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg">
        {/* Simplified Filter Section */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <label htmlFor="visit-date" className="font-bold text-gray-700">Select Date:</label>
            <input
              id="visit-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-2 border-gray-300 rounded-lg px-4 py-2 font-medium text-gray-700"
            />
          </div>
          <button 
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
          >
            <Download size={16} /> Export Excel
          </button>
        </div>
        
        {/* You can add the summary section here if you wish */}
        
        <div className="p-6">
          <HistoryTable visits={visits} isLoading={status === 'loading'} />
        </div>
      </div>
    </div>
  );
}