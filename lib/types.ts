export type CustomerStatus = "Active" | "Inactive";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  lastContactDate: string;
}

export interface CustomersResponse {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
}
