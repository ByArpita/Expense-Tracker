import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { getUserById, findOrCreateUserByEmail } from "@/lib/workspace";
import { sessionInputSchema } from "@/lib/validators";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!userId) {
    return NextResponse.json({ user: null });
  }

  const user = await getUserById(userId);
  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = sessionInputSchema.parse(body);
    const user = await findOrCreateUserByEmail(email, name);

    const response = NextResponse.json({ user });
    response.cookies.set(SESSION_COOKIE_NAME, user.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0]?.message ?? "Please enter a valid email."
        },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Unable to login.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });

  return response;
}