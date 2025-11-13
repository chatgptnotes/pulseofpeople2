#!/bin/bash
# Setup daily cron job for sentiment updates

# This script sets up a cron job to run the sentiment updater daily at 6 AM
# The AI will analyze news and update district sentiment scores automatically

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔧 Setting up daily sentiment update cron job..."
echo "📁 Project root: $PROJECT_ROOT"

# Create log directory
mkdir -p "$PROJECT_ROOT/logs"

# Cron command
CRON_CMD="0 6 * * * cd $PROJECT_ROOT && /usr/bin/env tsx scripts/update-constituency-sentiment.ts >> logs/sentiment-update.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "update-constituency-sentiment"; then
    echo "⚠️  Cron job already exists. Updating..."
    # Remove old entry
    crontab -l | grep -v "update-constituency-sentiment" | crontab -
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -

echo "✅ Cron job installed successfully!"
echo ""
echo "📅 Schedule: Every day at 6:00 AM"
echo "📝 Logs: $PROJECT_ROOT/logs/sentiment-update.log"
echo ""
echo "To view current cron jobs:"
echo "  crontab -l"
echo ""
echo "To remove this cron job:"
echo "  crontab -l | grep -v 'update-constituency-sentiment' | crontab -"
echo ""
echo "To test manually:"
echo "  cd $PROJECT_ROOT"
echo "  tsx scripts/update-constituency-sentiment.ts"
echo ""
