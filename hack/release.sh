#!/bin/bash
set -e

# Check if version is provided
if [ $# -ne 1 ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 1.2.3 or $0 1.2.3-beta1"
  exit 1
fi

VERSION=$1
TAG_NAME="v$VERSION"

# Validate semantic version format
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9\.]+)?$ ]]; then
  echo "Error: Version must follow semantic versioning (e.g., 1.2.3 or 1.2.3-beta1)"
  exit 1
fi

# Check if we're on the main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "Error: You must be on the main branch to release"
  exit 1
fi

# Check if the working directory is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: Working directory is not clean. Commit all changes before releasing."
  exit 1
fi

# Pull latest changes
echo "Pulling latest changes from main..."
git pull origin main

# Update go.mod
echo "Updating go.mod with version $VERSION..."
# Get the current module path from go.mod
MODULE_PATH=$(grep -m 1 "module" go.mod | awk '{print $2}')
sed -i.bak "1,/module/ s|module $MODULE_PATH|module $MODULE_PATH/v$VERSION|" go.mod && rm go.mod.bak || true

# Build to ensure everything compiles
echo "Building to verify code..."
go build ./...

# Commit the version change
echo "Committing version update..."
git add go.mod
git commit -m "chore: release version $VERSION"

# Create and push the tag
echo "Creating and pushing tag $TAG_NAME..."
git tag -a "$TAG_NAME" -m "Release $VERSION"
git push origin main
git push origin "$TAG_NAME"

echo "Release $VERSION initiated successfully!"
echo "GitHub Actions workflow should now start building the release."
echo "Check the Actions tab in your GitHub repository to monitor progress."
