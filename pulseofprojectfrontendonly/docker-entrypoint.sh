#!/bin/sh
# Railway Dynamic Port Configuration
# Replaces PORT placeholder in nginx config with Railway's $PORT variable

set -e

# Use Railway's PORT if set, otherwise default to 80
PORT=${PORT:-80}

echo "🚀 Starting Nginx on port $PORT"

# Replace PORT in nginx config
sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g 'daemon off;'
