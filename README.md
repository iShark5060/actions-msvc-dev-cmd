# MSVC Dev Cmd

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/iShark5060/actions-msvc-dev-cmd/ci.yml?style=flat-square&label=CI)](https://github.com/iShark5060/actions-msvc-dev-cmd/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/Node-%3E%3D24-339933?logo=node.js&logoColor=white&style=flat-square)
[![Cursor](https://img.shields.io/badge/Cursor-IDE-141414?logo=cursor&logoColor=white&style=flat-square)](https://cursor.com)

Load the MSVC Developer Command Prompt on Windows runners so `cl`, `nmake`, and CMake can find the toolchain. One step, then the rest of the job looks like a local Native Tools prompt.

This is a maintained fork of [ilammy/msvc-dev-cmd](https://github.com/ilammy/msvc-dev-cmd) by ilammy (MIT License). NiTTY and 7-Zip CI depend on it. No-op on Linux and macOS.

```yaml
- uses: iShark5060/actions-msvc-dev-cmd@v1
  with:
    arch: x64
    vsversion: 2026
- run: cmake -S . -B build -G Ninja && cmake --build build
```

Inputs live in `action.yml`. Year map includes `2026` → `18.0`, `2022` → `17.0`, `2019` → `16.0`.

## Gotchas

- Reference a **published tag** (`@v1`). The bundle is `dist/index.cjs` (CJS) and only exists on release tags; `@main` will not work.
- `shell: bash` on GitHub-hosted Windows prepends GNU tools. If `link.exe` fails with “extra operand”, it is GNU `link`, not MSVC. Use `cmd` or `pwsh` for compile steps.
- VS 2026 dropped ARM32 (`amd64_arm`, `x86_arm`). Use `amd64_arm64` / `x86_arm64`, or pin an older image with `vsversion: 2022`. On `windows-11-arm`, pass `arm64` / `arm64_x64`.
- You can invoke the action more than once in a job; a matrix is usually cleaner.

## License

MIT. See [LICENSE](LICENSE).
