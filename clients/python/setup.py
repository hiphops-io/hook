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
            # Find the installed package directory and run download
            import subprocess
            import sys
            result = subprocess.run([
                sys.executable, "-c", 
                "import hiphops_hook.scripts.install; hiphops_hook.scripts.install.download_binary()"
            ], capture_output=True, text=True)
            if result.returncode != 0:
                print(f"Warning: Binary download failed: {result.stderr}")
            else:
                print("Hook binary downloaded successfully")
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
            # Find the installed package directory and run download
            import subprocess
            import sys
            result = subprocess.run([
                sys.executable, "-c", 
                "import hiphops_hook.scripts.install; hiphops_hook.scripts.install.download_binary()"
            ], capture_output=True, text=True)
            if result.returncode != 0:
                print(f"Warning: Binary download failed: {result.stderr}")
            else:
                print("Hook binary downloaded successfully")
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
