#!/usr/bin/env python3
"""
Build-time script to download the appropriate Hook binary using cibuildwheel environment variables.
"""

import os
import ssl
import stat
import sys
import urllib.request
import urllib.error
from pathlib import Path


def get_binary_name_from_cibw():
    """Get the binary name based on cibuildwheel environment variables and platform detection."""
    import platform as platform_module

    # Get architecture from cibuildwheel (this is available)
    archs = os.environ.get("CIBW_ARCHS", "").lower()

    # Detect platform using Python's platform module
    system = platform_module.system().lower()

    print(f"🔍 System: {system}")
    print(f"🔍 CIBW_ARCHS: {archs}")

    # If CIBW_ARCHS is not set, try to detect from machine architecture
    if not archs:
        machine = platform_module.machine().lower()
        print(f"🔍 Machine: {machine}")
        if machine in ["x86_64", "amd64"]:
            archs = "x86_64"
        elif machine in ["arm64", "aarch64"]:
            archs = "arm64"

    # Map platform and architecture to binary names
    if system == "linux":
        if "x86_64" in archs or "amd64" in archs:
            return "hook-linux-amd64"
        elif "aarch64" in archs or "arm64" in archs:
            return "hook-linux-arm64"
    elif system == "darwin":
        if "x86_64" in archs or "amd64" in archs:
            return "hook-darwin-amd64"
        elif "arm64" in archs:
            return "hook-darwin-arm64"
    elif system == "windows":
        if "amd64" in archs or "x86_64" in archs:
            return "hook-windows-amd64.exe"

    raise RuntimeError(f"Unsupported platform/arch combination: {system}/{archs}")


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

        # Try to download with SSL verification first, fallback to no verification
        response = None
        try:
            # Create SSL context that handles certificate verification
            ssl_context = ssl.create_default_context()
            response = urllib.request.urlopen(download_url, context=ssl_context)
        except urllib.error.URLError as e:
            if "certificate verify failed" in str(e):
                print(
                    "⚠️  SSL certificate verification failed, retrying without verification..."
                )
                # Create unverified SSL context as fallback
                ssl_context = ssl.create_default_context()
                ssl_context.check_hostname = False
                ssl_context.verify_mode = ssl.CERT_NONE
                response = urllib.request.urlopen(download_url, context=ssl_context)
            else:
                raise

        # Download the binary
        with response:
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
