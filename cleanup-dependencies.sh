#!/bin/bash

# Dependency Cleanup Script for AGI Framework
# This script removes unnecessary dependencies and updates outdated packages

set -e  # Exit on error

echo "🔍 AGI Framework Dependency Cleanup"
echo "===================================="
echo ""

# Backup current package.json
echo "📦 Creating backup of package.json..."
cp package.json package.json.backup
echo "✅ Backup created: package.json.backup"
echo ""

# Phase 1: Remove React dependencies
echo "🗑️  Phase 1: Removing unused React dependencies..."
npm uninstall react react-dom react-scripts web-vitals \
  @testing-library/jest-dom @testing-library/react \
  2>/dev/null || echo "Some packages already removed"
echo "✅ React dependencies removed"
echo ""

# Phase 2: Remove unused AI providers
echo "🗑️  Phase 2: Removing unused AI provider SDKs..."
npm uninstall @mistralai/mistralai cohere-ai 2>/dev/null || echo "Already removed"
echo "✅ Unused AI providers removed"
echo ""

# Phase 3: Update remaining dependencies
echo "⬆️  Phase 3: Updating AI SDKs to latest versions..."
echo "   This may take a few moments..."
npm install @anthropic-ai/sdk@latest \
  @google/generative-ai@latest \
  openai@latest \
  @supabase/supabase-js@latest
echo "✅ AI SDKs updated"
echo ""

# Phase 4: Add proper dev dependencies
echo "🛠️  Phase 4: Adding proper development dependencies..."
npm install --save-dev jest@latest
echo "✅ Dev dependencies added"
echo ""

# Run audit to check security status
echo "🔒 Running security audit..."
npm audit || echo "⚠️  Some vulnerabilities may remain - review audit output above"
echo ""

# Show outdated packages
echo "📊 Checking for remaining outdated packages..."
npm outdated || echo "✅ All packages up to date!"
echo ""

# Success message
echo "✨ Cleanup complete!"
echo ""
echo "📋 Summary:"
echo "  - Removed all React dependencies (react, react-dom, react-scripts, web-vitals)"
echo "  - Removed unused AI providers (Mistral, Cohere)"
echo "  - Updated AI SDKs to latest versions"
echo "  - Added proper dev dependencies"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "  1. Test your provider implementations (they may need updates for new SDK versions)"
echo "  2. Update your code to use new API patterns if needed"
echo "  3. Review src/providers/ files for breaking changes"
echo "  4. Update package.json scripts (remove 'start' and 'build')"
echo "  5. Run your tests to ensure everything works"
echo ""
echo "💾 Backup available at: package.json.backup"
echo ""
