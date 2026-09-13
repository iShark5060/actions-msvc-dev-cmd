# MSVC Dev Cmd

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/iShark5060/actions-msvc-dev-cmd/ci.yml?style=flat-square&label=CI)](https://github.com/iShark5060/actions-msvc-dev-cmd/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/Node-%3E%3D24-339933?logo=node.js&logoColor=white&style=flat-square)
[![Cursor](https://img.shields.io/badge/Cursor-IDE-141414?logo=cursor&logoColor=white&style=flat-square)](https://cursor.com)

<<<<<<< Updated upstream
Loads the MSVC Developer Command Prompt on Windows runners so `cl`, `nmake`, and CMake can find the toolchain. Maintained fork of [ilammy/msvc-dev-cmd](https://github.com/ilammy/msvc-dev-cmd). No-op on Linux and macOS.
=======
Load the MSVC Developer Command Prompt on Windows runners so `cl`, `nmake`, and CMake can find the toolchain. One step, then the rest of the job looks like a local Native Tools prompt.

This is a maintained fork of [ilammy/msvc-dev-cmd](https://github.com/ilammy/msvc-dev-cmd) by ilammy (MIT License). NiTTY and 7-Zip CI depend on it.

> **Always reference a published version tag** (e.g. `@v1`). The bundled action code (`dist/index.cjs`) is only committed to release tags, so referencing `@main` will not work.

Supports Windows. Does nothing on Linux and macOS.

## Usage

### NMake
>>>>>>> Stashed changes

```yaml
- uses: iShark5060/actions-msvc-dev-cmd@v1
  with:
    arch: x64
    vsversion: 2026
- run: cmake -S . -B build -G Ninja && cmake --build build
```

Inputs live in `action.yml`. Year map includes `2026` → `18.0`, `2022` → `17.0`, `2019` → `16.0`.

## Gotchas

<<<<<<< Updated upstream
- Reference a **published tag** (`@v1`). The bundle is `dist/index.cjs` (CJS) and only exists on release tags; `@main` will not work.
- `shell: bash` on GitHub-hosted Windows prepends GNU tools. If `link.exe` fails with “extra operand”, it is GNU `link`, not MSVC. Use `cmd` or `pwsh` for compile steps.
- VS 2026 dropped ARM32 (`amd64_arm`, `x86_arm`). Use `amd64_arm64` / `x86_arm64`, or pin an older image with `vsversion: 2022`. On `windows-11-arm`, pass `arm64` / `arm64_x64`.
- You can invoke the action more than once in a job; a matrix is usually cleaner.
=======
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
>>>>>>> Stashed changes

## License

MIT. See [LICENSE](LICENSE).
