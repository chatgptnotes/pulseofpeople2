#!/usr/bin/env bash
# exit on error
set -o errexit

echo "📦 Installing dependencies..."
pip install -r requirements.txt

echo "📁 Collecting static files..."
python manage.py collectstatic --no-input

echo "🗄️  Running migrations..."
python manage.py migrate

echo "👥 Creating demo users..."
python manage.py create_demo_users || echo "⚠️  Warning: Demo users creation failed (will continue anyway)"

echo "✅ Build complete!"
