# Contributing to toastcraft

Thanks for helping out. Bug reports, docs fixes, new designs and framework adapters are all welcome, and you don't need to be an expert to contribute.

If you're new here, look for issues labelled [`good first issue`](https://github.com/AnantDuhan/toastcraft/labels/good%20first%20issue). Comment on one before you start, so two people don't work on the same thing.

## What's in this repository

| Path | What it is |
| --- | --- |
| `src/` | The `toastcraft` core: `toaster.ts` (behavior), `styles.ts` (all 15 designs), `types.ts`, `icons.ts` |
| `test/` | Tests for the core, run with Vitest |
| `demo/` | Source for the playground (`template.html`) and the ngx-toastr migration guide (`migrate.html`) |
| `docs/` | The built website, served at [toastcraft.netlify.app](https://toastcraft.netlify.app). Generated: don't edit by hand |
| `angular/` | Angular workspace for the `ngx-toastcraft` package and its demo app |

## Setup

You need Node.js 20 or newer. The repo includes an `.nvmrc`, so `nvm use` picks the right version.

```bash
git clone https://github.com/AnantDuhan/toastcraft.git
cd toastcraft
npm install
```

### Core package commands

```bash
npm test             # run the tests
npm run typecheck    # check types
npm run build        # build dist/
npm run demo         # build the library, then the website into docs/
```

To try your change in a browser, run `npm run demo` and open `docs/index.html`.

### Angular package commands

```bash
cd angular
npm install
npm run test:lib     # unit tests for ngx-toastcraft
npm run build:lib    # build the package
npm run demo         # serve the Angular demo app at http://localhost:4200
```

## Making a change

1. Fork the repo and create a branch from `main`, for example `fix/stacked-rtl` or `feat/swipe-direction`.
2. Make your change. Add or update a test for any change in behavior.
3. Run the checks for the package you changed:
   - Core: `npm run typecheck && npm test`
   - Angular: `cd angular && npm run test:lib && npm run build:lib`
4. If you changed `src/` or `demo/`, run `npm run demo` and commit the updated `docs/` too, so the website matches the code.
5. Add a line to `CHANGELOG.md` under `## [Unreleased]`. Create that heading if it doesn't exist.
6. Open a pull request and fill in the template.

### Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add swipe direction option
fix(stacked): keep newest toast on top in RTL
docs: explain zoneless change detection
feat(angular): add signal-based toast state
```

Use `(angular)` as the scope for changes to `ngx-toastcraft`.

## Adding a design

All built-in designs live in the `DESIGNS` object in `src/styles.ts`. A new built-in design should:

- support every toast type (`success`, `error`, `warning`, `info`, `default`, `loading`) and both light and dark themes
- work with actions, the progress bar, stacked mode and right-to-left text
- use the existing CSS variables (`--tc-bg`, `--tc-fg`, `--tc-accent` and so on) so users can still theme it
- not depend on web fonts that aren't already installed on the user's system

Check it in the playground with `npm run demo` before opening a pull request, and include a screenshot of it in light and dark mode.

If a design is very specific to your own app, it may fit better as a custom design with `registerDesign()` than as a built-in one. Open an issue first if you're unsure.

## Reporting bugs

Use the [bug report form](https://github.com/AnantDuhan/toastcraft/issues/new/choose). A minimal reproduction, such as a StackBlitz link or a short code snippet, makes a bug much faster to fix.

Found a security problem? Don't open a public issue. Follow [SECURITY.md](./SECURITY.md) instead.

## Releases

Releases are published by the maintainer. You don't need to bump versions in your pull request.

## Code of conduct

This project follows the [Code of Conduct](./CODE_OF_CONDUCT.md). By taking part, you agree to follow it.
