# Diamond Black CMS

The CMS is integrated into the existing Diamond Black Next.js application. Public visitors do not create accounts. The first administrator is provisioned by a controlled one-time server command. Data roles support later SUPER_ADMIN and EDITOR accounts.

## Modules
- Protected administrator login/logout; password-derived scrypt hashes, random opaque sessions stored as SHA-256 digests, HTTP-only SameSite cookies and seven-day expiry.
- Dashboard metrics and audit activity.
- News/article and reusable page content editing with draft/published/archived state; public published-news list and article routes.
- Managed events with date, venue, publication and registration settings; published managed events appear on the existing public Events page.
- Private attendee search, status management and authenticated CSV export.
- Contact form intake API and private inbox.
- Media library, image signature checks, 5 MB limit and persistent Compose volume.
- Site settings and audit records.

## Prisma 7 configuration
The Prisma schema is in prisma/schema.prisma. The datasource URL is supplied through prisma.config.ts using DATABASE_URL. Keep the connection string in the private server environment; never commit it. Prisma commands must run with DATABASE_URL set.

## Additive migration / preservation
Migration 20261106003000_cms_foundation creates CMS tables and enums only. It does not alter, truncate or delete the existing EventRegistration table or rows. Back up PostgreSQL and verify the backup archive before production migration. A restore test should be performed against a separate disposable database, never over production.

## Docker image responsibilities
- runner is the lean Next.js web runtime. It contains the generated Prisma Client, PostgreSQL adapter and driver, but intentionally does not contain Prisma CLI or migration sources.
- migration is a separate operator-only Docker target built from the same commit. It contains the Prisma CLI, Prisma config, migration directory and administrator bootstrap script. It is never started automatically with the website and does not replace the web container.

Build both targets from the same checked-out commit:

```bash
docker build --target runner -t diamond-black-web:<release> .
docker build --target migration -t diamond-black-ops:<release> .
```

Run the migration image only after the database backup and deployment window are approved. Connect it to the Compose private network and provide only DATABASE_URL through the deployment secret mechanism:

```bash
docker run --rm --network <compose-private-network> \\
  -e DATABASE_URL \\
  diamond-black-ops:<release> npx prisma migrate deploy
```

The shell running this command must have DATABASE_URL exported securely. Do not put credentials directly in shell history or paste them into chat. The command is repeatable; Prisma applies only migrations not already recorded as complete.

## First administrator
Set DATABASE_URL, ADMIN_EMAIL, ADMIN_INITIAL_PASSWORD (at least 14 characters), and optional ADMIN_NAME only in a private operator environment. Run the seed script from the same operations image, attached to the same private network:

```bash
docker run --rm --network <compose-private-network> \\
  -e DATABASE_URL -e ADMIN_EMAIL -e ADMIN_NAME -e ADMIN_INITIAL_PASSWORD \\
  diamond-black-ops:<release> node --experimental-strip-types prisma/seed-admin.ts
```

The seed is idempotent and never resets an existing password. Remove ADMIN_INITIAL_PASSWORD from the operator environment immediately after provisioning. Sign in at /admin/login; there is no public signup or password reset. Do not pass the initial password to the web service permanently.

## CI safety tests
CI builds both Docker targets, applies all migrations to a disposable PostgreSQL 16 service, verifies a second migration run is a no-op, inserts a registration sentinel and confirms it survives, and runs the administrator bootstrap script against the same disposable database. This tests the operational image independently from the web runtime.

## Production checklist
- Back up PostgreSQL and verify the archive can be listed; test restore separately.
- Confirm a recent Lightsail snapshot exists before the change window.
- Confirm the uploads_data Compose volume is mounted at /app/public/uploads; include it in server backups.
- Build web and operations images from the exact same source commit.
- Apply migration during a controlled change window, not during image build/start.
- Provision admin credentials privately; remove the initial password after successful provisioning.
- Smoke-test HTTPS login, published news/events, attendee export, public contact form and image uploads.
- Verify existing registrations remain present.
- Review privacy notice and retention periods for personal data.
- PostgreSQL remains on the private Docker network.
