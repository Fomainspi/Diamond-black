# Diamond Black CMS — Implementation Plan

## Product decision

Build one private CMS inside the existing Diamond Black Next.js application. Public visitors do not create accounts. Start with one administrator account; design authorization so additional administrator accounts and roles can be added later.

## Existing production capabilities to preserve

- Public corporate website and its current routes.
- PostgreSQL 16 running privately in Docker Compose.
- Prisma 7 with the existing PostgreSQL adapter.
- EventRegistration model and all existing registration records.
- Event registration API and Titan SMTP notifications.
- Existing Lightsail deployment and Caddy HTTPS proxy.

Never expose PostgreSQL publicly. Never place production credentials, registration exports, or visitor personal information in Git.

## CMS modules

1. Dashboard — summary metrics and recent activity.
2. Content — create, edit, preview, publish, unpublish, and archive news/articles and managed pages.
3. Events — create and manage events, publication state, registration availability, and event details.
4. Registrations — search and filter attendees, inspect registration/email status, and export CSV with appropriate authorization.
5. Newsletter — subscriber and campaign integration; preserve the existing provider integration and consent/unsubscribe requirements.
6. Contact inbox — securely store and manage website contact enquiries.
7. Media library — upload, validate, list, and remove approved media assets using a storage strategy suitable for the current server.
8. Settings — editable site metadata, social links, contact details, and navigation.

## Security requirements

- Private /admin area and server-side authentication.
- Password hashes only; never store plaintext passwords.
- Secure, HTTP-only, same-site session cookies with expiration and rotation.
- Protect every CMS page and API handler server-side; hiding navigation is not authorization.
- CSRF/origin protections on state-changing requests.
- Input validation, output escaping, upload type/size limits, and rate limiting.
- Least-privilege access to data; attendee and contact information must never be exposed to public endpoints.
- Audit sensitive administrator actions.
- Keep secrets in the server environment, not source control.
- Add tests for authentication, authorization, validation, and data access.

## Data and migration strategy

Extend the current Prisma schema using additive migrations. Preserve EventRegistration and its existing rows. Introduce CMS entities for administrator accounts, sessions, content, events, contact messages, media metadata, site settings, and audit events as implementation requires. Avoid duplicating newsletter subscriber data if the configured newsletter provider remains the source of truth.

## Delivery sequence

1. CMS foundation: schema, secure single-admin bootstrap, login/logout, protected layout, dashboard shell.
2. Content management: articles and managed pages.
3. Event management: event CRUD and registration management/export.
4. Contact inbox and newsletter integration.
5. Media library and site settings.
6. Security review, automated tests, backup/restore validation, and production rollout.

## Release policy

Develop on feature/diamond-black-cms-foundation. Run typecheck, lint, build, migration checks, and security tests. Review via pull request before merging. Do not deploy schema or application changes to production until the migration and rollback/backup plan are reviewed.
