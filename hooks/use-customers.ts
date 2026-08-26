"use client";

import { useQuery } from "@tanstack/react-query";

import type { CustomersResponse } from "@/lib/types";

export type SortField = "name" | "email" | "company" | "status" | "lastContactDate";
export type SortDir = "asc" | "desc";

export interface UseCustomersParams {
  search: string;
  sortBy: SortField;
  sortDir: SortDir;
  page: number;
  pageSize: number;
}

export function useCustomers(params: UseCustomersParams) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: async (): Promise<CustomersResponse> => {
      const query = new URLSearchParams({
        search: params.search,
        sortBy: params.sortBy,
        sortDir: params.sortDir,
        page: String(params.page),
        pageSize: String(params.pageSize),
      });

      const res = await fetch(`/api/customers?${query.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load customers");
      }
      return res.json();
    },
  });
}
