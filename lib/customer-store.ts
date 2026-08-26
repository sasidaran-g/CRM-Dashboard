import { mockCustomers } from "./mock-data";
import type { Customer, CustomerStatus } from "./types";

// Module-level state so it survives across requests within the same
// server process. This is a mock backend — data resets on server restart.
let customers: Customer[] = [...mockCustomers];
let nextId = customers.length + 1;

export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  lastContactDate: string;
  notes: string;
}

export function listCustomers(): Customer[] {
  return customers;
}

export function getCustomer(id: string): Customer | undefined {
  return customers.find((customer) => customer.id === id);
}

export function createCustomer(input: CustomerInput): Customer {
  const maxOrder = customers.reduce((max, c) => Math.max(max, c.order), 0);
  const customer: Customer = { id: `cust-${nextId++}`, order: maxOrder + 1, ...input };
  customers = [customer, ...customers];
  return customer;
}

export function updateCustomer(
  id: string,
  patch: Partial<CustomerInput>
): Customer | null {
  const index = customers.findIndex((customer) => customer.id === id);
  if (index === -1) return null;
  const updated = { ...customers[index], ...patch };
  customers = [
    ...customers.slice(0, index),
    updated,
    ...customers.slice(index + 1),
  ];
  return updated;
}

export function deleteCustomer(id: string): boolean {
  const index = customers.findIndex((customer) => customer.id === id);
  if (index === -1) return false;
  customers = [...customers.slice(0, index), ...customers.slice(index + 1)];
  return true;
}

// Reassigns the `order` values currently held by `ids` to match the new
// sequence, leaving every other customer's order untouched.
export function reorderCustomers(ids: string[]): void {
  const idSet = new Set(ids);
  const affectedOrders = customers
    .filter((customer) => idSet.has(customer.id))
    .map((customer) => customer.order)
    .sort((a, b) => a - b);

  const nextOrderById = new Map<string, number>();
  ids.forEach((id, index) => {
    if (affectedOrders[index] !== undefined) {
      nextOrderById.set(id, affectedOrders[index]);
    }
  });

  customers = customers.map((customer) =>
    nextOrderById.has(customer.id)
      ? { ...customer, order: nextOrderById.get(customer.id)! }
      : customer
  );
}
