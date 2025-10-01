/**
 * Optimized logging utility that reduces console output in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const optimizedLogger = {
  log: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(message, data);
    }
  },
  
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(message, data);
    }
  },
  
  error: (message: string, data?: any) => {
    console.error(message, data); // Always log errors
  },
  
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`🔍 ${message}`, data);
    }
  },
  
  performance: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`⚡ ${message}`, data);
    }
  }
};

/**
 * Batch console logs to reduce render blocking
 */
const logQueue: Array<{ type: string; message: string; data?: any }> = [];
let flushTimeout: NodeJS.Timeout | null = null;

const flushLogs = () => {
  if (logQueue.length === 0) return;
  
  const logsToFlush = [...logQueue];
  logQueue.length = 0;
  
  if (isDevelopment) {
    console.group('Batched Logs');
    logsToFlush.forEach(({ type, message, data }) => {
      if (type === 'error') {
        console.error(message, data);
      } else if (type === 'warn') {
        console.warn(message, data);
      } else {
        console.log(message, data);
      }
    });
    console.groupEnd();
  }
  
  flushTimeout = null;
};

export const batchedLogger = {
  log: (message: string, data?: any) => {
    if (!isDevelopment) return;
    
    logQueue.push({ type: 'log', message, data });
    
    if (!flushTimeout) {
      flushTimeout = setTimeout(flushLogs, 100);
    }
  },
  
  warn: (message: string, data?: any) => {
    if (!isDevelopment) return;
    
    logQueue.push({ type: 'warn', message, data });
    
    if (!flushTimeout) {
      flushTimeout = setTimeout(flushLogs, 100);
    }
  },
  
  error: (message: string, data?: any) => {
    logQueue.push({ type: 'error', message, data });
    
    if (!flushTimeout) {
      flushTimeout = setTimeout(flushLogs, 0); // Immediate for errors
    }
  }
};