# Diamond Black Corporation Website & CMS

**Build • Innovate • Expand**

Production website: https://diamondblack-ph.com  
Repository: https://github.com/Fomainspi/Diamond-black

## Application
Next.js 16.4, React 19, TypeScript, Prisma 7, PostgreSQL 16, Docker Compose and Caddy. The public site and CMS run in the same application; administration is under `/admin`.

## Public website
Corporate pages: Home, About, Services, Events, News, Newsletter and Contact. Public event registration is available at `/events/register`, stored in PostgreSQL through the existing `EventRegistration` table. SMTP confirmation/notification outcomes are stored separately. Newsletter signup integrates with Mailchimp pending/double opt-in.

## CMS modules
- One initial administrator, provisioned through a controlled seed command. No public visitor signup.
- Protected sign-in/out with bcrypt password hashes and opaque session tokens in HTTP-only, SameSite cookies.
- Dashboard metrics and audit activity.
- News/article and reusable page content with draft/published/archived state.
- Event management.
- Private attendee search, status updates and authenticated CSV export.
- Contact inbox and public enquiry persistence API.
- Media library (JPEG/PNG/WebP/GIF, 5 MB maximum).
- Site settings and audit log.

## Database
PostgreSQL 16 through Prisma 7 and `@prisma/adapter-pg`. CMS tables are introduced through additive migration `20261106003000_cms_foundation`; existing EventRegistration rows are not altered or deleted.

## Local development
Use Node.js 22 and a separate development database:
```bash
npm ci
npx prisma generate
npm run dev
```
Checks: `npm run typecheck`, `npm run lint`, `npm run build`.

## Initial administrator
Set only in the private server environment: `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD` (at least 14 characters), optional `ADMIN_NAME`. In the app container after deploying the approved image:
```bash
npx prisma migrate deploy
npm run db:seed-admin
```
The seed is idempotent and does not reset an existing password. Remove `ADMIN_INITIAL_PASSWORD` immediately after successful provisioning. Login: `/admin/login`.

## Production controls
Back up and test restore PostgreSQL before applying the migration. Persist and back up `public/uploads` for media. Apply migrations deliberately during a maintenance window and test admin login, content publishing, registrations, contact messages and image uploads over HTTPS. Never expose PostgreSQL publicly or commit secrets/production data.

Documentation: [Architecture](ARCHITECTURE.md) · [Security](SECURITY.md) · [Production operations](docs/PRODUCTION-OPERATIONS.md) · [CMS implementation](docs/CMS-IMPLEMENTATION.md)
