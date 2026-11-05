# Diamond Black — Application and Production Architecture

**Last reviewed: 6 November 2026**

## Current implementation status
The public website is deployed on Amazon Lightsail. The production stack includes Next.js, PostgreSQL 16, Docker Compose and Caddy. Public event registration persists to PostgreSQL and transactional email delivery has been verified. The private CMS is a planned milestone; it is not implemented or deployed. There is currently no administrator login.

## Product scope
The public website promotes Diamond Black Corporation's entrepreneurship, innovation, talent, networking, digital marketing, audiovisual production and corporate events. Public visitors can browse public content, view events/news, subscribe to the newsletter and register for events. Public account creation, member profiles and public login are out of scope.

## Current production topology

```text
Public visitors
   | HTTP :80 / HTTPS :443
   v
Caddy reverse proxy
   v
Next.js application container (:3000)
   | Prisma 7 + @prisma/adapter-pg + pg
   v
PostgreSQL 16 container (:5432)
   v
postgres_data named volume

Application -> SMTP provider (event email)
Application -> Mailchimp API (newsletter double opt-in)
```

- Host: Amazon Lightsail, Ubuntu 24.04.
- Runtime: Docker Engine and Docker Compose.
- Application: Next.js 16.4 standalone production build.
- Reverse proxy: Caddy.
- Database: PostgreSQL 16 Alpine container.
- Private Docker bridge network: `app-internal`.
- Persistent database volume: `postgres_data`.
- App reaches PostgreSQL as `db:5432` on the internal network.
- PostgreSQL is not published on a public host port.

A Docker volume persists data through ordinary container recreation; it is not an independent backup. Off-host backup retention and restore testing must be verified separately.

## Application stack
Next.js 16.4, React 19, TypeScript, PostgreSQL 16, Prisma 7, `@prisma/adapter-pg`, `pg`, Nodemailer, Mailchimp API, Docker Compose, Caddy and GitHub Actions.

The browser calls server-side Next.js routes and never connects directly to PostgreSQL.

## Implemented database model
The current Prisma schema contains one implemented application model: `EventRegistration`.

| Field | Purpose |
|---|---|
| `id` | Registration identifier (CUID) |
| `fullName` | Attendee full name |
| `email` | Attendee email address |
| `phone` | Contact phone number |
| `company` | Optional company/organization |
| `guests` | Number of attendees, default 1 |
| `consent` | Contact consent flag |
| `eventName` | Event label, default 100 People · One Night |
| `status` | `CONFIRMED` or `CANCELLED` |
| `confirmationEmail` | Participant email status |
| `notificationEmail` | Administrator notification status |
| `emailError` | Non-secret delivery diagnostic |
| `createdAt`, `updatedAt` | Record timestamps |

Indexes exist on email, creation time and registration status. Schema: `prisma/schema.prisma`. Initial migration: `prisma/migrations/20261017235123_create_event_registration/migration.sql`.

The production database name is `diamond_black_dev`, with configured application user `diamondblack`. These are configuration identifiers, not credentials. The actual password and complete DATABASE_URL remain private in the server environment.

The shared Prisma client is initialized in `src/lib/prisma.ts` using `PrismaPg` and `DATABASE_URL`. Schema changes should be additive, committed as migrations and preserve existing registration records. Production migrations require backup, review and explicit approval.

## Implemented event registration workflow
- Public page: `/events/register`.
- API: `POST /api/events/register`.
- Implementation: `src/app/events/register/page.tsx` and `src/app/api/events/register/route.ts`.

The browser submits name, email, phone, optional company, attendee count, consent and a honeypot field. The server verifies origin/host, enforces a request-size limit, applies a basic in-memory rate limit and honeypot, validates/normalizes input, saves the registration through Prisma, then independently attempts the attendee confirmation and administrator notification through SMTP. It stores the outcome of each email attempt as `PENDING`, `SENT` or `FAILED` and records a non-secret diagnostic.

The database save happens before email delivery. A failed email does not discard the saved registration. The in-memory rate limiter is suitable only as a basic control for the current single instance; it is not shared across replicas or restarts.

The deployed Titan SMTP configuration has been tested for attendee confirmation and administrator notification. The sender address must be authorized by the configured SMTP mailbox. Never include SMTP credentials in Git or documentation.

## Implemented newsletter workflow
- API: `POST /api/newsletter`.
- Implementation: `src/app/api/newsletter/route.ts`.

The route validates email and consent, checks origin/host, applies a basic in-memory rate limit and honeypot, then creates a Mailchimp audience member with `status: pending`. The contact must complete provider confirmation. Newsletter subscribers are held by Mailchimp, not duplicated in the local PostgreSQL schema.

## Planned CMS architecture
The CMS will remain part of this Next.js modular monolith and use the existing PostgreSQL database. Public visitors will not create accounts. The first release is for one administrator, with an extensible design for additional administrators and roles.

Planned modules: protected `/admin` and administrator authentication; dashboard; content/page publishing; event management; private registration search/filter and CSV export; contact inbox; validated media library; site settings; Mailchimp-integrated newsletter management; and audit log.

Planned entities include administrator accounts/sessions, content, managed events, contact messages, media metadata, site settings and audit records. These are future design targets, not current database tables. The CMS must preserve the existing `EventRegistration` model and data.

## Security requirements
- No public account registration.
- Established password hashing and server-side authorization.
- Secure, HttpOnly, SameSite cookies and HTTPS in production.
- CSRF/origin protection for state-changing operations.
- Server-side validation, output encoding, request limits and rate limiting.
- Safe parameterized database access through Prisma.
- Upload size/type/content validation; never execute uploaded content.
- No secrets or personal data in client bundles, public API responses, logs, source maps or test fixtures.
- Privacy-conscious consent and newsletter unsubscribe handling.
- Audit sensitive admin actions without logging credentials or tokens.
- Least privilege for app, database, CI/CD and hosting.
- Keep database on private Docker network; secure SSH and host firewall.
- Automated secret scanning, dependency auditing, tests and build checks.
- Documented backup, restore, patching and incident-response procedures.

## CI and production image
GitHub Actions installs dependencies, generates Prisma Client, runs TypeScript type-checking and ESLint, builds Next.js and the Docker image, and checks that Prisma runtime dependencies are present.

The standalone output currently traces Prisma Client, `@prisma/adapter-pg` and `pg` for the event registration route. When CMS API routes use Prisma, extend `outputFileTracingIncludes` to cover those routes and add runtime-image checks.

## Operations and change control
See [docs/PRODUCTION-OPERATIONS.md](docs/PRODUCTION-OPERATIONS.md) for safe production inspection, registration query examples and backup/change-control cautions. Never run destructive database commands or production migrations without a verified backup and approved plan.

Keep `.env` and secrets out of Git. Never commit database dumps, production registrations, subscriber lists, contact submissions, passwords, API keys or private keys. Rotate any exposed secret.

## Non-goals for the first release
Public user accounts, member profiles, social networking, public messaging, Kubernetes, microservices, a load balancer or a separate managed database without a documented need and budget approval.
