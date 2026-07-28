import { NextResponse } from "next/server";
import { intakeDataSchema } from "@/lib/validation";
import { generatePlan } from "@/lib/engine/generatePlan";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = intakeDataSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message ?? "Invalid intake data" }, { status: 400 });
  }

  const plan = generatePlan(result.data);
  return NextResponse.json(plan);
}
