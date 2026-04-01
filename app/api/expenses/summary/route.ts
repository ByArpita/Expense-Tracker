import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getExpenseDashboardData } from "@/lib/expense-summary";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { getUserById } from "@/lib/workspace";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!userId) {
    return NextResponse.json({ error: "Please sign in to your account." }, { status: 401 });
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
  }

  const summary = await getExpenseDashboardData(user);

  return NextResponse.json(summary, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
