/**
 * Provider Manager - Routes requests to appropriate LLM providers
 * Supports multiple providers with fallback and cost optimization
 */

import { AnthropicProvider } from './AnthropicProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { GoogleProvider } from './GoogleProvider';
import { LocalProvider } from './LocalProvider';
import { logger } from '../utils/logger';

export class ProviderManager {
    constructor(config) {
        this.config = config;
        this.providers = {};
        this.costTracker = new Map();

        this.initializeProviders();
    }

    /**
     * Initialize all enabled providers
     */
    initializeProviders() {
        const providerConfig = this.config.ai.providers;

        // Anthropic
        if (providerConfig.anthropic?.enabled) {
            this.providers.anthropic = new AnthropicProvider({
                apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
                defaultModel: providerConfig.anthropic.defaultModel
            });
            logger.info('Anthropic provider initialized');
        }

        // OpenAI
        if (providerConfig.openai?.enabled) {
            this.providers.openai = new OpenAIProvider({
                apiKey: process.env.REACT_APP_OPENAI_API_KEY,
                defaultModel: providerConfig.openai.defaultModel
            });
            logger.info('OpenAI provider initialized');
        }

        // Google
        if (providerConfig.google?.enabled) {
            this.providers.google = new GoogleProvider({
                apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
                defaultModel: providerConfig.google.defaultModel
            });
            logger.info('Google provider initialized');
        }

        // Local (Ollama)
        if (providerConfig.local?.enabled) {
            this.providers.local = new LocalProvider({
                endpoint: providerConfig.local.endpoint,
                defaultModel: providerConfig.local.defaultModel
            });
            logger.info('Local provider initialized');
        }
    }

    /**
     * Route request to appropriate provider based on strategy
     */
    async complete(request, options = {}) {
        const provider = this.selectProvider(request, options);

        try {
            const result = await provider.complete(request);
            this.trackCost(provider.name, result.usage);
            return result;
        } catch (error) {
            logger.error(`Provider ${provider.name} failed`, { error });

            // Try fallback if enabled
            if (this.config.ai.routing.fallback.enabled) {
                return await this.tryFallback(request, provider.name);
            }

            throw error;
        }
    }

    /**
     * Select best provider based on routing strategy
     */
    selectProvider(request, options) {
        // Explicit provider requested
        if (options.provider) {
            return this.providers[options.provider];
        }

        const strategy = this.config.ai.routing.strategy;
        const rules = this.config.ai.routing.rules;

        // Check routing rules
        if (request.metadata?.complexity === 'simple') {
            const modelName = rules['simple-queries'];
            return this.getProviderForModel(modelName);
        }

        if (request.metadata?.complexity === 'complex') {
            const modelName = rules['complex-reasoning'];
            return this.getProviderForModel(modelName);
        }

        if (request.metadata?.useCase === 'embeddings') {
            const modelName = rules['embeddings'];
            return this.getProviderForModel(modelName);
        }

        // Default routing strategy
        switch (strategy) {
            case 'cost-optimized':
                return this.getCheapestProvider();

            case 'latency-optimized':
                return this.getFastestProvider();

            case 'quality-optimized':
                return this.getBestQualityProvider();

            default:
                return this.getDefaultProvider();
        }
    }

    /**
     * Get provider for specific model string
     */
    getProviderForModel(modelString) {
        // Format: "provider/model" or just "model"
        if (modelString.includes('/')) {
            const [providerName] = modelString.split('/');
            return this.providers[providerName];
        }

        // Find provider that has this model
        for (const [name, provider] of Object.entries(this.providers)) {
            if (provider.hasModel(modelString)) {
                return provider;
            }
        }

        return this.getDefaultProvider();
    }

    /**
     * Try fallback providers
     */
    async tryFallback(request, failedProvider) {
        const fallbackOrder = this.config.ai.routing.fallback.order;

        for (const providerName of fallbackOrder) {
            if (providerName === failedProvider) continue;

            const provider = this.providers[providerName];
            if (!provider) continue;

            try {
                logger.info(`Trying fallback provider: ${providerName}`);
                const result = await provider.complete(request);
                this.trackCost(providerName, result.usage);
                return result;
            } catch (error) {
                logger.warn(`Fallback provider ${providerName} also failed`, { error });
                continue;
            }
        }

        throw new Error('All providers failed');
    }

    /**
     * Get cheapest available provider
     */
    getCheapestProvider() {
        // Simple heuristic: local > haiku > sonnet > opus
        if (this.providers.local) return this.providers.local;
        if (this.providers.anthropic) return this.providers.anthropic; // Will use haiku
        if (this.providers.openai) return this.providers.openai;
        return this.getDefaultProvider();
    }

    /**
     * Get fastest provider (typically local or Haiku)
     */
    getFastestProvider() {
        if (this.providers.local) return this.providers.local;
        if (this.providers.anthropic) return this.providers.anthropic;
        return this.getDefaultProvider();
    }

    /**
     * Get best quality provider (typically Opus or GPT-4)
     */
    getBestQualityProvider() {
        if (this.providers.anthropic) return this.providers.anthropic; // Will use opus
        if (this.providers.openai) return this.providers.openai;
        return this.getDefaultProvider();
    }

    /**
     * Get default provider
     */
    getDefaultProvider() {
        const defaultName = process.env.REACT_APP_DEFAULT_PROVIDER || 'anthropic';
        return this.providers[defaultName] || Object.values(this.providers)[0];
    }

    /**
     * Track costs per provider
     */
    trackCost(providerName, usage) {
        if (!this.config.monitoring?.trackCosts) return;

        const current = this.costTracker.get(providerName) || { tokens: 0, cost: 0 };
        current.tokens += usage.totalTokens;
        // Calculate cost based on provider pricing
        current.cost += this.calculateCost(providerName, usage);

        this.costTracker.set(providerName, current);

        logger.debug(`Cost tracking for ${providerName}`, current);
    }

    /**
     * Calculate cost based on usage
     */
    calculateCost(providerName, usage) {
        const pricing = {
            anthropic: {
                'claude-opus-4': { input: 15 / 1000000, output: 75 / 1000000 },
                'claude-sonnet-4': { input: 3 / 1000000, output: 15 / 1000000 },
                'claude-haiku-4': { input: 0.25 / 1000000, output: 1.25 / 1000000 }
            },
            openai: {
                'gpt-4': { input: 30 / 1000000, output: 60 / 1000000 },
                'gpt-4-turbo': { input: 10 / 1000000, output: 30 / 1000000 },
                'gpt-3.5-turbo': { input: 0.5 / 1000000, output: 1.5 / 1000000 }
            },
            local: {
                default: { input: 0, output: 0 }
            }
        };

        // Simplified - would need to know exact model used
        const providerPricing = pricing[providerName] || pricing.local;
        const modelPricing = Object.values(providerPricing)[0];

        return (usage.inputTokens * modelPricing.input) +
            (usage.outputTokens * modelPricing.output);
    }

    /**
     * Get cost summary
     */
    getCostSummary() {
        const summary = {};
        for (const [provider, data] of this.costTracker.entries()) {
            summary[provider] = {
                tokens: data.tokens,
                cost: data.cost.toFixed(4),
                currency: 'USD'
            };
        }
        return summary;
    }

    /**
     * List available providers
     */
    listProviders() {
        return Object.keys(this.providers).map(name => ({
            name,
            enabled: true,
            models: this.config.ai.providers[name].models
        }));
    }
}