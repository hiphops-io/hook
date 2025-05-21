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
# Get the root dir so we can move around safely no matter where it was called from
SCRIPT_DIR=$( dirname $(realpath "$0") )
ROOT_DIR=$(realpath "$SCRIPT_DIR/../..")
CURRENT_DIR=$(pwd)
cd $START_DIR

# Validate semantic version format
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9_]+)?$ ]]; then
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

# Build to ensure everything compiles
echo "Building to verify code..."
go build ./...

# Update the js package version
echo "Updating JavaScript package version to $VERSION..."
cd clients/js
pnpm version $VERSION --no-git-tag-version
cd $ROOT_DIR
echo "JavaScript package updated to version $VERSION"

# Commit the version change
echo "Committing version update..."
git add clients/js/package.json
git commit -m "chore: release version $VERSION"

# Create and push the tag
echo "Creating and pushing tag $TAG_NAME..."
git tag -a "$TAG_NAME" -m "Release $VERSION"
git push origin main
git push origin "$TAG_NAME"

echo "Release $VERSION initiated successfully!"
echo "GitHub Actions workflow should now start building the release."
echo "Check the Actions tab in your GitHub repository to monitor progress."

cd $START_DIR
