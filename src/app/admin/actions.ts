"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  createAdminSession,
  destroyAdminSession,
  getCurrentAdmin,
  writeAudit,
} from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
});

export async function loginAdmin(formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/login?error=invalid");

  const email = parsed.data.email.trim().toLowerCase();
  const db = getPrismaClient();
  const admin = await db.adminUser.findUnique({ where: { email } });
  const valid = admin?.active
    ? await bcrypt.compare(parsed.data.password, admin.passwordHash)
    : false;

  if (!admin || !valid) redirect("/admin/login?error=invalid");

  await createAdminSession(admin.id);
  await db.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  await writeAudit(admin.id, "auth.login", "AdminUser", admin.id);
  redirect("/admin");
}

export async function logoutAdmin() {
  const admin = await getCurrentAdmin();
  await destroyAdminSession();
  if (admin) await writeAudit(admin.id, "auth.logout", "AdminUser", admin.id);
  redirect("/admin/login");
}
