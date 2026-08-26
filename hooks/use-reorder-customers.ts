"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CustomersResponse } from "@/lib/types";
import type { UseCustomersParams } from "@/hooks/use-customers";

export function useReorderCustomers(params: UseCustomersParams) {
  const queryClient = useQueryClient();
  const queryKey = ["customers", params];

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch("/api/customers/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) {
        throw new Error("Failed to reorder customers");
      }
    },
    onMutate: async (ids: string[]) => {
      const previous = queryClient.getQueryData<CustomersResponse>(queryKey);
      if (previous) {
        const byId = new Map(previous.data.map((customer) => [customer.id, customer]));
        const reordered = ids
          .map((id) => byId.get(id))
          .filter((customer): customer is NonNullable<typeof customer> => Boolean(customer));
        queryClient.setQueryData(queryKey, { ...previous, data: reordered });
      }
      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
