# Mailchimp integration in the CMS

Diamond Black keeps Mailchimp as the source of truth for newsletter contacts. The CMS reads the existing Mailchimp Audience; it does not import, copy, or migrate contacts into PostgreSQL.

## Server configuration

Set these variables in the private production environment (never commit them):

- `NEWSLETTER_PROVIDER=mailchimp`
- `NEWSLETTER_API_KEY=<Mailchimp API key>`
- `NEWSLETTER_AUDIENCE_ID=<existing Audience ID>`

The API key's data-center suffix (for example, `-usX`) is used to select the Mailchimp API host. The key must have permission to read audience and campaign data. Keep it server-side only.

The public signup endpoint retains double opt-in and sends new contacts to the same configured Audience with `status=pending`.

## CMS audience module

The protected route `/admin/newsletter` reads live audience totals and contacts from Mailchimp. It supports status filtering, name/email search, and pagination. Contact records are not duplicated in the Diamond Black database. If Mailchimp is unavailable or configuration is incomplete, the page displays a safe operational error and does not expose credentials.

## Campaign publishing safeguards

Campaign creation and sending are a separate next milestone. Before enabling sends, verify the sender identity/domain in Mailchimp and implement draft → preview → test send → explicit final confirmation. Never send a campaign merely because a draft was saved.
