import { UniversalProvider } from '../providers/UniversalProvider';
import { AnthropicProvider } from '../providers/AnthropicProvider';
import { OpenAIProvider } from '../providers/OpenAIProvider';
import { GoogleProvider } from '../providers/GoogleProvider';
import { logger } from '../utils/logger';

export function initializeProviders(config = null) {
  const universal = new UniversalProvider();
  
  // Anthropic
  const anthropicKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
  if (anthropicKey) {
    universal.register('anthropic', new AnthropicProvider({ apiKey: anthropicKey }));
    logger.info('Anthropic provider initialized');
  }

  // OpenAI
  const openaiKey = process.env.REACT_APP_OPENAI_API_KEY;
  if (openaiKey) {
    universal.register('openai', new OpenAIProvider({ apiKey: openaiKey }));
    logger.info('OpenAI provider initialized');
  }

  // Google
  const googleKey = process.env.REACT_APP_GOOGLE_API_KEY;
  if (googleKey) {
    universal.register('google', new GoogleProvider({ apiKey: googleKey }));
    logger.info('Google provider initialized');
  }

  // Set default provider
  const defaultProvider = process.env.REACT_APP_DEFAULT_PROVIDER || 'anthropic';
  try {
    universal.setDefaultProvider(defaultProvider);
  } catch (error) {
    logger.warn('Could not set default provider, using first available');
  }

  return universal;
}
