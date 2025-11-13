# ============================================
# Pulse of People - Frontend Dockerfile
# Multi-stage build for optimized production image
# ============================================

# Stage 1: Build
FROM node:22-alpine as builder

# Set working directory
WORKDIR /app

# Accept build arguments for environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_DJANGO_API_URL
ARG VITE_APP_NAME
ARG VITE_APP_VERSION

# Set environment variables for Vite build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_DJANGO_API_URL=$VITE_DJANGO_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION

# Copy package files
COPY package*.json ./

# Install ALL dependencies (need devDependencies for build)
# Using npm install instead of npm ci to handle lock file inconsistencies
RUN npm install && npm cache clean --force

# Copy application source
COPY . .

# Build application (environment variables will be baked into JS bundle)
RUN npm run build

# ============================================
# Stage 2: Production with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy custom entrypoint script for Railway dynamic PORT
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user (but keep root for entrypoint to modify nginx config)
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 && \
    chown -R appuser:appuser /usr/share/nginx/html

# Note: Running as root for Railway PORT configuration
# Railway needs to modify nginx.conf at runtime

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx using custom entrypoint that handles Railway's dynamic PORT
CMD ["/docker-entrypoint.sh"]
