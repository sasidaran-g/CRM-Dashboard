import { NextRequest, NextResponse } from "next/server";

import { createCustomer, listCustomers } from "@/lib/customer-store";
import { customerFormSchema } from "@/lib/customer-schema";
import type { Customer, CustomersResponse } from "@/lib/types";

const SORTABLE_FIELDS = [
  "name",
  "email",
  "company",
  "status",
  "lastContactDate",
  "order",
] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

function isSortableField(value: string): value is SortableField {
  return (SORTABLE_FIELDS as readonly string[]).includes(value);
}

function parseListParam(value: string | null): string[] {
  return (value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const search = (searchParams.get("search") ?? "").trim().toLowerCase();
  const sortByParam = searchParams.get("sortBy") ?? "name";
  const sortBy: SortableField = isSortableField(sortByParam)
    ? sortByParam
    : "name";
  const sortDir = searchParams.get("sortDir") === "desc" ? "desc" : "asc";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, Number(searchParams.get("pageSize")) || 10)
  );

  const statusFilter = parseListParam(searchParams.get("status"));
  const companyFilter = parseListParam(searchParams.get("company"));
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";
  const phoneFilter = (searchParams.get("phone") ?? "").trim();
  const emailFilter = (searchParams.get("email") ?? "").trim().toLowerCase();

  // simulate network latency so loading states are visible
  await new Promise((resolve) => setTimeout(resolve, 300));

  let results: Customer[] = listCustomers();

  if (search) {
    results = results.filter(
      (customer) =>
        customer.name.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.company.toLowerCase().includes(search)
    );
  }

  if (statusFilter.length > 0) {
    results = results.filter((customer) => statusFilter.includes(customer.status));
  }

  if (companyFilter.length > 0) {
    results = results.filter((customer) => companyFilter.includes(customer.company));
  }

  if (dateFrom) {
    const fromTime = new Date(dateFrom).getTime();
    results = results.filter(
      (customer) => new Date(customer.lastContactDate).getTime() >= fromTime
    );
  }

  if (dateTo) {
    const toTime = new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1;
    results = results.filter(
      (customer) => new Date(customer.lastContactDate).getTime() <= toTime
    );
  }

  if (phoneFilter) {
    results = results.filter((customer) => customer.phone.includes(phoneFilter));
  }

  if (emailFilter) {
    results = results.filter((customer) =>
      customer.email.toLowerCase().includes(emailFilter)
    );
  }

  results = [...results].sort((a, b) => {
    const comparison =
      sortBy === "order" ? a.order - b.order : a[sortBy].localeCompare(b[sortBy]);
    return sortDir === "asc" ? comparison : -comparison;
  });

  const total = results.length;
  const start = (page - 1) * pageSize;
  const data = results.slice(start, start + pageSize);

  const body: CustomersResponse = { data, total, page, pageSize };
  return NextResponse.json(body);
}

export async function POST(request: NextRequest) {
  const json = await request.json();
  const parsed = customerFormSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid customer data", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  const customer = createCustomer(parsed.data);
  return NextResponse.json(customer, { status: 201 });
}
