# Changelog

All notable changes to `toastcraft` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/).

## [0.1.3] - 2026-10-08

### Security

- Hardened custom design registration by validating design names before generating CSS selectors.
- Added tests covering invalid custom design names.
- Added tests verifying that toast content is escaped by default.
- Confirmed trusted HTML remains an explicit opt-in through `html: true`.
- Updated development dependencies and regenerated the package lockfile.
- Verified the project with `npm audit` with 0 vulnerabilities.

### Tests

- Expanded security-focused test coverage.
- Verified the existing toast rendering, dismissal, queueing, promise, action, custom rendering, and design behavior.

### Maintenance

- Verified TypeScript type checking.
- Verified production builds.
- Verified the npm package contents before release.

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

[0.1.3]: https://github.com/AnantDuhan/toastcraft/releases/tag/v0.1.3
[0.1.2]: https://github.com/AnantDuhan/toastcraft/releases/tag/v0.1.2
[0.1.1]: https://github.com/AnantDuhan/toastcraft/releases/tag/v0.1.1
[0.1.0]: https://github.com/AnantDuhan/toastcraft/releases/tag/v0.1.0