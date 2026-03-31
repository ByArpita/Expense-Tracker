import { NextResponse } from "next/server";
import { getExpenseDashboardData } from "@/lib/expense-summary";

export async function GET() {
  const summary = await getExpenseDashboardData();
  return NextResponse.json(summary);
}
