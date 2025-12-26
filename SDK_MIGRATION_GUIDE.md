# AI SDK Migration Guide

This guide helps you update your provider implementations after upgrading to the latest AI SDKs.

---

## 🎯 Overview

You're updating from very old versions of AI SDKs to the latest versions. This requires code changes in your provider implementations.

| SDK | Old Version | New Version | Estimated Effort |
|-----|-------------|-------------|------------------|
| @anthropic-ai/sdk | 0.24.0 | 0.71.2 | 1-2 hours |
| openai | 4.20.0 | 6.15.0 | 1 hour |
| @google/generative-ai | 0.1.3 | 0.24.1 | 30 mins |

---

## 1. Anthropic SDK (v0.24 → v0.71)

### Major Changes

1. **Streaming API Changes**: New streaming interface
2. **Message Structure**: Improved message handling
3. **Tool Use**: Enhanced tool calling capabilities
4. **System Prompts**: New handling for system messages
5. **Model Names**: Updated model identifiers

### Required Updates in `AnthropicProvider.js`

#### Before (v0.24):
```javascript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await anthropic.messages.create({
  model: 'claude-2',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello' }],
});
```

#### After (v0.71):
```javascript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4', // Updated model names
  max_tokens: 4096,
  messages: [{ role: 'user', content: 'Hello' }],
  // New: system as separate parameter (not in messages)
  system: 'You are a helpful assistant',
});
```

### Key Changes:

1. **Model Names Updated**:
   - ❌ `claude-2`, `claude-instant-1`
   - ✅ `claude-sonnet-4`, `claude-opus-4`, `claude-haiku-4`

2. **System Messages**:
   - Now use dedicated `system` parameter (not in messages array)

3. **Streaming**:
   ```javascript
   const stream = await anthropic.messages.create({
     model: 'claude-sonnet-4',
     max_tokens: 1024,
     messages: [{ role: 'user', content: 'Hello' }],
     stream: true,
   });

   for await (const chunk of stream) {
     if (chunk.type === 'content_block_delta') {
       process.stdout.write(chunk.delta.text);
     }
   }
   ```

4. **Tool Use** (if needed):
   ```javascript
   const response = await anthropic.messages.create({
     model: 'claude-sonnet-4',
     max_tokens: 1024,
     tools: [{
       name: 'get_weather',
       description: 'Get weather for a location',
       input_schema: {
         type: 'object',
         properties: {
           location: { type: 'string' }
         }
       }
     }],
     messages: [{ role: 'user', content: 'What is the weather in SF?' }]
   });
   ```

---

## 2. OpenAI SDK (v4.20 → v6.15)

### Major Changes

1. **Response Structure**: Simplified response handling
2. **Streaming**: New streaming interface
3. **Function Calling**: Now called "tools"
4. **Model Names**: Updated GPT-4 variants

### Required Updates in `OpenAIProvider.js`

#### Before (v4.20):
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello' }],
});
```

#### After (v6.15):
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo', // Updated model names
  messages: [{ role: 'user', content: 'Hello' }],
});
```

### Key Changes:

1. **Model Names**:
   - ❌ `gpt-4`
   - ✅ `gpt-4-turbo`, `gpt-4o`, `gpt-4o-mini`

2. **Function Calling → Tools**:
   ```javascript
   const response = await openai.chat.completions.create({
     model: 'gpt-4-turbo',
     messages: [{ role: 'user', content: 'Hello' }],
     tools: [{  // Previously "functions"
       type: 'function',
       function: {
         name: 'get_weather',
         description: 'Get weather',
         parameters: {
           type: 'object',
           properties: {
             location: { type: 'string' }
           }
         }
       }
     }]
   });
   ```

3. **Streaming**:
   ```javascript
   const stream = await openai.chat.completions.create({
     model: 'gpt-4-turbo',
     messages: [{ role: 'user', content: 'Hello' }],
     stream: true,
   });

   for await (const chunk of stream) {
     process.stdout.write(chunk.choices[0]?.delta?.content || '');
   }
   ```

---

## 3. Google Generative AI (v0.1.3 → v0.24.1)

### Major Changes

1. **API Improvements**: Better error handling
2. **Model Names**: Updated Gemini models
3. **Content Structure**: Improved message handling

### Required Updates in `GoogleProvider.js`

#### Before (v0.1.3):
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const result = await model.generateContent('Hello');
```

#### After (v0.24.1):
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }); // Updated model

const result = await model.generateContent('Hello');
```

### Key Changes:

1. **Model Names**:
   - ❌ `gemini-pro`
   - ✅ `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-2.0-flash`

2. **Better Error Handling**:
   ```javascript
   try {
     const result = await model.generateContent(prompt);
     const response = result.response;
     const text = response.text();
   } catch (error) {
     if (error.status === 400) {
       console.error('Invalid request:', error.message);
     } else if (error.status === 429) {
       console.error('Rate limited');
     }
     throw error;
   }
   ```

---

## 🔧 Step-by-Step Migration Process

### Step 1: Update AnthropicProvider.js

Location: `src/providers/AnthropicProvider.js`

1. Update model names to `claude-sonnet-4` or `claude-opus-4`
2. Move system prompt from messages to separate `system` parameter
3. Test basic completion
4. Update streaming if used
5. Update tool calling if used

**Test Command**:
```bash
node -e "
  const { AnthropicProvider } = require('./src/providers/AnthropicProvider');
  const provider = new AnthropicProvider({ apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY });
  provider.complete({ messages: [{ role: 'user', content: 'Hello' }] })
    .then(r => console.log('✅ Anthropic working:', r.content))
    .catch(e => console.error('❌ Error:', e.message));
"
```

### Step 2: Update OpenAIProvider.js

Location: `src/providers/OpenAIProvider.js`

1. Update model name to `gpt-4-turbo` or `gpt-4o`
2. Update function calling to tools format
3. Test completion
4. Update streaming if used

**Test Command**:
```bash
node -e "
  const { OpenAIProvider } = require('./src/providers/OpenAIProvider');
  const provider = new OpenAIProvider({ apiKey: process.env.REACT_APP_OPENAI_API_KEY });
  provider.complete({ messages: [{ role: 'user', content: 'Hello' }] })
    .then(r => console.log('✅ OpenAI working:', r.content))
    .catch(e => console.error('❌ Error:', e.message));
"
```

### Step 3: Update GoogleProvider.js

Location: `src/providers/GoogleProvider.js`

1. Update model name to `gemini-1.5-pro`
2. Add improved error handling
3. Test completion

**Test Command**:
```bash
node -e "
  const { GoogleProvider } = require('./src/providers/GoogleProvider');
  const provider = new GoogleProvider({ apiKey: process.env.REACT_APP_GOOGLE_API_KEY });
  provider.complete({ messages: [{ role: 'user', content: 'Hello' }] })
    .then(r => console.log('✅ Google working:', r.content))
    .catch(e => console.error('❌ Error:', e.message));
"
```

### Step 4: Update UniversalProvider.js

Location: `src/providers/UniversalProvider.js`

1. Review normalization logic for new SDKs
2. Update default models
3. Test provider switching
4. Test fallback logic

### Step 5: Update Documentation

Update the following files:
- `docs/API_PATTERNS.md` - Update code examples
- `README.md` - Update model names in examples
- `.env.example` - Update environment variable docs

---

## ⚠️ Breaking Changes Checklist

- [ ] Updated Anthropic model names
- [ ] Moved Anthropic system prompts to `system` parameter
- [ ] Updated OpenAI model names
- [ ] Changed OpenAI `functions` to `tools`
- [ ] Updated Google model names
- [ ] Tested all three providers independently
- [ ] Tested UniversalProvider with all providers
- [ ] Updated all documentation
- [ ] Updated .env.example
- [ ] Verified streaming still works (if used)
- [ ] Verified tool calling still works (if used)

---

## 🧪 Testing Checklist

After migration, test:

- [ ] Basic completion with Anthropic
- [ ] Basic completion with OpenAI
- [ ] Basic completion with Google
- [ ] Provider switching via UniversalProvider
- [ ] Fallback logic when provider fails
- [ ] System prompts work correctly
- [ ] Error handling works
- [ ] Token counting is accurate
- [ ] Streaming (if implemented)
- [ ] Tool calling (if implemented)

---

## 📚 Official Documentation

- [Anthropic SDK Changelog](https://github.com/anthropics/anthropic-sdk-typescript/releases)
- [OpenAI SDK Changelog](https://github.com/openai/openai-node/releases)
- [Google Generative AI Docs](https://ai.google.dev/gemini-api/docs)

---

## 🆘 Common Issues

### Issue: "Model not found"
**Solution**: Update to new model names (see sections above)

### Issue: "Invalid request format"
**Solution**: Check if you're using old message format for system prompts

### Issue: "Function calling not working"
**Solution**: Update from `functions` to `tools` format (OpenAI)

### Issue: "Streaming broken"
**Solution**: Review new streaming interfaces in SDK docs

---

## 🎯 Quick Reference: Model Names

### Anthropic
- ✅ `claude-sonnet-4` (recommended)
- ✅ `claude-opus-4` (most capable)
- ✅ `claude-haiku-4` (fastest)

### OpenAI
- ✅ `gpt-4o` (recommended)
- ✅ `gpt-4-turbo`
- ✅ `gpt-4o-mini` (faster, cheaper)

### Google
- ✅ `gemini-1.5-pro` (recommended)
- ✅ `gemini-2.0-flash` (newest)
- ✅ `gemini-1.5-flash` (faster)

---

**Estimated Total Migration Time**: 3-5 hours

Good luck with your migration! 🚀
