#!/usr/bin/env python3
"""Bulk S3 redirect creator.

Reads redirects from scripts/redirects_v2.yml (expects list of mapping with
`old` and `new` keys) and calls `scripts/create-redirect.sh` for each redirect.

Usage:
    python scripts/create-redirect.py <bucket_name> [--start N] [--end M]

Options:
    --start N   Start index (inclusive) in redirects list to process. Default 0.
    --end M     End index (exclusive). Default len(list).

The slice options are useful for testing a subset.
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

try:
    import yaml  # type: ignore
except ImportError:  # pragma: no cover
    sys.stderr.write("[ERROR] PyYAML is required. Install with: pip install pyyaml\n")
    sys.exit(1)

ROOT_DIR = Path(__file__).resolve().parent.parent  # repo root (circleci-docs-static)
REDIRECTS_FILE = ROOT_DIR / "scripts" / "redirects_v2.yml"
SH_SCRIPT = ROOT_DIR / "scripts" / "create-redirect.sh"


def load_redirects(path: Path) -> list[dict[str, str]]:
    """Load redirects YAML file into list of dicts with 'old' and 'new'."""
    if not path.exists():
        raise FileNotFoundError(f"Redirects YAML not found: {path}")

    with path.open("r", encoding="utf-8") as fh:
        data = yaml.safe_load(fh)

    if not isinstance(data, list):
        raise ValueError("Redirects YAML should be a list of mappings.")

    redirects: list[dict[str, str]] = []
    for item in data:
        if not isinstance(item, dict):
            continue
        old = item.get("old")
        new = item.get("new")
        if old and new:
            redirects.append({"old": str(old), "new": str(new)})
    return redirects


def create_redirect(bucket: str, old_path: str, new_path: str) -> None:
    """Call the shell script to create a single redirect."""
    cmd = [
        "bash",
        str(SH_SCRIPT),
        bucket,
        old_path,
        new_path,
    ]
    subprocess.run(cmd, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Bulk S3 redirect creator")
    parser.add_argument("bucket", help="Target S3 bucket name")
    parser.add_argument("--start", type=int, default=0, help="Start index (inclusive)")
    parser.add_argument("--end", type=int, default=None, help="End index (exclusive)")
    args = parser.parse_args()

    redirects = load_redirects(REDIRECTS_FILE)
    end = args.end if args.end is not None else len(redirects)

    slice_redirects = redirects[args.start : end]
    total = len(slice_redirects)
    print(f"[INFO] Processing {total} redirects (indexes {args.start}-{end-1})...")

    for idx, entry in enumerate(slice_redirects, start=args.start):
        old = entry["old"]
        new = entry["new"]
        try:
            print(f"[INFO] ({idx}) Creating redirect {old} -> {new}")
            create_redirect(args.bucket, old, new)
        except subprocess.CalledProcessError as exc:
            print(f"[ERROR] Failed to create redirect for {old}: {exc}", file=sys.stderr)


if __name__ == "__main__":
    main()
