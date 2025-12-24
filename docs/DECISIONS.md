# Architecture Decision Records (ADRs)

This document tracks significant architectural decisions made during the development of our AGI-ready framework. Each decision is recorded with context, rationale, and consequences.

## Table of Contents

- [ADR-001: Use Capability-Based Abstraction](#adr-001-use-capability-based-abstraction)
- [ADR-002: JavaScript Over TypeScript](#adr-002-javascript-over-typescript)
- [ADR-003: Agent-Based Architecture](#adr-003-agent-based-architecture)
- [ADR-004: Separate Memory Systems](#adr-004-separate-memory-systems)
- [ADR-005: Dynamic Tool Registry](#adr-005-dynamic-tool-registry)
- [ADR-006: Prompt Versioning Strategy](#adr-006-prompt-versioning-strategy)
- [ADR-007: React for UI Layer](#adr-007-react-for-ui-layer)

---

## ADR-001: Use Capability-Based Abstraction

**Status**: Accepted  
**Date**: December 23, 2025  
**Deciders**: Funnelists LLC  
**Related ADRs**: ADR-003

### Context

AI models evolve rapidly with new capabilities (vision, tool use, longer contexts, etc.). Applications tightly coupled to specific model APIs or versions break or require significant refactoring as models improve. We need a way to build applications that can seamlessly adapt to new AI capabilities without code changes.

### Decision

We will architect the system around **capabilities** rather than specific models or APIs. Each capability (reasoning, vision, tool-use, long-context) is abstracted as an interface that different model providers can implement.

```javascript
// Instead of:
if (modelName === 'claude-opus-4') {
  // Use advanced features
}

// We do:
if (provider.hasCapability('structured-output')) {
  // Use advanced features
}
```

### Rationale

1. **Future-proof**: New models automatically work if they implement the capability interfaces
2. **Provider flexibility**: Can swap between Anthropic, OpenAI, local models without refactoring
3. **Graceful degradation**: Can detect missing capabilities and fall back to alternatives
4. **Testing**: Can mock capabilities independently of provider
5. **Cost optimization**: Can route to cheapest model that has required capabilities

### Consequences

**Positive**:

- Applications work with current and future models
- Easy to add new model providers
- Can A/B test different models for same capability
- Clear separation of concerns

**Negative**:

- Additional abstraction layer adds complexity
- Need to maintain capability detection logic
- Some provider-specific features might be harder to expose
- Requires discipline to avoid breaking abstraction

**Risks**:

- Abstraction might not capture all nuances of different models
- Performance overhead from capability checking

**Mitigation**:

- Keep capability interfaces simple and focused
- Cache capability checks
- Document provider-specific quirks in CONTEXT.md
- Allow escape hatches for provider-specific features when necessary

---

## ADR-002: JavaScript Over TypeScript

**Status**: Accepted  
**Date**: December 23, 2025  
**Deciders**: Funnelists LLC

### Context

Most modern web applications use TypeScript for type safety and better developer experience. However, our AGI-ready framework requires significant runtime flexibility, dynamic behavior, and rapid iteration.

### Decision

We will use **JavaScript (ES6+)** with JSDoc comments for type documentation, rather than TypeScript.

### Rationale

1. **Runtime Flexibility**: Agents and tools need to be modified dynamically
   - Prompts can generate code that's evaluated at runtime
   - Tool definitions can be created on-the-fly
   - Agent behaviors adapt based on context

2. **AI Code Generation**: Models generate cleaner JavaScript
   - No type errors blocking execution
   - More forgiving of variations in AI output
   - Easier to eval() AI-generated tool implementations

3. **Iteration Speed**: No compilation step
   - Change prompt, see results immediately
   - Faster debugging cycle
   - Easier A/B testing of strategies

4. **Appropriate Validation**: Runtime validation better matches AI needs
   - Validate model outputs with JSON Schema
   - Check capabilities at runtime
   - Use Zod or similar for runtime type checking where needed

### Consequences

**Positive**:

- Faster development and iteration
- Better integration with AI-generated code
- More flexible for dynamic behaviors
- No build step complexity

**Negative**:

- No compile-time type checking
- Potential runtime errors that TypeScript would catch
- Less IDE autocomplete support
- Requires more disciplined documentation

**Mitigation**:

- Extensive JSDoc comments
- Runtime validation with Zod/JSON Schema
- Comprehensive test coverage
- ESLint for catching common errors
- PropTypes for React components

---

## ADR-003: Agent-Based Architecture

**Status**: Accepted  
**Date**: December 23, 2025  
**Deciders**: Funnelists LLC  
**Related ADRs**: ADR-001, ADR-004

### Context

Complex AI tasks require more than single API calls. We need a way to:

- Break down complex goals
- Specialize in different domains
- Coordinate multiple AI interactions
- Enable self-improvement through reflection

### Decision

We will implement an **agent-based architecture** where autonomous agents can reason, act, and coordinate to accomplish goals.

Key components:

- **BaseAgent**: Foundation class all agents extend
- **Specialized Agents**: Domain-specific expertise (ReasoningAgent, CodeAgent, etc.)
- **MetaAgent**: Plans and delegates to other agents
- **Orchestrator**: Coordinates multi-agent workflows

### Rationale

1. **Composability**: Build complex systems from simple agents
2. **Specialization**: Each agent focuses on what it does best
3. **Scalability**: Add new agents without changing existing ones
4. **Testability**: Test agents in isolation
5. **AGI-Ready**: Agent architecture scales to more capable AI systems

### Consequences

**Positive**:

- Clear separation of concerns
- Reusable agent components
- Natural fit for multi-step reasoning
- Easy to add specialized capabilities
- Supports emergent behaviors through coordination

**Negative**:

- More complex than single-API approach
- Need inter-agent communication protocol
- Potential for coordination overhead
- Debugging multi-agent interactions is harder

**Implementation Notes**:

```javascript
class BaseAgent {
  async execute(task, context) {
    const plan = await this.plan(task);
    const result = await this.act(plan, context);
    const improved = await this.reflect(result);
    return improved;
  }
}
```

---

## ADR-004: Separate Memory Systems

**Status**: Accepted  
**Date**: December 23, 2024  
**Deciders**: Funnelists LLC

### Context

AI systems need different types of memory:

- Current task context (working memory)
- Past conversation history (episodic memory)
- Learned facts and concepts (semantic memory)
- Successful strategies (procedural memory)

A single memory system can't efficiently handle all these needs.

### Decision

Implement **separate, specialized memory systems**:

1. **ShortTermMemory**: Current conversation/task (in-memory)
2. **EpisodicMemory**: Conversation history (structured DB)
3. **SemanticMemory**: Facts and concepts (vector DB)
4. **ProceduralMemory**: Strategies and patterns (structured DB)

### Rationale

1. **Different Access Patterns**: Each memory type is queried differently
2. **Different Storage Needs**: Short-term doesn't need persistence
3. **Performance**: Optimized storage for each type
4. **Context Management**: Retrieve only relevant memories
5. **Scalability**: Each system scales independently

### Consequences

**Positive**:

- Efficient retrieval for each memory type
- Better context window management
- Natural separation of concerns
- Can optimize each system independently

**Negative**:

- More complex architecture
- Need to coordinate between memory systems
- Multiple storage backends to manage
- Potential data synchronization issues

**Technology Choices**:

- Short-term: JavaScript objects/Map
- Episodic: PostgreSQL with time-based indexing
- Semantic: Pinecone/Weaviate for vector embeddings
- Procedural: PostgreSQL with pattern matching

---

## ADR-005: Dynamic Tool Registry

**Status**: Accepted  
**Date**: December 23, 2025  
**Deciders**: Funnelists LLC

### Context

AI agents need tools to interact with the world. Fixed tool sets limit flexibility. As agents become more capable, they should be able to:

- Discover available tools
- Create new tools on-demand
- Compose existing tools into workflows

### Decision

Implement a **dynamic tool registry** that supports:

- Runtime tool registration
- Tool discovery by capability
- Tool composition
- AI-generated tools

```javascript
toolRegistry.register(newTool);
const tools = toolRegistry.discover('web search');
const compositeTool = toolRegistry.compose([tool1, tool2]);
```

### Rationale

1. **Flexibility**: Add tools without redeploying
2. **Discoverability**: Agents find tools they need
3. **Composition**: Build complex tools from simple ones
4. **AI-Generated Tools**: Agents create tools for novel situations
5. **AGI-Ready**: Scales to autonomous tool creation

### Consequences

**Positive**:

- Extremely flexible tool system
- Agents can adapt to new requirements
- Easy to extend with new capabilities
- Supports emergent problem-solving

**Negative**:

- Security concerns with dynamic tool creation
- Harder to validate tool correctness
- Potential for inefficient tool compositions
- Need careful access control

**Security Measures**:

- Sandbox for AI-generated tools
- Approval workflow for new tools
- Rate limiting on tool execution
- Audit logging for all tool uses

---

## ADR-006: Prompt Versioning Strategy

**Status**: Accepted  
**Date**: December 23, 2025  
**Deciders**: Funnelists LLC

### Context

Prompts are core to AI application behavior but evolve frequently. Changes can improve or break functionality. We need version control for prompts just like code.

### Decision

Implement **semantic versioning for prompts**:

- Store prompts in registry with version numbers
- Support multiple versions simultaneously
- Track performance metrics per version
- Enable A/B testing and rollback

```javascript
const prompt = promptRegistry.getVersion('task-decomposition', '1.2');
```

### Rationale

1. **Safety**: Can rollback bad prompt changes
2. **Experimentation**: A/B test prompt variations
3. **Documentation**: Track why changes were made
4. **Auditing**: Know which version produced results
5. **Optimization**: Compare performance across versions

### Consequences

**Positive**:

- Safe prompt iteration
- Clear change history
- Can optimize prompts scientifically
- Easy rollback on issues

**Negative**:

- More overhead managing versions
- Need storage for prompt history
- Potential version proliferation
- Team needs version discipline

**Implementation**:

- Store in PROMPTS.md with version numbers
- Track metrics in separate analytics system
- Use feature flags for gradual rollout
- Document changes in prompt comments

---

## ADR-007: React for UI Layer

**Status**: Accepted  
**Date**: December 23, 2025  
**Deciders**: Funnelists LLC

### Context

Need to build interactive UIs for:

- Agent execution monitoring
- Task management
- Memory visualization
- Debugging tools

### Decision

Use **React** for all UI components with:

- Functional components and hooks
- Component composition
- Shared component library
- Consistent styling approach

### Rationale

1. **Team Expertise**: Team already uses React
2. **Ecosystem**: Rich ecosystem of libraries
3. **Component Model**: Natural fit for UI composition
4. **Hot Reload**: Fast development iteration
5. **Future-Proof**: Can migrate to Next.js if needed

### Consequences

**Positive**:

- Consistent UI patterns
- Fast development
- Rich component library
- Easy state management with hooks

**Negative**:

- Single framework lock-in
- Client-side rendering (for now)
- Bundle size considerations

**Guidelines**:

- Keep components small and focused
- Use composition over inheritance
- Implement loading states for async operations
- Follow accessibility best practices

---

## ADR Template

Use this template for new decisions:

```markdown
## ADR-XXX: [Decision Title]

**Status**: [Proposed | Accepted | Deprecated | Superseded]  
**Date**: December 23, 2025  
**Deciders**: Funnelists LLC  
**Related ADRs**: [List]

### Context
[What is the issue that motivates this decision?]

### Decision
[What is the change we're making?]

### Rationale
[Why this approach over alternatives?]

### Consequences

**Positive**:
- [Benefit 1]

**Negative**:
- [Tradeoff 1]

**Risks**:
- [Risk 1]

**Mitigation**:
- [How to address risks]

### Alternatives Considered
1. [Alternative 1] - [Why rejected]
2. [Alternative 2] - [Why rejected]
```

---

## Decision Making Process

1. **Identify Decision**: Recognize a significant architectural choice
2. **Research**: Gather information on options
3. **Propose**: Draft ADR with context and rationale
4. **Discuss**: Team reviews and provides feedback
5. **Decide**: Team agrees on direction
6. **Document**: Update ADR with decision
7. **Implement**: Execute according to ADR
8. **Review**: Revisit periodically

## When to Create an ADR

Create an ADR for decisions that:

- Impact multiple components
- Are hard to reverse
- Affect performance or scalability
- Change fundamental approaches
- Have significant cost implications
- Set precedents for future work

Don't create ADRs for:

- Minor implementation details
- Easily reversible choices
- Temporary workarounds
- Obvious best practices

---

**Last Updated**: December 23, 2025  
**Maintained By**: Funnelists LLC  
**Related**: See ARCHITECTURE.md for current system design
