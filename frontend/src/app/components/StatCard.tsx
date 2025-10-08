import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: number | string;
    color: 'blue' | 'yellow' | 'green' | 'purple';
}

export const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200'
    };
    return (
        <div className={`${colors[color]} border-2 rounded-xl p-6 shadow-sm`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium opacity-80">{label}</p>
                    <p className="text-4xl font-bold mt-2">{value}</p>
                </div>
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md">
                    <Icon size={28} />
                </div>
            </div>
        </div>
    );
};