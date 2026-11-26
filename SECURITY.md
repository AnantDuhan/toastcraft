# Security policy

## Supported versions

Security fixes are released for the latest version of each package.

| Package | Supported |
| --- | --- |
| `toastcraft` | Latest `0.1.x` |
| `ngx-toastcraft` | Latest `0.1.x` |

## Reporting a vulnerability

**Please don't report security problems in a public issue.**

Report them privately instead, in either of these ways:

- Use GitHub's [private vulnerability reporting](https://github.com/AnantDuhan/toastcraft/security/advisories/new).
- Email **duhananant@gmail.com** with "toastcraft security" in the subject.

Include the package and version, what an attacker could do, and steps or code to reproduce it.

You'll get a reply within 7 days. Once the problem is confirmed, a fix will be released as soon as possible, and you'll be credited in the release notes unless you'd rather not be.

## Good to know

toastcraft escapes all text by default. The `html: true` option renders HTML as-is, so only use it with content you trust. A report that `html: true` renders the HTML it was given is expected behavior, not a vulnerability.
