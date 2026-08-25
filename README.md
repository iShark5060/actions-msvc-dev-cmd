# MSVC Dev Cmd

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/iShark5060/actions-msvc-dev-cmd/actions/workflows/ci.yml/badge.svg)](https://github.com/iShark5060/actions-msvc-dev-cmd/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/Node-%3E%3D24-339933?logo=node.js&logoColor=white)
[![Cursor](https://img.shields.io/badge/Cursor-IDE-141414?logo=cursor&logoColor=white)](https://cursor.com)

Load the MSVC Developer Command Prompt on Windows runners so `cl`, `nmake`, and CMake can find the toolchain.

> **Fork notice:** Maintained fork of [ilammy/msvc-dev-cmd](https://github.com/ilammy/msvc-dev-cmd) by ilammy (MIT License).

> **Always reference a published version tag** (e.g. `@v1`). The bundled action code (`dist/index.cjs`) is only committed to release tags, so referencing `@main` will not work.

Supports Windows. Does nothing on Linux and macOS.

## Usage

### NMake

```yaml
jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v7
      - uses: iShark5060/actions-msvc-dev-cmd@v1
      - name: Build
        run: |
          cmake -G "NMake Makefiles" .
          nmake
```

### CMake + Ninja (recommended for modern CI)

Once MSVC is on `PATH`, CMake can use the Ninja generator (install Ninja separately, e.g. via `choco install ninja` or a cached binary):

```yaml
jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v7
      - uses: iShark5060/actions-msvc-dev-cmd@v1
        with:
          arch: x64
          vsversion: 2026
      - name: Configure and build
        run: |
          cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
          cmake --build build
```

`clang-cl` works when the Visual Studio LLVM/Clang component is installed; vcvars puts it on `PATH` when available.

Matrix builds for multiple architectures:

```yaml
jobs:
  build:
    runs-on: windows-latest
    strategy:
      matrix:
        arch: [amd64, amd64_x86, amd64_arm64]
    steps:
      - uses: actions/checkout@v7
      - uses: iShark5060/actions-msvc-dev-cmd@v1
        with:
          arch: ${{ matrix.arch }}
      - name: Build
        run: |
          cmake -G "NMake Makefiles" .
          nmake
```

## Inputs

| Input       | Default | Description                                                                                 |
| ----------- | ------- | ------------------------------------------------------------------------------------------- |
| `arch`      | `x64`   | Target architecture (`x64`, `x86`, cross-compile variants like `amd64_x86`, `amd64_arm64`). |
| `sdk`       | —       | Windows SDK version (e.g. `10.0.10240.0` or `8.1`).                                         |
| `toolset`   | —       | VC++ compiler toolset (e.g. `14.0`, `14.11`).                                               |
| `uwp`       | —       | Set `true` / `1` to build for Universal Windows Platform.                                   |
| `spectre`   | —       | Set `true` / `1` to use Spectre-mitigated Visual Studio libraries.                          |
| `vsversion` | latest  | Visual Studio version number (e.g. `18.0`) or year (e.g. `2026`).                           |

Year → version mapping includes `2026` → `18.0`, `2022` → `17.0`, `2019` → `16.0`, and earlier editions.

## Outputs

| Output              | Description                                                                   |
| ------------------- | ----------------------------------------------------------------------------- |
| `arch`              | Resolved architecture passed to vcvarsall.                                    |
| `vcvarsall`         | Absolute path to the invoked `vcvarsall.bat` (or VS 2015 `vcbuildtools.bat`). |
| `installation-path` | Visual Studio installation root inferred from vcvarsall.                      |
| `vs-version`        | Resolved version number when known (e.g. `18.0`).                             |
| `vs-year`           | Resolved year when known (e.g. `2026`).                                       |

## Caveats

### `shell: bash` path conflicts

GitHub Actions prepends GNU paths when `shell: bash` is used, which can shadow MSVC tools such as `link.exe`. If you see linker errors mentioning "extra operand", that is likely the cause.

### Reconfiguration

You can invoke the action multiple times in one job with different inputs, but using a `strategy.matrix` for parallel builds is preferred.

### ARM32 cross-compilation (`amd64_arm`, `x86_arm`)

32-bit ARM targets were removed from Visual Studio 2026. On GitHub-hosted runners with VS 2026+, use `amd64_arm64` or `x86_arm64` instead. To target ARM32, pin an older runner image and set `vsversion: 2022`.

### Native ARM64 hosts

On `windows-11-arm` runners, pass host/target forms that vcvarsall understands (for example `arm64` or `arm64_x64`). Values are passed through after common x86/x64 aliases are normalized.

## Requirements

- Node.js 24+
- pnpm 11+

## Scripts

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `pnpm run validate` | Format check, lint, and tests.       |
| `pnpm run build`    | Bundle `src/` into `dist/index.cjs`. |

## Development

Agent notes: [AGENTS.md](AGENTS.md).

Engineering standards: AppBase `docs/org-standards/` with [personal-repos.md](https://github.com/Dark-Avian-Labs/AppBase/blob/main/docs/org-standards/personal-repos.md) (GitHub-hosted runners).

## License

MIT. See [LICENSE](LICENSE).
