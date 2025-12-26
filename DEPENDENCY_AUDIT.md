# Dependency Audit Report
**Date**: December 26, 2025
**Project**: AGI Framework v1.0.0

## Executive Summary

This audit identified **9 security vulnerabilities** (6 high, 3 moderate), **severely outdated packages**, and **significant dependency bloat** from unused React dependencies. Immediate action is required.

---

## 🔴 Critical Issues

### 1. Security Vulnerabilities (9 total)

#### High Severity (6)
- **nth-check** (CVE-1095141): Inefficient Regular Expression Complexity (CVSS 7.5)
  - Via: react-scripts → @svgr/webpack → svgo → css-select
  - Impact: Denial of service through ReDoS attack

- **@svgr/webpack**, **@svgr/plugin-svgo**, **svgo**, **css-select**: Chain of vulnerabilities
  - All stem from outdated react-scripts dependencies

#### Moderate Severity (3)
- **postcss** (CVE-1109574): Line return parsing error (CVSS 5.3)
  - Via: react-scripts → resolve-url-loader

- **webpack-dev-server** (2 vulnerabilities):
  - Source code theft via malicious websites (CVSS 6.5)
  - Non-Chromium browser exploitation (CVSS 5.3)

**Root Cause**: `react-scripts@5.0.1` is the dependency causing ALL vulnerabilities, but it's completely unnecessary for this project.

---

### 2. Severely Outdated AI SDKs

| Package | Current | Latest | Versions Behind | Risk Level |
|---------|---------|--------|-----------------|------------|
| @anthropic-ai/sdk | 0.24.0 | 0.71.2 | ~47 versions | 🔴 Critical |
| @google/generative-ai | 0.1.3 | 0.24.1 | ~23 versions | 🔴 Critical |
| @mistralai/mistralai | 0.1.3 | 1.11.0 | 2 major versions | 🔴 Critical |
| openai | 4.20.0 | 6.15.0 | 2 major versions | 🔴 Critical |

**Impact**:
- Missing critical bug fixes and security patches
- Incompatible with latest model capabilities
- Missing new API features (structured outputs, vision improvements, etc.)
- Potential breaking changes in API behavior

---

### 3. Unnecessary Bloat (Complete React Stack - UNUSED)

The following packages are **completely unused** - the project has NO React UI:

#### Production Dependencies (Completely Unnecessary)
```json
"react": "^18.2.0",           // → 19.2.3 available
"react-dom": "^18.2.0",       // → 19.2.3 available
"react-scripts": "5.0.1",     // SOURCE OF ALL SECURITY VULNERABILITIES
"web-vitals": "^2.1.4",       // → 5.1.0 available
```

#### Dev Dependencies (Unnecessary)
```json
"@testing-library/jest-dom": "^5.17.0",
"@testing-library/react": "^13.4.0",
```

**Evidence**:
- No `public/` directory
- No `index.html`, `App.js`, or React components
- No React imports in any source files
- Project is a Node.js AI framework, not a web app

**Waste**: These unused dependencies pull in **~1,585 packages** consuming significant disk space and installation time.

---

### 4. Unused AI Provider SDKs

The following are installed but **never imported** in the codebase:

```json
"@mistralai/mistralai": "^0.1.3",  // Not used anywhere
"cohere-ai": "^7.7.0",              // Not used anywhere
```

**Evidence**:
- `initProviders.js` only initializes Anthropic, OpenAI, and Google
- No imports of Mistral or Cohere SDKs in any file
- No configuration for these providers in `.env.example`

---

## ✅ Recommended Actions

### Priority 1: Remove Unnecessary Dependencies (Immediate)

Remove all React-related packages:

```bash
npm uninstall react react-dom react-scripts web-vitals
npm uninstall @testing-library/jest-dom @testing-library/react
```

Remove unused AI providers:

```bash
npm uninstall @mistralai/mistralai cohere-ai
```

**Impact**:
- ✅ Eliminates ALL 9 security vulnerabilities
- ✅ Reduces install size by ~90%
- ✅ Faster npm install
- ✅ Cleaner dependency tree

---

### Priority 2: Update AI SDKs (Critical)

Update to latest versions:

```bash
npm install @anthropic-ai/sdk@latest
npm install @google/generative-ai@latest
npm install openai@latest
npm install @supabase/supabase-js@latest
```

**Breaking Changes to Review**:
- **@anthropic-ai/sdk**: v0.24 → v0.71 (major API changes likely)
- **openai**: v4 → v6 (significant changes in v5 and v6)
- **@google/generative-ai**: v0.1 → v0.24 (API improvements)

**Required Actions**:
1. Review migration guides for each SDK
2. Update provider implementations in `src/providers/`
3. Test all provider integrations
4. Update documentation with new API patterns

---

### Priority 3: Add Missing Dev Tools

Since this is a Node.js framework (not React), add appropriate tooling:

```bash
npm install --save-dev jest @types/node
```

Update scripts in `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "lint": "eslint src/**/*.js",
    "prepare": "husky"
  }
}
```

Remove the React-specific scripts:
- ❌ `"start": "react-scripts start"` (not a web app)
- ❌ `"build": "react-scripts build"` (not needed)

---

### Priority 4: Optional Enhancements

Consider adding these useful dependencies:

**Testing**:
```bash
npm install --save-dev jest @jest/globals
```

**Type Safety** (if desired):
```bash
npm install --save-dev @types/node typescript
```

**Code Quality**:
```bash
npm install --save-dev prettier eslint-config-prettier
```

---

## 📋 Updated package.json

### Recommended Production Dependencies

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.71.2",
    "@google/generative-ai": "^0.24.1",
    "@supabase/supabase-js": "^2.89.0",
    "openai": "^6.15.0"
  }
}
```

### Recommended Dev Dependencies

```json
{
  "devDependencies": {
    "eslint": "^8.45.0",
    "husky": "^9.1.7",
    "jest": "^29.7.0"
  }
}
```

---

## 🎯 Implementation Plan

### Phase 1: Emergency Security Fix (30 minutes)
1. Remove all React dependencies
2. Remove unused AI provider dependencies
3. Run `npm audit` to verify vulnerabilities eliminated
4. Test that existing code still runs

### Phase 2: AI SDK Updates (2-4 hours)
1. Update one provider at a time
2. Start with Anthropic (primary provider)
3. Update provider implementation for API changes
4. Test each provider thoroughly
5. Update OpenAI, then Google
6. Update documentation

### Phase 3: Cleanup & Documentation (1 hour)
1. Update README.md to remove React references
2. Update `.env.example` to remove unused provider keys
3. Update package.json scripts
4. Add proper dev dependencies
5. Run final tests

---

## 📊 Metrics

### Before Cleanup
- **Total packages**: ~1,649 dependencies
- **Security vulnerabilities**: 9 (6 high, 3 moderate)
- **Outdated packages**: 8 critical
- **Install time**: ~2-3 minutes
- **node_modules size**: ~500+ MB

### After Cleanup (Estimated)
- **Total packages**: ~150-200 dependencies
- **Security vulnerabilities**: 0
- **Outdated packages**: 0
- **Install time**: ~15-30 seconds
- **node_modules size**: ~50-75 MB

**Improvement**: ~90% reduction in dependencies, 100% elimination of security risks.

---

## 🔍 How This Happened

The project appears to have been initialized with `create-react-app` but then pivoted to a Node.js AI framework without cleaning up the React boilerplate. This is a common issue when prototyping pivots from web UI to backend framework.

**Lesson**: When changing project architecture, audit and remove dependencies from the previous approach.

---

## ⚠️ Warnings

1. **Breaking Changes**: Updating AI SDKs from v0.24 to v0.71+ will require code changes
2. **API Compatibility**: Test all provider integrations after updates
3. **Environment Variables**: May need to update .env configuration
4. **Documentation**: All code examples in docs/ may need updates

---

## 📚 Resources

- [Anthropic SDK Migration Guide](https://github.com/anthropics/anthropic-sdk-typescript/releases)
- [OpenAI Migration Guide](https://github.com/openai/openai-node/blob/master/MIGRATION.md)
- [npm audit documentation](https://docs.npmjs.com/cli/v9/commands/npm-audit)

---

## ✅ Success Criteria

- [ ] Zero security vulnerabilities in `npm audit`
- [ ] All AI SDKs on latest stable versions
- [ ] No unused dependencies in package.json
- [ ] All providers working with updated SDKs
- [ ] Documentation updated to reflect changes
- [ ] Tests passing (if implemented)
- [ ] Clean `npm install` with no warnings

---

**Next Steps**: Review this audit and approve recommended changes before implementation.
