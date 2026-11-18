# Security Policy

Cybrsoft Browser is a web browser; security is a core requirement, not a
feature. See `docs/ARCHITECTURE.md §15` for the security model and its
documented limitations.

## Reporting a vulnerability
**Please do not open a public issue for security vulnerabilities.**

**Preferred:** use **GitHub Private Vulnerability Reporting** — open the repo's
**Security** tab → **Report a vulnerability**. This is a private channel straight
to the maintainers; no email address is needed. *(Enable it once in repo Settings
→ Advanced Security → “Private vulnerability reporting”.)*

**Email:** a dedicated `security@` address will be published here once the
project has its own domain. A `users.noreply.github.com` address is deliberately
**not** used — GitHub does not deliver mail sent to noreply addresses, so it
cannot receive reports.

Include: affected version/commit, a description, reproduction steps, and impact.
We aim to acknowledge within a few business days.

Please give us reasonable time to fix and ship an update before public
disclosure. We credit reporters who wish to be credited.

## Scope
- **Cybrsoft-authored code** (tooling, prefs, chrome pages, theme, branding).
- **Engine/platform vulnerabilities** originate upstream in Firefox/Gecko. We
  address them by **rebasing to the fixed Firefox ESR release promptly** — this
  is the core maintenance commitment (see `docs/REBASE.md`). If you find an
  engine bug, report it to Mozilla as well.

## Upstream security tracking
We pin a specific Firefox ESR (`config/cybrsoft.conf`) and run an automated
weekly check (`.github/workflows/esr-watch.yml`) that flags new ESR security
releases so they are not missed. Users stay protected only if these rebases are
applied — treat ESR security releases as *act within days*, emergency releases
as *act now*.

## What we do not promise
We make **no** claim of immunity to tracking, fingerprinting, malware, or
exploitation. Each protection has documented limits (ARCHITECTURE §8, §15).
Keeping the browser updated is essential.
