# Changelog

All notable changes to `toastcraft` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Security

- Harden custom design registration by validating design names before generating CSS selectors.
- Keep user-provided HTML behind the explicit `html: true` opt-in.
- Keep the default toast content rendering HTML-safe through `textContent`.
- Keep custom icon HTML as an explicitly trusted-input API.

### Maintenance

- Keep development dependencies and `package-lock.json` up to date.
- Verify the package with tests, type checking, production build, and npm audit before releases.

## [0.1.2] - 2026-10-07

### Changed

- Updated package metadata and release information.
- Improved toast stacking behavior.
- Updated the documentation and playground.
- Added additional toast customization and configuration improvements.

### Fixed

- Fixed minor issues across the toast rendering and configuration flow.

## [0.1.1]

### Added

- Added additional toast customization capabilities.
- Improved toast configuration and presentation behavior.

## [0.1.0]

### Added

- Initial public release of `toastcraft`.
- Framework-agnostic toast notifications.
- TypeScript support.
- Multiple built-in toast designs.
- Multiple toast positions.
- Toast animations.
- Light, dark, and automatic themes.
- Auto-dismiss and manual dismissal.
- Pause on hover and focus loss.
- Progress indicators.
- Swipe-to-dismiss support.
- Toast queues and maximum visible toast limits.
- Stacked toast presentation.
- Promise-based toast handling.
- Toast actions.
- Custom icons.
- Custom rendering.
- Custom designs.
- Accessibility support.
- Reduced-motion support.
- SSR-safe initialization.

[Unreleased]: https://github.com/AnantDuhan/toastcraft/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/AnantDuhan/toastcraft/releases/tag/v0.1.2
[0.1.1]: https://github.com/AnantDuhan/toastcraft/releases/tag/v0.1.1
[0.1.0]: https://github.com/AnantDuhan/toastcraft/releases/tag/v0.1.0