# Domain Concepts

## Overview

This section covers the domain-specific concepts related to Microsoft Visual Studio, MSVC toolchains, architecture support, and environment configuration that are essential for understanding and working with this GitHub Action.

## Visual Studio Concepts

### Version Mapping

The action supports multiple ways to specify Visual Studio versions:

#### Year-Based Specification

```javascript
// Mapping in src/version.js
export const VsYearVersion = {
  2026: '18.0',
  2022: '17.0',
  2019: '16.0',
  2017: '15.0',
  2015: '14.0',
  2013: '12.0',
};
```

**Supported Years**: 2013, 2015, 2017, 2019, 2022, 2026 (as year string)

#### Version Number Specification

**Format**: `major.minor` (e.g., `16.0`, `17.0`)
**Mapping**:

- `16.0` → Visual Studio 2019
- `17.0` → Visual Studio 2022
- `18.0` → Visual Studio 2026

#### Discovery Priority

1. **vswhere Tool**: Queries Visual Studio installation registry
2. **Standard Paths**: `Program Files\Microsoft Visual Studio\[year]\[edition]`
3. **Build Tools**: Special case for Visual Studio 2015 Build Tools

### Editions Support

The action searches for these Visual Studio editions (in order):

1. **Enterprise**
2. **Professional**
3. **Community**
4. **BuildTools**

**Location Pattern**:

```
%ProgramFiles(x86)%\Microsoft Visual Studio\[year]\[edition]\VC\Auxiliary\Build\vcvarsall.bat
```

### vswhere Integration

**Purpose**: Microsoft's official tool for locating Visual Studio installations
**Path**: `%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe`
**Usage**: `vswhere -products * -version "[version]" -prerelease -property installationPath`

## Architecture Support

### Native Architectures

| Architecture | Description    | Aliases                     |
| ------------ | -------------- | --------------------------- |
| `x64`        | 64-bit (AMD64) | `win64`, `x86_64`, `x86-64` |
| `x86`        | 32-bit (x86)   | `win32`                     |

**Implementation**: Architecture aliases are normalized in `src/lib.js` (lines 106-115)

### Cross-Compilation Architectures

#### Host→Target Patterns

| Pattern       | Host | Target | Notes                        |
| ------------- | ---- | ------ | ---------------------------- |
| `amd64_x86`   | x64  | x86    | 64-bit host compiling 32-bit |
| `amd64_arm64` | x64  | ARM64  | 64-bit to ARM64              |
| `x86_arm64`   | x86  | ARM64  | 32-bit to ARM64              |

#### Deprecated Architectures

- `amd64_arm`: 64-bit to ARM32 (removed in VS 2026)
- `x86_arm`: 32-bit to ARM32 (removed in VS 2026)

**Workaround for ARM32**: Pin older runner image with `vsversion: 2022`

### Architecture Discovery

The action doesn't validate architecture support; it passes the value directly to `vcvarsall.bat`, which validates and reports errors.

## Environment Configuration

### vcvarsall.bat Parameters

The action constructs command-line arguments for `vcvarsall.bat`:

```javascript
var args = [arch];
if (uwp == 'true') {
  args.push('uwp');
}
if (sdk) {
  args.push(sdk);
}
if (toolset) {
  args.push(`-vcvars_ver=${toolset}`);
}
if (spectre == 'true') {
  args.push('-vcvars_spectre_libs=spectre');
}
```

### Environment Variable Types

#### PATH-like Variables

Special handling for variables that contain path lists:

- `PATH`
- `INCLUDE`
- `LIB`
- `LIBPATH`

**Deduplication Logic**: `filterPathValue()` function removes duplicate entries while preserving order.

#### Standard Variables

Exported when changed by `vcvarsall.bat`:

- Compiler paths (`CL`, `LINK`)
- Library paths
- Include paths
- SDK directories
- Toolset-specific variables

### Environment Capture Method

The action uses a three-phase capture method:

1. **Initial `set`**: Captures pre-configuration environment
2. **`vcvarsall.bat` execution**: Configures MSVC environment
3. **Final `set`**: Captures post-configuration environment

**Separator**: `cls` (clear screen) produces form feed (`\f`) character for parsing.

## Windows SDK Concepts

### SDK Version Format

**Examples**: `10.0.10240.0`, `8.1`, `10.0`
**Purpose**: Specifies which Windows SDK to use for compilation

### SDK Discovery

Managed by `vcvarsall.bat` based on:

1. SDK version parameter (if provided)
2. Default SDK for Visual Studio version
3. Installed SDKs on the system

## Toolset Concepts

### Toolset Versions

**Format**: `major.minor` or `major.minor.patch`
**Examples**: `14.0`, `14.11`, `14.41`

**Purpose**: Specifies which MSVC compiler version to use within a Visual Studio installation.

### Common Toolsets

- `14.0`: Visual Studio 2015
- `14.1x`: Visual Studio 2017
- `14.2x`: Visual Studio 2019
- `14.3x`: Visual Studio 2022
- `14.4x`: Visual Studio 2026

## Security Features

### Spectre Mitigation

**Parameter**: `spectre: true`
**Effect**: Uses Spectre-mitigated versions of Visual Studio libraries
**Command-line**: `-vcvars_spectre_libs=spectre`

**Use Case**: For projects requiring Spectre variant 1 mitigation.

## Platform-Specific Behavior

### Windows-Only Operation

The action checks platform early:

```javascript
if (process.platform != 'win32') {
  core.info('This is not a Windows virtual environment, bye!');
  return;
}
```

### GitHub Hosted Runners

**Default Images**: Include multiple Visual Studio versions
**Visual Studio Editions**: Typically include Community and BuildTools
**SDK Availability**: Windows SDKs pre-installed based on image version

### Self-Hosted Runners

**Requirements**: Visual Studio with C++ tools installed
**Installation Paths**: Must match standard patterns or vswhere must work
**Configuration**: Ensure `vcvarsall.bat` is discoverable

## Error Patterns

### vcvarsall.bat Error Detection

The action parses output for error patterns:

```javascript
const error_messages = vcvars_output.filter((line) => {
  if (line.match(/^\[ERROR.*\]/)) {
    // Don't print this particular line which will be confusing in output.
    if (!line.match(/Error in script usage. The correct usage is:$/)) {
      return true;
    }
  }
  return false;
});
```

### Common Error Messages

1. `[ERROR:vcvarsall.bat] Invalid argument found:` - Invalid architecture
2. `[ERROR:...]` - Various configuration errors
3. Missing error lines - Successful execution with warnings

## Version Compatibility

### Visual Studio 2026 Changes

**ARM32 Removal**: 32-bit ARM targets no longer supported
**Workflow Impact**: Requires updates to use `amd64_arm64` or pin older versions

### Backward Compatibility

**Older Visual Studios**: Supported via year/version mapping
**Future Versions**: May require updates to `VsYearVersion` mapping

## Source References

### Core Implementation

- [`src/version.js`](/src/version.js) - Version/year mappings
- [`src/lib.js`](/src/lib.js) - Architecture aliases (106-115), vcvarsall arguments (120-134)
- [`src/lib.js`](/src/lib.js) - Environment capture (136-145), error detection (149-160)

### Configuration

- [`action.yml`](/action.yml) - Input parameter definitions
- [`README.md`](/README.md) - User-facing documentation

### Test Coverage

- [`tests/version.test.js`](/tests/version.test.js) - Version mapping tests

## Related Documentation

- [Architecture](architecture/index.md) - Implementation details
- [Workflows](workflows/index.md) - Usage patterns
- [Operations](operations/index.md) - Development processes
