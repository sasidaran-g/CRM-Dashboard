import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { reorderCustomers } from "@/lib/customer-store";

const reorderSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export async function POST(request: NextRequest) {
  const json = await request.json();
  const parsed = reorderSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reorder payload" }, { status: 400 });
  }

  await new Promise((resolve) => setTimeout(resolve, 200));

  reorderCustomers(parsed.data.ids);
  return NextResponse.json({ success: true });
}
