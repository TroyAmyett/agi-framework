/**
 * Simple logger utility for AGI Framework
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

class Logger {
  constructor(name, level = 'info') {
    this.name = name;
    this.level = LOG_LEVELS[level] || LOG_LEVELS.info;
  }

  debug(...args) {
    if (this.level <= LOG_LEVELS.debug) {
      console.log([DEBUG] [], ...args);
    }
  }

  info(...args) {
    if (this.level <= LOG_LEVELS.info) {
      console.log([INFO] [], ...args);
    }
  }

  warn(...args) {
    if (this.level <= LOG_LEVELS.warn) {
      console.warn([WARN] [], ...args);
    }
  }

  error(...args) {
    if (this.level <= LOG_LEVELS.error) {
      console.error([ERROR] [], ...args);
    }
  }
}

// Export factory function
export function createLogger(name, level) {
  return new Logger(name, level || process.env.LOG_LEVEL || 'info');
}

// For CommonJS compatibility
export default { createLogger };
