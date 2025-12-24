/**
 * Reasoning Agent
 * 
 * Specialized agent for complex, multi-step reasoning tasks.
 * Uses chain-of-thought prompting and task decomposition.
 */

import { BaseAgent } from './BaseAgent';
import { logger } from '../utils/logger';

export class ReasoningAgent extends BaseAgent {
    constructor(config) {
        super({
            ...config,
            capabilities: [...(config.capabilities || []), 'reasoning', 'decomposition']
        });

        this.maxDecompositionDepth = config.maxDecompositionDepth || 3;
    }

    /**
     * Override: Plan using task decomposition
     */
    async plan(task, context) {
        logger.info(`ReasoningAgent ${this.id} planning task`);

        // Decompose complex task into subtasks
        const decomposition = await this.decomposeTask(task);

        return {
            approach: 'decomposition',
            subtasks: decomposition.tasks,
            strategy: decomposition.strategy
        };
    }

    /**
     * Override: Execute with chain-of-thought reasoning
     */
    async act(plan, context) {
        logger.info(`ReasoningAgent ${this.id} executing with CoT`);

        const results = [];
        let workingMemory = { context };

        // Execute each subtask with reasoning chain
        for (const subtask of plan.subtasks) {
            const result = await this.executeWithReasoning(
                subtask,
                workingMemory,
                context
            );

            results.push(result);

            // Update working memory with results
            workingMemory = {
                ...workingMemory,
                previousResults: results
            };
        }

        // Synthesize final answer
        const synthesis = await this.synthesizeResults(results, context.task);

        return {
            success: true,
            subtaskResults: results,
            finalAnswer: synthesis,
            plan
        };
    }

    /**
     * Decompose task into manageable subtasks
     * @private
     */
    async decomposeTask(task) {
        const prompt = `You are an expert task planner. Decompose this task into clear, executable subtasks.

Task: ${task.description}

Requirements:
1. Break into 3-7 subtasks
2. Each subtask should be clear and actionable
3. Include dependencies (which must complete first)
4. Provide overall strategy

Output JSON:
{
  "strategy": "high-level approach",
  "tasks": [
    {
      "id": "task_1",
      "description": "what to do",
      "reasoning": "why this is needed",
      "dependencies": [],
      "complexity": "low|medium|high"
    }
  ]
}`;

        const response = await this.provider.complete({
            messages: [{ role: 'user', content: prompt }],
            maxTokens: 2048
        });

        try {
            return JSON.parse(response.content);
        } catch (error) {
            logger.warn('Failed to parse decomposition, using simple plan');
            return {
                strategy: 'direct',
                tasks: [{
                    id: 'task_1',
                    description: task.description,
                    dependencies: [],
                    complexity: 'medium'
                }]
            };
        }
    }

    /**
     * Execute subtask with chain-of-thought reasoning
     * @private
     */
    async executeWithReasoning(subtask, workingMemory, context) {
        logger.debug(`Executing subtask with reasoning: ${subtask.description}`);

        const prompt = this.buildReasoningPrompt(subtask, workingMemory, context);

        const response = await this.provider.complete({
            messages: [{ role: 'user', content: prompt }],
            maxTokens: 4096
        });

        return {
            subtask: subtask.description,
            reasoning: this.extractReasoning(response.content),
            result: this.extractResult(response.content),
            tokens: response.usage.totalTokens
        };
    }

    /**
     * Build chain-of-thought prompt
     * @private
     */
    buildReasoningPrompt(subtask, workingMemory, context) {
        let prompt = `${context.systemPrompt}\n\n`;

        prompt += `Let's solve this step by step.\n\n`;

        // Add previous results if available
        if (workingMemory.previousResults?.length > 0) {
            prompt += `Previous Steps:\n`;
            workingMemory.previousResults.forEach((result, i) => {
                prompt += `${i + 1}. ${result.subtask}: ${result.result}\n`;
            });
            prompt += '\n';
        }

        prompt += `Current Step: ${subtask.description}\n\n`;

        if (subtask.reasoning) {
            prompt += `Why this step: ${subtask.reasoning}\n\n`;
        }

        prompt += `Please work through this methodically:
1. Analyze what's being asked
2. Consider what information or steps are needed
3. Work through the problem
4. State your conclusion

Format:
REASONING: [Your step-by-step thinking]
RESULT: [Your final answer for this step]`;

        return prompt;
    }

    /**
     * Extract reasoning from response
     * @private
     */
    extractReasoning(content) {
        const match = content.match(/REASONING:\s*([\s\S]*?)(?=RESULT:|$)/i);
        return match ? match[1].trim() : 'No reasoning provided';
    }

    /**
     * Extract result from response
     * @private
     */
    extractResult(content) {
        const match = content.match(/RESULT:\s*([\s\S]*?)$/i);
        return match ? match[1].trim() : content;
    }

    /**
     * Synthesize results into final answer
     * @private
     */
    async synthesizeResults(results, task) {
        logger.info('Synthesizing final answer from subtask results');

        const prompt = `Based on these step-by-step results, provide a comprehensive final answer.

Original Task: ${task.description}

Steps Completed:
${results.map((r, i) => `${i + 1}. ${r.subtask}\n   Reasoning: ${r.reasoning}\n   Result: ${r.result}`).join('\n\n')}

Synthesize these into a clear, complete answer to the original task.`;

        const response = await this.provider.complete({
            messages: [{ role: 'user', content: prompt }],
            maxTokens: 4096
        });

        return response.content;
    }

    /**
     * Override: Custom system prompt for reasoning
     */
    getSystemPrompt() {
        return `You are an expert reasoning agent. You excel at:
- Breaking down complex problems
- Thinking step-by-step
- Identifying logical dependencies
- Synthesizing information

Always show your reasoning process clearly.`;
    }

    /**
     * Override: Higher quality threshold for reasoning tasks
     */
    getQualityThreshold() {
        return 8; // Reasoning requires higher quality
    }
}

/**
 * Example Usage:
 * 
 * const agent = new ReasoningAgent({
 *   id: 'reasoner-1',
 *   provider: anthropicProvider,
 *   memory: memorySystem
 * });
 * 
 * const result = await agent.execute({
 *   id: 'task-1',
 *   description: 'Analyze the trade-offs between microservices and monolithic architecture',
 *   priority: 'high'
 * });
 * 
 * console.log(result.finalAnswer);
 */
