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

## Additive migration / preservation
Migration `20261106003000_cms_foundation` creates CMS tables and enums only. It does not alter, truncate or delete the existing EventRegistration table or rows. Back up PostgreSQL and test restore before production migration.

## First administrator
Set only in private server environment: `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD` (at least 14 characters), and optional `ADMIN_NAME`. Inside the application container:
```bash
npx prisma migrate deploy
npm run db:seed-admin
```
The seed is idempotent and never resets an existing password. Remove `ADMIN_INITIAL_PASSWORD` immediately after provisioning. Sign in at `/admin/login`; there is no public signup or password reset.

## Production checklist
- Back up and test restore before migrations.
- `uploads_data` Compose volume is mounted to `/app/public/uploads`; include it in server backups.
- Apply migration during a controlled change window, not during image build/start.
- Provision admin credentials privately; do not commit secrets.
- Smoke-test HTTPS login, published news/events, attendee export, public contact form and image uploads.
- Review privacy notice and retention periods for personal data.
- PostgreSQL remains on the private Docker network.
