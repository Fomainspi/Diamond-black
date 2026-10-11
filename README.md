# Diamond Black Corporation Website

**Build • Innovate • Expand**

A premium corporate website for Diamond Black Corporation, focused on entrepreneurship, innovation, talent, networking, digital marketing, audiovisual production, and corporate events.

> Project status: secure repository foundation and architecture planning. Application code has not yet been implemented.

## Product scope

The public website will include:
- Home
- About Us
- Services
- Events
- News
- Newsletter subscription
- Contact
- Privacy and other applicable legal pages

A private admin CMS will manage services, events, news, media, newsletter subscribers/campaigns, contact messages, and site settings.

Public visitors will **not** create accounts or profiles.

## Design direction

Follow the approved Diamond Black black-and-gold homepage concept and use the supplied official logo and event artwork. The visual identity is premium, elegant, cinematic, and corporate, with black/dark charcoal, metallic gold, white, restrained animation, and subtle diamond geometry.

## Featured event

**100 People — One Night**  
**New Connections. New Business.**  
Saturday, 14 November 2026 · 19:00–03:00 · Manila, Philippines

Use the supplied promotional artwork. Confirm the event timezone, end date, and official registration URL before publishing detailed schedules or enabling a registration CTA.

## Hosting decision

The initial target is **Amazon Lightsail**, starting with the Linux/Unix 2 GB plan listed at $12/month, subject to final verification before purchase.

- Monthly infrastructure budget ceiling: **US$25**.
- Initial architecture: one Linux server, Docker Compose, application container, PostgreSQL with persistent storage, and Caddy/Nginx for HTTPS.
- CI/CD: GitHub Actions for testing, build validation, and deployment.
- Do not provision cloud resources until the app is tested locally and the cost assumptions are reviewed.
- Keep database ports private. Configure firewall, secure SSH, HTTPS, backups, monitoring, and a documented restore procedure before production launch.
- Do not add paid AWS services without checking the effect on the monthly budget.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the planned system and deployment details.

## Security baseline

- Never commit real secrets, production data, database dumps, subscriber lists, or contact submissions.
- Keep local `.env` files untracked; use `.env.example` only for placeholders.
- Review `.gitignore`, `.dockerignore`, and Git history before pushing.
- Use server-side validation, least privilege, secure admin authentication, rate limiting, and secret/dependency scanning.
- Never expose PostgreSQL to the public internet.
- See [SECURITY.md](SECURITY.md).

## Newsletter backend (Mailchimp)

The public newsletter form posts to the server-side `/api/newsletter` route. The route validates input and consent, applies basic request throttling and a honeypot check, then submits new contacts to a Mailchimp audience with `pending` status so they must confirm before becoming subscribed. The API key is never sent to the browser. Subscriber records are held by Mailchimp, not copied into the local PostgreSQL database.

To enable it:

1. Create or select the Diamond Black audience in Mailchimp and copy its Audience ID.
2. Create a dedicated Mailchimp API key. Keep it private; its suffix (for example, `-us21`) identifies the data center.
3. Set these environment variables in the runtime environment (or the server's untracked `.env` file used by Docker Compose):
   - `NEWSLETTER_PROVIDER=mailchimp`
   - `NEWSLETTER_API_KEY=<your-private-api-key>`
   - `NEWSLETTER_AUDIENCE_ID=<your-audience-id>`
4. Recreate the app container after changing environment variables, then test signup with an address you control and confirm the email.
5. Verify the audience's sender/domain configuration and unsubscribe preferences in Mailchimp before sending campaigns.

Do not paste API keys into GitHub source files or chat. `.env.example` contains placeholders only. The API returns a service-unavailable message until all three settings are configured. The in-memory request throttle is suitable only for the current single-app instance; use a shared rate limiter before scaling to multiple app instances.

## Implementation sequence

1. Finalize and review the secure repository foundation.
2. Build the responsive public website and design system.
3. Add PostgreSQL schema and migrations.
4. Implement secure admin authentication and CMS.
5. Add contact form, newsletter consent/unsubscribe, and email delivery.
6. Add automated tests, Docker Compose, and CI checks.
7. Review the deployment cost and provision Lightsail.
8. Configure HTTPS, firewall, backups, monitoring, and automated deployment.
9. Complete security, accessibility, SEO, mobile, performance, and recovery checks.

No production credentials, provider keys, or real subscriber/contact data belong in this repository.
