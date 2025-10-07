'use client';

import {AuthGuard}  from '../components/AuthGuard';
import { Sidebar } from '../components/SideBar';
import { UserRole } from '../store/types';
import { AddWalkinModal } from '../components/queue/AddWalkinModal';
import { useAppSelector } from '../store/store';
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  
   const { isModalOpen, modalType } = useAppSelector((state) => state.ui);
  return (
    <AuthGuard requiredRoles={[UserRole.ADMIN, UserRole.STAFF]}>
      <div className="min-h-screen bg-gray-100 font-sans">
        <Sidebar />
        <main className="ml-64 p-8">
          {children}
        </main>
        {isModalOpen && modalType === 'addWalkin' && <AddWalkinModal />}
      </div>
    </AuthGuard>
  );
}