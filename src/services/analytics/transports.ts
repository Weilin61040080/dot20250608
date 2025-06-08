/**
 * Analytics Transport Implementations
 * Different ways to send/store analytics events
 */

import { StandardAnalyticsEvent, AnalyticsTransport, AnalyticsAction } from '../../types/Analytics';
import debugHelper from '../../utils/debugHelper';

/**
 * Console Transport - Pretty prints events to console for debugging
 */
export class ConsoleTransport implements AnalyticsTransport {
  private includeDebugInfo: boolean;

  constructor(includeDebugInfo: boolean = true) {
    this.includeDebugInfo = includeDebugInfo;
  }

  async send(event: StandardAnalyticsEvent): Promise<void> {
    const timestamp = new Date().toISOString();
    
    // Create a styled console output
    const eventType = event.action;
    const activityId = event.activityId;
    
    console.group(`🎯 Analytics Event: ${eventType}`);
    console.log(`📅 Timestamp: ${timestamp}`);
    console.log(`🎮 Activity: ${activityId}`);
    console.log(`📚 Module: ${event.moduleName}`);
    console.log(`👤 Student: ${event.studentId || 'N/A'}`);
    console.log(`🏫 Class: ${event.classId || 'N/A'}`);
    console.log(`📝 Input: "${event.input}"`);
    console.log(`✅ Evaluation: ${event.evaluation}`);
    console.log(`💬 Feedback: ${typeof event.feedback === 'object' ? JSON.stringify(event.feedback) : event.feedback}`);
    console.log(`🕐 Started At: ${event.startedAt || 'N/A'}`);
    console.log(`🕑 Finished At: ${event.finishedAt || 'N/A'}`);
    
    // Event-specific logging
    switch (event.action) {
      case AnalyticsAction.SUBMIT_ANSWER:
        if (event.questionId) {
          console.log(`❓ Question: ${event.questionId} (${event.questionType})`);
        }
        if (event.timeSpent) {
          console.log(`⏱️ Time Spent: ${(event.timeSpent / 1000).toFixed(2)}s`);
        }
        break;
        
      case AnalyticsAction.ASK_FOR_HINT:
        if (event.questionId) {
          console.log(`❓ Question: ${event.questionId} (${event.questionType})`);
        }
        if (event.hintLevel) {
          console.log(`💡 Hint Level: ${event.hintLevel}`);
        }
        break;
        
      case AnalyticsAction.ACTIVITY_START:
        if (event.totalQuestions) {
          console.log(`📊 Total Questions: ${event.totalQuestions}`);
        }
        break;
        
      case AnalyticsAction.ACTIVITY_COMPLETE:
        if (event.timeSpent) {
          console.log(`⏱️ Total Time: ${(event.timeSpent / 1000).toFixed(2)}s`);
        }
        if (event.finalScore !== undefined) {
          console.log(`🏆 Final Score: ${event.finalScore}/${event.maxPossibleScore || 'N/A'}`);
        }
        if (event.questionsAnswered !== undefined) {
          console.log(`📊 Progress: ${event.questionsAnswered}/${event.totalQuestions || 'N/A'} questions`);
        }
        break;
    }
    
    if (this.includeDebugInfo) {
      console.log('📋 Full Event Data:', event);
    }
    
    console.groupEnd();
    
    // Also use the existing debug helper
    debugHelper.logDebug(`Analytics Event: ${eventType}`, {
      activityId,
      moduleName: event.moduleName,
      timestamp
    });
  }
}

/**
 * HTTP Transport - Sends events to a backend API
 * Currently a stub with TODO for future implementation
 */
export class HttpTransport implements AnalyticsTransport {
  private apiEndpoint: string;
  private apiKey?: string;
  private retryAttempts: number;

  constructor(apiEndpoint: string, apiKey?: string, retryAttempts: number = 3) {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
    this.retryAttempts = retryAttempts;
  }

  async send(event: StandardAnalyticsEvent): Promise<void> {
    // TODO: Implement actual HTTP sending when backend is ready
    console.log(`📡 [HTTP Transport] Would send to ${this.apiEndpoint}:`, event);
    
    try {
      // Placeholder for future implementation
      await this.sendToBackend(event);
    } catch (error) {
      console.error('❌ Failed to send analytics event to backend:', error);
      // In a real implementation, we might want to queue for retry
      throw error;
    }
  }

  private async sendToBackend(event: StandardAnalyticsEvent): Promise<void> {
    // TODO: Replace this stub with actual HTTP request
    /*
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
    */
    
    // Simulate network delay for testing
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('✅ [STUB] Event would be sent to backend successfully');
  }
}

/**
 * Batch Transport - Buffers events and sends them in batches
 */
export class BatchTransport implements AnalyticsTransport {
  private buffer: StandardAnalyticsEvent[] = [];
  private batchSize: number;
  private flushInterval: number;
  private underlyingTransport: AnalyticsTransport;
  private flushTimer?: NodeJS.Timeout;

  constructor(
    underlyingTransport: AnalyticsTransport,
    batchSize: number = 10,
    flushInterval: number = 30000 // 30 seconds
  ) {
    this.underlyingTransport = underlyingTransport;
    this.batchSize = batchSize;
    this.flushInterval = flushInterval;
    this.startFlushTimer();
  }

  async send(event: StandardAnalyticsEvent): Promise<void> {
    this.buffer.push(event);
    
    if (this.buffer.length >= this.batchSize) {
      await this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const eventsToSend = [...this.buffer];
    this.buffer = [];

    console.log(`📦 [Batch Transport] Flushing ${eventsToSend.length} events`);

    // Send all events in the batch
    try {
      await Promise.all(
        eventsToSend.map(event => this.underlyingTransport.send(event))
      );
      console.log('✅ [Batch Transport] Batch sent successfully');
    } catch (error) {
      console.error('❌ [Batch Transport] Failed to send batch:', error);
      // Re-add failed events to buffer for retry
      this.buffer.unshift(...eventsToSend);
      throw error;
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush().catch(error => {
        console.error('❌ [Batch Transport] Scheduled flush failed:', error);
      });
    }, this.flushInterval);
  }

  public async destroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    await this.flush(); // Final flush
  }
}

/**
 * Local Storage Transport - Stores events in browser localStorage
 */
export class LocalStorageTransport implements AnalyticsTransport {
  private storageKey: string;
  private maxEvents: number;

  constructor(storageKey: string = 'analytics_events', maxEvents: number = 1000) {
    this.storageKey = storageKey;
    this.maxEvents = maxEvents;
  }

  async send(event: StandardAnalyticsEvent): Promise<void> {
    try {
      const existingEvents = this.getStoredEvents();
      existingEvents.push(event);
      
      // Keep only the most recent events
      if (existingEvents.length > this.maxEvents) {
        existingEvents.splice(0, existingEvents.length - this.maxEvents);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(existingEvents));
      
      console.log(`💾 [LocalStorage] Event stored (${existingEvents.length}/${this.maxEvents})`);
    } catch (error) {
      console.error('❌ Failed to store event in localStorage:', error);
      throw error;
    }
  }

  private getStoredEvents(): StandardAnalyticsEvent[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to parse stored events:', error);
      return [];
    }
  }

  public getEvents(): StandardAnalyticsEvent[] {
    return this.getStoredEvents();
  }

  public clearEvents(): void {
    localStorage.removeItem(this.storageKey);
    console.log('🗑️ [LocalStorage] Events cleared');
  }
} 