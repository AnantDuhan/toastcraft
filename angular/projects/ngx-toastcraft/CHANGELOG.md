# Changelog

All notable changes to `ngx-toastcraft` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-11-24

### Added

- `provideToastcraft()` standalone provider and `TOASTCRAFT_CONFIG` token.
- `ToastService` with `show`, `success`, `error`, `warning`, `info`, `loading`, `update`, `replace`, `dismiss`, `promise`, `configure` and an `events` Observable.
- `track()` RxJS operator: loading, then success or error toasts for an Observable.
- Component toasts with `ToastService.component()`, input binding and an injectable `ToastRef`.
- Template toasts with `ToastService.template()` and `let-toast` context.
- `toastcraftHttpErrors()` interceptor with readable per-status messages, per-status deduplication, `skip`, custom messages and the `SKIP_ERROR_TOAST` context token.
- Zone-aware: timers run outside Angular's zone; user callbacks run inside it. Works zoneless.
- Migration guide from ngx-toastr.
- Tested in browsers on Angular 18, 19, 20, 21 and 22.
