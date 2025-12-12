#!/bin/sh

echo "➡ Waiting for MySQL..."
while ! nc -z mysql_db 3306; do
  sleep 1
done
echo "✔ MySQL is ready"

echo "➡ Applying migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo "➡ Collecting static files..."
python manage.py collectstatic --noinput

echo "➡ Creating default admin user if not exists..."
python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username="admin").exists():
    User.objects.create_superuser("admin", "admin@gmail.com", "adminpass")
EOF

echo "➡ Starting Gunicorn server..."
gunicorn main.wsgi:application --bind 0.0.0.0:8000 --workers 3