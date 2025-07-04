#!/usr/bin/env python3
"""
Build-time script to download the appropriate Hook binary using cibuildwheel environment variables.
"""

import os
import stat
import sys
import urllib.request
import urllib.error
from pathlib import Path


def get_binary_name_from_cibw():
    """Get the binary name based on cibuildwheel environment variables."""
    # Get platform and architecture from cibuildwheel
    platform = os.environ.get("CIBW_PLATFORM", "").lower()
    archs = os.environ.get("CIBW_ARCHS", "").lower()

    print(f"🔍 CIBW_PLATFORM: {platform}")
    print(f"🔍 CIBW_ARCHS: {archs}")

    # Map cibuildwheel values to our binary names
    if platform == "linux":
        if "x86_64" in archs or "amd64" in archs:
            return "hook-linux-amd64"
        elif "aarch64" in archs or "arm64" in archs:
            return "hook-linux-arm64"
    elif platform == "macos":
        if "x86_64" in archs or "amd64" in archs:
            return "hook-darwin-amd64"
        elif "arm64" in archs:
            return "hook-darwin-arm64"
    elif platform == "windows":
        if "amd64" in archs or "x86_64" in archs:
            return "hook-windows-amd64.exe"

    raise RuntimeError(f"Unsupported platform/arch combination: {platform}/{archs}")


def get_version():
    """Get the package version from pyproject.toml."""
    import re

    # Find pyproject.toml
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    pyproject_path = project_root / "pyproject.toml"

    if not pyproject_path.exists():
        raise RuntimeError(f"Could not find pyproject.toml at {pyproject_path}")

    # Simple regex-based parsing
    with open(pyproject_path, "r", encoding="utf-8") as f:
        content = f.read()

    match = re.search(r'version\s*=\s*["\']([^"\']+)["\']', content)
    if not match:
        raise RuntimeError("Could not find version in pyproject.toml")

    return match.group(1)


def download_binary():
    """Download the Hook binary for the current platform."""
    try:
        binary_name = get_binary_name_from_cibw()
        version = get_version()

        print(f"📦 Package version: {version}")
        print(f"🔍 Binary name: {binary_name}")

        # Create bin directory in package
        script_dir = Path(__file__).parent
        package_dir = script_dir.parent / "hiphops_hook"
        bin_dir = package_dir / "bin"
        bin_dir.mkdir(exist_ok=True)

        binary_path = bin_dir / binary_name

        # Download URL
        download_url = f"https://github.com/hiphops-io/hook/releases/download/v{version}/{binary_name}"

        print(f"📥 Downloading from: {download_url}")
        print(f"💾 Saving to: {binary_path}")

        # Download the binary
        with urllib.request.urlopen(download_url) as response:
            if response.status != 200:
                raise RuntimeError(
                    f"Failed to download binary. Status code: {response.status}"
                )

            # Write binary to file
            with open(binary_path, "wb") as f:
                f.write(response.read())

        # Make binary executable on Unix-like systems
        if not binary_name.endswith(".exe"):
            current_mode = binary_path.stat().st_mode
            binary_path.chmod(current_mode | stat.S_IEXEC)

        print(f"✅ Successfully downloaded binary to {binary_path}")
        print(f"📊 Binary size: {binary_path.stat().st_size} bytes")

    except Exception as e:
        print(f"❌ Error during binary download: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    print("🚀 Starting cibuildwheel binary download...")
    download_binary()
    print("🎉 Binary download completed successfully!")
