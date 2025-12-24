# Development Conventions

## Code Organization

### Directory Structure

```
/src
  /agents          # Agent implementations
  /capabilities    # Capability abstractions
  /orchestration   # Workflow and coordination
  /memory          # Memory systems
  /tools           # Tool implementations
  /providers       # Model provider integrations
  /utils           # Shared utilities
/docs              # Documentation and context
/tests             # Test suites
/examples          # Example applications
/config            # Configuration files
```

### File Naming

- **JavaScript/React**: `camelCase.js` for utilities, `PascalCase.jsx` for React components
- **Python**: `snake_case.py` for all files
- **Tests**: `*.test.js` or `test_*.py` matching source file names
- **React Components**: PascalCase (e.g., `AgentExecutor.jsx`, `TaskPanel.jsx`)

### Module Organization

Each major component should have:

- Main implementation file
- Interface/type definitions
- Tests
- README.md with usage examples

## Naming Conventions

### Classes and Interfaces

- **PascalCase** for class names: `ReasoningAgent`, `ToolRegistry`
- Descriptive, noun-based names
- Suffix with type when helpful: `BaseAgent`, `AgentCoordinator`

### Functions and Methods

- **camelCase** for function names: `executeTask`, `registerTool`
- Verb-based names that describe action
- Async functions prefixed with action: `fetchMemory`, `generatePlan`

### Variables

- **camelCase** for regular variables: `taskContext`, `modelResponse`
- **UPPER_SNAKE_CASE** for constants: `MAX_RETRIES`, `DEFAULT_MODEL`
- Descriptive names over abbreviations: `promptTemplate` not `pt`

### Type Names

- **PascalCase** for types: `AgentConfig`, `CapabilityType`
- Use descriptive unions: `ModelProvider | 'auto'` instead of generic names

## Code Style

### TypeScript/JavaScript

```typescript
// Good: Clear interface with documentation
interface AgentConfig {
  /** Agent's unique identifier */
  id: string;
  /** Capabilities this agent possesses */
  capabilities: Capability[];
  /** Optional model override */
  model?: string;
}

// Good: Async/await with proper error handling
async function executeAgent(agent: Agent, task: Task): Promise<Result> {
  try {
    const context = await loadContext(task);
    const result = await agent.execute(task, context);
    await saveResult(result);
    return result;
  } catch (error) {
    logger.error('Agent execution failed', { agent: agent.id, error });
    throw new AgentExecutionError('Execution failed', { cause: error });
  }
}

// Good: Functional composition
const pipeline = compose(
  parseInput,
  validateTask,
  routeToAgent,
  executeWithRetry,
  formatOutput
);
```

### Python

```python
# Good: Type hints and docstrings
def execute_agent(agent: Agent, task: Task, context: Context) -> Result:
    """
    Execute an agent with the given task and context.
    
    Args:
        agent: The agent to execute
        task: Task to perform
        context: Execution context
        
    Returns:
        Execution result
        
    Raises:
        AgentExecutionError: If execution fails
    """
    try:
        result = agent.execute(task, context)
        return result
    except Exception as e:
        logger.error(f"Agent {agent.id} execution failed: {e}")
        raise AgentExecutionError("Execution failed") from e

# Good: Context managers for resources
with MemorySession() as memory:
    context = memory.load_context(task_id)
    result = execute_with_context(task, context)
    memory.save_result(result)
```

## Error Handling

### Custom Error Hierarchy

```javascript
class AgentError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
  }
}

class AgentExecutionError extends AgentError {}
class CapabilityNotFoundError extends AgentError {}
class ContextTooLargeError extends AgentError {}
```

### Error Handling Pattern

- Use try-catch for expected failures
- Let unexpected errors bubble up
- Always log errors with context
- Provide actionable error messages
- Include recovery suggestions where possible

### Retry Logic

```javascript
async function withRetry(fn, options = {}) {
  const { maxRetries = 3, backoff = 'exponential' } = options;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries || !isRetriable(error)) {
        throw error;
      }
      await sleep(calculateBackoff(attempt, backoff));
    }
  }
  throw new Error('Unreachable');
}
```

## Testing Conventions

### Test Structure

```javascript
describe('ReasoningAgent', () => {
  let agent;
  let mockProvider;
  
  beforeEach(() => {
    mockProvider = createMockProvider();
    agent = new ReasoningAgent({ provider: mockProvider });
  });
  
  describe('execute', () => {
    it('should decompose complex tasks', async () => {
      const task = createComplexTask();
      const result = await agent.execute(task);
      
      expect(result.subtasks).toHaveLength(3);
      expect(mockProvider.complete).toHaveBeenCalledTimes(3);
    });
    
    it('should handle provider failures gracefully', async () => {
      mockProvider.complete.mockRejectedValue(new Error('API Error'));
      
      await expect(agent.execute(task)).rejects.toThrow(AgentExecutionError);
    });
  });
});
```

### Test Categories

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete workflows
- **Performance Tests**: Measure latency and cost

### Test Data

- Store test fixtures in `/tests/fixtures`
- Use factories for test object creation
- Mock external APIs (never hit real model APIs in tests)
- Use realistic test data that covers edge cases

## Logging

### Log Levels

- **debug**: Detailed diagnostic information
- **info**: General informational messages
- **warn**: Warning messages for recoverable issues
- **error**: Error messages for failures

### Logging Pattern

```javascript
logger.info('Task execution started', {
  taskId: task.id,
  agentId: agent.id,
  estimatedCost: task.estimatedCost
});

logger.error('Agent execution failed', {
  taskId: task.id,
  agentId: agent.id,
  error: error.message,
  stack: error.stack
});
```

### What to Log

- Agent decisions and reasoning
- Tool invocations and results
- Model API calls (with token counts and costs)
- Memory operations
- Performance metrics
- Errors with full context

### What NOT to Log

- Sensitive user data
- API keys or credentials
- Full prompt contents in production (use IDs)
- PII without proper safeguards

## Configuration

### Environment Variables

```bash
# Model Providers
REACT_APP_ANTHROPIC_API_KEY=
REACT_APP_OPENAI_API_KEY=

# Application
REACT_APP_LOG_LEVEL=info
REACT_APP_MAX_CONTEXT_TOKENS=100000
REACT_APP_DEFAULT_MODEL=claude-sonnet-4

# Memory
REACT_APP_VECTOR_DB_URL=
REACT_APP_EPISODIC_DB_URL=

# Performance
REACT_APP_MAX_CONCURRENT_AGENTS=5
REACT_APP_REQUEST_TIMEOUT_MS=30000
```

### Config Files

- Use JavaScript objects or JSON for structured config
- Support environment-specific overrides
- Validate configuration at startup
- Document all configuration options

Example config structure:

```javascript
// config/default.js
export const config = {
  models: {
    default: process.env.REACT_APP_DEFAULT_MODEL || 'claude-sonnet-4',
    providers: {
      anthropic: {
        apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
        models: ['claude-opus-4', 'claude-sonnet-4']
      }
    }
  },
  memory: {
    maxTokens: parseInt(process.env.REACT_APP_MAX_CONTEXT_TOKENS) || 100000
  }
};
```

## Documentation

### Code Comments

```typescript
// Use comments for "why" not "what"
// Good: Explains reasoning
// We use exponential backoff here because API rate limits 
// reset after 60 seconds, and linear backoff would waste time

// Bad: States the obvious
// This increments the counter
counter++;
```

### Function Documentation

- Document public APIs thoroughly with JSDoc
- Include usage examples for complex functions
- Document side effects and state changes
- Specify pre/post conditions

```javascript
/**
 * Execute an agent with the given task and context.
 * 
 * @param {Object} agent - The agent to execute
 * @param {Object} task - Task to perform
 * @param {Object} context - Execution context
 * @returns {Promise<Object>} Execution result
 * @throws {AgentExecutionError} If execution fails
 * 
 * @example
 * const result = await executeAgent(reasoningAgent, {
 *   type: 'analysis',
 *   data: analysisData
 * }, context);
 */
async function executeAgent(agent, task, context) {
  // implementation
}
```

### README Files

Each major component should have a README with:

- Purpose and overview
- Usage examples
- API reference
- Configuration options
- Common patterns

## AGI-Specific Conventions

### Capability Detection

Always check for capabilities before using them:

```javascript
if (provider.hasCapability('structured-output')) {
  return await provider.completeStructured(prompt, schema);
} else {
  return await provider.complete(prompt).then(parseJSON);
}
```

### Prompt Engineering

- Store prompts in separate files or dedicated registry
- Use template variables, not string concatenation
- Version your prompts
- Include system context clearly
- Design prompts to be model-agnostic where possible

### Context Management

```javascript
// Always track token usage
const context = new Context();
context.add(systemPrompt, { type: 'system', priority: 'required' });
context.add(taskDescription, { type: 'task', priority: 'high' });
context.add(relevantMemory, { type: 'memory', priority: 'medium' });

// Compress if needed
if (context.tokenCount > model.contextWindow * 0.8) {
  await context.compress();
}
```

### Agent Communication

- Use structured message passing between agents
- Include metadata (sender, timestamp, priority)
- Support both synchronous and asynchronous communication
- Log all inter-agent communication

```javascript
/**
 * @typedef {Object} AgentMessage
 * @property {string} from - Sender agent ID
 * @property {string} to - Recipient agent ID
 * @property {'request'|'response'|'broadcast'} type - Message type
 * @property {*} content - Message content
 * @property {Object} metadata - Message metadata
 * @property {Date} metadata.timestamp - When message was sent
 * @property {string} metadata.priority - Message priority
 * @property {string} [metadata.replyTo] - ID of message being replied to
 */
```

## Performance Best Practices

- **Cache aggressively**: Embeddings, API responses, parsed outputs
- **Batch operations**: Group similar requests when possible
- **Stream responses**: Use streaming for better UX
- **Parallelize**: Run independent operations concurrently
- **Monitor costs**: Track token usage and API costs per operation
- **Use appropriate models**: Don't use Opus for simple tasks

## Security Best Practices

- Never log API keys or credentials
- Sanitize all user inputs before using in prompts
- Validate tool outputs before executing actions
- Use structured outputs to prevent prompt injection
- Implement rate limiting for user-facing endpoints
- Audit all tool executions

## Version Control

### Commit Messages

Use conventional commits:

```
feat(agents): add ReflectiveAgent for self-correction
fix(memory): resolve context compression bug
docs(architecture): update capability layer diagram
test(orchestration): add integration tests for task planning
```

### Branch Naming

- `feature/agent-reflection`
- `fix/memory-leak`
- `docs/api-reference`
- `refactor/provider-interface`

### Pull Requests

- Link to relevant issues
- Include test coverage
- Update documentation
- Add example usage if adding features

---

**Last Updated**: December 23, 2025  
**Maintained By**: Funnelists LLC
