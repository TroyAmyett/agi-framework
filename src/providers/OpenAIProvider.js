import OpenAI from 'openai';
import { logger } from '../utils/logger';

export class OpenAIProvider {
  constructor(config) {
    this.name = 'openai';
    this.version = '1.0';
    this.client = new OpenAI({
      apiKey: config.apiKey
    });
    this.supportedModels = [
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo'
    ];
  }

  async complete(request) {
    const response = await this.client.chat.completions.create({
      model: request.model || 'gpt-4',
      max_tokens: request.maxTokens || 4096,
      messages: request.messages,
      temperature: request.temperature
    });

    return response;
  }

  isAvailable() {
    return !!this.client.apiKey;
  }
}
