#!/bin/bash
set -e

# Save the current branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
echo "[INFO] Current branch: $current_branch"

# Process all server-v* branches
for branch in $(git ls-remote --heads origin | awk '{print $2}' | grep 'refs/heads/server-v' | sed 's|refs/heads/||'); do
  echo "[INFO] Updating branch: $branch"
  git checkout "$branch"
  git pull origin "$branch"
done

# Go back to the original branch
echo "[INFO] Returning to original branch: $current_branch"
git checkout "$current_branch"