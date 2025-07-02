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
import { license } from '@hiphops/hook';

// Get license information
const getLicenseInfo = async () => {
  try {
    const info = await license();
    console.log('License info:', info);
    return info;
  } catch (error) {
    console.error('Error getting license info:', error);
  }
};

getLicenseInfo();
```

## Custom Binary Path

If you want to use a custom hook binary, set the `HIPHOPS_HOOK_BIN` environment variable:

```bash
# Set the environment variable
export HIPHOPS_HOOK_BIN=/path/to/custom/hook

# Then use the package normally
node your-script.js
```

## Runtime Support

This package is designed to work with:

- Node.js (16+)
- Deno (via npm compatibility)
- Bun

## License

MIT
