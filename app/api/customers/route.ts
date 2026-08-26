import { NextRequest, NextResponse } from "next/server";

import { mockCustomers } from "@/lib/mock-data";
import type { Customer, CustomersResponse } from "@/lib/types";

const SORTABLE_FIELDS = [
  "name",
  "email",
  "company",
  "status",
  "lastContactDate",
] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

function isSortableField(value: string): value is SortableField {
  return (SORTABLE_FIELDS as readonly string[]).includes(value);
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

  // simulate network latency so loading states are visible
  await new Promise((resolve) => setTimeout(resolve, 300));

  let results: Customer[] = mockCustomers;

  if (search) {
    results = results.filter(
      (customer) =>
        customer.name.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.company.toLowerCase().includes(search)
    );
  }

  results = [...results].sort((a, b) => {
    const comparison = a[sortBy].localeCompare(b[sortBy]);
    return sortDir === "asc" ? comparison : -comparison;
  });

  const total = results.length;
  const start = (page - 1) * pageSize;
  const data = results.slice(start, start + pageSize);

  const body: CustomersResponse = { data, total, page, pageSize };
  return NextResponse.json(body);
}
