import { useQuery } from "@tanstack/react-query";
import type { PredictionData } from "@/app/api/predictions/route";

async function fetchPredictions(): Promise<PredictionData> {
  const response = await fetch("/api/predictions");
  if (!response.ok) {
    throw new Error("Failed to fetch predictions");
  }
  return response.json();
}

export const usePredictions = () => {
  return useQuery({
    queryKey: ["predictions"],
    queryFn: fetchPredictions,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};
