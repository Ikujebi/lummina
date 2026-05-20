// hooks/useCases.ts
import { useQuery } from "@tanstack/react-query";

export function useCases() {
  return useQuery({
    queryKey: ["cases"],
    queryFn: async () => {
      const res = await fetch("/api/admin/matters");
      return res.json();
    },
  });
}