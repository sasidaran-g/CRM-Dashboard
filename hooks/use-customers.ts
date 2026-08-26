"use client";

import { useQuery } from "@tanstack/react-query";

import type { CustomerFilters, CustomersResponse } from "@/lib/types";

export type SortField =
  | "name"
  | "email"
  | "company"
  | "status"
  | "lastContactDate"
  | "order";
export type SortDir = "asc" | "desc";

export interface UseCustomersParams {
  search: string;
  sortBy: SortField;
  sortDir: SortDir;
  page: number;
  pageSize: number;
  filters: CustomerFilters;
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
        status: params.filters.status.join(","),
        company: params.filters.companies.join(","),
        dateFrom: params.filters.dateFrom,
        dateTo: params.filters.dateTo,
        phone: params.filters.phone,
        email: params.filters.email,
      });

      const res = await fetch(`/api/customers?${query.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load customers");
      }
      return res.json();
    },
  });
}
