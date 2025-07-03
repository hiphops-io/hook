#!/usr/bin/env python3
"""
Setup script for HipHops Hook Python client.

This script handles package installation and post-install hooks.
"""

import sys
from pathlib import Path
from setuptools import setup, find_packages
from setuptools.command.install import install
from setuptools.command.develop import develop


class PostInstallCommand(install):
    """Post-installation for installation mode."""

    def run(self):
        install.run(self)
        self._post_install()

    def _post_install(self):
        """Run post-installation tasks."""
        try:
            # Import and run the binary download function directly
            from hiphops_hook.scripts.install import download_binary
            download_binary()
        except Exception as e:
            print(f"Warning: Post-install hook failed: {e}")


class PostDevelopCommand(develop):
    """Post-installation for development mode."""

    def run(self):
        develop.run(self)
        self._post_install()

    def _post_install(self):
        """Run post-installation tasks."""
        try:
            # Import and run the binary download function directly
            from hiphops_hook.scripts.install import download_binary
            download_binary()
        except Exception as e:
            print(f"Warning: Post-install hook failed: {e}")


# Read the README file
readme_path = Path(__file__).parent / "README.md"
long_description = ""
if readme_path.exists():
    with open(readme_path, "r", encoding="utf-8") as f:
        long_description = f.read()

setup(
    cmdclass={
        "install": PostInstallCommand,
        "develop": PostDevelopCommand,
    },
)
