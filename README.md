# Diamond Black Corporation Website & CMS

**Build • Innovate • Expand**

Production website: https://diamondblack-ph.com  
Repository: https://github.com/Fomainspi/Diamond-black

## Application
Next.js 16.4, React 19, TypeScript, Prisma 7, PostgreSQL 16, Docker Compose and Caddy. The public site and administration CMS are in the same application under `/admin`.

## Public website
Corporate pages: Home, About, Services, Events, News, Newsletter and Contact. Event registration at `/events/register` persists to PostgreSQL using the existing `EventRegistration` model. SMTP confirmation/notification outcomes are stored independently. Newsletter signup integrates with Mailchimp pending/double opt-in.

## CMS modules
- One initial administrator, provisioned by a controlled seed command; no public visitor accounts or signup.
- Protected sign-in/out using bcrypt password hashes, opaque session tokens and HTTP-only SameSite cookies.
- Dashboard metrics and audit history.
- News/article and reusable page content with draft/published/archived state.
- Event management.
- Private attendee search, status management and authenticated CSV export.
- Contact inbox and enquiry API.
- Media library (JPEG/PNG/WebP/GIF, maximum 5 MB).
- Site settings and audit log.

## Database
PostgreSQL 16 via Prisma 7 and `@prisma/adapter-pg`. CMS tables are introduced by additive migration `20261106003000_cms_foundation`. Existing EventRegistration rows are not altered or deleted.

## Local development
Use Node.js 22 and a separate development database:
```bash
npm ci
npx prisma generate
npm run dev
```
Run `npm run typecheck`, `npm run lint` and `npm run build` before changes are merged.

## Initial administrator provisioning
Set only in the private server environment: `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD` (at least 14 characters) and optional `ADMIN_NAME`. After deploying code, run inside the app container:
```bash
npx prisma migrate deploy
npm run db:seed-admin
```
The seed is idempotent and does not reset existing passwords. Remove `ADMIN_INITIAL_PASSWORD` immediately after provisioning. Login at `/admin/login`.

## Production controls
Back up and test restore PostgreSQL before migration. Persist and back up `public/uploads`. Apply the migration during a controlled change window and test admin login, publishing, registrations, contact messages and media upload over HTTPS. Keep PostgreSQL private. Never commit secrets or production data.

Documentation: [Architecture](ARCHITECTURE.md) · [Security](SECURITY.md) · [Production operations](docs/PRODUCTION-OPERATIONS.md) · [CMS implementation](docs/CMS-IMPLEMENTATION.md)
