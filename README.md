# Diamond Black Corporation Website & CMS

**Build • Innovate • Expand**

Production website: https://diamondblack-ph.com  
Repository: https://github.com/Fomainspi/Diamond-black

## Application
Next.js 16.4, React 19, TypeScript, Prisma 7 and PostgreSQL 16. Public website and CMS are served by the same app; administration is under /admin.

## Public website
Corporate pages: Home, About, Services, Events, News, Newsletter and Contact. Event registration at /events/register persists to PostgreSQL through the existing EventRegistration model. Newsletter signup uses the existing opt-in integration.

## CMS modules
- One first administrator; no public visitor accounts or signup.
- Password sign-in, secure HTTP-only sessions and server-side authorization.
- Dashboard and audit history.
- News/article and reusable page content with draft/published/archived status.
- Managed events, rendered on the public Events page once published.
- Private attendee search, status management and authenticated CSV export.
- Contact inbox and public contact submission API.
- Image library with JPEG/PNG/WebP/GIF allow-list, 5 MB maximum and image-signature checks.
- Organisation site settings.
- Mailchimp newsletter audience view with subscriber search, status filters and pagination; Mailchimp remains the source of truth for contacts.

## Database
Prisma 7 with PostgreSQL. Additive migration 20261106003000_cms_foundation creates CMS tables only. It does not alter or remove existing registrations. The Prisma datasource URL is configured in prisma.config.ts through DATABASE_URL.

## Local development
Use Node.js 22 and a separate development database. Set DATABASE_URL in your private local environment.

```bash
npm ci
npx prisma generate
npm run dev
```

Checks: npm run typecheck, npm run lint, npm run build.

## Docker images and database operations
The runner target is the lean Next.js web runtime. The migration target is a separate operator-only image containing Prisma CLI, migrations and the admin bootstrap script. Both must be built from the same source commit. The web container does not run migrations automatically.

```bash
docker build --target runner -t diamond-black-web:<release> .
docker build --target migration -t diamond-black-ops:<release> .
```

See docs/CMS-IMPLEMENTATION.md for safe migration and bootstrap commands, backup requirements, private-network connection and CI preservation tests.

## Administrator bootstrap
Set DATABASE_URL, ADMIN_EMAIL, ADMIN_INITIAL_PASSWORD (14+ characters), and optional ADMIN_NAME only in a private operator environment. Run the seed script from the migration image after the database migration has been applied. The bootstrap is idempotent and does not reset an existing password. Remove ADMIN_INITIAL_PASSWORD immediately after success. Login: /admin/login. There is no public sign-up or reset form.

## Production rollout gates
Back up PostgreSQL and verify the archive before migration. Confirm a recent Lightsail snapshot. Persist and back up the Docker Compose uploads_data volume mounted at /app/public/uploads. Apply the additive migration deliberately during a maintenance window, then smoke-test sign-in, published news/events, attendee export, contact inbox and media upload over HTTPS. Verify existing event registrations remain present. Keep PostgreSQL private and never commit credentials.

More detail: docs/CMS-IMPLEMENTATION.md, ARCHITECTURE.md, SECURITY.md.
