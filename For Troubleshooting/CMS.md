# CMS Troubleshooting Runbook

**Project:** Diamond Black Corporation CMS  
**Repository:** https://github.com/Fomainspi/Diamond-black  
**Production:** https://diamondblack-ph.com  
**Production host:** AWS Lightsail (Ubuntu)  
**Runtime:** Docker Compose, Next.js, PostgreSQL and Caddy

This runbook covers general CMS availability, administrator access, application startup, database connectivity, content modules and safe production deployment.

## 1. Understand the production services

The production Compose stack has included these services:

- `app`: Next.js CMS application, listening on container port 3000.
- `db`: PostgreSQL database.
- `caddy`: Reverse proxy and HTTPS entry point.
- `uploads-init`: initialization helper for uploaded-file storage.

Confirm the current service names in the production Compose file; they can change as the project evolves.

## 2. First-response checks

Run these commands on the Lightsail server, from the production project directory.

### Confirm the directory

```bash
cd ~/diamond-black
pwd
```

- `cd` changes into the production project directory.
- `pwd` prints the current directory so you can confirm you are operating in the correct location.

### Check all services

```bash
sudo docker compose ps
```

Shows each Compose service, its container, status and published ports. Look for services that are exited, restarting or unhealthy.

### Check the application only

```bash
sudo docker compose ps app
```

Shows the app container status and the image tag it is configured to run.

### Check the resolved image references

```bash
sudo docker compose config --images
```

Prints the image references after Compose variable substitution. Use this to verify that the intended production image is selected.

### Validate Compose configuration

```bash
sudo docker compose config --quiet
```

Checks whether Compose can parse and resolve the configuration. It does not prove that containers or the application are healthy.

## 3. Inspect application logs

### Last 40 lines

```bash
sudo docker compose logs --tail=40 app
```

Shows recent application output. Look for startup errors, missing configuration, database connection failures and runtime exceptions.

### Last 100 lines

```bash
sudo docker compose logs --tail=100 app
```

Use when the issue needs more context.

### Logs from the last three minutes

```bash
sudo docker compose logs --since=3m --tail=100 app
```

Useful immediately after reproducing an issue. It narrows the output to recent events.

### Follow logs live

```bash
sudo docker compose logs -f app
```

Streams new log lines. Press `Ctrl+C` to stop following; this does not stop the container.

### Check Caddy and database logs

```bash
sudo docker compose logs --tail=80 caddy
sudo docker compose logs --tail=80 db
```

Use these when the problem may be related to HTTPS/reverse proxy routing or database startup. The commands only read logs.

## 4. Administrator login and protected routes

The CMS uses administrator authentication and protected admin routes. An unauthenticated request to a protected page may correctly redirect to the login page; that redirect alone is not a failure.

Useful browser checks:

1. Open the admin login page.
2. Sign in using the authorized administrator account.
3. Open the affected admin module.
4. Use a hard refresh (`Ctrl+Shift+R`) if the browser may be showing cached assets.
5. Check the browser developer tools Network and Console tabs for failed requests.

A redirect to `/admin/login` when not authenticated is expected behavior. Do not disable authentication to troubleshoot a redirect.

### Inspect app logs while reproducing a login issue

```bash
sudo docker compose logs --since=3m --tail=100 app
```

Reproduce the issue in the browser, then inspect the recent logs. Do not share cookies, authorization headers, session tokens or passwords.

## 5. Database troubleshooting

### Check database container status

```bash
sudo docker compose ps db
```

Look for `Up` and, if configured, `healthy`.

### Inspect recent database logs

```bash
sudo docker compose logs --tail=100 db
```

Look for initialization errors, authentication failures, storage errors or repeated restarts.

### Check whether the database accepts connections

If the Compose service is named `db` and the image includes `pg_isready`, run:

```bash
sudo docker compose exec db pg_isready
```

This checks PostgreSQL readiness. It does not validate application-level queries or credentials.

### Important database safety

- Never run `docker compose down -v` to troubleshoot the CMS.
- Never remove the database volume as a first response.
- Do not run migrations manually unless the migration procedure for the current release is understood.
- Before a schema migration or risky database operation, create and verify a recoverable database backup.
- Application image rollback does not automatically reverse database migrations.

## 6. CMS modules and feature-level troubleshooting

The CMS foundation includes administrator access, dashboard/audit logging, content entries, managed events, attendee management, contact messages, media assets and site settings. Event registration data is a separate existing data area that must be preserved.

When one module fails but the rest of the site works:

1. Record the exact URL and action that fails.
2. Determine whether the issue affects all administrators or one session.
3. Reproduce it once while watching application logs.
4. Inspect the browser Network tab for the failed request and HTTP status.
5. Check whether the failure is limited to one module or affects the whole app.
6. Avoid changing database records directly until the relevant model and expected behavior are understood.

For media problems, check both the application response and the persistent uploaded-file storage. Do not delete or recreate upload volumes as a troubleshooting shortcut.

## 7. Deployment troubleshooting

### Inspect the configured app image

```bash
sudo docker compose config --images
```

### Inspect the APP_IMAGE override without printing the full environment file

```bash
sudo docker compose config --environment | grep '^APP_IMAGE='
```

Compose uses `APP_IMAGE` when it is defined. The fallback in the Compose file is used only when the variable is not set. An old value in the environment can therefore keep production on an old image.

### Pull the configured application image

```bash
sudo docker compose pull app
```

Downloads the image currently selected by the Compose configuration. It does not, by itself, replace the running container.

### Recreate only the app service

```bash
sudo docker compose up -d --no-deps app
```

- `-d`: run in the background.
- `--no-deps`: do not recreate dependency services.
- `app`: target only the application service.

This is the controlled deployment command used for the Mailchimp validation fix. It does not intentionally restart PostgreSQL or Caddy.

### Verify the app after deployment

```bash
sudo docker compose ps app
sudo docker compose logs --tail=40 app
```

Confirm the expected SHA-tagged image, an `Up` status and successful Next.js startup.

## 8. Git and CI/CD checks

On the developer workstation, inside the repository:

```bash
git status
git fetch origin
git branch -vv
git log --oneline --graph --decorate --all -20
```

- `git status`: shows current branch and local changes.
- `git fetch origin`: refreshes remote-tracking information without changing working files.
- `git branch -vv`: shows local branches and their upstream tracking status.
- `git log ...`: visualizes recent commits and branch relationships.

Synchronize local main safely:

```bash
git switch main
git pull --ff-only origin main
git log -1 --oneline
```

- `git switch main`: switches to main.
- `git pull --ff-only`: updates only when Git can fast-forward; it will stop rather than create an unexpected merge.
- `git log -1`: displays the current main commit.

After a feature branch is merged, confirm GitHub Actions completed successfully and published the image for the merged commit before deploying it.

## 9. Backup and recovery principles

Before a risky release, migration or storage operation, confirm that you have recoverable copies of:

- PostgreSQL data (a database dump and/or verified Lightsail snapshot).
- Uploaded media files and their persistent volume.
- Deployment configuration, stored securely.
- The last known-good Docker image SHA.

A backup is not verified merely because a command completed. Confirm that the backup file exists, has a plausible size and can be restored using a tested procedure.

Do not copy secrets into this runbook. Protect backup files because database dumps and environment configuration may contain sensitive information.

## 10. Escalation checklist

Before asking for help, collect:

- Exact page or action that fails.
- Approximate time of the failure.
- Output of `sudo docker compose ps`.
- Relevant redacted app/Caddy/database log lines.
- Current app image tag from `sudo docker compose ps app`.
- Latest merged Git commit SHA.
- Whether the problem affects the public site, admin login or one CMS module.

Never include the contents of `.env`, passwords, API keys, cookies, session tokens or full authorization headers.
