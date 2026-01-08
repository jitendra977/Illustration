

# ========================================
# logs.sh (ROOT)
# ========================================
#!/bin/bash

# Show logs for all services
echo "📋 Showing logs (Ctrl+C to exit)..."

# Choose which logs to show
case "$1" in
  backend)
    docker-compose logs -f yaw-backend
    ;;
  frontend)
    docker-compose logs -f yaw-frontend
    ;;
  mysql)
    cd mysql && docker-compose logs -f mysql_db
    ;;
  all)
    docker-compose logs -f
    ;;
  *)
    echo "Usage: ./logs.sh [backend|frontend|mysql|all]"
    echo "Example: ./logs.sh backend"
    ;;
esac
