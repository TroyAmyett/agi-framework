const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const currentLevel = LOG_LEVELS[process.env.REACT_APP_LOG_LEVEL || 'info'];

export const logger = {
  debug: (message, ...args) => {
    if (currentLevel <= LOG_LEVELS.debug) {
      console.debug([DEBUG] , ...args);
    }
  },
  
  info: (message, ...args) => {
    if (currentLevel <= LOG_LEVELS.info) {
      console.info([INFO] , ...args);
    }
  },
  
  warn: (message, ...args) => {
    if (currentLevel <= LOG_LEVELS.warn) {
      console.warn([WARN] , ...args);
    }
  },
  
  error: (message, ...args) => {
    if (currentLevel <= LOG_LEVELS.error) {
      console.error([ERROR] , ...args);
    }
  }
};
