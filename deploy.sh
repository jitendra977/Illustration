#!/usr/bin/env bash

# Deployment script for Illustration System
# This script pushes local changes to GitHub and triggers a deployment on the VPS.

set -e

# ==========================================
# CONFIGURATION
# ==========================================
# VPS SSH Details (Please fill these if they are different)
VPS_USER="nishanaweb"                       # Change if necessary
VPS_HOST="nishanaweb.cloud"       # Based on your browser URL
REMOTE_PROJECT_DIR="/home/nishanaweb/project/Illustration" # Path on the VPS
BRANCH="deploy-server"                # The branch to deploy

# ==========================================
# LOCAL ACTIONS
# ==========================================
echo "🚀 Starting deployment flow..."

# 1. Git Push
echo "📦 Pushing changes to origin/$BRANCH..."
git push origin "$BRANCH"

# ==========================================
# REMOTE ACTIONS (via SSH)
# ==========================================
echo "🌐 Connecting to VPS: $VPS_HOST..."

ssh "$VPS_USER@$VPS_HOST" << EOF
    set -e
    echo "--- VPS: Navigating to project directory ---"
    cd "$REMOTE_PROJECT_DIR"

    echo "--- VPS: Configuring safe directory for Git ---"
    git config --global --add safe.directory "$REMOTE_PROJECT_DIR"

    echo "--- VPS: Fetching latest changes from origin ---"
    git fetch origin

    echo "--- VPS: Stashing any local changes (settings/env) ---"
    git stash

    echo "--- VPS: Pulling latest changes from $BRANCH ---"
    git pull origin "$BRANCH"

    echo "--- VPS: Restoring local changes (if any) ---"
    git stash pop || echo "No local changes to restore."

    echo "--- VPS: Building images (Separate from UP to reduce load) ---"
    docker compose build --pull

    echo "--- VPS: Restarting and rebuilding containers ---"
    docker compose up -d

    echo "✅ VPS: Deployment successful!"
EOF

echo "🎉 Deployment complete for branch $BRANCH!"
