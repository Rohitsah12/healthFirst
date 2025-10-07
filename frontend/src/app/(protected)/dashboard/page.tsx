"use client";
import { useAppSelector, RootState } from "../../store/store";
import { UserPlus} from 'lucide-react'

export default function DashboardPage() {
  const user = useAppSelector((state: RootState) => state.auth.user);

  return (
    <div className="p-8 text-black">
      
    </div>
  );
}
