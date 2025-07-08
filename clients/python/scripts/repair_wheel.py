#!/usr/bin/env python3
"""
Simple wheel repair script that renames platform tags to be PyPI-compatible.
"""

import shutil
import sys
import os
from pathlib import Path


def main():
    if len(sys.argv) != 3:
        print("Usage: repair_wheel.py <wheel_path> <dest_dir>", file=sys.stderr)
        sys.exit(1)

    wheel_path = sys.argv[1]
    dest_dir = sys.argv[2]

    wheel_name = os.path.basename(wheel_path)

    # Replace linux_x86_64 with manylinux_2_17_x86_64 for PyPI compatibility
    new_name = wheel_name.replace("linux_x86_64", "manylinux_2_17_x86_64")

    # Ensure destination directory exists
    Path(dest_dir).mkdir(parents=True, exist_ok=True)

    new_path = os.path.join(dest_dir, new_name)
    shutil.copy2(wheel_path, new_path)

    print(f"Repaired wheel: {wheel_name} -> {new_name}")


if __name__ == "__main__":
    main()
