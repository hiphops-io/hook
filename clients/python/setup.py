#!/usr/bin/env python3
"""
Setup script for HipHops Hook Python client.

This script handles package installation. Binary download is handled
automatically at runtime when the client is first used.
"""

from pathlib import Path
from setuptools import setup


# Read the README file
readme_path = Path(__file__).parent / "README.md"
long_description = ""
if readme_path.exists():
    with open(readme_path, "r", encoding="utf-8") as f:
        long_description = f.read()

setup()
