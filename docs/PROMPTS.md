# Prompt Library

This document contains reusable prompt templates for common operations in our AGI-ready framework. All prompts are versioned and tested across multiple model providers.

## Table of Contents

- [Task Decomposition](#task-decomposition)
- [Reasoning Patterns](#reasoning-patterns)
- [Tool Selection](#tool-selection)
- [Code Generation](#code-generation)
- [Reflection and Improvement](#reflection-and-improvement)
- [Memory Management](#memory-management)
- [Agent Coordination](#agent-coordination)

---

## Task Decomposition

### Basic Task Breakdown

**ID**: `task-decomposition-v1`  
**Purpose**: Break complex goals into actionable subtasks  
**Model Compatibility**: All models  
**Version**: 1.0

```
You are an expert task planner. Break down the following goal into concrete, executable subtasks.

Goal: {{goal}}

{{#if context}}
Context: {{context}}
{{/if}}

Requirements:
1. Each subtask must be clear and actionable
2. Include dependencies between tasks (which tasks must complete before others)
3. Estimate complexity for each task (low, medium, high)
4. Identify required capabilities for each task

Output Format (JSON):
{
  "tasks": [
    {
      "id": "task_1",
      "description": "Clear description of what needs to be done",
      "complexity": "low|medium|high",
      "dependencies": ["task_id_that_must_complete_first"],
      "requiredCapabilities": ["capability1", "capability2"],
      "estimatedDuration": "time estimate"
    }
  ],
  "overallStrategy": "High-level approach to accomplish the goal",
  "criticalPath": ["task_1", "task_3", "task_5"]
}
```

**Usage Example**:

```javascript
const prompt = promptRegistry.render('task-decomposition-v1', {
  goal: 'Build a user authentication system',
  context: 'Using React frontend and Node.js backend'
});
```

### Advanced Task Planning with Risk Assessment

**ID**: `task-decomposition-advanced-v1`  
**Purpose**: Detailed planning with risk analysis  
**Version**: 1.0

```
You are a senior project planner. Analyze this goal and create a detailed execution plan.

Goal: {{goal}}
Constraints: {{constraints}}
Available Resources: {{resources}}

Provide a comprehensive plan including:
1. Task breakdown with dependencies
2. Risk assessment for each task
3. Mitigation strategies
4. Resource allocation
5. Timeline estimates

For each task, consider:
- What could go wrong?
- What are the alternatives if this approach fails?
- What information is needed before starting?
- What skills/capabilities are required?

Output as structured JSON following this schema:
{{schema}}
```

---

## Reasoning Patterns

### Chain of Thought

**ID**: `chain-of-thought-v1`  
**Purpose**: Step-by-step problem solving  
**Version**: 1.0

```
Let's solve this problem step by step.

Problem: {{problem}}

{{#if examples}}
Here are similar examples:
{{examples}}
{{/if}}

Please work through this methodically:
1. First, analyze what's being asked
2. Break down the problem into components
3. Identify what information or tools are needed
4. Solve each component
5. Synthesize the final answer

Show your reasoning at each step. If you're uncertain about something, say so and explain why.
```

### Self-Consistency Reasoning

**ID**: `self-consistency-v1`  
**Purpose**: Validate solutions through multiple approaches  
**Version**: 1.0

```
Solve this problem using three different approaches, then compare your answers.

Problem: {{problem}}

Approach 1: {{method1}}
[Solve the problem using this approach]

Approach 2: {{method2}}
[Solve the problem using this approach]

Approach 3: {{method3}}
[Solve the problem using this approach]

Comparison:
- Compare the three answers
- Identify any discrepancies
- Explain which answer is most reliable and why
- If answers differ, explain what might account for the differences

Final Answer: [Your most confident answer with justification]
```

### ReAct (Reasoning + Acting)

**ID**: `react-v1`  
**Purpose**: Interleave reasoning and tool use  
**Version**: 1.0

```
You have access to the following tools:
{{#each tools}}
- {{name}}: {{description}}
  Parameters: {{parameters}}
{{/each}}

Task: {{task}}

Work through this task using the following format:

Thought: [Your reasoning about what to do next]
Action: [The tool you want to use]
Action Input: [The input to provide to the tool]
Observation: [The result from the tool - this will be provided]

... (repeat Thought/Action/Observation as many times as needed)

Thought: I now have enough information to provide the final answer
Final Answer: [Your complete answer to the original task]

Important:
- Think before each action
- Only use tools that are listed above
- If a tool fails, try a different approach
- Be specific with action inputs

Begin!
```

---

## Tool Selection

### Automatic Tool Discovery

**ID**: `tool-selection-v1`  
**Purpose**: Select appropriate tools for a task  
**Version**: 1.0

```
Given the following task and available tools, determine which tools would be most useful.

Task: {{task}}

Available Tools:
{{#each tools}}
{{@index}}. {{name}} - {{description}}
   Cost: {{metadata.cost}}, Latency: {{metadata.latency}}, Reliability: {{metadata.reliability}}
{{/each}}

Consider:
1. Which tools are necessary vs nice-to-have?
2. Are there dependencies between tools (one must run before another)?
3. What's the optimal order to use these tools?
4. Are there any tools that could be composed together?

Output Format (JSON):
{
  "selectedTools": ["tool_name_1", "tool_name_2"],
  "executionOrder": ["tool_name_1", "tool_name_2"],
  "reasoning": "Why these tools were selected",
  "alternatives": "Other approaches considered"
}
```

### Tool Composition Planner

**ID**: `tool-composition-v1`  
**Purpose**: Combine multiple tools into workflows  
**Version**: 1.0

```
Create a tool workflow to accomplish this task.

Task: {{task}}
Available Tools: {{tools}}

Design a workflow that:
1. Identifies which tools to use
2. Determines the order of execution
3. Specifies how outputs from one tool feed into another
4. Handles potential errors at each step

Output a workflow diagram in this format:
{
  "workflow": [
    {
      "step": 1,
      "tool": "tool_name",
      "input": "where the input comes from",
      "output": "what this produces",
      "errorHandling": "what to do if this fails"
    }
  ],
  "dataFlow": "description of how data moves through the workflow"
}
```

---

## Code Generation

### Component Generation

**ID**: `code-generation-component-v1`  
**Purpose**: Generate React components following conventions  
**Version**: 1.0

```
Generate a React component following our project conventions.

Requirements:
{{requirements}}

Conventions to follow:
1. Use functional components with hooks
2. Include JSDoc comments for props
3. Use descriptive variable names
4. Include error handling
5. Follow the patterns in CONVENTIONS.md

Component Structure:
- Import statements
- JSDoc type definitions
- Component function
- PropTypes validation (if complex props)
- Export statement

Additional Context:
{{#if existingComponents}}
Similar existing components: {{existingComponents}}
{{/if}}

Generate the complete component code.
```

### Agent Implementation

**ID**: `code-generation-agent-v1`  
**Purpose**: Generate agent class implementations  
**Version**: 1.0

```
Implement an agent class following our architecture.

Agent Specification:
Name: {{agentName}}
Purpose: {{purpose}}
Capabilities: {{capabilities}}
Specialization: {{specialization}}

The agent should:
1. Extend BaseAgent class
2. Implement plan(), execute(), and reflect() methods
3. Use the capabilities specified
4. Follow error handling patterns from CONVENTIONS.md
5. Include comprehensive JSDoc comments

Context:
{{#if similarAgents}}
Reference these similar agents: {{similarAgents}}
{{/if}}

Generate the complete agent implementation.
```

---

## Reflection and Improvement

### Output Evaluation

**ID**: `reflection-evaluate-v1`  
**Purpose**: Evaluate quality of outputs  
**Version**: 1.0

```
Review the following output and provide a detailed evaluation.

Original Task: {{task}}
Output to Evaluate: {{output}}

Evaluate on these dimensions:

1. **Correctness**: Are there any factual errors or logical flaws?
2. **Completeness**: Is anything important missing?
3. **Clarity**: Is it easy to understand?
4. **Efficiency**: Could the same goal be achieved more efficiently?
5. **Robustness**: Does it handle edge cases?

For each dimension:
- Provide a score (1-10)
- Explain the reasoning
- Give specific examples of issues if any

Overall Assessment:
- Strengths: What was done well
- Weaknesses: What needs improvement
- Priority Fixes: What should be addressed first

Output Format (JSON):
{
  "scores": {
    "correctness": 8,
    "completeness": 7,
    "clarity": 9,
    "efficiency": 6,
    "robustness": 7
  },
  "analysis": {
    "correctness": "detailed analysis...",
    ...
  },
  "overallScore": 7.4,
  "strengths": ["list of strengths"],
  "weaknesses": ["list of weaknesses"],
  "priorityFixes": ["ordered list of what to fix"]
}
```

### Improvement Suggestions

**ID**: `reflection-improve-v1`  
**Purpose**: Generate specific improvement suggestions  
**Version**: 1.0

```
Suggest specific improvements for this output.

Original Task: {{task}}
Current Output: {{output}}
Evaluation: {{evaluation}}

Provide concrete, actionable suggestions for improvement:

1. For each identified weakness, provide:
   - Specific change to make
   - Why this change improves the output
   - Example of the improved version

2. Prioritize suggestions:
   - Critical: Must fix (breaks functionality or has errors)
   - Important: Should fix (significantly improves quality)
   - Nice-to-have: Could fix (minor improvements)

3. Consider:
   - Can this be simplified?
   - Are there more efficient approaches?
   - What edge cases should be handled?

Output Format (JSON):
{
  "suggestions": [
    {
      "priority": "critical|important|nice-to-have",
      "issue": "description of the problem",
      "suggestion": "what to change",
      "reasoning": "why this improves things",
      "example": "code or text showing the improvement"
    }
  ]
}
```

### Self-Correction Loop

**ID**: `reflection-self-correct-v1`  
**Purpose**: Agent self-corrects its output  
**Version**: 1.0

```
Review and improve your previous response.

Original Task: {{task}}
Your Previous Response: {{previousResponse}}

Self-review checklist:
1. Did I fully address the task?
2. Are there any errors in my reasoning?
3. Is my explanation clear?
4. Could I have been more efficient?
5. Did I miss any important considerations?

Based on this review:
1. List any issues you found
2. Provide an improved version of your response
3. Explain what you changed and why

Be honest about limitations or uncertainties.
```

---

## Memory Management

### Memory Summarization

**ID**: `memory-summarize-v1`  
**Purpose**: Compress conversation history  
**Version**: 1.0

```
Summarize this conversation segment concisely while preserving key information.

Conversation:
{{conversation}}

Focus on:
1. Key decisions made
2. Important information discovered
3. Actions taken or planned
4. Open questions or unresolved issues
5. Context needed for future reference

Summarize in under {{maxWords}} words. Maintain chronological order if it matters.

Format:
[Summary of discussion about topic X. Key points: 1) decision Y was made, 2) discovered Z, 3) still need to address W.]
```

### Relevant Memory Retrieval

**ID**: `memory-retrieve-v1`  
**Purpose**: Identify relevant past context  
**Version**: 1.0

```
Given the current task, identify what information from past conversations would be most relevant.

Current Task: {{task}}

Available Memory Summaries:
{{#each memories}}
{{@index}}. [{{timestamp}}] {{summary}}
{{/each}}

Analyze:
1. Which memories are directly relevant to this task?
2. Which provide useful context or background?
3. Are there patterns or lessons from past tasks?
4. What information is NOT needed?

Output Format (JSON):
{
  "highPriority": [memory_ids_directly_relevant],
  "mediumPriority": [memory_ids_providing_context],
  "reasoning": "explanation of relevance",
  "synthesizedContext": "key points from relevant memories in own words"
}
```

---

## Agent Coordination

### Agent Task Assignment

**ID**: `coordination-assign-v1`  
**Purpose**: Assign subtasks to appropriate agents  
**Version**: 1.0

```
Assign these subtasks to the most appropriate agents.

Subtasks:
{{#each subtasks}}
{{@index}}. {{description}}
   Required Capabilities: {{requiredCapabilities}}
   Complexity: {{complexity}}
{{/each}}

Available Agents:
{{#each agents}}
{{name}}: {{capabilities}} (Specialization: {{specialization}})
{{/each}}

Consider:
1. Agent capabilities vs task requirements
2. Current agent workload
3. Dependencies between tasks
4. Opportunities for parallel execution

Output Format (JSON):
{
  "assignments": [
    {
      "taskId": "task_1",
      "assignedTo": "agent_name",
      "reasoning": "why this agent is best suited",
      "estimatedDuration": "time estimate"
    }
  ],
  "executionPlan": "description of how agents will coordinate",
  "parallelGroups": [["task_1", "task_2"], ["task_3"]]
}
```

### Inter-Agent Communication

**ID**: `coordination-communicate-v1`  
**Purpose**: Generate structured messages between agents  
**Version**: 1.0

```
Generate a message from one agent to another.

From: {{fromAgent}}
To: {{toAgent}}
Purpose: {{purpose}}
Context: {{context}}

The message should:
1. Be clear and specific
2. Include all necessary information
3. Specify what response or action is needed
4. Be appropriately formal/informal for agent types

Output Format (JSON):
{
  "messageType": "request|response|update|question",
  "priority": "high|medium|low",
  "content": "the actual message",
  "expectedResponse": "what kind of response is needed",
  "deadline": "if time-sensitive"
}
```

---

## Prompt Engineering Best Practices

### Guidelines for Creating New Prompts

1. **Be Specific**: Clearly state what you want
2. **Provide Examples**: Include 1-3 examples of expected output
3. **Structure Output**: Request specific formats (JSON, lists, etc.)
4. **Handle Edge Cases**: Mention what to do if uncertain
5. **Version Everything**: Track prompt versions and their performance

### Testing New Prompts

```javascript
// Test prompt across multiple models
async function testPrompt(promptId, testCases) {
  const results = [];
  
  for (const testCase of testCases) {
    const prompt = promptRegistry.render(promptId, testCase.variables);
    
    // Test with different models
    for (const model of ['claude-sonnet-4', 'gpt-4']) {
      const response = await provider.complete({
        messages: [{ role: 'user', content: prompt }],
        metadata: { model }
      });
      
      results.push({
        testCase: testCase.name,
        model,
        response,
        passed: testCase.validator(response)
      });
    }
  }
  
  return results;
}
```

### Prompt Versioning Strategy

- **v1.0**: Initial version
- **v1.1**: Minor improvements (clarity, examples)
- **v2.0**: Major changes (structure, approach)
- Keep old versions for rollback
- Document why changes were made

---

## Custom Prompt Template

Use this template when creating new prompts:

```markdown
### [Prompt Name]
**ID**: `[unique-id-v1]`  
**Purpose**: [What this prompt accomplishes]  
**Model Compatibility**: [Which models work well]  
**Version**: 1.0  
**Created**: [Date]  
**Last Updated**: [Date]

[The actual prompt with {{variables}}]

**Usage Example**:
```javascript
const prompt = promptRegistry.render('[unique-id-v1]', {
  variable1: 'value1'
});
```

**Test Cases**:

- Input: [example input]
- Expected Output: [example output]

**Known Issues**:

- [Any limitations or quirks]

**Performance Notes**:

- Works best with: [model names]
- Average tokens: [estimate]
- Success rate: [if measured]

```

---

**Last Updated**: December 23, 2025  
**Maintained By**: Funnelists LLC  
**Related**: See API_PATTERNS.md for prompt implementation details
