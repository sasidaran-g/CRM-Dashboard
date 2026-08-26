"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { Customer } from "@/lib/types";
import type { CustomerFormValues } from "@/lib/customer-schema";

async function parseErrorMessage(res: Response, fallback: string) {
  try {
    const body = await res.json();
    return body?.error ?? fallback;
  } catch {
    return fallback;
  }
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CustomerFormValues): Promise<Customer> => {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        throw new Error(await parseErrorMessage(res, "Failed to create customer"));
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: CustomerFormValues;
    }): Promise<Customer> => {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        throw new Error(await parseErrorMessage(res, "Failed to update customer"));
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error(await parseErrorMessage(res, "Failed to delete customer"));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
