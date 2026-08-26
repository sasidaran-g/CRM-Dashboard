export type CustomerStatus = "Active" | "Inactive";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  lastContactDate: string;
  notes: string;
  order: number;
}

export interface CustomersResponse {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CustomerFilters {
  status: CustomerStatus[];
  companies: string[];
  dateFrom: string;
  dateTo: string;
  phone: string;
  email: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: CustomerFilters;
}
