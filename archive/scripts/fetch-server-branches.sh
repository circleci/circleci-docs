#!/bin/bash
set -e

# Parse command line arguments
FORCE_UPDATE=false
if [[ "$1" == "--force" || "$1" == "-f" ]]; then
    echo "[WARNING] Force update will discard any local changes on server-4* branches!"
    echo "[WARNING] This will reset all server-4* branches to exactly match origin."
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        FORCE_UPDATE=true
        echo "[INFO] Proceeding with force update..."
    else
        echo "[INFO] Force update cancelled."
        exit 0
    fi
fi

# Save the current branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
echo "[INFO] Current branch: $current_branch"

# Fetch all remote branches to ensure we have the latest refs
echo "[INFO] Fetching remote branches..."
git fetch origin

# Process all server-4* branches
for branch in $(git ls-remote --heads origin | awk '{print $2}' | grep 'refs/heads/server-4' | sed 's|refs/heads/||'); do
  echo "[INFO] Updating branch: $branch"
  git checkout "$branch" 2>/dev/null || {
    echo "[INFO] Branch $branch doesn't exist locally, creating it..."
    git checkout -b "$branch" "origin/$branch"
    continue
  }

  if [[ "$FORCE_UPDATE" == true ]]; then
    echo "[INFO] Force updating $branch to match origin (discarding local changes)..."
    git reset --hard "origin/$branch"
  else
    echo "[INFO] Pulling changes for $branch..."
    git pull origin "$branch"
  fi
done

# Go back to the original branch
echo "[INFO] Returning to original branch: $current_branch"
git checkout "$current_branch"

if [[ "$FORCE_UPDATE" == true ]]; then
    echo "[INFO] All server-4* branches have been force-updated to match origin"
else
    echo "[INFO] All server-4* branches have been updated"
    echo "[INFO] Use --force or -f flag to force-update branches and avoid conflicts"
fi