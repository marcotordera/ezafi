#!/usr/bin/env bash
set -e

# Navigate to the ezAFI repository directory on EC2
cd /home/ubuntu/ezafi

echo "=========================================="
echo "🚀 1. Pulling latest code and chunks..."
echo "=========================================="
git pull origin main

echo "=========================================="
echo "🛑 2. Stopping existing containers..."
echo "=========================================="
docker compose down

echo "=========================================="
echo "🔨 3. Rebuilding and starting stack..."
echo "=========================================="
docker compose up -d --build

echo "=========================================="
echo "✅ 4. Verifying status..."
echo "=========================================="
sleep 3
curl -s http://localhost:8000/health || true
echo ""
