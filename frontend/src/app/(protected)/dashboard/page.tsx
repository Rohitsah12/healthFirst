"use client";
import { useAppSelector,RootState } from "../../store/store";

export default function DashboardPage() {
  const user = useAppSelector((state: RootState) => state.auth.user);
  

  return (
    <div className="p-8 text-black">
      <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
      {user && (
        <div className="mt-4">
          <p>Hello, {user.name}!</p>
          <p>Your role is: {user.role}</p>
        </div>
      )}
    </div>
  );
}
