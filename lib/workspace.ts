import { prisma } from "@/lib/prisma";
import type { UserProfile } from "@/lib/types";

const legacyEmail = "local-owner@expense.local";
const palette = ["#165fa8", "#2d7dd2", "#4c9ce2", "#6fb5ff", "#3b82c4"];

type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  avatarColor: string;
};

function toUserProfile(user: UserRecord): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarColor: user.avatarColor
  };
}

function buildNameFromEmail(email: string) {
  const root = email.split("@")[0] ?? "User";

  return (
    root
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") || "User"
  );
}

function buildColorFromEmail(email: string) {
  const hash = [...email.toLowerCase()].reduce((total, char) => total + char.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

async function ensureLegacyOwner() {
  const legacyUser = await prisma.user.upsert({
    where: {
      email: legacyEmail
    },
    update: {
      name: "Local Owner",
      passwordHash: null,
      avatarColor: "#165fa8"
    },
    create: {
      email: legacyEmail,
      name: "Local Owner",
      passwordHash: null,
      avatarColor: "#165fa8"
    }
  });

  await prisma.$executeRawUnsafe(
    'UPDATE "Expense" SET "userId" = ? WHERE "userId" IS NULL',
    legacyUser.id
  );
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getUserAuthRecordByEmail(email: string) {
  await ensureLegacyOwner();

  return prisma.user.findUnique({
    where: {
      email: normalizeEmail(email)
    }
  });
}

export async function saveUserWithPassword(email: string, passwordHash: string, name?: string) {
  await ensureLegacyOwner();

  const normalizedEmail = normalizeEmail(email);
  const nextName = name?.trim() || buildNameFromEmail(normalizedEmail);
  const avatarColor = buildColorFromEmail(normalizedEmail);

  const user = await prisma.user.upsert({
    where: {
      email: normalizedEmail
    },
    update: {
      name: nextName,
      passwordHash,
      avatarColor
    },
    create: {
      email: normalizedEmail,
      name: nextName,
      passwordHash,
      avatarColor
    }
  });

  return toUserProfile(user);
}

export async function getUserById(userId: string) {
  await ensureLegacyOwner();

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  return user ? toUserProfile(user) : null;
}
