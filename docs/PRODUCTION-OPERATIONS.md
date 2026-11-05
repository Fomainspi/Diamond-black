# Production Operations — Database and Event Registration

**Last reviewed: 6 November 2026**

This runbook documents the implemented production database and public event-registration workflow. It contains no passwords, database URLs, attendee records or production secrets.

## Production components

| Component | Current configuration |
|---|---|
| Hosting | Amazon Lightsail |
| Operating system | Ubuntu 24.04 |
| Runtime | Docker Engine / Docker Compose |
| Web application | Next.js standalone container |
| Reverse proxy | Caddy |
| Database | PostgreSQL 16 Alpine container |
| Database name | diamond_black_dev |
| Database user | diamondblack |
| Internal database host | db:5432 |
| Persistent volume | postgres_data |
| ORM | Prisma 7 with @prisma/adapter-pg |

The database port is not published to the public host. The app connects to PostgreSQL using Docker service hostname db on the private app-internal network. DATABASE_URL is supplied from the private server environment.

The configured database name diamond_black_dev does not mean production data is a development database. Do not rename it casually; the application configuration depends on it.

## Database schema and migration

The current implemented Prisma model is EventRegistration.

Initial migration:
prisma/migrations/20261017235123_create_event_registration/migration.sql

The migration creates:
- RegistrationStatus enum: CONFIRMED, CANCELLED.
- EmailStatus enum: PENDING, SENT, FAILED.
- EventRegistration table.
- Indexes on email, createdAt and status.

The table stores attendee name, email, phone, optional company, guest count, consent, event name, registration status, separate participant/admin email delivery statuses, a non-secret email diagnostic and timestamps.

Schema source: prisma/schema.prisma.

## Event registration workflow

Public page: https://diamondblack-ph.com/events/register

API: POST /api/events/register

The server validates the request and saves the registration first. It then independently attempts:
1. Confirmation to the attendee.
2. New-registration notification to the configured event notification mailbox.

One email failing does not prevent the other attempt. The saved registration is retained if email delivery fails. The route updates confirmationEmail, notificationEmail and emailError with the delivery outcomes.

Titan is the configured SMTP provider. Runtime settings are private environment variables. The sender must be authorized by the configured SMTP mailbox. Do not change sender aliases without verifying send-as authorization with the provider.

## Newsletter is separate

POST /api/newsletter validates email and consent and sends the address to Mailchimp with pending/double-opt-in status. Newsletter contacts are held by Mailchimp and are not stored in local PostgreSQL.

## Safe production inspection

Connect to the Lightsail server through your normal SSH method. Do not paste .env contents or database credentials into chat, tickets or screenshots.

Enter the application directory:

~~~bash
cd ~/diamond-black
~~~

Inspect running services:

~~~bash
sudo docker compose ps
~~~

Open a PostgreSQL prompt inside the database container:

~~~bash
sudo docker compose exec db psql -U diamondblack -d diamond_black_dev
~~~

Read-only SQL examples inside psql:

~~~sql
-- List tables
\dt

-- Inspect the registration table structure
\d "EventRegistration"

-- Count registrations
SELECT COUNT(*) FROM "EventRegistration";

-- Count registrations by status
SELECT "status", COUNT(*)
FROM "EventRegistration"
GROUP BY "status"
ORDER BY "status";

-- Review email delivery outcomes without attendee details
SELECT "confirmationEmail", "notificationEmail", COUNT(*)
FROM "EventRegistration"
GROUP BY "confirmationEmail", "notificationEmail"
ORDER BY "confirmationEmail", "notificationEmail";

-- Exit psql
\q
~~~

Queries that return names, email addresses, phone numbers or company details expose personal data. Only authorized operators should inspect individual records. Do not paste real rows into public issues, pull requests, screenshots or chat.

## Container logs

Use logs for diagnosis, but inspect them before sharing; logs may contain request details or user-supplied values.

~~~bash
sudo docker compose logs --tail=100 app
sudo docker compose logs --tail=100 db
~~~

Avoid commands that print resolved environment configuration, such as docker compose config or printenv, in shared terminals because output may contain secrets.

## Persistence is not backup

The named postgres_data volume persists across ordinary container recreation. It does not protect against host loss, volume corruption, accidental deletion, ransomware or operator error.

Before production CMS migrations or other risky database changes:
1. Confirm application and database health.
2. Create a database backup using an approved procedure.
3. Store it outside the same server/volume with restricted access and encryption.
4. Verify the backup is non-empty and record its timestamp.
5. Test restore into a separate non-production environment.
6. Review the migration and rollback/recovery plan.
7. Obtain explicit approval before applying the migration to production.

**Backup automation, off-host retention and a tested restore procedure must be confirmed as operational. This document does not claim they are already configured.**

## Production change controls

- Never run prisma migrate reset, DROP DATABASE, TRUNCATE or destructive SQL against production.
- Do not use prisma db push as a substitute for reviewed production migrations.
- Commit Prisma schema and migration changes together.
- Test migrations against a disposable development database.
- Preserve existing event registrations during additive schema changes.
- Apply production migrations only after backup, review and explicit approval.
- Keep production .env private and access-restricted on the host.
- Never commit credentials or production data.

## Current limitations and follow-up work

- Registration uses an in-memory rate limiter. It is a basic single-instance control and is not shared across replicas or restarts.
- There is no private admin interface to browse registrations yet. Authorized operators can inspect records directly in PostgreSQL using the commands above.
- There is no CMS export workflow yet.
- The CMS must add authenticated server-side access controls before exposing registration details in an admin UI.
- Backup automation, off-host retention and restore testing still need explicit operational verification.
