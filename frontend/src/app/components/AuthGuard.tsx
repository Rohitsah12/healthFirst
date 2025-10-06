"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../store/store";
import type { UserRole } from "../store/types";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles: UserRole[];
}

export const AuthGuard = ({ children, requiredRoles }: AuthGuardProps) => {
  const { isAuthenticated, status, role } = useAppSelector(
    (state) => state.auth
  );
  const router = useRouter();

  const isLoading = status === "idle" || status === "loading";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex items-center justify-center h-16 w-16">
          <div className="rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin h-16 w-16" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (requiredRoles && !requiredRoles.includes(role!)) {
      router.push("/dashboard");
      return null; // Render nothing while redirecting.
    }
    return <>{children}</>;
  }

  return null;
};
