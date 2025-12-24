#!/bin/bash

# AGI Framework - New Project Setup Script
# This script sets up a new project using the AGI framework

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

# Check if project name is provided
if [ -z "$1" ]; then
    print_error "Please provide a project name"
    echo "Usage: ./setup-new-project.sh <project-name>"
    exit 1
fi

PROJECT_NAME=$1
FRAMEWORK_REPO="https://github.com/YOUR_USERNAME/agi-framework.git"

echo "=================================================="
echo "  AGI Framework - New Project Setup"
echo "=================================================="
echo ""
echo "Creating project: $PROJECT_NAME"
echo ""

# Check if directory already exists
if [ -d "$PROJECT_NAME" ]; then
    print_error "Directory $PROJECT_NAME already exists"
    exit 1
fi

# Step 1: Create project directory
print_status "Creating project directory..."
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Step 2: Initialize git
print_status "Initializing git repository..."
git init

# Step 3: Add AGI framework as a submodule or copy it
echo ""
echo "How would you like to include the AGI framework?"
echo "1) Submodule (recommended - stays in sync with framework updates)"
echo "2) Copy (independent - no automatic updates)"
read -p "Enter choice (1 or 2): " FRAMEWORK_CHOICE

if [ "$FRAMEWORK_CHOICE" = "1" ]; then
    print_status "Adding AGI framework as submodule..."
    git submodule add "$FRAMEWORK_REPO" framework
    git submodule update --init --recursive
elif [ "$FRAMEWORK_CHOICE" = "2" ]; then
    print_status "Copying AGI framework..."
    git clone "$FRAMEWORK_REPO" temp_framework
    cp -r temp_framework/src ./framework
    cp -r temp_framework/docs ./docs
    rm -rf temp_framework
else
    print_error "Invalid choice"
    exit 1
fi

# Step 4: Create project structure
print_status "Creating project structure..."

mkdir -p src/{components,pages,services,hooks,utils}
mkdir -p public
mkdir -p tests
mkdir -p config

# Step 5: Initialize package.json
print_status "Initializing package.json..."

cat > package.json << EOF
{
  "name": "$PROJECT_NAME",
  "version": "0.1.0",
  "private": true,
  "description": "AI application built with AGI Framework by Funnelists LLC",
  "author": "Funnelists LLC",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "@anthropic-ai/sdk": "^0.24.0"
  },
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "eslint": "^8.45.0",
    "eslint-config-react-app": "^7.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "lint": "eslint src/**/*.{js,jsx}"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF

# Step 6: Create .env.example
print_status "Creating .env.example..."

cat > .env.example << 'EOF'
# Copy this to .env and fill in your values

# Model Providers
REACT_APP_ANTHROPIC_API_KEY=
REACT_APP_DEFAULT_MODEL=claude-sonnet-4

# Application
REACT_APP_LOG_LEVEL=info
REACT_APP_DEBUG_MODE=false

# For full configuration options, see framework/docs/.env.example
EOF

# Step 7: Create .gitignore
print_status "Creating .gitignore..."

cat > .gitignore << 'EOF'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Misc
.cache/
.temp/
EOF

# Step 8: Create main App.js
print_status "Creating App.js..."

cat > src/App.js << 'EOF'
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AGI Framework Application</h1>
        <p>Your AI-powered application starts here.</p>
      </header>
      
      <main>
        <p>
          Edit <code>src/App.js</code> to get started building your application.
        </p>
        <p>
          See <code>framework/docs/</code> for complete documentation.
        </p>
      </main>
    </div>
  );
}

export default App;
EOF

# Step 9: Create index.js
print_status "Creating index.js..."

cat > src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# Step 10: Create basic CSS
cat > src/App.css << 'EOF'
.App {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.App-header {
  background-color: #282c34;
  padding: 2rem;
  color: white;
  text-align: center;
}

main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

code {
  background-color: #f4f4f4;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}
EOF

cat > src/index.css << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOF

# Step 11: Create public/index.html
print_status "Creating index.html..."

mkdir -p public
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="AI application built with AGI Framework" />
    <title>AGI Framework App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
EOF

# Step 12: Create README for the project
print_status "Creating project README..."

cat > README.md << EOF
# $PROJECT_NAME

AI application built with the AGI Framework.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy environment template:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Add your API keys to \`.env\`

4. Start development server:
   \`\`\`bash
   npm start
   \`\`\`

## Documentation

- Framework docs: \`framework/docs/\` or \`docs/\`
- Start with: \`framework/docs/CONTEXT.md\`
- Architecture: \`framework/docs/ARCHITECTURE.md\`
- Patterns: \`framework/docs/API_PATTERNS.md\`

## Project Structure

\`\`\`
src/
  components/     - React components
  pages/          - Page components
  services/       - Business logic and API calls
  hooks/          - Custom React hooks
  utils/          - Utility functions
\`\`\`

## Available Scripts

- \`npm start\` - Run development server
- \`npm test\` - Run tests
- \`npm run build\` - Build for production
- \`npm run lint\` - Lint code

## Framework

This project uses the AGI Framework for building AI applications.
EOF

# Step 13: Install dependencies
print_status "Installing dependencies..."
npm install

# Step 14: Create initial commit
print_status "Creating initial commit..."
git add .
git commit -m "Initial commit - AGI Framework project setup"

# Done!
echo ""
echo "=================================================="
print_status "Project setup complete!"
echo "=================================================="
echo ""
echo "Next steps:"
echo ""
echo "  1. cd $PROJECT_NAME"
echo "  2. cp .env.example .env"
echo "  3. Edit .env and add your API keys"
echo "  4. npm start"
echo ""
echo "Documentation:"
if [ "$FRAMEWORK_CHOICE" = "1" ]; then
    echo "  - Framework docs: framework/docs/"
else
    echo "  - Framework docs: docs/"
fi
echo "  - Start here: CONTEXT.md"
echo ""
print_warning "Don't forget to add your API keys to .env!"
echo ""
