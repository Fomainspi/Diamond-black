# Mailchimp integration in the CMS

Diamond Black keeps Mailchimp as the source of truth for newsletter contacts. The CMS reads the existing Mailchimp Audience; it does not import, copy, or migrate contacts into PostgreSQL.

## Server configuration

Set these variables in the private production environment (never commit credentials):

- `NEWSLETTER_PROVIDER=mailchimp`
- `NEWSLETTER_API_KEY=<Mailchimp API key>`
- `NEWSLETTER_AUDIENCE_ID=<existing Audience ID>`
- `NEWSLETTER_DATA_CENTER=<Mailchimp data center, for example us20>`

The explicit `NEWSLETTER_DATA_CENTER` setting selects the Mailchimp API host (for example, `us20` uses `https://us20.api.mailchimp.com/3.0`). It must contain only the data-center identifier, not a URL. For backward compatibility, the application can still infer the data center from the API key suffix when this setting is omitted. Keep the API key server-side only.

The API key must have permission to read the configured Audience. The public signup endpoint retains double opt-in and sends new contacts to the same configured Audience with `status=pending`.

## CMS audience module

The protected route `/admin/newsletter` reads live audience totals and contacts from Mailchimp. It supports status filtering, name/email search, and pagination. Contact records are not duplicated in the Diamond Black database. If Mailchimp is unavailable or configuration is incomplete, the page displays a safe operational error and does not expose credentials.

## Campaign publishing safeguards

Campaign creation and sending are a separate next milestone. Before enabling sends, verify the sender identity/domain in Mailchimp and implement draft → preview → test send → explicit final confirmation. Never send a campaign merely because a draft was saved.
