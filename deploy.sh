#!/usr/bin/env bash
set -euo pipefail

REMOTE="${1:-}"
REMOTE_DIR="${2:-/opt/trust_engine}"

if [[ -z "$REMOTE" ]]; then
  echo "Usage: $0 user@remote-host [/remote/path]"
  exit 1
fi

echo "Deploying to $REMOTE:$REMOTE_DIR"

# Ensure remote dir exists and is writable by the SSH user
ssh -T "$REMOTE" "
  set -e
  sudo mkdir -p '$REMOTE_DIR'
  sudo chown -R \$(id -un):\$(id -gn) '$REMOTE_DIR'
"

# Sync project files (excluding node_modules and .git)
rsync -avz --delete \
  --exclude node_modules \
  --exclude .git \
  . "$REMOTE:$REMOTE_DIR"

# Build and run on remote (use sudo for docker if required)
ssh -T "$REMOTE" "
  set -e
  cd '$REMOTE_DIR'
  sudo docker compose build --pull
  sudo docker compose up -d --remove-orphans
  sudo docker compose ps
"

echo "Deployment complete."