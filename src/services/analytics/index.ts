/**
 * Analytics Module Index
 * 
 * This file exports all analytics-related classes and utilities
 * for clean imports throughout the project.
 */

// Main tracker exports
export { 
  AnalyticsTracker, 
  createDefaultAnalyticsTracker, 
  createProductionAnalyticsTracker 
} from './analyticsTracker';

// Import for creating default instance
import { createDefaultAnalyticsTracker } from './analyticsTracker';

// Transport exports
export { 
  ConsoleTransport, 
  HttpTransport, 
  BatchTransport, 
  LocalStorageTransport 
} from './transports';

// Type exports
export type {
  AnalyticsEvent,
  AnalyticsAction,
  ActivityLifecycleType,
  AnalyticsEvaluation,
  AnalyticsFeedback,
  AnalyticsConfig,
  AnalyticsTransport,
  SubmitAnswerEvent,
  AskForHintEvent,
  ActivityStartEvent,
  ActivityCompleteEvent
} from '../../types/Analytics';

// Helper exports
export * from './helpers';

// Create and export a default analytics tracker instance
export const analyticsTracker = createDefaultAnalyticsTracker();

// Log that analytics is ready
console.log('🔧 Analytics system initialized and ready for tracking!'); 