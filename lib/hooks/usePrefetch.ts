import { useQueryClient } from "@tanstack/react-query";
import { fetchSummaryData } from "./useSummary";
import { fetchDashboardData } from "./useDashboard";
import { fetchSettings } from "./useSettings";

export const usePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchSummary = () => {
    queryClient.prefetchQuery({
      queryKey: ["summary"],
      queryFn: fetchSummaryData,
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  const prefetchDashboard = () => {
    queryClient.prefetchQuery({
      queryKey: ["dashboard"],
      queryFn: fetchDashboardData,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const prefetchSettings = () => {
    queryClient.prefetchQuery({
      queryKey: ["settings"],
      queryFn: fetchSettings,
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  const prefetchAll = () => {
    prefetchSummary();
    prefetchDashboard();
    prefetchSettings();
  };

  return {
    prefetchSummary,
    prefetchDashboard,
    prefetchSettings,
    prefetchAll,
  };
};
