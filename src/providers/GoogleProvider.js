import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';

export class GoogleProvider {
  constructor(config) {
    this.name = 'google';
    this.version = '1.0';
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.supportedModels = [
      'gemini-pro',
      'gemini-ultra'
    ];
  }

  async complete(request) {
    const model = this.client.getGenerativeModel({
      model: request.model || 'gemini-pro'
    });

    const chat = model.startChat({
      history: this.convertMessages(request.messages.slice(0, -1)),
      generationConfig: {
        maxOutputTokens: request.maxTokens || 4096,
        temperature: request.temperature
      }
    });

    const lastMessage = request.messages[request.messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;

    return response;
  }

  convertMessages(messages) {
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
  }

  isAvailable() {
    return !!this.client;
  }
}
