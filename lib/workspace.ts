import { prisma } from "@/lib/prisma";
import type { UserProfile } from "@/lib/types";

const legacyEmail = "local-owner@expense.local";
const palette = ["#165fa8", "#2d7dd2", "#4c9ce2", "#6fb5ff", "#3b82c4"];

function toUserProfile(user: {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
}): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarColor: user.avatarColor
  };
}

function buildNameFromEmail(email: string) {
  const root = email.split("@")[0] ?? "User";

  return root
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "User";
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
      avatarColor: "#165fa8"
    },
    create: {
      email: legacyEmail,
      name: "Local Owner",
      avatarColor: "#165fa8"
    }
  });

  await prisma.$executeRawUnsafe(
    'UPDATE "Expense" SET "userId" = ? WHERE "userId" IS NULL',
    legacyUser.id
  );
}

export async function findOrCreateUserByEmail(email: string, name?: string) {
  await ensureLegacyOwner();

  const normalizedEmail = email.trim().toLowerCase();
  const nextName = name?.trim() || buildNameFromEmail(normalizedEmail);
  const avatarColor = buildColorFromEmail(normalizedEmail);

  const user = await prisma.user.upsert({
    where: {
      email: normalizedEmail
    },
    update: name?.trim()
      ? {
          name: nextName,
          avatarColor
        }
      : {
          avatarColor
        },
    create: {
      email: normalizedEmail,
      name: nextName,
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