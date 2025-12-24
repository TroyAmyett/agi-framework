# API Patterns for AI Integration

## Model Provider Abstraction

### Core Provider Interface

```javascript
/**
 * @typedef {Object} ModelProvider
 * @property {string} name - Provider name
 * @property {string} version - Provider version
 * @property {Set<string>} capabilities - Available capabilities
 */

class ModelProvider {
  constructor(config) {
    this.name = config.name;
    this.version = config.version;
    this.capabilities = new Set(config.capabilities);
  }
  
  /**
   * Core completion methods
   * @param {CompletionRequest} request
   * @returns {Promise<CompletionResponse>}
   */
  async complete(request) {
    throw new Error('Not implemented');
  }
  
  /**
   * @param {CompletionRequest} request
   * @returns {AsyncIterable<StreamChunk>}
   */
  async *streamComplete(request) {
    throw new Error('Not implemented');
  }
  
  /**
   * Capability detection
   * @param {string} capability
   * @returns {boolean}
   */
  hasCapability(capability) {
    return this.capabilities.has(capability);
  }
  
  /**
   * @param {string} capability
   * @returns {string|null}
   */
  getCapabilityVersion(capability) {
    return this.capabilities.has(capability) ? this.version : null;
  }
  
  /**
   * Context and cost management
   * @returns {number}
   */
  getContextWindow() {
    throw new Error('Not implemented');
  }
  
  /**
   * @param {CompletionRequest} request
   * @returns {Promise<CostEstimate>}
   */
  async estimateCost(request) {
    throw new Error('Not implemented');
  }
  
  /**
   * @param {string} text
   * @returns {number}
   */
  countTokens(text) {
    throw new Error('Not implemented');
  }
}

/**
 * @typedef {Object} CompletionRequest
 * @property {Array<Message>} messages
 * @property {string} [systemPrompt]
 * @property {Array<Tool>} [tools]
 * @property {number} [temperature]
 * @property {number} [maxTokens]
 * @property {Array<string>} [stopSequences]
 * @property {Object} [metadata]
 */

/**
 * @typedef {Object} CompletionResponse
 * @property {string} content
 * @property {Array<ToolCall>} [toolCalls]
 * @property {'complete'|'length'|'tool_use'|'error'} finishReason
 * @property {Object} usage
 * @property {number} usage.inputTokens
 * @property {number} usage.outputTokens
 * @property {number} usage.totalTokens
 * @property {Object} [metadata]
 */
```

### Provider Implementation Pattern

```javascript
import Anthropic from '@anthropic-ai/sdk';

class AnthropicProvider extends ModelProvider {
  constructor(config) {
    super({
      name: 'anthropic',
      version: '1.0',
      capabilities: ['reasoning', 'vision', 'tool-use', 'long-context']
    });
    
    this.client = new Anthropic({
      apiKey: config.apiKey
    });
  }
  
  async complete(request) {
    const response = await this.client.messages.create({
      model: request.metadata?.model || 'claude-sonnet-4',
      max_tokens: request.maxTokens || 4096,
      system: request.systemPrompt,
      messages: this.formatMessages(request.messages),
      tools: request.tools ? this.formatTools(request.tools) : undefined,
      temperature: request.temperature
    });
    
    return this.parseResponse(response);
  }
  
  async *streamComplete(request) {
    const stream = await this.client.messages.stream({
      model: request.metadata?.model || 'claude-sonnet-4',
      max_tokens: request.maxTokens || 4096,
      messages: this.formatMessages(request.messages)
    });
    
    for await (const chunk of stream) {
      yield this.parseStreamChunk(chunk);
    }
  }
  
  hasCapability(capability) {
    return this.capabilities.has(capability);
  }
  
  formatMessages(messages) {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }
  
  formatTools(tools) {
    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters
    }));
  }
  
  parseResponse(response) {
    return {
      content: response.content[0].text,
      toolCalls: this.extractToolCalls(response),
      finishReason: response.stop_reason,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens
      }
    };
  }
}
```

## Prompt Engineering Patterns

### Prompt Template System

```javascript
/**
 * @typedef {Object} PromptTemplate
 * @property {string} id
 * @property {string} version
 * @property {string} template
 * @property {Array<PromptVariable>} variables
 * @property {Object} [metadata]
 */

class PromptRegistry {
  constructor() {
    this.templates = new Map();
  }
  
  /**
   * Register a new prompt template
   * @param {PromptTemplate} template
   */
  register(template) {
    this.templates.set(template.id, template);
  }
  
  /**
   * Render a template with variables
   * @param {string} id - Template ID
   * @param {Object} variables - Variable values
   * @returns {string} Rendered prompt
   */
  render(id, variables) {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template ${id} not found`);
    }
    
    return this.interpolate(template.template, variables);
  }
  
  /**
   * Interpolate variables into template
   * @private
   */
  interpolate(template, variables) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? variables[key] : match;
    });
  }
  
  /**
   * Version management for A/B testing and rollback
   * @param {string} id
   * @param {string} [version]
   * @returns {PromptTemplate}
   */
  getVersion(id, version) {
    // Implementation for versioned prompts
    const template = this.templates.get(id);
    if (version && template.version !== version) {
      return this.templates.get(`${id}:${version}`);
    }
    return template;
  }
}

// Usage example
const taskDecompositionPrompt = {
  id: 'task-decomposition',
  version: '1.2',
  template: `You are a task planning expert. Break down the following goal into concrete, executable subtasks.

Goal: {{goal}}

Context: {{context}}

Requirements:
- Each subtask should be clear and actionable
- Include dependencies between tasks
- Estimate complexity for each task
- Output as JSON following this schema: {{schema}}`,
  variables: [
    { name: 'goal', type: 'string', required: true },
    { name: 'context', type: 'string', required: false },
    { name: 'schema', type: 'string', required: true }
  ]
};
```

### Common Prompt Patterns

#### Chain-of-Thought Prompting

```typescript
const chainOfThoughtPrompt = `Let's approach this step-by-step:

1. First, analyze what's being asked: {{task}}
2. Break down the problem into components
3. Consider what information is needed
4. Solve each component
5. Synthesize the final answer

Show your reasoning for each step.`;
```

#### Self-Consistency

```typescript
const selfConsistencyPrompt = `Solve this problem using three different approaches:

Problem: {{problem}}

Approach 1: {{method1}}
Approach 2: {{method2}}
Approach 3: {{method3}}

Compare your answers and explain which is most reliable and why.`;
```

#### ReAct (Reasoning + Acting)

```typescript
const reactPrompt = `You have access to these tools: {{tools}}

Solve this task: {{task}}

Use this format:
Thought: [reasoning about what to do]
Action: [tool to use]
Action Input: [input to the tool]
Observation: [result from tool]
... (repeat Thought/Action/Observation as needed)
Thought: I now know the final answer
Final Answer: [your answer]

Begin!`;
```

#### Reflection Pattern

```typescript
const reflectionPrompt = `Review the following output and identify issues:

Task: {{task}}
Output: {{output}}

Evaluate on these dimensions:
1. Correctness: Are there any factual errors?
2. Completeness: Is anything missing?
3. Clarity: Is it easy to understand?
4. Efficiency: Could it be improved?

Provide specific suggestions for improvement.`;
```

## Tool Use Patterns

### Tool Definition Schema

```javascript
/**
 * @typedef {Object} Tool
 * @property {string} name
 * @property {string} description
 * @property {Object} parameters - JSON Schema for parameters
 * @property {Function} execute - Async function to execute the tool
 * @property {Object} [metadata]
 * @property {'free'|'low'|'medium'|'high'} [metadata.cost]
 * @property {'fast'|'medium'|'slow'} [metadata.latency]
 * @property {number} [metadata.reliability] - 0-1 scale
 * @property {boolean} [metadata.requiresAuth]
 */

// Example tool definition
const webSearchTool = {
  name: 'web_search',
  description: 'Search the web for current information',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query'
      },
      numResults: {
        type: 'number',
        description: 'Number of results to return',
        default: 5
      }
    },
    required: ['query']
  },
  execute: async (params) => {
    return await searchAPI.search(params.query, params.numResults);
  },
  metadata: {
    cost: 'low',
    latency: 'medium',
    reliability: 0.95
  }
};
```

### Tool Selection Strategy

```javascript
class ToolSelector {
  /**
   * Select appropriate tools for a task
   * @param {Object} task
   * @param {Array<Tool>} availableTools
   * @returns {Array<Tool>}
   */
  selectTools(task, availableTools) {
    // Analyze task requirements
    const requirements = this.analyzeTask(task);
    
    // Filter tools by capability
    const capable = availableTools.filter(tool => 
      this.meetsRequirements(tool, requirements)
    );
    
    // Rank by cost/benefit
    const ranked = this.rankTools(capable, {
      preferFast: task.priority === 'high',
      preferCheap: task.budget === 'low',
      requireReliable: task.critical
    });
    
    return ranked.slice(0, this.getOptimalToolCount(task));
  }
  
  analyzeTask(task) {
    // Extract requirements from task description
    return {
      needsWebAccess: task.description.includes('current') || task.description.includes('latest'),
      needsCalculation: /\d+|\bcalculate\b|\bcompute\b/.test(task.description),
      needsDataRetrieval: task.description.includes('fetch') || task.description.includes('retrieve')
    };
  }
  
  meetsRequirements(tool, requirements) {
    // Check if tool can satisfy requirements
    if (requirements.needsWebAccess && tool.name === 'web_search') return true;
    if (requirements.needsCalculation && tool.name === 'calculator') return true;
    return false;
  }
  
  rankTools(tools, preferences) {
    return tools.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      
      if (preferences.preferFast) {
        scoreA += a.metadata.latency === 'fast' ? 10 : 0;
        scoreB += b.metadata.latency === 'fast' ? 10 : 0;
      }
      
      if (preferences.preferCheap) {
        scoreA += a.metadata.cost === 'free' ? 10 : a.metadata.cost === 'low' ? 5 : 0;
        scoreB += b.metadata.cost === 'free' ? 10 : b.metadata.cost === 'low' ? 5 : 0;
      }
      
      if (preferences.requireReliable) {
        scoreA += (a.metadata.reliability || 0.5) * 10;
        scoreB += (b.metadata.reliability || 0.5) * 10;
      }
      
      return scoreB - scoreA;
    });
  }
  
  getOptimalToolCount(task) {
    if (task.complexity === 'simple') return 1;
    if (task.complexity === 'medium') return 3;
    return 5;
  }
}
```

### Tool Composition

```javascript
class CompositeTool {
  /**
   * @param {string} name
   * @param {Array<Tool>} tools
   * @param {Function} workflow - Function that processes results
   */
  constructor(name, tools, workflow) {
    this.name = name;
    this.tools = tools;
    this.workflow = workflow;
  }
  
  async execute(params) {
    const results = [];
    
    for (const tool of this.tools) {
      const result = await tool.execute(params);
      results.push(result);
      
      // Pass results to next tool if needed
      if (this.shouldContinue(result)) {
        params = this.prepareNextInput(params, result);
      } else {
        break;
      }
    }
    
    return this.workflow(results);
  }
  
  shouldContinue(result) {
    return result && !result.error;
  }
  
  prepareNextInput(currentParams, previousResult) {
    // Merge previous result into params for next tool
    return {
      ...currentParams,
      previousResult
    };
  }
}

// Example: Search + Summarize composite tool
const researchTool = new CompositeTool(
  'research_and_summarize',
  [webSearchTool, summarizeTool],
  (results) => ({
    searchResults: results[0],
    summary: results[1]
  })
);
```

## Context Management Patterns

### Context Window Optimization

```javascript
class ContextManager {
  constructor(maxTokens, reservedTokens = 1000) {
    this.maxTokens = maxTokens;
    this.reservedTokens = reservedTokens; // For response
  }
  
  async buildContext(systemPrompt, task, memory, conversationHistory) {
    const context = [];
    let currentTokens = this.countTokens(systemPrompt);
    
    // Priority 1: Current task (always include)
    const taskMessage = this.formatTask(task);
    context.push(taskMessage);
    currentTokens += this.countTokens(taskMessage.content);
    
    // Priority 2: Relevant memories
    const relevantMemories = await memory.retrieve(task, {
      maxTokens: this.maxTokens * 0.3 // Use up to 30% for memory
    });
    
    for (const mem of relevantMemories) {
      const memTokens = this.countTokens(mem.content);
      if (currentTokens + memTokens > this.maxTokens - this.reservedTokens) {
        break;
      }
      context.push(this.formatMemory(mem));
      currentTokens += memTokens;
    }
    
    // Priority 3: Recent conversation (compressed if needed)
    const availableTokens = this.maxTokens - this.reservedTokens - currentTokens;
    const historyMessages = await this.fitHistory(
      conversationHistory,
      availableTokens
    );
    context.push(...historyMessages);
    
    return context;
  }
  
  async fitHistory(history, maxTokens) {
    // Start with most recent messages
    const recent = history.slice(-10);
    let tokens = this.countTokens(recent);
    
    if (tokens <= maxTokens) {
      return recent;
    }
    
    // Compress older messages
    const compressed = await this.compressMessages(
      history.slice(0, -10),
      maxTokens * 0.3
    );
    
    return [...compressed, ...recent.slice(-(maxTokens - compressed.length))];
  }
  
  countTokens(content) {
    // Rough estimate: ~4 characters per token
    if (typeof content === 'string') {
      return Math.ceil(content.length / 4);
    }
    if (Array.isArray(content)) {
      return content.reduce((sum, item) => sum + this.countTokens(item.content), 0);
    }
    return 0;
  }
  
  formatTask(task) {
    return {
      role: 'user',
      content: `Task: ${task.description}\nPriority: ${task.priority}`
    };
  }
  
  formatMemory(memory) {
    return {
      role: 'assistant',
      content: `[Relevant context: ${memory.content}]`
    };
  }
}
```

### Intelligent Summarization

```javascript
class ContextCompressor {
  constructor(model) {
    this.model = model;
  }
  
  async compress(messages, targetTokens) {
    // Group messages by topic/subtask
    const groups = this.groupMessages(messages);
    
    // Summarize each group
    const summaries = await Promise.all(
      groups.map(group => this.summarizeGroup(group))
    );
    
    // Combine summaries
    return this.combineSummaries(summaries, targetTokens);
  }
  
  groupMessages(messages) {
    // Simple grouping by time windows
    const groups = [];
    const windowSize = 5;
    
    for (let i = 0; i < messages.length; i += windowSize) {
      groups.push(messages.slice(i, i + windowSize));
    }
    
    return groups;
  }
  
  async summarizeGroup(messages) {
    const prompt = `Summarize this conversation segment concisely:

${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

Focus on:
- Key decisions made
- Important information discovered
- Actions taken
- Open questions

Keep under 100 words.`;
    
    const summary = await this.model.complete({ 
      messages: [{ 
        role: 'user', 
        content: prompt 
      }]
    });
    
    return {
      role: 'assistant',
      content: `[Summary of previous discussion: ${summary.content}]`
    };
  }
  
  combineSummaries(summaries, targetTokens) {
    // Take summaries until we hit target
    const result = [];
    let currentTokens = 0;
    
    for (const summary of summaries) {
      const tokens = Math.ceil(summary.content.length / 4);
      if (currentTokens + tokens > targetTokens) break;
      result.push(summary);
      currentTokens += tokens;
    }
    
    return result;
  }
}
```

## Structured Output Patterns

### Schema-Driven Generation

```javascript
/**
 * @typedef {Object} StructuredOutputRequest
 * @property {Array<Message>} messages
 * @property {Object} schema - JSON Schema
 * @property {Function} [validator] - Optional validation function
 * @property {boolean} [retryOnInvalid]
 * @property {number} [maxRetries]
 */

class StructuredOutputProvider {
  constructor(provider) {
    this.provider = provider;
  }
  
  async generate(request) {
    const prompt = this.buildSchemaPrompt(request);
    
    for (let attempt = 0; attempt < (request.maxRetries || 3); attempt++) {
      const response = await this.provider.complete({
        ...request,
        messages: [{ role: 'user', content: prompt }]
      });
      
      try {
        const parsed = JSON.parse(response.content);
        
        if (request.validator && !request.validator(parsed)) {
          throw new Error('Validation failed');
        }
        
        return parsed;
      } catch (error) {
        if (attempt === request.maxRetries - 1) throw error;
        
        // Add error feedback to next attempt
        prompt += `\n\nPrevious attempt failed: ${error.message}. Try again.`;
      }
    }
    
    throw new Error('Failed to generate valid structured output');
  }
  
  buildSchemaPrompt(request) {
    return `Generate a JSON response following this exact schema:

${JSON.stringify(request.schema, null, 2)}

Requirements:
- Must be valid JSON
- Must match the schema exactly
- Include all required fields
- Use appropriate data types

${request.messages[0].content}

Respond with ONLY the JSON, no other text.`;
  }
}
```

### Type-Safe Responses

```javascript
// Define response types with JSDoc
/**
 * @typedef {Object} TaskDecomposition
 * @property {Array<SubTask>} tasks
 * @property {Array<Dependency>} dependencies
 * @property {number} estimatedTime
 */

/**
 * @typedef {Object} SubTask
 * @property {string} id
 * @property {string} description
 * @property {'low'|'medium'|'high'} complexity
 * @property {Array<string>} requiredCapabilities
 */

// Use with structured output
const decomposition = await structuredProvider.generate({
  messages: [{ 
    role: 'user', 
    content: `Break down this project: ${project}` 
  }],
  schema: taskDecompositionSchema,
  validator: (data) => {
    return Array.isArray(data.tasks) && 
           data.tasks.every(t => t.id && t.description);
  }
});

// Schema definition
const taskDecompositionSchema = {
  type: 'object',
  properties: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          description: { type: 'string' },
          complexity: { type: 'string', enum: ['low', 'medium', 'high'] },
          requiredCapabilities: { type: 'array', items: { type: 'string' } }
        },
        required: ['id', 'description', 'complexity']
      }
    },
    dependencies: { type: 'array' },
    estimatedTime: { type: 'number' }
  },
  required: ['tasks']
};
```

## Error Handling & Retry Patterns

### Robust API Calls

```javascript
class ResilientProvider {
  constructor(provider) {
    this.provider = provider;
  }
  
  async completeWithRetry(request, options = {}) {
    const {
      maxRetries = 3,
      backoff = 'exponential',
      retryableErrors = ['rate_limit', 'timeout', 'server_error']
    } = options;
    
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.provider.complete(request);
      } catch (error) {
        lastError = error;
        
        if (!this.isRetriable(error, retryableErrors) || 
            attempt === maxRetries) {
          throw error;
        }
        
        const delay = this.calculateBackoff(attempt, backoff);
        await this.sleep(delay);
        
        // Adjust request for retry if needed
        request = this.adjustForRetry(request, error);
      }
    }
    
    throw lastError;
  }
  
  isRetriable(error, retriableTypes) {
    return retriableTypes.some(type => 
      error.type === type || error.message.includes(type)
    );
  }
  
  calculateBackoff(attempt, strategy) {
    switch (strategy) {
      case 'exponential':
        return Math.min(1000 * Math.pow(2, attempt), 30000);
      case 'linear':
        return 1000 * (attempt + 1);
      case 'constant':
        return 1000;
      default:
        return 1000;
    }
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  adjustForRetry(request, error) {
    // If rate limited, could reduce max_tokens or temperature
    if (error.type === 'rate_limit') {
      return {
        ...request,
        maxTokens: Math.floor(request.maxTokens * 0.8)
      };
    }
    return request;
  }
}
```

### Graceful Degradation

```javascript
class CapabilityAwareProvider {
  constructor(provider) {
    this.provider = provider;
  }
  
  async complete(request) {
    // Try preferred approach with advanced features
    if (this.hasCapability('structured-output')) {
      try {
        return await this.completeStructured(request);
      } catch (error) {
        // Fall back to basic completion
        logger.warn('Structured output failed, falling back', { error });
      }
    }
    
    // Fallback to basic completion
    return await this.basicComplete(request);
  }
  
  hasCapability(capability) {
    return this.provider.hasCapability(capability);
  }
  
  async completeStructured(request) {
    // Use native structured output if available
    return await this.provider.complete({
      ...request,
      responseFormat: { type: 'json_object' }
    });
  }
  
  async basicComplete(request) {
    // Standard completion with JSON parsing
    const response = await this.provider.complete(request);
    return this.parseJSON(response);
  }
  
  parseJSON(response) {
    try {
      // Try to extract JSON from response
      const content = response.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...response,
          content: JSON.stringify(parsed)
        };
      }
      return response;
    } catch (error) {
      logger.warn('Failed to parse JSON from response', { error });
      return response;
    }
  }
}
```

## Rate Limiting & Cost Control

```javascript
class RateLimitedProvider {
  constructor(provider, options = {}) {
    this.provider = provider;
    this.requestQueue = new RequestQueue(options.maxConcurrent || 5);
    this.costTracker = new CostTracker(options.budget);
  }
  
  async complete(request) {
    // Check budget
    const estimatedCost = await this.provider.estimateCost(request);
    await this.costTracker.checkBudget(estimatedCost);
    
    // Queue request if needed
    await this.requestQueue.enqueue(request);
    
    try {
      const response = await this.provider.complete(request);
      
      // Track actual cost
      await this.costTracker.recordUsage(response.usage);
      
      return response;
    } finally {
      this.requestQueue.dequeue();
    }
  }
}

class CostTracker {
  constructor(budget) {
    this.budget = budget;
    this.spent = 0;
    this.costs = {
      'claude-opus-4': { input: 15 / 1000000, output: 75 / 1000000 },
      'claude-sonnet-4': { input: 3 / 1000000, output: 15 / 1000000 }
    };
  }
  
  async checkBudget(estimatedCost) {
    if (this.spent + estimatedCost > this.budget) {
      throw new Error(`Budget exceeded. Spent: ${this.spent}, Budget: ${this.budget}`);
    }
  }
  
  async recordUsage(usage, model = 'claude-sonnet-4') {
    const cost = this.costs[model];
    const totalCost = (usage.inputTokens * cost.input) + 
                     (usage.outputTokens * cost.output);
    this.spent += totalCost;
    return totalCost;
  }
}

class RequestQueue {
  constructor(maxConcurrent) {
    this.maxConcurrent = maxConcurrent;
    this.active = 0;
    this.queue = [];
  }
  
  async enqueue(request) {
    if (this.active >= this.maxConcurrent) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    this.active++;
  }
  
  dequeue() {
    this.active--;
    const next = this.queue.shift();
    if (next) next();
  }
}
```

---

**Last Updated**: December 23, 2025  
**Related**: See ARCHITECTURE.md for overall system design
