'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Home, Clock, Calendar, Users, Stethoscope, ClipboardList, LogOut, Activity, User,
    LucideIcon 
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { logoutUser } from '../store/authSlice';

const NavItem = ({ href, icon: Icon, label, badge }: { href: string; icon: LucideIcon; label: string; badge?: number }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link href={href} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
            isActive ? 'bg-white text-blue-900 shadow-lg' : 'text-blue-100 hover:bg-blue-700'
        }`}>
            <Icon size={20} />
            <span className="flex-1 text-left font-medium">{label}</span>
            {badge !== undefined && badge > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    {badge}
                </span>
            )}
        </Link>
    );
};

const LogoutButton = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const handleLogout = async () => {
        await dispatch(logoutUser());
        router.push('/login');
    };

    return (
        <button 
            onClick={handleLogout}
            className="w-full bg-blue-700 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
            <LogOut size={16} />
            <span>Logout</span>
        </button>
    );
};

export const Sidebar = () => {
    const { user, role } = useAppSelector((state) => state.auth);
    
 
    const waitingCount = useAppSelector((state) => state.queue.waiting.length);

    return (
        <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white h-screen fixed left-0 top-0 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-blue-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Activity className="text-blue-900" size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">healthFirst</h1>
                        <p className="text-xs text-blue-200">Front Desk System</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3">
                <NavItem href="/dashboard" icon={Home} label="Dashboard" />
                <NavItem href="/queue" icon={Clock} label="Live Queue" badge={waitingCount} />
                <NavItem href="/appointments" icon={Calendar} label="Appointments" />
                <NavItem href="/patients" icon={Users} label="Patients" />
                <NavItem href="/doctors" icon={Stethoscope} label="Doctors" />
                <NavItem href="/history" icon={ClipboardList} label="Visit History" />
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-blue-700">
                <div className="flex items-center gap-3 mb-4 p-2">
                    <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
                        <User size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-sm truncate">{user?.name || 'Staff Member'}</p>
                        <p className="text-xs text-blue-200">{role || 'Front Desk'}</p>
                    </div>
                </div>
                <LogoutButton />
            </div>
        </div>
    );
};