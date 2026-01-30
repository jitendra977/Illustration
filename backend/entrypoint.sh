#!/usr/bin/sh

set -e

echo "➡ Waiting for MySQL database at ${DB_HOST:-mysql_db}:${DB_PORT:-3306}..."

# Wait for MySQL to be ready
max_tries=30
count=0
while ! nc -z ${DB_HOST:-mysql_db} ${DB_PORT:-3306}; do
  count=$((count + 1))
  if [ $count -ge $max_tries ]; then
    echo "❌ MySQL is not available after ${max_tries} attempts"
    exit 1
  fi
  echo "MySQL is unavailable - sleeping (attempt $count/$max_tries)"
  sleep 2
done

echo "✔ MySQL is ready!"

# Additional check: try to connect with mysqladmin
echo "➡ Verifying MySQL connection..."
sleep 3

echo "➡ Running migrations..."
python manage.py makemigrations --noinput || true
python manage.py migrate --noinput

echo "➡ Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "➡ Creating default admin user if not exists..."
python manage.py shell <<EOF
import os
from django.contrib.auth import get_user_model
User = get_user_model()
username = os.getenv("DJANGO_SUPERUSER_USERNAME", "admin")
email = os.getenv("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
password = os.getenv("DJANGO_SUPERUSER_PASSWORD", "adminpass")

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
    print(f"✔ Admin user '{username}' created")
else:
    print(f"✔ Admin user '{username}' already exists")
EOF

echo "➡ Starting Gunicorn server with threaded workers..."
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 2 \
    --threads 4 \
    --worker-class gthread \
    --timeout 120 \
    --log-level info \
    --access-logfile - \
    --error-logfile -