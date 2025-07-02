# @hiphops/hook

A JavaScript/TypeScript client for the HipHops hook server.

## Installation

```bash
# Using npm
npm install @hiphops/hook

# Using pnpm (recommended)
pnpm add @hiphops/hook

# Using yarn
yarn add @hiphops/hook
```

## Usage

```typescript
import { license } from "@hiphops/hook";

// Get license information
const getLicenseInfo = async () => {
  try {
    const info = await license();
    if (info.verified) {
      console.log("License is valid:", info.license);
    } else {
      console.warn("License verification failed:", info.verify_failures);
    }
    console.log("License info:", info);
    return info;
  } catch (error) {
    console.error("Error getting license info:", error);
  }
};

getLicenseInfo();
```

### Example result

Given a license with `seats` configured as a value and in this case count of 10, the output will look like this:

```json
{
  "verified": true,
  "verify_failures": [],
  "license": {
    "seats": 10
  },
  "hiphops": {
    "identity": "c_01jz3b9bz4ka7stedds7g3fjb7",
    "project_id": "my-project-1234""
  }
}
```

Failure looks like this:

```json
{
  "verified": false,
  "verify_failures": ["invalid_license_token"],
  "license": null,
  "hiphops": {
    "identity": "",
    "project_id": ""
  }
}
```

## Custom Binary Path

Hook automatically manages the binary which checks license keys for you, but if you need to use a custom binary, you can specify its path using the `HIPHOPS_HOOK_BIN` environment variable.

```bash
# Set the environment variable
export HIPHOPS_HOOK_BIN=/path/to/custom/hook-binary

# Then use the package normally
node your-script.js
```

## Runtime Support

This package is designed to work with:

- Node.js (16+)
- Deno (via npm compatibility)
- Bun
