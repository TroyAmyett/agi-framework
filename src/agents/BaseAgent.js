/**
 * Base Agent Class
 * 
 * Foundation for all agents in the framework. Provides core functionality
 * for planning, execution, and reflection.
 * 
 * @example
 * class MyAgent extends BaseAgent {
 *   async plan(task) { return steps; }
 *   async execute(task, context) { return result; }
 *   async reflect(result) { return improvements; }
 * }
 */

import { logger } from '../utils/logger';
import { ContextManager } from '../memory/ContextManager';

/**
 * @typedef {Object} AgentConfig
 * @property {string} id - Unique identifier
 * @property {Array<string>} capabilities - Agent capabilities
 * @property {Object} provider - Model provider instance
 * @property {Object} [memory] - Memory system instance
 * @property {Object} [toolRegistry] - Tool registry instance
 */

/**
 * @typedef {Object} Task
 * @property {string} id - Task identifier
 * @property {string} description - What needs to be done
 * @property {string} [priority] - Task priority (low, medium, high)
 * @property {Object} [metadata] - Additional task data
 */

/**
 * @typedef {Object} ExecutionContext
 * @property {Object} memory - Memory context
 * @property {Array<Object>} conversationHistory - Past messages
 * @property {Object} [feedback] - Feedback from previous attempts
 */

export class BaseAgent {
    /**
     * Create a new agent
     * @param {AgentConfig} config - Agent configuration
     */
    constructor(config) {
        this.id = config.id;
        this.capabilities = config.capabilities || [];
        this.provider = config.provider;
        this.memory = config.memory;
        this.toolRegistry = config.toolRegistry;
        this.contextManager = new ContextManager(
            this.provider.getContextWindow()
        );

        logger.info(`Agent ${this.id} initialized`, {
            capabilities: this.capabilities
        });
    }

    /**
     * Main execution method - orchestrates plan, act, reflect cycle
     * @param {Task} task - Task to execute
     * @param {ExecutionContext} [context] - Execution context
     * @returns {Promise<Object>} Execution result
     */
    async execute(task, context = {}) {
        logger.info(`Agent ${this.id} executing task`, { taskId: task.id });

        try {
            // Build context from memory and history
            const fullContext = await this.buildContext(task, context);

            // Plan the approach
            const plan = await this.plan(task, fullContext);
            logger.debug(`Plan created`, { plan });

            // Execute the plan
            const result = await this.act(plan, fullContext);
            logger.debug(`Execution complete`, { result });

            // Reflect on the result (if enabled)
            if (this.shouldReflect(result)) {
                const improved = await this.reflect(result, task);
                logger.debug(`Reflection complete`, { improved });
                return improved;
            }

            return result;

        } catch (error) {
            logger.error(`Agent ${this.id} execution failed`, {
                taskId: task.id,
                error: error.message,
                stack: error.stack
            });

            throw new AgentExecutionError(
                `Agent ${this.id} failed to execute task`,
                { taskId: task.id, originalError: error }
            );
        }
    }

    /**
     * Plan how to approach the task
     * Subclasses should override this method
     * 
     * @param {Task} task - Task to plan for
     * @param {ExecutionContext} context - Execution context
     * @returns {Promise<Object>} Execution plan
     */
    async plan(task, context) {
        logger.warn(`Agent ${this.id} using default plan method`);

        // Default: treat task description as the plan
        return {
            steps: [{
                action: 'complete',
                description: task.description
            }]
        };
    }

    /**
     * Execute the plan
     * Subclasses should override this method
     * 
     * @param {Object} plan - Execution plan
     * @param {ExecutionContext} context - Execution context
     * @returns {Promise<Object>} Execution result
     */
    async act(plan, context) {
        logger.warn(`Agent ${this.id} using default act method`);

        // Default: execute each step sequentially
        const results = [];

        for (const step of plan.steps) {
            const result = await this.executeStep(step, context);
            results.push(result);
        }

        return {
            success: true,
            results,
            plan
        };
    }

    /**
     * Reflect on the result and suggest improvements
     * Subclasses can override this method
     * 
     * @param {Object} result - Execution result
     * @param {Task} task - Original task
     * @returns {Promise<Object>} Improved result
     */
    async reflect(result, task) {
        logger.info(`Agent ${this.id} reflecting on result`);

        // Evaluate the result
        const evaluation = await this.evaluate(result, task);

        // If quality is sufficient, return as-is
        if (evaluation.score >= this.getQualityThreshold()) {
            logger.debug(`Result meets quality threshold`, { score: evaluation.score });
            return result;
        }

        // Otherwise, improve it
        logger.debug(`Result needs improvement`, {
            score: evaluation.score,
            threshold: this.getQualityThreshold()
        });

        return await this.improve(result, evaluation, task);
    }

    /**
     * Execute a single step of the plan
     * @private
     */
    async executeStep(step, context) {
        logger.debug(`Executing step: ${step.description}`);

        const prompt = this.buildStepPrompt(step, context);

        const response = await this.provider.complete({
            messages: [{ role: 'user', content: prompt }],
            maxTokens: 4096
        });

        return {
            step: step.description,
            result: response.content,
            tokens: response.usage.totalTokens
        };
    }

    /**
     * Build context for execution
     * @private
     */
    async buildContext(task, context) {
        const systemPrompt = this.getSystemPrompt();

        // Retrieve relevant memories if available
        let relevantMemories = [];
        if (this.memory) {
            relevantMemories = await this.memory.retrieve(task, {
                maxTokens: 10000
            });
        }

        // Build full context
        return {
            systemPrompt,
            task,
            memory: relevantMemories,
            conversationHistory: context.conversationHistory || [],
            feedback: context.feedback
        };
    }

    /**
     * Build prompt for a step
     * @private
     */
    buildStepPrompt(step, context) {
        let prompt = `${context.systemPrompt}\n\n`;

        if (context.feedback) {
            prompt += `Previous Feedback: ${JSON.stringify(context.feedback)}\n\n`;
        }

        prompt += `Task: ${step.description}\n\n`;

        if (context.memory && context.memory.length > 0) {
            prompt += `Relevant Context:\n`;
            context.memory.forEach(mem => {
                prompt += `- ${mem.content}\n`;
            });
            prompt += '\n';
        }

        prompt += `Please provide a detailed response.`;

        return prompt;
    }

    /**
     * Evaluate result quality
     * @private
     */
    async evaluate(result, task) {
        const evaluationPrompt = `Evaluate this result for the given task.

Task: ${task.description}

Result: ${JSON.stringify(result)}

Evaluate on:
1. Correctness: Are there any errors?
2. Completeness: Is anything missing?
3. Clarity: Is it easy to understand?

Provide a score from 0-10 and specific feedback.

Output JSON:
{
  "score": 0-10,
  "correctness": "analysis",
  "completeness": "analysis", 
  "clarity": "analysis",
  "suggestions": ["suggestion1", "suggestion2"]
}`;

        const response = await this.provider.complete({
            messages: [{ role: 'user', content: evaluationPrompt }],
            maxTokens: 2048
        });

        try {
            return JSON.parse(response.content);
        } catch (error) {
            logger.warn('Failed to parse evaluation JSON', { error });
            return { score: 5, suggestions: [] };
        }
    }

    /**
     * Improve result based on evaluation
     * @private
     */
    async improve(result, evaluation, task) {
        logger.info(`Improving result based on evaluation`);

        const improvementPrompt = `Improve this result based on the evaluation.

Task: ${task.description}

Current Result: ${JSON.stringify(result)}

Evaluation:
- Score: ${evaluation.score}/10
- Suggestions: ${evaluation.suggestions.join(', ')}

Please provide an improved version that addresses these issues.`;

        const response = await this.provider.complete({
            messages: [{ role: 'user', content: improvementPrompt }],
            maxTokens: 4096
        });

        return {
            ...result,
            improved: true,
            content: response.content,
            evaluationScore: evaluation.score
        };
    }

    /**
     * Get system prompt for this agent
     * Subclasses should override to customize
     */
    getSystemPrompt() {
        return `You are a helpful AI agent with the following capabilities: ${this.capabilities.join(', ')}.`;
    }

    /**
     * Get quality threshold for reflection
     * Subclasses can override
     */
    getQualityThreshold() {
        return 7; // Reflect if score < 7
    }

    /**
     * Determine if reflection should be performed
     * @private
     */
    shouldReflect(result) {
        const reflectionEnabled = process.env.REACT_APP_ENABLE_REFLECTION === 'true';
        return reflectionEnabled && !result.improved;
    }

    /**
     * Check if agent has a specific capability
     * @param {string} capability - Capability to check
     * @returns {boolean}
     */
    hasCapability(capability) {
        return this.capabilities.includes(capability);
    }

    /**
     * Get agent status
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            id: this.id,
            capabilities: this.capabilities,
            active: true
        };
    }
}

/**
 * Custom error for agent execution failures
 */
export class AgentExecutionError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = 'AgentExecutionError';
        this.details = details;
    }
}
