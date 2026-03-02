#!/usr/bin/env bash
set -euo pipefail

# Usage: ./deploy.sh user@remote-host [/remote/path]
REMOTE="${1:-}"
REMOTE_DIR="${2:-/opt/trust_engine}"

if [[ -z "$REMOTE" ]]; then
  echo "Usage: $0 user@remote-host [/remote/path]"
  exit 1
fi

echo "Deploying to $REMOTE:$REMOTE_DIR"

# Sync project files to remote (excluding node_modules and .git)
rsync -avz --delete \
  --exclude node_modules \
  --exclude .git \
  . "$REMOTE:$REMOTE_DIR"

# Build and run on remote (no heredoc; everything is on one line)
ssh -T "$REMOTE" "
  set -e
  cd '$REMOTE_DIR'
  docker compose build --pull
  docker compose up -d --remove-orphans
  docker compose ps
"

echo "Deployment complete."