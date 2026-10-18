-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT,
    "guests" INTEGER NOT NULL DEFAULT 1,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "eventName" TEXT NOT NULL DEFAULT '100 People · One Night',
    "status" "RegistrationStatus" NOT NULL DEFAULT 'CONFIRMED',
    "confirmationEmail" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "notificationEmail" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "emailError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventRegistration_email_idx" ON "EventRegistration"("email");

-- CreateIndex
CREATE INDEX "EventRegistration_createdAt_idx" ON "EventRegistration"("createdAt");

-- CreateIndex
CREATE INDEX "EventRegistration_status_idx" ON "EventRegistration"("status");
