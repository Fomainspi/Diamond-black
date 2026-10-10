# Security Policy

## Reporting a vulnerability

Please do not publish exploitable vulnerabilities, credentials, personal data, or sensitive operational details in a public issue.

Contact the repository owner privately through the contact method listed on the verified Diamond Black Corporation website or GitHub profile. If no verified security contact has been published yet, contact the repository owner privately through GitHub.

Include:
- A concise description of the issue
- Steps to reproduce in a non-production environment
- Potential impact
- Suggested mitigation, if known

Allow time for investigation and remediation before public disclosure.

## Repository security rules

- Never commit real credentials, API keys, tokens, private keys, certificates containing private material, database URLs with credentials, production data, subscriber lists, or contact submissions.
- Keep local environment files such as `.env` untracked. Commit only placeholder-based examples such as `.env.example`.
- Use least-privilege permissions for GitHub Actions and runtime identities.
- Validate all untrusted input on the server.
- Keep dependencies patched and review security advisories.
- Run secret scanning and dependency auditing before merges.
- Rotate any secret that may have been exposed; deleting it from the latest commit is not sufficient.
- Never use production data in local development or automated tests.
- Require review before production deployment.

## If a secret is committed accidentally

1. Stop using it and revoke or rotate it immediately.
2. Determine where it was exposed and review relevant access logs.
3. Remove it from the repository and, when necessary, coordinate history cleanup.
4. Do not assume deleting the file invalidates the exposed secret.
5. Record the incident and corrective actions without copying the secret into the report.
