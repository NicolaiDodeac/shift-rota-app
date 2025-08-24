import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type WeekRow = {
  weekStartISO: string;
  scheduledMinutes: number;
  basicMinutes: number;
  overtimeMinutes: number;
  bankedMinutes: number;
  confirmed?: boolean;
  actualBasicMinutes?: number;
  actualOvertimeMinutes?: number;
  actualBankedMinutes?: number;
  isManualOverride?: boolean;
};

type SummaryData = {
  tz: string;
  weeks: WeekRow[];
};

type Settings = {
  basicHoursCap: number;
  overtimeMultiplier: number;
};

// API functions
export const fetchSummaryData = async (): Promise<SummaryData> => {
  const res = await fetch("/api/summary");
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return res.json();
};

const fetchSettings = async (): Promise<Settings> => {
  const res = await fetch("/api/settings");
  if (!res.ok) {
    throw new Error("Failed to fetch settings");
  }
  const data = await res.json();
  return {
    basicHoursCap: data.basicHoursCap,
    overtimeMultiplier: data.overtimeMultiplier,
  };
};

const confirmWeekAPI = async (weekData: {
  weekStartISO: string;
  weekEndISO: string;
  scheduledMinutes: number;
  basicMinutes: number;
  overtimeMinutes: number;
  bankedMinutes: number;
  isManualOverride: boolean;
}) => {
  const res = await fetch("/api/summary/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(weekData),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  
  return res.json();
};

// Custom hooks
export const useSummary = () => {
  return useQuery({
    queryKey: ["summary"],
    queryFn: fetchSummaryData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
};

export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useConfirmWeek = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: confirmWeekAPI,
    onMutate: async (weekData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["summary"] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["summary"]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["summary"], (old: any) => {
        if (!old?.weeks) return old;
        
        return {
          ...old,
          weeks: old.weeks.map((week: any) => 
            week.weekStartISO === weekData.weekStartISO 
              ? { 
                  ...week, 
                  confirmed: true,
                  actualBasicMinutes: weekData.basicMinutes,
                  actualOvertimeMinutes: weekData.overtimeMinutes,
                  actualBankedMinutes: weekData.bankedMinutes,
                  isManualOverride: weekData.isManualOverride
                }
              : week
          ),
        };
      });

      // Also optimistically update dashboard data
      queryClient.setQueryData(["dashboard"], (old: any) => {
        if (!old) return old;
        
        // Update the dashboard totals based on the new week data
        const summaryData = queryClient.getQueryData(["summary"]) as any;
        const updatedWeeks = summaryData?.weeks || [];
        const confirmedWeeks = updatedWeeks.filter((week: any) => week.confirmed).length;
        
        return {
          ...old,
          confirmedWeeks,
          // You might want to recalculate other totals here based on your business logic
        };
      });
      
      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (err, weekData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(["summary"], context.previousData);
      }
      console.error("Failed to confirm week:", err);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      // Also invalidate dashboard data since it depends on summary data
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useUpdateWeek = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: confirmWeekAPI,
    onMutate: async (weekData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["summary"] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["summary"]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["summary"], (old: any) => {
        if (!old?.weeks) return old;
        
        return {
          ...old,
          weeks: old.weeks.map((week: any) => 
            week.weekStartISO === weekData.weekStartISO 
              ? { 
                  ...week, 
                  actualBasicMinutes: weekData.basicMinutes,
                  actualOvertimeMinutes: weekData.overtimeMinutes,
                  actualBankedMinutes: weekData.bankedMinutes,
                  isManualOverride: weekData.isManualOverride
                }
              : week
          ),
        };
      });

      // Also optimistically update dashboard data
      queryClient.setQueryData(["dashboard"], (old: any) => {
        if (!old) return old;
        
        // Update the dashboard totals based on the new week data
        const summaryData = queryClient.getQueryData(["summary"]) as any;
        const updatedWeeks = summaryData?.weeks || [];
        const confirmedWeeks = updatedWeeks.filter((week: any) => week.confirmed).length;
        
        return {
          ...old,
          confirmedWeeks,
          // You might want to recalculate other totals here based on your business logic
        };
      });
      
      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (err, weekData, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(["summary"], context.previousData);
      }
      console.error("Failed to update week:", err);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      // Also invalidate dashboard data since it depends on summary data
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};
