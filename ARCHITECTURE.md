# Diamond Black — Initial Architecture

## Product scope

Diamond Black Corporation's public-facing corporate website promotes entrepreneurship, innovation, talent, networking, digital marketing, audiovisual production, and corporate events.

Public visitors can browse content, view events and news, subscribe to the newsletter, and submit a contact form. Public account creation, member profiles, entrepreneur profiles, and public login are out of scope.

A separate, authenticated administrator area will manage website content and submissions.

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
- The website should closely follow the approved black-and-gold homepage concept, not a generic corporate template.
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

Events must eventually be managed through the admin CMS, not hard-coded into components. An administrator should be able to mark one published upcoming event as featured. Past events should move into a Past Events listing based on event status/date and admin settings.

## Application architecture

Use a server-side application/API between the public frontend/admin interface and the database. The browser must never connect directly to the database. Keep the database private and restrict access to the application runtime.

Recommended logical components:
- Public website
- Server-side API/application
- Relational database
- Private admin CMS
- Email/newsletter provider integration
- Media storage

Select a concrete framework and database after checking the intended cPanel hosting plan's supported runtime, database engines, background processing, storage, and deployment constraints. Do not assume cPanel supports Docker or every Node.js runtime.

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
- Add automated secret scanning, dependency audits, tests, and build checks before deployment.

## Git and secrets

- Keep `.env` and other environment-specific files out of Git.
- Commit only safe placeholder values in `.env.example`.
- Never commit database dumps, backups, production uploads, subscriber lists, contact messages, passwords, API keys, or private keys.
- Review Git history as well as the working tree before pushing.
- If a secret is exposed, revoke/rotate it immediately.
- Keep `.gitignore` and `.dockerignore` current.

## Implementation sequence

1. Secure repository baseline and documentation.
2. Confirm hosting capabilities and choose the stack.
3. Implement the responsive design system and public page shells.
4. Add database schema and migrations.
5. Implement CMS/admin authentication and authorization.
6. Implement content management for services, events, news, and media.
7. Implement contact form and newsletter integration.
8. Add tests, CI security checks, deployment and backup documentation.
9. Review security, accessibility, SEO, mobile behavior, and performance before launch.

## Non-goals for the first release

- Public user accounts
- Entrepreneur/member profiles
- Social networking features
- Public messaging
- Unverified event registration/payment processing
- Fake company facts, unverified social links, or invented contact details
