import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';

export class AnthropicProvider {
  constructor(config) {
    this.name = 'anthropic';
    this.version = '1.0';
    this.client = new Anthropic({
      apiKey: config.apiKey
    });
    this.supportedModels = [
      'claude-opus-4',
      'claude-sonnet-4',
      'claude-haiku-4'
    ];
  }

  async complete(request) {
    const response = await this.client.messages.create({
      model: request.model || 'claude-sonnet-4',
      max_tokens: request.maxTokens || 4096,
      system: request.system,
      messages: request.messages,
      temperature: request.temperature
    });

    return response;
  }

  isAvailable() {
    return !!this.client.apiKey;
  }
}
