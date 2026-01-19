#!/bin/bash
# Fix slow deployment by removing node_modules from Git on server

set -e

echo "🔧 Fixing slow deployment issue on server..."
echo "This will remove frontend/node_modules from Git tracking"
echo ""

# SSH into server and fix the issue
ssh nishanaweb@nishanaweb.cloud << 'EOF'
  cd /home/nishanaweb/project/Illustration
  
  echo "📍 Current directory: $(pwd)"
  
  # Stop containers first
  echo "🛑 Stopping containers..."
  docker compose down
  
  # Remove node_modules from Git tracking (but keep the files)
  echo "🗑️  Removing node_modules from Git..."
  git rm -r --cached frontend/node_modules || true
  
  # Commit this change
  echo "💾 Committing the removal..."
  git add .gitignore
  git commit -m "chore: Remove node_modules from Git tracking" || echo "Nothing to commit"
  
  # Force clean any remaining conflicts
  echo "🧹 Cleaning up..."
  git reset --hard origin/deploy-server
  
  # Pull latest changes
  echo "📥 Pulling latest code..."
  git pull origin deploy-server
  
  # Rebuild containers
  echo "🏗️  Rebuilding containers..."
  docker compose up -d --build
  
  echo "✅ Done! Deployment should be much faster now."
EOF

echo ""
echo "🎉 Server fixed! Future deployments will be much faster."
