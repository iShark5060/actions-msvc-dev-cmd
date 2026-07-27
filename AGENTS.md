# actions-msvc-dev-cmd

GitHub Action for configuring the MSVC Developer Command Prompt on Windows runners.

## Architecture

- `src/index.js` — entry point: read inputs and invoke setup
- `src/lib.js` — MSVC environment setup and Windows-specific logic
- `src/version.js` — Visual Studio version/year mapping helpers
- `action.yml` — action metadata
- `dist/index.cjs` — published CJS bundle (committed on release tags only)

Source files use ESM (`"type": "module"`); the published bundle must stay **CJS** (`--format=cjs`).

## Core rules

- Prefer narrow behavior fixes over structural churn.
- Treat GitHub platform behavior and Windows runner images as distinct from action behavior.
- Preserve the current vcvarsall-based setup flow unless there is strong evidence it needs to change.
- Windows-only logic is hard to unit-test on Linux CI; rely on integration jobs for regression coverage.

## Contract sync

When behavior changes, update:

- `README.md`
- `action.yml`
- tests under `tests/`
- regenerate `dist/index.cjs` with `pnpm run build` on the release tag

## Verification

```bash
pnpm run validate
pnpm run build
```

CI builds and verifies the bundle; it does not require committing `dist/index.cjs` on ordinary PRs. Integration jobs download the CI-built bundle before `uses: ./`.

## Release

1. Create a pre-release from `main`
2. Verify the Release workflow completes
3. Promote to a full release when ready

## Engineering standards

Follow AppBase `docs/org-standards/` with personal-repo overrides (`personal-repos.md`):

- Runners: `ubuntu-latest` / `windows-latest`
- Checkout: `actions/checkout@v7`
- Node setup: `actions/setup-node@v7`
- Quality gate: `pnpm run validate`

## OpenWiki

This repository has documentation located in the /openwiki directory.

Start here:

- [OpenWiki quickstart](openwiki/quickstart.md)

OpenWiki includes repository overview, architecture notes, workflows, domain concepts, operations, integrations, testing guidance, and source maps.

When working in this repository, read the OpenWiki quickstart first, then follow its links to the relevant architecture, workflow, domain, operation, and testing notes.
