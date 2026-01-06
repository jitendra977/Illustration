#!/usr/bin/env bash

# Simple deployment script for the Illustration project
# Assumes the repository is already cloned at ~/project/Illustration

set -e

PROJECT_DIR=~/project/Illustration
BRANCH=deploy-server

echo "--- Deploying Illustration project ---"
echo "--- Update Verification: Test Push $(date) ---"

cd "$PROJECT_DIR"

# Ensure we are on the correct branch
git fetch origin
git checkout $BRANCH

git pull origin $BRANCH

# Use Docker Compose to bring up services (CI config not needed for production)
# Adjust as needed for your environment
docker compose -f docker-compose.yml up -d --build

echo "--- Deployment complete ---"
