import { useQuery } from "@tanstack/react-query";

type DashboardData = {
  tz: string;
  contractYearStartISO: string;
  targetHours: number;
  basicHours: number;
  overtimeHours: number;
  bankedHours: number;
  balanceHours: number;
  confirmedWeeks: number;
};

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const res = await fetch("/api/dashboard");
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return res.json();
};

export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};
