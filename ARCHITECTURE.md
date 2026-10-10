# Diamond Black — Initial Architecture

## Product scope

Diamond Black Corporation's public-facing corporate website promotes entrepreneurship, innovation, talent, networking, digital marketing, audiovisual production, and corporate events.

Public visitors can browse content, view events and news, subscribe to the newsletter, and submit a contact form. Public account creation, member profiles, entrepreneur profiles, and public login are out of scope.

A private, authenticated administrator area will manage website content and submissions.

## Initial public pages

- Home
- About Us
- Services
- Events
- News
- Newsletter
- Contact
- Privacy Policy
- Terms of Use, if required
- Cookie information, where applicable

## Brand and visual direction

- Use the supplied official Diamond Black logo assets.
- Premium black, dark charcoal, metallic/dark gold, white and diamond/platinum highlights.
- Elegant corporate typography, generous spacing, restrained motion, subtle diamond geometry, and high-quality business/event photography.
- Closely follow the approved black-and-gold homepage concept, not a generic corporate template.
- Header includes Home, About Us, Services, Events, News, Newsletter, Contact, and verified social links.
- Footer includes company summary, navigation, services, verified social links, newsletter signup, legal links, copyright, and the BUILD • INNOVATE • EXPAND tagline.

## Featured event

Initial event artwork supplied by the owner:
- Title: 100 People — One Night
- Message: New Connections. New Business.
- Date: Saturday, 14 November 2026
- Time: 19:00–03:00 (confirm timezone and whether the end time is on the following day before publishing detailed schedules)
- Location: Manila, Philippines
- Category/positioning: Business • Networking • Nightlife

Display the event in a featured-event section on the homepage and as the lead item on the Events page. An optional slim announcement strip may appear above the header while the event is upcoming. Use the supplied artwork as provided; do not recreate its embedded text. Confirm the official registration URL before enabling the Register Now button.

Events must be managed through the admin CMS, not hard-coded into components. An administrator should be able to mark one published upcoming event as featured. Past events should move into a Past Events listing based on event status/date and admin settings.

## Hosting and deployment decision

The initial hosting target is **Amazon Lightsail**, using a Linux/Unix instance with public IPv4, starting with the $12/month 2 GB RAM plan, subject to a final pricing and capacity check before provisioning.

Budget ceiling: **US$25/month for hosting and related infrastructure**. The application design must avoid unplanned paid services and must not assume that every AWS service is included in the instance price. Review snapshots, email delivery, storage, domain renewal, taxes, and any optional services separately. Do not provision resources until the app has been tested locally and the cost plan is reviewed.

Initial deployment model:
- One Lightsail Linux server.
- Docker Engine and Docker Compose.
- Reverse proxy (Caddy is the initial candidate) to terminate HTTPS and route requests.
- Application container for the website and server-side API.
- PostgreSQL container with persistent storage and restricted network exposure.
- Persistent media storage with a documented backup/restore approach.
- External email delivery provider, such as Amazon SES, only after sender/domain verification and production access are configured.
- GitHub Actions for tests, build validation, and deployment automation.

Keep the design modular so components can be moved to managed services later if traffic, recovery requirements, or budget justify it. Do not introduce Kubernetes, microservices, a load balancer, or a separate managed database for the initial release without a documented need and budget approval.

## Application architecture

Use a server-side application/API between the public frontend/admin interface and the database. The browser must never connect directly to PostgreSQL. The database must not be exposed to the public internet.

Preferred stack:
- Next.js with TypeScript for public pages and the admin interface.
- PostgreSQL for relational data.
- Prisma or another mature type-safe ORM, with committed schema migrations.
- Docker and Docker Compose for consistent local and production environments.
- Caddy or Nginx as the HTTPS reverse proxy.
- GitHub Actions for CI checks and deployment.

Keep the first release as a secure modular monolith rather than microservices. Re-evaluate the stack only if a concrete compatibility or maintenance issue is discovered.

## Initial data model

Planned entities:
- administrators and roles
- services
- events
- news articles and categories
- newsletter subscribers and consent/subscription status
- newsletter campaigns and delivery logs
- contact messages
- media metadata
- site settings
- audit logs

Use schema migrations, server-side validation, foreign keys, unique constraints, and appropriate indexes.

## Security requirements

- No public account registration.
- Secure administrator authentication and role-based authorization.
- Password hashing using a modern, established password-hashing library.
- Secure, HttpOnly, SameSite cookies and HTTPS in production.
- CSRF protection where applicable, rate limiting, security headers, output encoding, and server-side validation.
- Parameterized database queries or a safe ORM.
- Upload size/type/content validation; never execute uploaded content.
- Do not expose secrets or personal data in client bundles, API responses, logs, source maps, screenshots, or test fixtures.
- Newsletter unsubscribe and privacy-conscious consent records.
- Audit sensitive administrative actions without logging credentials or tokens.
- Use least-privilege access for application, database, CI/CD, and hosting accounts.
- Restrict database access to the private Docker network; do not publish its port on the server's public interfaces.
- Configure a host firewall to allow only necessary public ports (normally SSH, HTTP, and HTTPS), and secure SSH access.
- Add automated secret scanning, dependency audits, tests, and build checks before deployment.
- Document patching, backup, restore, incident response, and cost review procedures.

## Git and secrets

- Keep `.env` and other environment-specific files out of Git.
- Commit only safe placeholder values in `.env.example`.
- Never commit database dumps, backups, production uploads, subscriber lists, contact messages, passwords, API keys, or private keys.
- Review Git history as well as the working tree before pushing.
- If a secret is exposed, revoke/rotate it immediately.
- Keep `.gitignore` and `.dockerignore` current.
- Use GitHub Actions secrets or another appropriate secret store for deployment credentials; never place credentials in workflow files.

## Implementation sequence

1. Secure repository baseline and documentation.
2. Confirm stack and cost assumptions for the Lightsail target.
3. Implement the responsive design system and public page shells.
4. Add database schema and migrations.
5. Implement CMS/admin authentication and authorization.
6. Implement content management for services, events, news, and media.
7. Implement contact form and newsletter integration.
8. Add tests, CI security checks, Docker Compose, and deployment documentation.
9. Provision Lightsail only after local tests and cost review.
10. Configure domain, HTTPS, firewall, backups, monitoring, and automated deployment.
11. Review security, accessibility, SEO, mobile behavior, performance, and recovery before launch.

## Non-goals for the first release

- Public user accounts
- Entrepreneur/member profiles
- Social networking features
- Public messaging
- Unverified event registration/payment processing
- Fake company facts, unverified social links, or invented contact details
- Kubernetes or a multi-service cloud architecture without a clear requirement
