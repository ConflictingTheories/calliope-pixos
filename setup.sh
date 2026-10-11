#!/bin/bash
# PixoSpritz Engine — Development Setup
# Gets a new developer from zero to running in one command.

set -e

echo "🎮 PixoSpritz Engine Setup"
echo "=========================="

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install Node 18+ from https://nodejs.org"
    exit 1
fi
echo "✅ Node $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found."
    exit 1
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Verify
echo ""
echo "🔍 Verifying setup..."
npm run verify 2>/dev/null || echo "⚠️  Verify script not found, skipping"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  npm run dev        Start the editor"
echo "  npm test           Run tests"
echo "  npm run build      Build for production"
