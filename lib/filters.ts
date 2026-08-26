import type { CustomerFilters } from "./types";

export const EMPTY_FILTERS: CustomerFilters = {
  status: [],
  companies: [],
  dateFrom: "",
  dateTo: "",
  phone: "",
  email: "",
};

export function countActiveFilters(filters: CustomerFilters): number {
  let count = 0;
  if (filters.status.length > 0) count++;
  if (filters.companies.length > 0) count++;
  if (filters.dateFrom || filters.dateTo) count++;
  if (filters.phone.trim()) count++;
  if (filters.email.trim()) count++;
  return count;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface FilterTemplate {
  name: string;
  getFilters: () => CustomerFilters;
}

export const FILTER_TEMPLATES: FilterTemplate[] = [
  {
    name: "Active Customers",
    getFilters: () => ({ ...EMPTY_FILTERS, status: ["Active"] }),
  },
  {
    name: "Recent Contacts",
    getFilters: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 30);
      return { ...EMPTY_FILTERS, dateFrom: isoDate(from), dateTo: isoDate(to) };
    },
  },
  {
    name: "Inactive Leads",
    getFilters: () => ({ ...EMPTY_FILTERS, status: ["Inactive"] }),
  },
];
