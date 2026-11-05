# Diamond Black CMS

The CMS runs inside the existing Diamond Black Next.js application. Public visitors do not create accounts. The first administrator is provisioned using a controlled one-time server command; the data model supports future SUPER_ADMIN and EDITOR roles.

## Modules
- Protected administrator sign-in/out, bcrypt password hashing, opaque random session tokens stored as SHA-256 digests, HTTP-only SameSite cookies and seven-day expiry.
- Dashboard metrics and audit activity.
- News/article and reusable page content editing with draft, published and archived state; published news has public article routes.
- Event management with dates, venue, publication state and registration configuration.
- Private attendee search, status updates and authenticated CSV export.
- Contact inbox and enquiry intake API.
- Media library: JPEG/PNG/WebP/GIF, 5 MB maximum, file-signature verification.
- Site settings and administrator audit log.

## Additive migration and existing data
Migration `20261106003000_cms_foundation` creates CMS tables and enums only. It does not alter or delete the existing EventRegistration table or its rows. Back up PostgreSQL and test restoration before applying it to production.

## Initial administrator bootstrap
Configure only in the server's private environment: `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD` (at least 14 characters), and optional `ADMIN_NAME`. After deploying the feature image, run inside the application container:
```bash
npx prisma migrate deploy
npm run db:seed-admin
```
The seed is idempotent and does not reset an existing password. Remove `ADMIN_INITIAL_PASSWORD` from the runtime environment immediately after success. Sign in at `/admin/login`. There is no public sign-up or password-reset route.

## Production gates
- Back up and test restore PostgreSQL before migration rollout.
- Media is stored in `public/uploads`; persist and back up this directory. Move to object storage before horizontal scaling or ephemeral app containers.
- Set one-time admin credentials privately; never commit them.
- Apply migrations deliberately during a controlled change window, not automatically at build or container startup.
- Verify HTTPS admin login, publishing, attendee export, public contact submission and media upload before switching traffic.
- Review privacy notice and retention policy for contact and attendee data.
- Keep PostgreSQL on the private Docker network only.

## Validation
CI runs lockfile-based install, Prisma generation, TypeScript check, ESLint, Next build, production Docker build and runtime dependency inspection.
