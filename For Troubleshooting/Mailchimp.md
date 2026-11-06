# Mailchimp Integration Troubleshooting Runbook

**Project:** Diamond Black Corporation CMS  
**Integration:** Mailchimp  
**Affected area:** CMS administrator newsletter dashboard  
**Production:** https://diamondblack-ph.com/admin/newsletter

This runbook records the Mailchimp integration issue investigated on November 7, 2026, the root cause, the code correction and the production deployment steps.

## 1. Understand the integration

The CMS Mailchimp integration provides a read-only administrator view of audience information, including audience statistics and subscriber records, with search, status filtering and pagination.

The integration does not:
- Maintain a duplicate local subscriber database.
- Replace the public newsletter signup flow.
- Change the existing double-opt-in behavior.
- Modify contacts or send campaigns through this admin view.

Keep public signup troubleshooting separate from Mailchimp API/dashboard troubleshooting. See [Newsletter.md](./Newsletter.md) for the public signup lifecycle.

## 2. Mailchimp configuration values

The application needs the relevant provider configuration, including:

- Newsletter provider selection.
- Mailchimp API key.
- Audience ID.
- Mailchimp data-center code.

The production data-center value during the incident was `us20`.

Never print the API key or paste the contents of `.env` into a chat, issue or log.

## 3. Safe configuration verification

Run this command on the production server from `~/diamond-black`:

```bash
sudo docker compose exec app node -e '
const e=process.env;
const dc=e.NEWSLETTER_DATA_CENTER||"";
console.log("Provider:",JSON.stringify(e.NEWSLETTER_PROVIDER||""));
console.log("API key present:",Boolean(e.NEWSLETTER_API_KEY?.trim()));
console.log("Audience ID present:",Boolean(e.NEWSLETTER_AUDIENCE_ID?.trim()));
console.log("Data center:",JSON.stringify(dc));
console.log("Data center valid:",/^[a-z]{2}\d+$/.test(dc));
'
```

Explanation:

- `docker compose exec app`: runs a command inside the running app container.
- `node -e`: executes the supplied short JavaScript program.
- `process.env`: reads environment variables available to the app process.
- The API key and audience ID are checked only for presence; their values are never printed.
- The regular expression checks the two-letter-plus-digits data-center format, such as `us20`.

Expected shape of the output:

```text
Provider: "mailchimp"
API key present: true
Audience ID present: true
Data center: "us20"
Data center valid: true
```

This confirms presence and format only. It does not prove that the API key is accepted by Mailchimp or that the audience ID is correct.

## 4. Incident: valid data center rejected by application validation

### Symptom

The Mailchimp dashboard displayed a connection/configuration problem even though the production environment contained the data-center value `us20`.

The environment checks showed:

- Provider was configured as Mailchimp.
- API key was present.
- Audience ID was present.
- Data center was `us20`.
- The application considered the data center invalid.

### Root cause

The original validation accepted only one letter before the digits:

```typescript
const keyDataCenter = apiKey?.match(/-([a-z]\d+)$/i)?.[1]?.toLowerCase();
const validDataCenter = Boolean(dataCenter && /^[a-z]\d+$/.test(dataCenter));
```

This incorrectly rejected a valid two-letter prefix such as `us20`.

### Code correction

The validation was changed to accept two letters followed by digits:

```typescript
const keyDataCenter = apiKey?.match(/-([a-z]{2}\d+)$/i)?.[1]?.toLowerCase();
const validDataCenter = Boolean(dataCenter && /^[a-z]{2}\d+$/.test(dataCenter));
```

The change allows a data-center code such as `us20` to pass the format validation and allows the API-key suffix extraction to recognize the two-letter prefix.

This was a validation correction. It did not change the configured production data center.

## 5. GitHub change and release record

The fix was developed on:

```text
fix/mailchimp-data-center-validation
```

The change was submitted through PR #19:

https://github.com/Fomainspi/Diamond-black/pull/19

The fix commit was:

```text
6e00c694defecad531b4c2df31fcb625430513db
```

The merged main commit used for the production image was:

```text
25787ad7b62e4620839e9d7526053346e99e85db
```

The corresponding production image tag was:

```text
fomawill/diamond-black-app:25787ad7b62e4620839e9d7526053346e99e85db
```

## 6. Deployment issue: production continued using an old image

After the code fix was merged and GitHub Actions published the image, the server still resolved the app service to an older SHA.

The Compose file contained:

```yaml
image: ${APP_IMAGE:-fomawill/diamond-black-app:latest}
```

This syntax means:
- If `APP_IMAGE` is defined, Compose uses its value.
- The `latest` tag is only a fallback when `APP_IMAGE` is not defined.

### Inspect the configured image line

```bash
grep -n "fomawill/diamond-black-app" compose.yaml docker-compose.yml docker-compose.prod.yml 2>/dev/null
```

Explanation:
- `grep -n` searches the named files and prints matching line numbers.
- `2>/dev/null` suppresses errors for optional files that do not exist.
- This command does not display environment-file contents.

### Inspect only the effective APP_IMAGE value

```bash
sudo docker compose config --environment | grep '^APP_IMAGE='
```

During the incident, this showed the old value:

```text
APP_IMAGE=fomawill/diamond-black-app:1d542befb784f4690cd07ac106135c117dd671c9
```

This identified the stale override.

### Check whether .env exists and inspect permissions

```bash
ls -l .env
```

This shows file metadata and permissions, not its contents. The incident file had restrictive owner-only permissions.

### Safely update only APP_IMAGE

The following script changes only the `APP_IMAGE=` line in `.env`. It does not print other variables.

```bash
python3 - <<'PY'
from pathlib import Path

env_file = Path(".env")
lines = env_file.read_text().splitlines()

new_image = "fomawill/diamond-black-app:25787ad7b62e4620839e9d7526053346e99e85db"

matches = [i for i, line in enumerate(lines) if line.startswith("APP_IMAGE=")]

if len(matches) > 1:
    raise SystemExit("ERROR: Multiple APP_IMAGE entries found. No changes made.")

if matches:
    lines[matches[0]] = f"APP_IMAGE={new_image}"
else:
    lines.append(f"APP_IMAGE={new_image}")

env_file.write_text("\n".join(lines) + "\n")
print("APP_IMAGE updated successfully.")
print("New image:", new_image)
PY
```

The script:
1. Reads `.env` locally.
2. Finds the `APP_IMAGE=` entry.
3. Stops without writing if multiple entries are found.
4. Replaces only that entry, or adds it if absent.
5. Prints only the new image reference.

### Verify the resolved image before pulling

```bash
sudo docker compose config --images
```

Confirm that the app image is the expected SHA-tagged image.

## 7. Pull and deploy the corrected image

### Pull the image

```bash
sudo docker compose pull app
```

Downloads the image configured for the app service. This does not itself replace the running container.

### Recreate only the app container

```bash
sudo docker compose up -d --no-deps app
```

- `-d` runs in the background.
- `--no-deps` avoids recreating dependency services.
- `app` targets only the Next.js service.

This was used to deploy the correction without intentionally restarting PostgreSQL or Caddy.

### Verify the image and container status

```bash
sudo docker compose ps app
```

The incident verification showed:

```text
IMAGE: fomawill/diamond-black-app:25787ad7b62e4620839e9d7526053346e99e85db
STATUS: Up
```

### Verify Next.js startup

```bash
sudo docker compose logs --tail=40 app
```

The observed startup included:

```text
▲ Next.js 16.4.0
✓ Ready in 0ms
✓ Running next.config took 1.5ms
```

## 8. Test the Mailchimp dashboard

1. Open https://diamondblack-ph.com/admin/newsletter.
2. Sign in with the authorized administrator account.
3. Hard-refresh with `Ctrl+Shift+R`.
4. Confirm that audience statistics and subscriber data display.
5. If the page still fails, reproduce the issue and immediately inspect recent app logs.

### Inspect recent logs after reproducing a failure

```bash
sudo docker compose logs --since=3m --tail=100 app
```

This limits the output to recent app logs. Review any provider error status and message, but redact personal data and secrets.

## 9. If the dashboard still fails

Use this diagnostic order:

1. Verify provider, API-key presence, audience-ID presence and data-center format using the safe Node command in section 3.
2. Confirm the app container runs the intended image SHA.
3. Confirm Next.js started successfully.
4. Reproduce the dashboard request.
5. Inspect recent app logs for the Mailchimp API response.
6. If the application configuration is valid but the provider rejects the request, investigate the actual HTTP status and provider message.

Do not guess at credentials or change the data center without evidence.

Possible investigation directions, depending on the observed response:

- Authentication/authorization response: verify that the configured key is current and has the required permissions.
- Not-found response: verify the audience identifier and account/data-center pairing.
- Network or timeout response: investigate outbound connectivity and provider availability.
- Application validation failure: inspect the current validation code and add a regression test.

These are diagnostic possibilities, not conclusions about any unobserved failure.

## 10. Regression prevention

Add automated tests for the data-center format and API-key suffix parsing.

At minimum, tests should cover:

- A valid two-letter code such as `us20`.
- Other valid two-letter-plus-digit codes.
- Missing or empty data-center configuration.
- Malformed values.
- API-key suffix extraction with a two-letter prefix.
- Mismatch between configured data center and API-key suffix, if the integration enforces that comparison.

Run the repository's actual test and build scripts before merging. Confirm the GitHub Actions workflow succeeds and publish the image for the merged commit.

## 11. Safety reminders

- Never print or share `.env` contents.
- Never reveal Mailchimp API keys, cookies or authorization headers.
- Do not use `docker compose down -v` or remove volumes to fix an API integration.
- Do not restart PostgreSQL to fix a validation bug in the Next.js app.
- Prefer immutable commit-SHA image tags over relying only on `latest`.
- Confirm the deployed image with `sudo docker compose ps app`.
- Verify the actual dashboard in a browser after deployment.

## 12. Incident outcome

The production deployment was successful:

- The validation accepted the configured `us20` data center.
- The server was updated from the old SHA image to the merged PR #19 image.
- Only the app service was recreated using `--no-deps`.
- Next.js started successfully.
- The Mailchimp administrator dashboard displayed its data.

**Key lesson:** A successful code merge and image publication do not guarantee that production is running that image. Always verify the effective Compose image reference and the running container tag.
