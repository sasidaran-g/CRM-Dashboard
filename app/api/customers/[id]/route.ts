import { NextRequest, NextResponse } from "next/server";

import { deleteCustomer, getCustomer, updateCustomer } from "@/lib/customer-store";
import { customerFormSchema } from "@/lib/customer-schema";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const customer = getCustomer(id);
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json(customer);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const json = await request.json();
  const parsed = customerFormSchema.partial().safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid customer data", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  const updated = updateCustomer(id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await new Promise((resolve) => setTimeout(resolve, 300));

  const deleted = deleteCustomer(id);
  if (!deleted) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
