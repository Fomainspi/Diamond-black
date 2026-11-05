import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_INITIAL_PASSWORD;
const name = process.env.ADMIN_NAME || "Diamond Black Administrator";

if (!email || !password || password.length < 14 || !process.env.DATABASE_URL) {
  throw new Error("Set DATABASE_URL, ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD (minimum 14 characters).");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

try {
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log("Administrator already exists; no changes made.");
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.adminUser.create({
      data: { email, name, passwordHash, role: "SUPER_ADMIN" },
    });
    console.log("Administrator created. Remove ADMIN_INITIAL_PASSWORD from the environment now.");
  }
} finally {
  await prisma.$disconnect();
}
