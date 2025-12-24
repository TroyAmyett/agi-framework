# AGI-Ready AI Application Framework

A flexible, capability-based framework for building AI applications that seamlessly evolve as models advance toward AGI. Built with JavaScript and React, designed for rapid iteration and dynamic behavior.

## 🎯 What Makes This Framework Special

- **AGI-Ready Architecture**: Built to work with today's AI while automatically adapting to tomorrow's capabilities
- **Capability-Based Abstraction**: Swap model providers without changing application code
- **Agent-Based Design**: Compose intelligent agents that reason, act, and coordinate
- **Dynamic Everything**: Tools, prompts, and workflows that evolve at runtime
- **Production-Proven Patterns**: Battle-tested approaches for context management, cost control, and error handling

## 🚀 Quick Start

### Using the Setup Script (Recommended)

```bash
# Clone the framework
git clone https://github.com/YOUR_USERNAME/agi-framework.git
cd agi-framework

# Make setup script executable
chmod +x setup-new-project.sh

# Create a new project
./setup-new-project.sh my-awesome-app

# Navigate to your project
cd my-awesome-app

# Add your API keys
cp .env.example .env
# Edit .env and add: REACT_APP_ANTHROPIC_API_KEY=your_key_here

# Start developing!
npm start
```

### Manual Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/agi-framework.git
cd agi-framework

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm start
```

📖 **Complete setup guide**: See [GETTING_STARTED.md](GETTING_STARTED.md)

## 📁 Project Structure

```
/
├── docs/                    # 📚 Documentation
│   ├── ARCHITECTURE.md      # System design and components
│   ├── CONVENTIONS.md       # Coding standards and patterns
│   ├── CONTEXT.md          # Project knowledge and domain concepts
│   ├── API_PATTERNS.md     # AI integration patterns
│   ├── PROMPTS.md          # Reusable prompt templates
│   ├── DECISIONS.md        # Architecture decision records
│   └── GLOSSARY.md         # Terminology and concepts
│
├── src/
│   ├── agents/             # 🤖 Agent implementations
│   │   ├── BaseAgent.js
│   │   ├── ReasoningAgent.js
│   │   ├── CodeAgent.js
│   │   └── MetaAgent.js
│   │
│   ├── capabilities/       # 🎯 Capability abstractions
│   │   ├── Capability.js
│   │   └── CapabilityProvider.js
│   │
│   ├── orchestration/      # 🎼 Workflow coordination
│   │   ├── Orchestrator.js
│   │   ├── TaskPlanner.js
│   │   └── AgentCoordinator.js
│   │
│   ├── memory/             # 🧠 Memory systems
│   │   ├── ShortTermMemory.js
│   │   ├── EpisodicMemory.js
│   │   ├── SemanticMemory.js
│   │   └── ContextManager.js
│   │
│   ├── tools/              # 🛠️ Tool implementations
│   │   ├── ToolRegistry.js
│   │   ├── WebSearchTool.js
│   │   └── CompositeTool.js
│   │
│   ├── providers/          # 🔌 Model provider integrations
│   │   ├── ModelProvider.js
│   │   ├── AnthropicProvider.js
│   │   └── OpenAIProvider.js
│   │
│   ├── prompts/            # 💬 Prompt management
│   │   └── PromptRegistry.js
│   │
│   ├── ui/                 # 🎨 React components
│   │   └── components/
│   │
│   └── utils/              # 🔧 Shared utilities
│
├── tests/                  # ✅ Test suites
├── examples/               # 📖 Example applications
└── config/                 # ⚙️ Configuration files
```

## 📚 Documentation Guide

Start here based on your needs:

### For First-Time Users

1. **[CONTEXT.md](docs/CONTEXT.md)** - Understand the problem we're solving and our approach
2. **[GLOSSARY.md](docs/GLOSSARY.md)** - Learn the terminology
3. **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Understand the system design

### For Developers

1. **[CONVENTIONS.md](docs/CONVENTIONS.md)** - Coding standards and patterns
2. **[API_PATTERNS.md](docs/API_PATTERNS.md)** - How to integrate with AI models
3. **[PROMPTS.md](docs/PROMPTS.md)** - Reusable prompt templates

### For Architects

1. **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design and components
2. **[DECISIONS.md](docs/DECISIONS.md)** - Why we made key choices
3. **[CONTEXT.md](docs/CONTEXT.md)** - Domain concepts and constraints

### Quick Reference

- **[GLOSSARY.md](docs/GLOSSARY.md)** - Look up any term
- **[PROMPTS.md](docs/PROMPTS.md)** - Find prompt templates
- **[CONVENTIONS.md](docs/CONVENTIONS.md)** - Check coding patterns

## 🏗️ Core Concepts

### Agents

Autonomous entities that reason, act, and coordinate to accomplish goals.

```javascript
import { ReasoningAgent } from './agents/ReasoningAgent';

const agent = new ReasoningAgent({
  id: 'planner-1',
  capabilities: ['reasoning', 'tool-use'],
  provider: anthropicProvider
});

const result = await agent.execute(task, context);
```

### Capabilities

Abstract descriptions of what models can do, enabling provider-agnostic code.

```javascript
// Works with any provider that has 'vision' capability
if (provider.hasCapability('vision')) {
  const result = await provider.analyzeImage(image);
}
```

### Tools

Actions agents can take in the world, from API calls to complex workflows.

```javascript
toolRegistry.register({
  name: 'web_search',
  description: 'Search the web for information',
  execute: async (params) => {
    return await searchAPI.search(params.query);
  }
});
```

### Memory

Different types of memory for different needs: short-term, episodic, semantic, and procedural.

```javascript
const context = await contextManager.buildContext(
  systemPrompt,
  task,
  memory,
  conversationHistory
);
```

### Orchestration

Coordinate multiple agents to accomplish complex goals.

```javascript
const orchestrator = new Orchestrator();
const result = await orchestrator.execute({
  goal: 'Research and write a technical report',
  agents: [researchAgent, writingAgent, reviewAgent]
});
```

## 🎨 Example Use Cases

### Complex Research Tasks

```javascript
const researchTask = {
  goal: 'Analyze market trends for AI chips',
  requirements: ['current data', 'competitor analysis', 'predictions']
};

const result = await orchestrator.execute(researchTask);
```

### Autonomous Software Development

```javascript
const devTask = {
  goal: 'Add user authentication to the app',
  context: 'React frontend, Node.js backend'
};

const result = await codeAgent.execute(devTask);
```

### Multi-Step Problem Solving

```javascript
const problemTask = {
  goal: 'Optimize database query performance',
  context: { currentLatency: '2.5s', target: '500ms' }
};

const result = await reasoningAgent.execute(problemTask);
```

See [examples/](examples/) directory for complete implementations.

## 🔧 Configuration

### Environment Variables

```bash
# Model Providers
REACT_APP_ANTHROPIC_API_KEY=your_key_here
REACT_APP_OPENAI_API_KEY=your_key_here

# Application Settings
REACT_APP_LOG_LEVEL=info
REACT_APP_MAX_CONTEXT_TOKENS=100000
REACT_APP_DEFAULT_MODEL=claude-sonnet-4

# Memory Configuration
REACT_APP_VECTOR_DB_URL=your_vector_db_url
REACT_APP_EPISODIC_DB_URL=your_db_url

# Performance
REACT_APP_MAX_CONCURRENT_AGENTS=5
REACT_APP_REQUEST_TIMEOUT_MS=30000
```

### Model Providers

Currently supported:

- **Anthropic** (Claude family) - Default, recommended
- **OpenAI** (GPT-4 family)
- **Local models** via Ollama

Add new providers by implementing the `ModelProvider` interface.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- agents

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## 📖 Key Patterns

### Capability Detection

```javascript
if (provider.hasCapability('structured-output')) {
  return await provider.completeStructured(prompt, schema);
} else {
  return await provider.complete(prompt).then(parseJSON);
}
```

### Retry with Backoff

```javascript
const result = await withRetry(
  () => provider.complete(request),
  { maxRetries: 3, backoff: 'exponential' }
);
```

### Reflection Loop

```javascript
let output = await agent.execute(task);
const evaluation = await reflector.evaluate(output);

if (evaluation.score < threshold) {
  output = await agent.execute(task, { 
    feedback: evaluation.suggestions 
  });
}
```

### Context Management

```javascript
const context = new Context();
context.add(systemPrompt, { priority: 'required' });
context.add(taskDescription, { priority: 'high' });
context.add(relevantMemory, { priority: 'medium' });

if (context.tokenCount > maxTokens * 0.8) {
  await context.compress();
}
```

See [API_PATTERNS.md](docs/API_PATTERNS.md) for complete pattern library.

## 🎯 Design Principles

1. **AGI-Ready**: Built to evolve with AI capabilities
2. **Capability-Based**: Model-agnostic architecture
3. **Runtime Flexibility**: Dynamic behavior over static configuration
4. **Composability**: Build complex systems from simple components
5. **Fail Gracefully**: Robust error handling and fallbacks
6. **Observable**: Comprehensive logging and monitoring
7. **Cost-Conscious**: Track and optimize token usage

## 🚦 Getting Started Checklist

- [ ] Read [CONTEXT.md](docs/CONTEXT.md) to understand the why
- [ ] Review [ARCHITECTURE.md](docs/ARCHITECTURE.md) for the how
- [ ] Check [CONVENTIONS.md](docs/CONVENTIONS.md) for coding standards
- [ ] Browse [GLOSSARY.md](docs/GLOSSARY.md) for terminology
- [ ] Set up your API keys in `.env`
- [ ] Run the examples in [examples/](examples/)
- [ ] Build your first agent!

## 🤝 Contributing

This framework is developed and maintained by Funnelists LLC. Contributions are welcome!

### Before Contributing

1. Read [CONVENTIONS.md](docs/CONVENTIONS.md) for code standards
2. Check [DECISIONS.md](docs/DECISIONS.md) to understand key choices
3. Browse existing issues and discussions

### Making Changes

1. Fork the repository
2. Create a feature branch
3. Follow coding conventions
4. Write tests for new functionality
5. Update documentation as needed
6. Submit a pull request

### Adding New Components

- Agents: Extend `BaseAgent` class
- Tools: Implement tool interface and register
- Capabilities: Define capability interface
- Prompts: Add to [PROMPTS.md](docs/PROMPTS.md) with versioning

## 📊 Performance Considerations

- **Context Window**: Keep under 80% of max to leave room for responses
- **Token Costs**: Track usage per operation, optimize expensive calls
- **Caching**: Cache embeddings, tool results, and common queries
- **Parallelization**: Run independent operations concurrently
- **Rate Limiting**: Respect API limits, implement queuing

See [CONVENTIONS.md](docs/CONVENTIONS.md) for detailed performance guidelines.

## 🔒 Security

- Never log API keys or credentials
- Sanitize all user inputs before using in prompts
- Validate tool outputs before executing actions
- Use structured outputs to prevent prompt injection
- Implement rate limiting for user-facing endpoints
- Audit all tool executions

See [CONVENTIONS.md](docs/CONVENTIONS.md) for complete security guidelines.

## 🐛 Debugging

### Enable Debug Logging

```javascript
// In your .env
REACT_APP_LOG_LEVEL=debug
```

### Common Issues

**Agent not executing**

- Check capability detection: `provider.hasCapability('required-capability')`
- Verify API keys are set
- Check rate limits and quotas

**Context too large**

- Enable context compression: `context.compress()`
- Review what's being included in context
- Use memory retrieval instead of full history

**Unexpected outputs**

- Review prompt template in [PROMPTS.md](docs/PROMPTS.md)
- Check prompt versioning
- Enable reflection loop for self-correction

**Tool failures**

- Verify tool is registered: `toolRegistry.list()`
- Check tool parameters match schema
- Review tool execution logs

## 📈 Roadmap

### Current (v1.0)

- ✅ Core agent framework
- ✅ Capability-based abstraction
- ✅ Memory systems
- ✅ Tool registry
- ✅ Prompt management
- ✅ React UI components

### Near-Term (v1.1-1.2)

- [ ] Enhanced reflection mechanisms
- [ ] More specialized agents
- [ ] Improved tool composition
- [ ] Better cost optimization
- [ ] Extended provider support

### Future (v2.0+)

- [ ] Multi-modal reasoning
- [ ] Self-improving agents
- [ ] Distributed orchestration
- [ ] Advanced memory systems
- [ ] Real-time learning

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details.

This is free and open source software. You can use it for personal or commercial projects.

## 🙏 Acknowledgments

Built on insights from:

- Anthropic's Claude capabilities
- Modern agentic AI patterns
- Production AI application experience
- The broader AI research community

## 📞 Support

- **Documentation**: Start with [docs/CONTEXT.md](docs/CONTEXT.md)
- **Issues**: Check existing issues before creating new ones
- **Discussions**: Join our discussions for questions and ideas
- **Examples**: See [examples/](examples/) for working code

## 🔗 Related Resources

- [Anthropic Documentation](https://docs.anthropic.com)
- [OpenAI Documentation](https://platform.openai.com/docs)
- [Prompt Engineering Guide](https://www.promptingguide.ai)
- [LangChain](https://langchain.com) - Alternative framework
- [AutoGPT](https://github.com/Significant-Gravitas/AutoGPT) - Autonomous agent project

---

**Built with ❤️ by Funnelists LLC**

Start building: `npm start`  
Read the docs: [docs/](docs/)  
Get help: [Create an issue](issues/)
