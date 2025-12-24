# Getting Started with AGI Framework

Complete guide to setting up the framework and creating new projects.

## Table of Contents

- [Initial Setup](#initial-setup)
- [Creating New Projects](#creating-new-projects)
- [Manual Setup Alternative](#manual-setup-alternative)
- [License Recommendation](#license-recommendation)
- [First Steps After Setup](#first-steps-after-setup)

---

## Initial Setup

### Prerequisites

Before starting, ensure you have:

- **Node.js** 18.x or 20.x ([Download](https://nodejs.org/))
- **npm** 9.x+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- An **Anthropic API key** ([Get one](https://console.anthropic.com/))

### 1. Set Up the Framework Repository

First, create your framework repository that will be the foundation for all projects:

```bash
# Create the framework repository
mkdir agi-framework
cd agi-framework

# Initialize git
git init

# Create the structure
mkdir -p src/{agents,capabilities,orchestration,memory,tools,providers,utils}
mkdir -p docs
mkdir -p examples
mkdir -p tests

# Copy all the documentation files to docs/
# (ARCHITECTURE.md, CONVENTIONS.md, CONTEXT.md, API_PATTERNS.md, 
#  PROMPTS.md, DECISIONS.md, GLOSSARY.md)

# Copy code files to src/
# (BaseAgent.js, ReasoningAgent.js, etc.)

# Copy .env.example to root
# Copy GitHub Actions workflow to .github/workflows/

# Initialize npm
npm init -y

# Install core dependencies
npm install @anthropic-ai/sdk react react-dom react-scripts

# Install dev dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom eslint

# Create initial commit
git add .
git commit -m "Initial AGI Framework setup"
```

### 2. Push to GitHub

```bash
# Create a new repository on GitHub (agi-framework)
# Then push your code:

git remote add origin https://github.com/YOUR_USERNAME/agi-framework.git
git branch -M main
git push -u origin main
```

### 3. Make the Setup Script Executable

```bash
chmod +x setup-new-project.sh
```

---

## Creating New Projects

### Option 1: Using the Setup Script (Recommended)

The quickest way to start a new project:

```bash
# Navigate to where you want to create projects
cd ~/projects

# Run the setup script
bash /path/to/agi-framework/setup-new-project.sh my-awesome-app

# Follow the prompts:
# 1) Choose "Submodule" to stay in sync with framework updates
# 2) Wait for dependencies to install

# Navigate to your new project
cd my-awesome-app

# Add your API keys
cp .env.example .env
nano .env  # or use your preferred editor

# Start developing!
npm start
```

**What the script creates:**

- ✅ Complete project structure
- ✅ AGI framework (as submodule or copy)
- ✅ React application boilerplate
- ✅ Configuration files
- ✅ Git repository with initial commit
- ✅ All dependencies installed

### Option 2: Using Create React App + Framework

If you prefer more control:

```bash
# Create React app
npx create-react-app my-awesome-app
cd my-awesome-app

# Add framework as submodule
git submodule add https://github.com/YOUR_USERNAME/agi-framework.git framework

# Install framework dependencies
npm install @anthropic-ai/sdk

# Copy .env.example from framework
cp framework/.env.example .env

# Start building!
npm start
```

---

## Manual Setup Alternative

If you prefer to set up everything manually:

### Step 1: Create Project

```bash
npx create-react-app my-project
cd my-project
```

### Step 2: Add Framework Files

**Option A: As Submodule (Recommended)**

```bash
git submodule add https://github.com/YOUR_USERNAME/agi-framework.git framework
git submodule update --init --recursive
```

**Option B: Copy Files**

```bash
# Clone and copy
git clone https://github.com/YOUR_USERNAME/agi-framework.git temp
cp -r temp/src ./framework/src
cp -r temp/docs ./framework/docs
rm -rf temp
```

### Step 3: Install Dependencies

```bash
npm install @anthropic-ai/sdk
```

### Step 4: Configure Environment

```bash
cp framework/.env.example .env

# Edit .env and add your keys:
REACT_APP_ANTHROPIC_API_KEY=your_key_here
REACT_APP_DEFAULT_MODEL=claude-sonnet-4
```

### Step 5: Import and Use

```javascript
// src/App.js
import { ReasoningAgent } from './framework/src/agents/ReasoningAgent';
import { AnthropicProvider } from './framework/src/providers/AnthropicProvider';

function App() {
  const provider = new AnthropicProvider({
    apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY
  });

  const agent = new ReasoningAgent({
    id: 'my-agent',
    provider: provider
  });

  // Use the agent...
}
```

---

## License Recommendation

### For Solo/Personal Projects: MIT License

Since you're working solo on personal projects, I recommend the **MIT License**. Here's why:

**Advantages:**

- ✅ Simple and permissive
- ✅ Others can use your code freely
- ✅ Can be used in commercial projects
- ✅ Industry standard for open source
- ✅ No complicated restrictions

**MIT License Text:**

```
MIT License

Copyright (c) 2025 Funnelists LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**To add it:**

1. Create `LICENSE` file in your framework repository
2. Paste the MIT license text
3. Replace `[Your Name]` with **Funnelists LLC**
4. Commit it: `git add LICENSE && git commit -m "Add MIT license"`

### Alternative: Apache 2.0

If you want more explicit patent protection:

- More legal protections
- Explicit patent grant
- Better for projects that might have patent concerns
- Still very permissive

---

## First Steps After Setup

### 1. Verify Installation

```bash
# Check that everything installed correctly
npm start

# You should see the React app running at http://localhost:3000
```

### 2. Test with a Simple Agent

Create `src/TestAgent.js`:

```javascript
import { ReasoningAgent } from './framework/src/agents/ReasoningAgent';
import { AnthropicProvider } from './framework/src/providers/AnthropicProvider';

async function testAgent() {
  const provider = new AnthropicProvider({
    apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY
  });

  const agent = new ReasoningAgent({
    id: 'test-agent',
    provider: provider
  });

  const result = await agent.execute({
    id: 'test-1',
    description: 'What are the key principles of good API design?'
  });

  console.log('Agent result:', result);
}

testAgent();
```

### 3. Read the Documentation

Start with these docs (in order):

1. **framework/docs/CONTEXT.md** - Understand the why
2. **framework/docs/GLOSSARY.md** - Learn the terms
3. **framework/docs/ARCHITECTURE.md** - See the big picture
4. **framework/docs/CONVENTIONS.md** - Learn coding patterns

### 4. Try the Example Application

```bash
# Copy the example to your src/
cp framework/examples/TaskAnalyzer.jsx src/

# Import it in your App.js
# import TaskAnalyzer from './TaskAnalyzer';
```

### 5. Build Your First Feature

Start small:

1. Create a simple agent
2. Add a basic tool
3. Integrate with your UI
4. Iterate and improve

---

## Keeping Framework Updated

### If Using Submodules (Recommended)

Update your framework in any project:

```bash
cd my-project
git submodule update --remote framework
git add framework
git commit -m "Update AGI framework"
```

### If You Copied Files

You'll need to manually copy updates:

```bash
# In your framework repo
git pull origin main

# In your project
cp -r /path/to/agi-framework/src/* ./framework/src/
```

---

## Common Issues

### "Cannot find module '@anthropic-ai/sdk'"

```bash
npm install @anthropic-ai/sdk
```

### "API key not found"

Make sure `.env` exists and contains:

```
REACT_APP_ANTHROPIC_API_KEY=your_actual_key
```

### Framework imports not working

Check your import paths:

```javascript
// If framework is a submodule:
import { ReasoningAgent } from './framework/src/agents/ReasoningAgent';

// If framework is in node_modules (not recommended):
import { ReasoningAgent } from 'agi-framework/agents/ReasoningAgent';
```

### Submodule not initialized

```bash
git submodule update --init --recursive
```

---

## Project Structure Best Practices

```
my-awesome-app/
├── framework/              # AGI Framework (submodule)
│   ├── src/
│   │   ├── agents/
│   │   ├── tools/
│   │   └── ...
│   └── docs/
│
├── src/
│   ├── components/        # Your React components
│   ├── pages/            # Your page components
│   ├── services/         # Business logic using framework
│   │   └── AgentService.js
│   ├── hooks/            # Custom React hooks
│   │   └── useAgent.js
│   └── utils/            # Your utilities
│
├── public/
├── tests/
├── .env                  # Your API keys (gitignored)
├── .env.example         # Template for .env
└── README.md            # Your project docs
```

---

## Next Steps

1. ✅ Set up framework repository
2. ✅ Create your first project
3. ✅ Add API keys
4. ✅ Run example application
5. 📖 Read documentation
6. 🎨 Build your first feature
7. 🚀 Ship your AI application!

---

## Getting Help

- **Framework Docs**: Start with `framework/docs/CONTEXT.md`
- **API Patterns**: See `framework/docs/API_PATTERNS.md`
- **Examples**: Check `framework/examples/`
- **Issues**: Create an issue on GitHub
- **Updates**: Watch the framework repo for updates

---

## Quick Reference

```bash
# Create new project
bash agi-framework/setup-new-project.sh my-app

# Update framework in project
git submodule update --remote framework

# Run development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

Happy building! 🚀
