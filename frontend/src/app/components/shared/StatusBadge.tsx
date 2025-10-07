import React from "react";

enum VisitStatus {
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  WITH_DOCTOR = "WITH_DOCTOR",
  CHECKED_IN = "CHECKED_IN",
  SCHEDULED = "SCHEDULED",
}

interface StatusBadgeProps {
  status: string | VisitStatus | null | undefined;
}

const tailwindClasses: Record<string, string> = {
  COMPLETED: "px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700",
  CANCELLED: "px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700",
  WITH_DOCTOR: "px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800",
  CHECKED_IN: "px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700",
  SCHEDULED: "px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700",
};

const colorHex: Record<string, { bg: string; fg: string }> = {
  COMPLETED: { bg: "#dcfce7", fg: "#15803d" },
  CANCELLED: { bg: "#fee2e2", fg: "#b91c1c" },
  WITH_DOCTOR: { bg: "#fffbeb", fg: "#854d0e" },
  CHECKED_IN: { bg: "#ebf8ff", fg: "#075985" },
  SCHEDULED: { bg: "#f3f4f6", fg: "#374151" },
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const key = (status ?? "").toString().trim().toUpperCase();
  const classes = tailwindClasses[key] ?? "px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700";
  const colors = colorHex[key];

  return (
    <span
      className={classes}
      style={colors ? { backgroundColor: colors.bg, color: colors.fg } : undefined}
    >
      {key || "UNKNOWN"}
    </span>
  );
};
