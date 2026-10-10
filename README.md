# Diamond Black Corporation Website

**Build • Innovate • Expand**

A premium corporate website for Diamond Black Corporation, focused on entrepreneurship, innovation, talent, networking, digital marketing, audiovisual production, and corporate events.

> Project status: planning and secure foundation. The application stack and production hosting requirements still need to be confirmed before implementation.

## Product scope

The public website will include:
- Home
- About Us
- Services
- Events
- News
- Newsletter subscription
- Contact

A private admin CMS will manage services, events, news, media, newsletter subscribers/campaigns, contact messages, and site settings.

Public visitors will **not** create accounts or profiles.

## Design direction

Follow the approved Diamond Black black-and-gold homepage concept and use the supplied official logo and event artwork. The visual identity is premium, elegant, cinematic, and corporate, with black/dark charcoal, metallic gold, white, restrained animation, and subtle diamond geometry.

## Featured event

**100 People — One Night**  
**New Connections. New Business.**  
Saturday, 14 November 2026 · 19:00–03:00 · Manila, Philippines

The supplied promotional artwork should appear in a featured section on the homepage and at the top of the Events page. Confirm the official registration URL and event timezone before publishing the registration CTA and detailed event schedule.

## Security baseline

- Never commit real secrets, production data, database dumps, subscriber lists, or contact submissions.
- Keep local `.env` files untracked; use `.env.example` only for placeholders.
- Review `.gitignore`, `.dockerignore`, and Git history before pushing.
- Use server-side validation, least privilege, secure admin authentication, rate limiting, and secret/dependency scanning.
- See [SECURITY.md](SECURITY.md) and [ARCHITECTURE.md](ARCHITECTURE.md).

## Next steps

1. Confirm the cPanel hosting plan's supported application runtime and database.
2. Choose the implementation stack based on those constraints.
3. Build the responsive public website and design system.
4. Add database migrations and secure admin CMS.
5. Add newsletter and contact integrations.
6. Add CI checks, tests, deployment instructions, and backup/restore procedures.

No production credentials, provider keys, or real subscriber/contact data belong in this repository.
