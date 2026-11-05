import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPrismaClient } from "@/lib/prisma";

const COOKIE_NAME = "diamond_black_admin";
const SESSION_DURATION_DAYS = 7;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

export async function createAdminSession(adminId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 86400000);
  await getPrismaClient().adminSession.create({
    data: { adminId, tokenHash: hash(token), expiresAt },
  });
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentAdmin() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const db = getPrismaClient();
  const session = await db.adminSession.findUnique({
    where: { tokenHash: hash(token) },
    include: { admin: true },
  });
  if (!session) return null;
  if (session.expiresAt <= new Date() || !session.admin.active) {
    await db.adminSession.delete({ where: { id: session.id } });
    return null;
  }
  return session.admin;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function destroyAdminSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (token) {
    await getPrismaClient().adminSession.deleteMany({ where: { tokenHash: hash(token) } });
  }
  (await cookies()).delete(COOKIE_NAME);
}

export async function writeAudit(
  adminId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>,
) {
  await getPrismaClient().auditLog.create({
    data: { adminId, action, entityType, entityId, details: details as object | undefined },
  });
}
