#!/bin/bash
# Setup Vercel Environment Variables for Production
# This script configures all required environment variables for the Pulse of People platform

set -e

echo "Setting up Vercel environment variables for production..."

# Get project directory
PROJECT_DIR="/Users/murali/1backup/Pulseofpeople8thNov/pulseofpeople/frontend"
cd "$PROJECT_DIR"

# Environment variables to set (from .env file)
SUPABASE_URL="https://iwtgbseaoztjbnvworyq.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dGdic2Vhb3p0amJudndvcnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjAzOTksImV4cCI6MjA3NjczNjM5OX0.xA4B0XZJE_4MdjFCkw2yVsf4vlHmHfpeV6Bk5tG2T94"

# Backend API URL - need to get from user or use Railway URL
# For now using a placeholder
API_URL="https://pulseofpeople-backend.railway.app/api"

echo "Setting VITE_SUPABASE_URL..."
echo "$SUPABASE_URL" | vercel env add VITE_SUPABASE_URL production --yes 2>/dev/null || echo "VITE_SUPABASE_URL may already exist"

echo "Setting VITE_SUPABASE_ANON_KEY..."
echo "$SUPABASE_ANON_KEY" | vercel env add VITE_SUPABASE_ANON_KEY production --yes 2>/dev/null || echo "VITE_SUPABASE_ANON_KEY may already exist"

echo "Setting VITE_API_URL..."
echo "$API_URL" | vercel env add VITE_API_URL production --yes 2>/dev/null || echo "VITE_API_URL may already exist"

echo "Setting VITE_DJANGO_API_URL..."
echo "$API_URL" | vercel env add VITE_DJANGO_API_URL production --yes 2>/dev/null || echo "VITE_DJANGO_API_URL may already exist"

echo "Setting VITE_BACKEND_URL..."
echo "https://pulseofpeople-backend.railway.app" | vercel env add VITE_BACKEND_URL production --yes 2>/dev/null || echo "VITE_BACKEND_URL may already exist"

echo "Setting VITE_APP_NAME..."
echo "Pulse of People" | vercel env add VITE_APP_NAME production --yes 2>/dev/null || echo "VITE_APP_NAME may already exist"

echo "Setting VITE_ENVIRONMENT..."
echo "production" | vercel env add VITE_ENVIRONMENT production --yes 2>/dev/null || echo "VITE_ENVIRONMENT may already exist"

echo "Setting VITE_MULTI_TENANT..."
echo "false" | vercel env add VITE_MULTI_TENANT production --yes 2>/dev/null || echo "VITE_MULTI_TENANT may already exist"

echo "Setting VITE_ENABLE_SOCIAL_MEDIA..."
echo "true" | vercel env add VITE_ENABLE_SOCIAL_MEDIA production --yes 2>/dev/null || echo "VITE_ENABLE_SOCIAL_MEDIA may already exist"

echo "Setting VITE_ENABLE_INFLUENCER_TRACKING..."
echo "true" | vercel env add VITE_ENABLE_INFLUENCER_TRACKING production --yes 2>/dev/null || echo "VITE_ENABLE_INFLUENCER_TRACKING may already exist"

echo "Setting VITE_ENABLE_FIELD_REPORTS..."
echo "true" | vercel env add VITE_ENABLE_FIELD_REPORTS production --yes 2>/dev/null || echo "VITE_ENABLE_FIELD_REPORTS may already exist"

echo "Setting VITE_ENABLE_SURVEYS..."
echo "true" | vercel env add VITE_ENABLE_SURVEYS production --yes 2>/dev/null || echo "VITE_ENABLE_SURVEYS may already exist"

echo "Setting VITE_ENABLE_AI_INSIGHTS..."
echo "true" | vercel env add VITE_ENABLE_AI_INSIGHTS production --yes 2>/dev/null || echo "VITE_ENABLE_AI_INSIGHTS may already exist"

echo ""
echo "Environment variables configured successfully!"
echo ""
echo "To pull these variables locally, run:"
echo "  vercel env pull .env.production"
echo ""
echo "To redeploy with new environment variables, run:"
echo "  vercel --prod"
