# For Troubleshooting

This folder contains separate operational runbooks for diagnosing and resolving issues in the Diamond Black CMS.

## Runbooks

| File | Scope |
|---|---|
| [CMS.md](./CMS.md) | CMS application, administrator access, production services, database and deployment troubleshooting |
| [Newsletter.md](./Newsletter.md) | Public newsletter subscription flow, confirmation status and signup troubleshooting |
| [Mailchimp.md](./Mailchimp.md) | Mailchimp API configuration, data-center validation, audience dashboard and integration troubleshooting |

## How to use these documents

1. Identify which part of the system is failing.
2. Open the matching runbook.
3. Start with the read-only checks.
4. Compare the observed output with the expected result.
5. Make one controlled change at a time.
6. Verify the service and the affected feature after the change.
7. Record the date, commit SHA, image tag, commands run and outcome.

## Production safety rules

- Never paste the contents of `.env`, API keys, passwords, cookies, session tokens or database credentials into tickets or chat.
- Do not run destructive Docker commands such as `docker compose down -v` or `docker volume prune` as routine troubleshooting.
- Do not delete PostgreSQL volumes or uploaded-media volumes to fix an application problem.
- Prefer read-only inspection before changing configuration or restarting services.
- Use a commit-SHA-tagged application image for reproducible deployments.
- Back up the database and uploaded files before risky changes, migrations or storage operations.
- A successful container start does not prove that the feature works. Test the actual user-facing workflow.
- The commands in these runbooks are operational examples. Confirm the current Compose service names, scripts and paths in the repository before running commands.

## Command conventions

- Commands beginning with `sudo docker compose` are intended for the production Lightsail host, from the directory containing the production Compose file.
- Git commands are intended for a developer workstation unless explicitly stated otherwise.
- Replace placeholders such as `<COMMIT_SHA>`, `<RUN_ID>` and `<SERVER_IP>` with verified values.
- Do not type the angle-bracket placeholders literally.
