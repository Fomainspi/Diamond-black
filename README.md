# Diamond Black Corporation Website

**Build • Innovate • Expand**

A Next.js corporate website for Diamond Black Corporation.

> **Status — 6 November 2026:** The public website is deployed on Amazon Lightsail. PostgreSQL persistence and public event registration are implemented and working in production. Transactional event emails have been verified. The private CMS is planned but is not yet implemented or deployed.

## Live services
- Website: https://diamondblack-ph.com
- Event registration: https://diamondblack-ph.com/events/register
- Repository: https://github.com/Fomainspi/Diamond-black

## Implemented: public event registration
The 100 People · One Night registration form is available at `/events/register` and submits to `POST /api/events/register`.

The server checks the request origin/host and size, applies a basic in-memory rate limit and honeypot, validates required fields, email format, attendee count and consent, then saves the registration to PostgreSQL through Prisma. It subsequently attempts the attendee confirmation and administrator notification independently through SMTP. Each email outcome is stored separately as `PENDING`, `SENT` or `FAILED`; a failed email does not discard a saved registration.

Registration data is private server-side data. There is currently no public endpoint that lists registrations and no CMS interface for browsing them.

## Implemented: database
- PostgreSQL 16 (Alpine container image).
- Prisma 7 with `@prisma/adapter-pg` and the `pg` driver.
- Prisma schema: [`prisma/schema.prisma`](prisma/schema.prisma).
- Initial migration: [`prisma/migrations/20261017235123_create_event_registration/migration.sql`](prisma/migrations/20261017235123_create_event_registration/migration.sql).
- Current implemented model: `EventRegistration`.
- Production database name: `diamond_black_dev`; configured application user: `diamondblack`.
- The app connects internally to `db:5432` on a private Docker network. PostgreSQL is not exposed through a public host port.
- Docker named volume `postgres_data` persists database files across normal container recreation. A persistent volume is not a backup; independent backups and restore tests must be verified separately.

See [`docs/PRODUCTION-OPERATIONS.md`](docs/PRODUCTION-OPERATIONS.md) for safe inspection commands and operational guidance.

## Implemented: newsletter
`POST /api/newsletter` validates email and consent, performs basic origin/rate-limit/honeypot checks, and submits to Mailchimp using pending/double-opt-in status. Newsletter contacts are stored by Mailchimp, not duplicated in the local PostgreSQL database.

## Production architecture
The deployed stack runs on Amazon Lightsail (Ubuntu 24.04) using Docker Compose:
- Next.js standalone application container.
- PostgreSQL 16 container with persistent `postgres_data` volume.
- Caddy reverse proxy for HTTPS and application routing.
- Private Docker bridge network for application/database communication.
- Titan SMTP for transactional event email.

The application uses server-side Next.js routes; the browser never connects directly to PostgreSQL. Runtime credentials are supplied through the private server environment and must never be committed or shared.

## Technology
Next.js 16.4, React 19, TypeScript, Prisma 7, PostgreSQL 16, Docker Compose, Caddy, Nodemailer, Mailchimp API and GitHub Actions.

## CMS roadmap — not implemented yet
The next milestone is a private CMS. Public visitors will not have accounts. The first release will support one administrator, with an extensible design for additional administrators/roles later.

Planned modules: secure sign-in/sign-out and protected admin routes; dashboard; content/page publishing; event management; private registration search/filter and CSV export; contact inbox; media library; site settings; Mailchimp-integrated newsletter management; and audit records.

**There is no administrator login or deployed CMS yet.** Scope and progress are tracked in [`docs/CMS-IMPLEMENTATION.md`](docs/CMS-IMPLEMENTATION.md).

## CI and development
GitHub Actions installs dependencies, generates Prisma Client, runs type-checking and ESLint, builds Next.js and the Docker image, and checks that Prisma runtime dependencies are included.

Use Node.js 22:

```bash
npm ci
npx prisma generate
npm run dev
```

Before submitting changes:

```bash
npm run typecheck
npm run lint
npm run build
```

Use a development-only database locally. Never use production credentials or data for local development. Database changes must include reviewed Prisma migrations; do not run unreviewed migrations against production.

## Documentation
- [Architecture](ARCHITECTURE.md)
- [Security policy](SECURITY.md)
- [Production database and event registration runbook](docs/PRODUCTION-OPERATIONS.md)
- [CMS implementation scope](docs/CMS-IMPLEMENTATION.md)

The original hosting budget target is US$25/month; review actual pricing before adding infrastructure or paid services.
