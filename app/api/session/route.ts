import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { hashPassword, verifyPassword } from "@/lib/password";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { getUserAuthRecordByEmail, getUserById, saveUserWithPassword } from "@/lib/workspace";
import { sessionInputSchema } from "@/lib/validators";
import type { UserProfile } from "@/lib/types";

function createSessionResponse(user: UserProfile, status = 200) {
  const response = NextResponse.json({ user }, { status });
  response.cookies.set(SESSION_COOKIE_NAME, user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}

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
    const payload = sessionInputSchema.parse(body);

    if (payload.mode === "signup") {
      const existingUser = await getUserAuthRecordByEmail(payload.email);

      if (existingUser?.passwordHash) {
        return NextResponse.json(
          {
            error: "An account with this email already exists. Sign in instead."
          },
          { status: 409 }
        );
      }

      const passwordHash = await hashPassword(payload.password);
      const user = await saveUserWithPassword(payload.email, passwordHash, payload.name);

      return createSessionResponse(user, 201);
    }

    const existingUser = await getUserAuthRecordByEmail(payload.email);

    if (!existingUser?.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isValidPassword = await verifyPassword(payload.password, existingUser.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const user = await getUserById(existingUser.id);

    if (!user) {
      return NextResponse.json({ error: "Your account could not be loaded." }, { status: 404 });
    }

    return createSessionResponse(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0]?.message ?? "Please enter valid account details."
        },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Unable to sign in.";
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

