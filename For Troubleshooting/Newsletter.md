# Newsletter Troubleshooting Runbook

**Project:** Diamond Black Corporation CMS  
**Scope:** Public newsletter signup and the newsletter subscription lifecycle.

This runbook is about the public signup experience and subscription status. The Mailchimp administrator dashboard and Mailchimp API integration have their own detailed runbook in [Mailchimp.md](./Mailchimp.md).

## 1. Understand the newsletter flow

The public newsletter signup and the administrator's Mailchimp audience dashboard are related but distinct functions.

The existing public signup flow uses a pending/double-opt-in process. A new subscriber may therefore be recorded as pending until the person completes the confirmation step.

The Mailchimp CMS integration described in this project is an administrative, read-only view of audience statistics and subscribers. It does not replace the public signup flow, create a second local subscriber database, or send campaigns.

Do not assume that a pending subscriber is a failed signup. First determine whether confirmation is still required.

## 2. Reproduce the issue carefully

Record:

- The public page where the signup form appears.
- The approximate time of submission.
- Whether the browser showed a success or error message.
- Whether the subscriber received a confirmation email.
- Whether the subscriber completed the confirmation link.
- Whether the issue affects one address or multiple test addresses.

Use a controlled test address that you are authorized to access. Do not use real subscriber personal information in screenshots or shared logs.

## 3. Check the public signup in the browser

1. Open the public website.
2. Submit a test subscription using an authorized test email address.
3. Record the exact user-visible result.
4. Open browser Developer Tools.
5. Select the Network tab and repeat the submission.
6. Inspect the signup request's HTTP status and response body.
7. Do not copy request headers, cookies or secrets into shared notes.

Interpret the result carefully:

- A successful response means the application accepted the request; it does not necessarily mean double-opt-in confirmation is complete.
- A pending status may be expected while the confirmation email is awaiting action.
- A validation response may indicate an invalid or already-used address.
- A server error requires inspection of the application logs.

## 4. Inspect production application logs

Run on Lightsail from the project directory:

```bash
cd ~/diamond-black
sudo docker compose logs --since=10m --tail=150 app
```

Explanation:

- `cd ~/diamond-black`: enters the production project directory.
- `--since=10m`: limits logs to the last ten minutes.
- `--tail=150`: limits the output to the latest 150 lines.
- `app`: reads only the application service logs.

Reproduce the signup and inspect the relevant timestamp. Redact email addresses and any personal data before sharing log excerpts.

## 5. Distinguish signup issues from confirmation-email issues

If the application accepts the signup but no confirmation email arrives, investigate the configured email-delivery mechanism and its logs/monitoring. Do not assume the Mailchimp administrator dashboard is responsible.

For this project, the public signup's double-opt-in behavior should remain unchanged unless a deliberate product decision and code change are approved.

Check:

1. Was the signup request accepted?
2. Was the subscriber left in the expected pending state?
3. Was a confirmation message requested by the application?
4. Is the configured email provider healthy?
5. Is the message in spam/junk?
6. Did the user complete the confirmation link?

The exact email provider and current delivery implementation should be confirmed from the current code and production configuration before changing anything.

## 6. Check the administrator newsletter page

The CMS administrator newsletter page provides a view into the connected audience. If the public signup works but the admin page fails to display audience data, use [Mailchimp.md](./Mailchimp.md).

If the admin page redirects to login, authenticate first. A redirect from a protected route while unauthenticated is expected.

## 7. Safe production diagnostics

### Check application status

```bash
sudo docker compose ps app
```

Shows whether the Next.js application container is running.

### Inspect recent logs

```bash
sudo docker compose logs --since=5m --tail=100 app
```

Use immediately after reproducing a signup or confirmation issue.

### Follow logs during a test

```bash
sudo docker compose logs -f app
```

Streams new app log lines. Stop the stream with `Ctrl+C`; the container continues running.

### Check all Compose services

```bash
sudo docker compose ps
```

Useful if the application depends on another service that may be unavailable.

## 8. What not to change during diagnosis

- Do not disable double opt-in merely to make a subscriber appear active.
- Do not create a second local subscriber database without an approved architecture change.
- Do not switch email providers or alter provider credentials based only on a missing email report.
- Do not expose API keys, SMTP passwords, cookies, email addresses or full request headers.
- Do not restart or delete database services to troubleshoot a single signup.

## 9. Verification checklist

After a fix, verify the complete lifecycle:

- [ ] Public signup form loads.
- [ ] Valid test address is accepted.
- [ ] Application returns the expected response.
- [ ] Subscriber enters the expected pending/confirmation state.
- [ ] Confirmation message is delivered, if required by the configured flow.
- [ ] Confirmation link completes the expected process.
- [ ] Administrator view reflects the correct audience/subscriber state, where applicable.
- [ ] No new application errors appear in logs.

Record the deployed commit SHA and image tag with the test result.
