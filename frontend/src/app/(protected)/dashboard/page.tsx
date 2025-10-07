'use client';
import { useAppDispatch } from '../../store/store';
import { openModal } from '../../store/uiSlice';
import { UserPlus } from 'lucide-react';

export default function DashboardPage() {
    const dispatch = useAppDispatch();

    return (
        <div>
            {/* ... other dashboard content */}
            <button 
                onClick={() => dispatch(openModal('addWalkin'))}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
            >
                <UserPlus size={20} /> Add Walk-in
            </button>
        </div>
    );
}