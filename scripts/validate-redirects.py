#!/usr/bin/env python3
"""Validate that configured redirects respond correctly.

Reads the redirects defined in ``scripts/redirects_v2.yml`` (list of mappings
with ``old`` and ``new`` keys).

For each entry it performs two checks:

1. A GET request to the *old* path returns an HTTP redirect (3xx).
2. The redirect *Location* is followed and the final response returns a 200
   status code. This ensures the target page exists.

The script is intentionally lightweight and has no external dependencies other
than the ``requests`` library.

Usage:
    python scripts/validate-redirects.py https://example.com [--start N] [--end M]

Passing a slice of the redirects is handy while developing.
"""
from __future__ import annotations

import argparse
import sys
import textwrap
from pathlib import Path
import time
from typing import Iterable
from urllib.parse import urljoin

try:
    import requests  # type: ignore
except ImportError:
    sys.stderr.write(
        textwrap.dedent(
            """
            [ERROR] The 'requests' package is required to run this script.\n\n"
            "       Install it with: pip install requests\n"
            """
        )
    )
    sys.exit(1)

try:
    import yaml  # type: ignore
except ImportError:
    sys.stderr.write("[ERROR] PyYAML is required. Install with: pip install pyyaml\n")
    sys.exit(1)

ROOT_DIR = Path(__file__).resolve().parent.parent  # repository root
REDIRECTS_FILE = ROOT_DIR / "scripts" / "redirects_v2.yml"
DEFAULT_TIMEOUT = 10  # seconds


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_redirects(path: Path) -> list[dict[str, str]]:
    """Return redirects loaded from *path* (expects list of mapping)."""
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


def check_redirect(base_url: str, old_path: str) -> tuple[int, str]:
    """Perform a request to *old_path* and return (status_code, location)."""
    url = urljoin(base_url, "docs-preview" + old_path)
    resp = requests.get(url, allow_redirects=False, timeout=DEFAULT_TIMEOUT)
    return resp.status_code, resp.headers.get("Location", "")


def check_final(url: str) -> int:
    """Follow redirect target URL and return status code."""
    resp = requests.get(url, allow_redirects=True, timeout=DEFAULT_TIMEOUT)
    return resp.status_code


def slice_iter(iterable: Iterable, start: int, end: int | None) -> Iterable:
    """Yield a slice [start:end] of *iterable* without loading it twice."""
    for idx, item in enumerate(iterable):
        if idx < start:
            continue
        if end is not None and idx >= end:
            break
        yield idx, item


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Validate configured redirects")
    parser.add_argument(
        "base_url",
        help="Base URL/domain to test against, e.g. https://circleci.com",
    )
    parser.add_argument("--start", type=int, default=0, help="Start index (inclusive)")
    parser.add_argument("--end", type=int, default=None, help="End index (exclusive)")
    args = parser.parse_args()

    redirects = load_redirects(REDIRECTS_FILE)
    end = args.end if args.end is not None else len(redirects)

    print(
        f"[INFO] Validating redirects {args.start}-{end-1} / {len(redirects)-1} "
        f"against {args.base_url}..."
    )

    failures: list[str] = []
    for idx, entry in slice_iter(redirects, args.start, end):
        # Throttle requests so we don't hammer the site
        time.sleep(0.1)
        old = entry["old"]
        status, location = check_redirect(args.base_url, old)
        print(f"[DEBUG] ({idx}) status={status}, location='{location}'")

        if status // 100 != 3:
            failures.append(f"({idx}) {old}: expected 3xx, got {status}")
            print(f"[FAIL] ({idx}) {old}: expected 3xx, got {status}")
            continue

        # Location could be absolute or relative
        absolute_location = urljoin(args.base_url, location)
        final_status = check_final(absolute_location)
        print(f"[DEBUG] ({idx}) final_status={final_status}")
        if final_status != 200:
            failures.append(
                f"({idx}) {old}: target returned status {final_status} (expected 200)"
            )
            print(
                f"[FAIL] ({idx}) {old}: target returned status {final_status} "
                f"(expected 200)"
            )
            continue

        print(f"[PASS] ({idx}) {old} -> {location} [OK]")

    print("\n[SUMMARY]")
    if failures:
        print(f"❌ {len(failures)} failures detected:")
        for msg in failures:
            print("  - " + msg)
        sys.exit(1)
    else:
        print("✅ All redirects validated successfully!")


if __name__ == "__main__":
    main()
