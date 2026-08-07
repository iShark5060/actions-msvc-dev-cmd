# Workflows

## Overview

This section covers how to use the MSVC Dev Cmd action in GitHub Actions workflows, including common patterns, input handling, integration strategies, and troubleshooting.

## Basic Usage Patterns

### Simple Build Configuration

```yaml
jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v7
      - uses: iShark5060/actions-msvc-dev-cmd@v1
      - name: Build with CMake and NMake
        run: |
          cmake -G "NMake Makefiles" .
          nmake
```

### Matrix Builds for Multiple Architectures

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

## Input Reference

### Architecture (`arch`)

**Default**: `x64`
**Supported Values**:

- Native: `x64`, `x86`
- Cross-compilation: `amd64_x86`, `amd64_arm64`, `x86_arm64`
- Aliases: `win32` → `x86`, `win64` → `x64`, `x86_64` → `x64`

**Usage Example**:

```yaml
- uses: iShark5060/actions-msvc-dev-cmd@v1
  with:
    arch: x86 # 32-bit compilation
```

### Visual Studio Version (`vsversion`)

**Default**: `latest` (uses vswhere to find latest)
**Supported Formats**:

- Year: `2019`, `2022`, `2026`
- Version: `16.0`, `17.0`, `18.0`
- Custom: Any value passed to vswhere `-version` filter

**Usage Example**:

```yaml
- uses: iShark5060/actions-msvc-dev-cmd@v1
  with:
    vsversion: 2019 # Use Visual Studio 2019
```

### Windows SDK (`sdk`)

**Format**: SDK version number
**Example**: `10.0.10240.0`, `8.1`

```yaml
- uses: iShark5060/actions-msvc-dev-cmd@v1
  with:
    sdk: 10.0.10240.0
```

### Toolset (`toolset`)

**Format**: VC++ compiler toolset version
**Example**: `14.0`, `14.11`, `14.41`

```yaml
- uses: iShark5060/actions-msvc-dev-cmd@v1
  with:
    toolset: 14.0
```

### Universal Windows Platform (`uwp`)

**Type**: Boolean flag
**Effect**: Configures environment for UWP development

```yaml
- uses: iShark5060/actions-msvc-dev-cmd@v1
  with:
    uwp: true
```

### Spectre Mitigation (`spectre`)

**Type**: Boolean flag
**Effect**: Uses Spectre-mitigated Visual Studio libraries

```yaml
- uses: iShark5060/actions-msvc-dev-cmd@v1
  with:
    spectre: true
```

## Integration Strategies

### With CMake Projects

```yaml
steps:
  - uses: actions/checkout@v7
  - uses: iShark5060/actions-msvc-dev-cmd@v1
  - name: Configure with CMake
    run: cmake -B build -G "Visual Studio 17 2022"
  - name: Build
    run: cmake --build build --config Release
```

### With MSBuild Projects

```yaml
steps:
  - uses: actions/checkout@v7
  - uses: iShark5060/actions-msvc-dev-cmd@v1
  - name: Build Solution
    run: msbuild MyProject.sln /p:Configuration=Release /p:Platform=x64
```

### Mixed Platform Workflows

```yaml
jobs:
  windows-build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v7
      - uses: iShark5060/actions-msvc-dev-cmd@v1
      - name: Windows Build
        run: # ... Windows-specific build commands

  linux-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - name: Linux Build
        run: # ... Linux-specific build commands
```

## Advanced Patterns

### Conditional MSVC Setup

```yaml
steps:
  - uses: actions/checkout@v7
  - name: Setup MSVC (if needed)
    if: runner.os == 'Windows'
    uses: iShark5060/actions-msvc-dev-cmd@v1
  - name: Build
    run: |
      if [[ "$RUNNER_OS" == "Windows" ]]; then
        # Windows build commands
      else
        # Non-Windows build commands
      fi
```

### Multiple Configurations in Single Job

```yaml
steps:
  - uses: actions/checkout@v7
  # x64 build
  - uses: iShark5060/actions-msvc-dev-cmd@v1
    with:
      arch: x64
  - name: Build x64
    run: # ... x64 build
  # x86 build
  - uses: iShark5060/actions-msvc-dev-cmd@v1
    with:
      arch: x86
  - name: Build x86
    run: # ... x86 build
```

## Error Handling and Debugging

### Common Issues

#### 1. Shell Path Conflicts

**Symptom**: Linker errors mentioning "extra operand"
**Cause**: `shell: bash` prepends GNU paths that shadow MSVC tools
**Solution**: Use default shell or explicitly set `shell: cmd`

```yaml
- name: Build with MSVC
  shell: cmd
  run: |
    cl /c hello.c
    link hello.obj
```

#### 2. vcvarsall.bat Not Found

**Symptom**: "Microsoft Visual Studio not found" error
**Causes**:

- Visual Studio not installed on self-hosted runner
- Incorrect `vsversion` specified
- vswhere tool missing
  **Debugging**: Check action logs for discovery attempts

#### 3. Invalid Architecture

**Symptom**: "invalid parameters" error
**Cause**: Unsupported architecture value
**Solution**: Check supported values in [Input Reference](#input-reference)

### Debug Mode

Enable step debug logging to see detailed discovery process:

```yaml
steps:
  - uses: iShark5060/actions-msvc-dev-cmd@v1
    env:
      ACTIONS_STEP_DEBUG: true
```

### Environment Inspection

Add a step to inspect configured environment:

```yaml
steps:
  - uses: iShark5060/actions-msvc-dev-cmd@v1
  - name: Check Environment
    run: |
      echo "CL version:"
      cl /?
      echo "PATH contains:"
      echo %PATH%
```

## Best Practices

### 1. Version Pinning

Always reference published version tags:

```yaml
# Good
uses: iShark5060/actions-msvc-dev-cmd@v1

# Bad (won't work)
uses: iShark5060/actions-msvc-dev-cmd@main
```

### 2. Matrix vs Repeated Invocations

**Preferred**: Use matrix for parallel architectures
**Alternative**: Multiple invocations work but can cause PATH overflow

### 3. Platform Detection

Wrap MSVC-specific steps with conditions:

```yaml
- name: Setup MSVC
  if: runner.os == 'Windows'
  uses: iShark5060/actions-msvc-dev-cmd@v1
```

### 4. Clean Environment

For complex workflows, consider isolated jobs:

```yaml
jobs:
  build-x64:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v7
      - uses: iShark5060/actions-msvc-dev-cmd@v1
        with:
          arch: x64
      - name: Build
        run: # x64 build

  build-x86:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v7
      - uses: iShark5060/actions-msvc-dev-cmd@v1
        with:
          arch: x86
      - name: Build
        run: # x86 build
```

## Platform Limitations

### Linux/macOS Runners

The action is a no-op on non-Windows platforms:

```javascript
if (process.platform != 'win32') {
  core.info('This is not a Windows virtual environment, bye!');
  return;
}
```

### ARM32 Support

- **VS 2026+**: ARM32 targets removed
- **Workaround**: Pin older runner image and set `vsversion: 2022`
- **Alternative**: Use `amd64_arm64` or `x86_arm64` for 64-bit ARM

## Source References

### Action Implementation

- [`src/lib.js`](/src/lib.js) - Input processing (lines 106-133)
- [`src/lib.js`](/src/lib.js) - Architecture aliases (lines 106-115)
- [`action.yml`](/action.yml) - Input definitions

### Examples and Tests

- [`.github/workflows/ci.yml`](/.github/workflows/ci.yml) - CI integration tests
- [`README.md`](/README.md) - Usage examples
- [`hello.c`](/hello.c) - Example C file for testing

## Related Documentation

- [Architecture](architecture/index.md) - Core implementation details
- [Operations](operations/index.md) - Development and testing workflows
- [Domain Concepts](domain/index.md) - Visual Studio and architecture specifics
