

# ========================================
# Makefile (ROOT - Optional)
# ========================================
.PHONY: help start stop restart logs build clean status

help:
	@echo "Available commands:"
	@echo "  make start    - Start all services"
	@echo "  make stop     - Stop all services"
	@echo "  make restart  - Restart all services"
	@echo "  make logs     - Show all logs"
	@echo "  make build    - Rebuild all containers"
	@echo "  make clean    - Remove all containers and volumes"
	@echo "  make status   - Show service status"

start:
	@echo "Starting MySQL..."
	@cd mysql && docker-compose up -d
	@sleep 15
	@echo "Starting application..."
	@docker-compose up -d
	@echo "✅ All services started!"

stop:
	@echo "Stopping services..."
	@docker-compose down
	@cd mysql && docker-compose down
	@echo "✅ All services stopped!"

restart: stop start

logs:
	@docker-compose logs -f

logs-backend:
	@docker-compose logs -f yaw-backend

logs-frontend:
	@docker-compose logs -f yaw-frontend

logs-mysql:
	@cd mysql && docker-compose logs -f mysql_db

build:
	@echo "Rebuilding containers..."
	@docker-compose build --no-cache
	@echo "✅ Build complete!"

clean:
	@echo "⚠️  This will remove all containers, volumes, and images!"
	@read -p "Are you sure? (y/N) " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v --rmi all; \
		cd mysql && docker-compose down -v --rmi all; \
		echo "✅ Cleanup complete!"; \
	fi

status:
	@echo "=== Application Services ==="
	@docker-compose ps
	@echo ""
	@echo "=== MySQL Services ==="
	@cd mysql && docker-compose ps

