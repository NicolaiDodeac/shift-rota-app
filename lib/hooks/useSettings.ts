import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Settings = {
  tz: string;
  contractYearStart: string;
  employmentStart: string;
  contractedWeeklyHours: number;
  contractedAnnualHours: number;
  hoursPerShift: number;
  daysPerWeek: number;
  basicHoursCap: number;
  overtimeMultiplier: number;
  holidayWeeksFirstYear: number;
  holidayWeeksSubsequent: number;
  bankHolidayHours: number;
  serviceLengthWeeks: number;
  useFirstYearRates: boolean;
};

// API functions
export const fetchSettings = async (): Promise<Settings> => {
  const res = await fetch("/api/settings");
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return res.json();
};

const updateSettings = async (settings: Settings): Promise<Settings> => {
  const res = await fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  
  return res.json();
};

// Custom hooks
export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      // Invalidate and refetch settings data
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      // Also invalidate summary and dashboard data since settings affect calculations
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => {
      console.error("Failed to update settings:", error);
    },
  });
};
