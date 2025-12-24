/**
 * Universal Provider Interface
 * 
 * Standardizes interactions across all frontier LLMs
 */

import { logger } from '../utils/logger';

export class UniversalProvider {
  constructor() {
    this.providers = new Map();
    this.defaultProvider = null;
  }

  register(name, provider) {
    this.providers.set(name, provider);
    logger.info(Provider registered: );
    
    if (!this.defaultProvider) {
      this.defaultProvider = name;
    }
  }

  getProvider(name) {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(Provider  not found);
    }
    return provider;
  }

  async complete(request, options = {}) {
    const providerName = options.provider || this.defaultProvider;
    const provider = this.getProvider(providerName);

    try {
      const normalizedRequest = this.normalizeRequest(request, provider);
      const response = await provider.complete(normalizedRequest);
      return this.normalizeResponse(response, provider);
    } catch (error) {
      logger.error(Provider  failed, { error });
      
      if (options.enableFallback !== false) {
        return await this.tryFallback(request, providerName, options);
      }
      
      throw error;
    }
  }

  normalizeRequest(request, provider) {
    const normalized = {
      messages: this.normalizeMessages(request.messages, provider),
      temperature: request.temperature ?? 0.7,
      maxTokens: request.maxTokens ?? 4096,
      stream: request.stream ?? false
    };

    if (provider.name === 'anthropic') {
      normalized.system = request.systemPrompt;
      normalized.model = request.model || 'claude-sonnet-4';
    } else if (provider.name === 'openai') {
      normalized.model = request.model || 'gpt-4';
      if (request.systemPrompt) {
        normalized.messages.unshift({
          role: 'system',
          content: request.systemPrompt
        });
      }
    } else if (provider.name === 'google') {
      normalized.model = request.model || 'gemini-pro';
    }

    return normalized;
  }

  normalizeMessages(messages, provider) {
    return messages.map(msg => ({
      role: this.normalizeRole(msg.role, provider),
      content: msg.content
    }));
  }

  normalizeRole(role, provider) {
    const roleMap = {
      anthropic: { user: 'user', assistant: 'assistant', system: 'system' },
      openai: { user: 'user', assistant: 'assistant', system: 'system' },
      google: { user: 'user', assistant: 'model', system: 'user' }
    };
    return roleMap[provider.name]?.[role] || role;
  }

  normalizeResponse(response, provider) {
    return {
      content: this.extractContent(response, provider),
      model: response.model,
      provider: provider.name,
      usage: {
        inputTokens: this.extractInputTokens(response, provider),
        outputTokens: this.extractOutputTokens(response, provider),
        totalTokens: this.extractTotalTokens(response, provider)
      },
      finishReason: this.extractFinishReason(response, provider)
    };
  }

  extractContent(response, provider) {
    switch (provider.name) {
      case 'anthropic':
        return response.content[0]?.text || '';
      case 'openai':
        return response.choices[0]?.message?.content || '';
      case 'google':
        return response.candidates[0]?.content?.parts[0]?.text || '';
      default:
        return response.content || response.text || '';
    }
  }

  extractInputTokens(response, provider) {
    switch (provider.name) {
      case 'anthropic':
        return response.usage?.input_tokens || 0;
      case 'openai':
        return response.usage?.prompt_tokens || 0;
      case 'google':
        return response.usageMetadata?.promptTokenCount || 0;
      default:
        return 0;
    }
  }

  extractOutputTokens(response, provider) {
    switch (provider.name) {
      case 'anthropic':
        return response.usage?.output_tokens || 0;
      case 'openai':
        return response.usage?.completion_tokens || 0;
      case 'google':
        return response.usageMetadata?.candidatesTokenCount || 0;
      default:
        return 0;
    }
  }

  extractTotalTokens(response, provider) {
    return this.extractInputTokens(response, provider) + 
           this.extractOutputTokens(response, provider);
  }

  extractFinishReason(response, provider) {
    switch (provider.name) {
      case 'anthropic':
        return response.stop_reason;
      case 'openai':
        return response.choices[0]?.finish_reason;
      case 'google':
        return response.candidates[0]?.finishReason;
      default:
        return 'unknown';
    }
  }

  async tryFallback(request, failedProvider, options) {
    const allProviders = Array.from(this.providers.keys());
    const fallbackOrder = allProviders.filter(p => p !== failedProvider);

    for (const providerName of fallbackOrder) {
      try {
        logger.info(Trying fallback provider: );
        return await this.complete(request, {
          ...options,
          provider: providerName,
          enableFallback: false
        });
      } catch (error) {
        logger.warn(Fallback provider  failed, { error });
        continue;
      }
    }

    throw new Error('All providers failed');
  }

  listProviders() {
    return Array.from(this.providers.entries()).map(([name, provider]) => ({
      name,
      available: provider.isAvailable(),
      models: provider.supportedModels
    }));
  }

  setDefaultProvider(name) {
    if (!this.providers.has(name)) {
      throw new Error(Provider  not registered);
    }
    this.defaultProvider = name;
    logger.info(Default provider set to: );
  }
}
