# Development Scripts

This directory contains helper scripts for development and release processes.

## Scripts

### `release.sh`

Usage: `./release.sh <version>`

This script automates the release process:
- Validates the semantic version format
- Ensures you're on the main branch with a clean working directory
- Updates JavaScript package version
- Creates and pushes a Git tag
- Triggers GitHub Actions workflows for building and releasing

Example: `./release.sh 1.2.3` or `./release.sh 1.2.3-beta1`

### `test-js-client.sh`

Usage: `./test-js-client.sh`

This script provides end-to-end testing of the JavaScript client:
- Builds the hook binary locally for your current platform
- Sets up the environment to use the local binary
- Builds the TypeScript client
- Runs the test script to verify functionality

No arguments needed. Simply run:
```
./test-js-client.sh
```

## Development Workflow

For testing changes to both the Go server and JS client:

1. Make your changes
2. Run `./hack/test-js-client.sh` to verify end-to-end functionality
3. Commit your changes
4. When ready for release, use `./hack/release.sh <version>`
