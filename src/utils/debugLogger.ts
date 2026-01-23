/**
 * Debug Logger Utility
 * Provides centralized logging controlled by VITE_PRODUCTION environment variable
 * When VITE_PRODUCTION=false (default), logs are visible in console
 * When VITE_PRODUCTION=true, all logs are suppressed
 */

const isProduction = import.meta.env.VITE_PRODUCTION === 'true';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface DebugLogger {
  info: (label: string, message: string, data?: unknown) => void;
  warn: (label: string, message: string, data?: unknown) => void;
  error: (label: string, message: string, data?: unknown) => void;
  debug: (label: string, message: string, data?: unknown) => void;
  group: (label: string) => void;
  groupEnd: () => void;
  getIsProduction: () => boolean;
}

const debugLogger: DebugLogger = {
  info: (label: string, message: string, data?: unknown) => {
    if (!isProduction) {
      console.log(`[${label}] ${message}`, data !== undefined ? data : '');
    }
  },

  warn: (label: string, message: string, data?: unknown) => {
    if (!isProduction) {
      console.warn(`[${label}] ${message}`, data !== undefined ? data : '');
    }
  },

  error: (label: string, message: string, data?: unknown) => {
    if (!isProduction) {
      console.error(`[${label}] ${message}`, data !== undefined ? data : '');
    }
  },

  debug: (label: string, message: string, data?: unknown) => {
    if (!isProduction) {
      console.debug(`[${label}] ${message}`, data !== undefined ? data : '');
    }
  },

  group: (label: string) => {
    if (!isProduction) {
      console.group(`[${label}]`);
    }
  },

  groupEnd: () => {
    if (!isProduction) {
      console.groupEnd();
    }
  },

  getIsProduction: () => {
    return isProduction;
  },
};

export default debugLogger;
