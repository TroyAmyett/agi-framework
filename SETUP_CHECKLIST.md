# Complete Setup Checklist

Use this checklist to set up your AGI Framework from scratch.

## Phase 1: Framework Repository Setup

### Initial Setup

- [ ] Create directory: `mkdir agi-framework && cd agi-framework`
- [ ] Initialize git: `git init`
- [ ] Create directory structure:

  ```bash
  mkdir -p src/{agents,capabilities,orchestration,memory,tools,providers,prompts,utils}
  mkdir -p docs
  mkdir -p examples
  mkdir -p tests
  mkdir -p config
  mkdir -p .github/workflows
  ```

### Documentation Files (docs/)

- [ ] Copy `ARCHITECTURE.md` to `docs/`
- [ ] Copy `CONVENTIONS.md` to `docs/`
- [ ] Copy `CONTEXT.md` to `docs/`
- [ ] Copy `API_PATTERNS.md` to `docs/`
- [ ] Copy `PROMPTS.md` to `docs/`
- [ ] Copy `DECISIONS.md` to `docs/`
- [ ] Copy `GLOSSARY.md` to `docs/`

### Code Files (src/)

- [ ] Copy `BaseAgent.js` to `src/agents/`
- [ ] Copy `ReasoningAgent.js` to `src/agents/`
- [ ] Create placeholder files for other components:
  - [ ] `src/providers/AnthropicProvider.js`
  - [ ] `src/memory/ContextManager.js`
  - [ ] `src/tools/ToolRegistry.js`
  - [ ] `src/utils/logger.js`

### Configuration Files (root)

- [ ] Copy `.env.example` to root
- [ ] Copy `setup-new-project.sh` to root
- [ ] Make script executable: `chmod +x setup-new-project.sh`
- [ ] Copy `LICENSE` to root (update with **Funnelists LLC**)
- [ ] Copy `README.md` to root
- [ ] Copy `GETTING_STARTED.md` to root
- [ ] Create `.gitignore`:

  ```
  node_modules/
  .env
  .DS_Store
  build/
  coverage/
  ```

### GitHub Actions (if using)

- [ ] Copy `ci.yml` to `.github/workflows/`

### Package Setup

- [ ] Run `npm init -y`
- [ ] Edit `package.json` with proper name, description, scripts
- [ ] Install dependencies:

  ```bash
  npm install @anthropic-ai/sdk react react-dom react-scripts
  npm install --save-dev @testing-library/react @testing-library/jest-dom eslint
  ```

### Example Applications

- [ ] Copy `TaskAnalyzer.jsx` to `examples/`

### First Commit

- [ ] Review all files are in place
- [ ] `git add .`
- [ ] `git commit -m "Initial AGI Framework setup"`

### GitHub Repository

- [ ] Create new repository on GitHub named `agi-framework`
- [ ] Add remote: `git remote add origin https://github.com/YOUR_USERNAME/agi-framework.git`
- [ ] Push: `git branch -M main && git push -u origin main`

---

## Phase 2: Create Your First Project

### Using Setup Script

- [ ] Navigate to projects directory: `cd ~/projects`
- [ ] Run setup script: `bash /path/to/agi-framework/setup-new-project.sh my-first-app`
- [ ] Choose submodule option when prompted
- [ ] Wait for installation to complete

### Configure Project

- [ ] `cd my-first-app`
- [ ] Copy env file: `cp .env.example .env`
- [ ] Edit `.env` and add your Anthropic API key
- [ ] Verify LICENSE shows "Funnelists LLC"

### Test Project

- [ ] Start dev server: `npm start`
- [ ] Verify app loads at `http://localhost:3000`
- [ ] Check console for any errors

---

## Phase 3: Implement Core Components

### Providers

- [ ] Implement `AnthropicProvider.js`
- [ ] Implement `OpenAIProvider.js` (optional)
- [ ] Add provider tests

### Memory Systems

- [ ] Implement `ContextManager.js`
- [ ] Implement `ShortTermMemory.js`
- [ ] Implement `SemanticMemory.js` (if using vector DB)
- [ ] Add memory tests

### Tools

- [ ] Implement `ToolRegistry.js`
- [ ] Create basic tools (web search, calculator, etc.)
- [ ] Add tool tests

### Utilities

- [ ] Implement `logger.js`
- [ ] Implement error handling utilities
- [ ] Add utility tests

---

## Phase 4: Documentation Review

### Update Placeholders

- [ ] Replace `[Your Name]` with **Funnelists LLC** in LICENSE
- [ ] Replace `[Date]` with **December 23, 2025** in all docs
- [ ] Replace `[Team]` with **Funnelists LLC** in all docs
- [ ] Replace `YOUR_USERNAME` in setup script and docs
- [ ] Update GitHub URLs throughout

### Customize for Your Use

- [ ] Review CONTEXT.md - add your specific use cases
- [ ] Review DECISIONS.md - update with your decisions
- [ ] Review CONVENTIONS.md - adjust to your preferences
- [ ] Add your own examples to PROMPTS.md

---

## Phase 5: Testing & CI/CD

### Tests

- [ ] Write tests for BaseAgent
- [ ] Write tests for ReasoningAgent
- [ ] Write tests for providers
- [ ] Write tests for tools
- [ ] Verify all tests pass: `npm test`

### CI/CD (if using GitHub Actions)

- [ ] Push code and verify CI runs
- [ ] Fix any CI failures
- [ ] Set up code coverage reporting (optional)

---

## Phase 6: Create Example Project

### Build TaskAnalyzer Example

- [ ] Copy TaskAnalyzer to new project
- [ ] Test with real API key
- [ ] Verify all features work
- [ ] Document any issues

### Document Example

- [ ] Add README to example
- [ ] Add screenshots/demo
- [ ] Add usage instructions

---

## Verification Checklist

Before considering setup complete, verify:

### Repository Structure

```
agi-framework/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CONVENTIONS.md
│   ├── CONTEXT.md
│   ├── API_PATTERNS.md
│   ├── PROMPTS.md
│   ├── DECISIONS.md
│   └── GLOSSARY.md
├── src/
│   ├── agents/
│   │   ├── BaseAgent.js
│   │   └── ReasoningAgent.js
│   ├── providers/
│   ├── memory/
│   ├── tools/
│   └── utils/
├── examples/
│   └── TaskAnalyzer.jsx
├── tests/
├── .env.example
├── .gitignore
├── LICENSE
├── README.md
├── GETTING_STARTED.md
├── SETUP_CHECKLIST.md
├── package.json
└── setup-new-project.sh
```

### Functionality Tests

- [ ] Can create new project with script
- [ ] New project installs dependencies
- [ ] New project starts without errors
- [ ] BaseAgent can be imported
- [ ] ReasoningAgent works with real API
- [ ] Example app runs successfully

### Documentation Quality

- [ ] All docs are readable and clear
- [ ] No broken links in docs
- [ ] Code examples work
- [ ] Setup instructions are accurate

---

## Common Issues & Solutions

### Issue: npm install fails

**Solution**: Check Node.js version (18.x or 20.x required)

```bash
node --version
```

### Issue: API calls fail

**Solution**: Verify .env file exists and has valid API key

```bash
cat .env | grep ANTHROPIC
```

### Issue: Imports not working

**Solution**: Check import paths match your structure

```javascript
// Should be:
import { BaseAgent } from './framework/src/agents/BaseAgent';
```

### Issue: Git submodule empty

**Solution**: Initialize submodule

```bash
git submodule update --init --recursive
```

---

## Next Steps After Setup

1. ✅ Framework repository created and pushed to GitHub
2. ✅ First test project created successfully
3. ✅ All core components implemented
4. ✅ Documentation updated with your info
5. 📖 Read through all documentation
6. 🎨 Customize framework for your needs
7. 🚀 Build your first real application!

---

## Quick Reference Commands

```bash
# Create framework repo
mkdir agi-framework && cd agi-framework
git init

# Create new project
./setup-new-project.sh my-app

# Update framework in project
cd my-app
git submodule update --remote framework

# Run tests
npm test

# Start dev server
npm start

# Build production
npm run build
```

---

## Support & Resources

- **Setup Guide**: See `GETTING_STARTED.md`
- **Architecture**: See `docs/ARCHITECTURE.md`
- **Patterns**: See `docs/API_PATTERNS.md`
- **Examples**: See `examples/` directory

---

**Status**: [ ] Not Started | [ ] In Progress | [ ] Complete

**Started**: ___________  
**Completed**: ___________  
**Notes**: _________________________________________________
