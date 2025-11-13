#!/bin/bash
# Quick setup script for AI Sentiment System

echo "🤖 AI-Powered Sentiment System Setup"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating..."
    cp .env.example .env 2>/dev/null || touch .env
fi

# Check for OpenAI API key
if grep -q "OPENAI_API_KEY=" .env && ! grep -q "OPENAI_API_KEY=$" .env && ! grep -q "OPENAI_API_KEY=sk-your" .env; then
    echo "✅ OpenAI API key found in .env"
else
    echo "❌ OpenAI API key not configured"
    echo ""
    echo "Please add your OpenAI API key to .env file:"
    echo "OPENAI_API_KEY=sk-your-key-here"
    echo ""
    echo "Get your API key from: https://platform.openai.com/api-keys"
    echo ""
    read -p "Press Enter to continue anyway, or Ctrl+C to exit and configure..."
fi

echo ""
echo "📦 Installing dependencies..."
npm install openai @supabase/supabase-js tsx --save

echo ""
echo "🗄️  Setting up database..."
echo "Please run the migration manually:"
echo "  psql -h your-db-host -U postgres -d postgres -f supabase/migrations/05_district_sentiment_ai.sql"
echo ""
read -p "Have you run the database migration? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️  Please run the migration before setting up cron job"
    echo "Exiting..."
    exit 1
fi

echo ""
echo "⏰ Would you like to set up the daily cron job? (runs at 6 AM)"
read -p "(y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    chmod +x scripts/cron-setup.sh
    ./scripts/cron-setup.sh
else
    echo "⏭️  Skipping cron setup. You can run it later with:"
    echo "  ./scripts/cron-setup.sh"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Test the system manually:"
echo "   tsx scripts/update-constituency-sentiment.ts"
echo ""
echo "2. View the README for more information:"
echo "   cat AI_SENTIMENT_SYSTEM.md"
echo ""
echo "3. Check your map - it should show sentiment colors!"
echo ""
echo "🎉 Your AI sentiment system is ready!"
