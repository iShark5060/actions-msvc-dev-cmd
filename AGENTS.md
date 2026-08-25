# actions-msvc-dev-cmd

## Org standards

CI/README/validate conventions live in AppBase `docs/org-standards/` with personal-repo overrides (`personal-repos.md`). GitHub-hosted runners, not Blacksmith. Action-publish track: `release` event → build-and-tag. Quality gate: `pnpm run validate`.

## Overview

Configures the MSVC Developer Command Prompt on Windows runners (exports vcvars environment). Maintained fork of ilammy/msvc-dev-cmd. No-op on Linux/macOS. Inputs and usage: `README.md` / `action.yml`.

## Bundle and CI

Source is ESM (`"type": "module"`); the published Action entry must stay **CJS** (`dist/index.cjs`). Do not switch the bundle to ESM. `dist/index.cjs` is only on release tags; consumers use `@v1`, not `@main`. CI builds/verifies the bundle and uploads it; integration jobs **download that artifact** before `uses: ./`. Do not require committing `dist/` on ordinary PRs.

Prefer narrow fixes. Keep the vcvarsall-based `set && cls && …` env-capture flow unless there is strong evidence it must change. Windows-specific logic is hard to unit-test on Linux CI; rely on integration jobs.

## Environment

Re-exports only changed env vars. PATH-like values (`PATH`, `INCLUDE`, `LIB`, `LIBPATH`) are deduped so repeated invocations do not grow without bound. `shell: bash` on GitHub-hosted Windows can put GNU tools ahead of MSVC on `PATH` (classic `link.exe` “extra operand” failures). Prefer `cmd` / `pwsh` for compile steps after this action.

VS 2026+ drops ARM32 targets (`amd64_arm` / `x86_arm`); use `amd64_arm64` / `x86_arm64` or pin an older image + `vsversion: 2022`. Year map includes `2026` → `18.0`.
