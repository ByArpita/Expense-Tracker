import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getExpenseTrendData } from "@/lib/expense-trend";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { getUserById } from "@/lib/workspace";

const trendRangeSchema = z.enum(["7d", "1m", "3m", "6m", "1y"]);

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!userId) {
    return NextResponse.json({ error: "Please sign in to your account." }, { status: 401 });
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const range = trendRangeSchema.parse(searchParams.get("range") ?? "7d");
    const trend = await getExpenseTrendData(user, range);

    return NextResponse.json(trend, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Choose a valid trend range." }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unable to load trend data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
