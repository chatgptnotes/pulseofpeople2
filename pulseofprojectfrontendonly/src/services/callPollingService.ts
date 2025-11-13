/**
 * Call Polling Service
 * Runs every 10 minutes to fetch completed calls from ElevenLabs
 * Stores transcripts (in Tamil) to Supabase
 */

import { elevenLabsService } from './elevenLabsService';
import { voterCallsService } from './voterCallsService';
import { voterSentimentService } from './voterSentimentService';

class CallPollingService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private lastPollTime: Date = new Date();
  private processedCallIds: Set<string> = new Set(); // Track processed calls
  private pollingIntervalMs: number = 2 * 60 * 1000; // 2 minutes (reduced from 10)

  /**
   * Start polling service (runs every 10 minutes)
   */
  startPolling() {
    if (this.isRunning) {
      console.log('[CallPolling] Already running');
      return;
    }

    console.log(`[CallPolling] Starting polling service (interval: ${this.pollingIntervalMs / 1000}s)...`);
    this.isRunning = true;

    // Run immediately on start
    this.pollCompletedCalls();

    // Then run every 2 minutes (configurable via pollingIntervalMs)
    this.pollingInterval = setInterval(() => {
      this.pollCompletedCalls();
    }, this.pollingIntervalMs);
  }

  /**
   * Stop polling service
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isRunning = false;
    console.log('[CallPolling] Stopped polling service');
  }

  /**
   * Retry helper with exponential backoff
   * @param fn Function to retry
   * @param maxRetries Maximum number of retries
   * @param initialDelay Initial delay in ms
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          const delay = initialDelay * Math.pow(2, attempt); // Exponential backoff
          console.log(`[CallPolling] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Main polling function - fetches completed calls from last polling interval
   */
  async pollCompletedCalls() {
    try {
      console.log('[CallPolling] Checking for completed calls...');
      const now = new Date();
      const lookbackTime = new Date(now.getTime() - this.pollingIntervalMs - (60 * 1000)); // Add 1 min buffer

      // Get all recent conversations from ElevenLabs
      const conversations = await elevenLabsService.getConversations(100, 0);

      if (!conversations || conversations.length === 0) {
        console.log('[CallPolling] No conversations found');
        return;
      }

      console.log(`[CallPolling] Found ${conversations.length} conversations`);

      // Filter for completed calls since last poll
      const completedCalls = conversations.filter((conv: any) => {
        const callId = conv.conversation_id || conv.id || conv.call_id;

        // Skip if already processed
        if (this.processedCallIds.has(callId)) {
          return false;
        }

        const endTime = conv.end_time || conv.ended_at || conv.completed_at || conv.end_timestamp;
        if (!endTime) return false;

        const callEndTime = new Date(endTime);
        const status = conv.status?.toLowerCase() || '';
        return (
          (status === 'completed' || status === 'ended' || status === 'finished' || status === 'done') &&
          callEndTime >= lookbackTime &&
          callEndTime <= now
        );
      });

      console.log(`[CallPolling] Found ${completedCalls.length} new completed calls`);

      if (completedCalls.length === 0) {
        return;
      }

      // Process each completed call
      for (const call of completedCalls) {
        await this.processCompletedCall(call);
      }

      this.lastPollTime = now;
      console.log('[CallPolling] Polling completed successfully');
    } catch (error) {
      console.error('[CallPolling] Error during polling:', error);
    }
  }

  /**
   * Process a single completed call
   * - Check if already fetched
   * - Fetch transcript from ElevenLabs
   * - Save to Supabase
   * - Analyze sentiment
   */
  private async processCompletedCall(call: any) {
    try {
      const callId = call.conversation_id || call.id || call.call_id;

      if (!callId) {
        console.warn('[CallPolling] Call missing ID, skipping:', call);
        return;
      }

      console.log(`[CallPolling] Processing call: ${callId}`);

      // Check if we've already fetched this call's transcript
      const existingCall = await voterCallsService.getCallByElevenLabsId(callId);

      if (existingCall && existingCall.transcript_fetched_at) {
        console.log(`[CallPolling] Call ${callId} already fetched, skipping`);
        return;
      }

      // Fetch transcript from ElevenLabs (in Tamil) with retry logic
      console.log(`[CallPolling] Fetching transcript for call: ${callId}`);
      const transcriptData = await this.retryWithBackoff(
        () => elevenLabsService.getTranscript(callId),
        3, // max 3 retries
        2000 // start with 2s delay
      );

      if (!transcriptData.transcript) {
        console.warn(`[CallPolling] No transcript available for call: ${callId}`);
        return;
      }

      console.log(`[CallPolling] Transcript fetched successfully (${transcriptData.transcript.length} chars)`);

      // Determine organization ID from call metadata or conversation initiation data
      const metadata = call.conversation_initiation_client_data || call.metadata || {};
      // Use a valid UUID for development mode
      const DEV_ORG_ID = '00000000-0000-0000-0000-000000000001';
      const organizationId = metadata.organization_id || DEV_ORG_ID;

      // Extract phone number - ElevenLabs uses 'to_number' or 'customer_phone_number'
      const phoneNumber = call.to_number || call.customer_phone_number || call.phone_number || 'unknown';

      // Extract timestamps
      const startTime = call.start_time || call.started_at || call.start_timestamp;
      const endTime = call.end_time || call.ended_at || call.completed_at || call.end_timestamp;

      // Save to Supabase
      const savedCall = await voterCallsService.createCall({
        organization_id: organizationId,
        call_id: callId,
        phone_number: phoneNumber,
        voter_name: metadata.voter_name || undefined,
        status: 'completed',
        duration_seconds: transcriptData.duration_seconds || call.duration_seconds || call.duration || 0,
        call_started_at: startTime ? new Date(startTime) : new Date(),
        call_ended_at: endTime ? new Date(endTime) : new Date(),
        transcript: transcriptData.transcript, // Tamil transcript
        transcript_fetched_at: new Date(),
        elevenlabs_agent_id: call.agent_id || undefined,
        elevenlabs_metadata: call,
        created_by: metadata.created_by || metadata.user_id || undefined,
      });

      if (!savedCall) {
        console.error(`[CallPolling] Failed to save call to database: ${callId}`);
        return;
      }

      console.log(`[CallPolling] Call saved to database: ${savedCall.id}`);

      // Analyze sentiment (handles Tamil text)
      console.log(`[CallPolling] Analyzing sentiment for call: ${callId}`);
      const analysis = voterSentimentService.analyzeTranscript(
        transcriptData.transcript,
        callId
      );

      // Save sentiment analysis
      const savedAnalysis = await voterSentimentService.saveSentimentAnalysis(
        savedCall.id,
        organizationId,
        analysis
      );

      if (savedAnalysis) {
        console.log(`[CallPolling] Sentiment analysis saved for call: ${callId}`);
      }

      // Mark call as processed to prevent duplicate processing
      this.processedCallIds.add(callId);
      console.log(`[CallPolling] Successfully processed call: ${callId}`);

      // Cleanup: Limit processedCallIds size to prevent memory leaks
      // Keep only last 1000 processed IDs
      if (this.processedCallIds.size > 1000) {
        const idsArray = Array.from(this.processedCallIds);
        this.processedCallIds = new Set(idsArray.slice(-500)); // Keep last 500
        console.log('[CallPolling] Cleaned up processed call IDs cache');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[CallPolling] Error processing call ${callId}:`, errorMessage);

      // Don't mark as processed if it failed - allow retry next time
      // Only mark as processed if transcript was successfully saved
    }
  }

  /**
   * Manually trigger a poll (for testing)
   */
  async triggerPoll() {
    console.log('[CallPolling] Manual poll triggered');
    await this.pollCompletedCalls();
  }

  /**
   * Get polling status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastPollTime: this.lastPollTime,
      pollingIntervalSeconds: this.pollingIntervalMs / 1000,
      processedCallsCount: this.processedCallIds.size,
    };
  }

  /**
   * Set custom polling interval (for testing or configuration)
   * @param intervalMs Interval in milliseconds
   */
  setPollingInterval(intervalMs: number) {
    if (intervalMs < 30000) {
      console.warn('[CallPolling] Interval too short, minimum is 30 seconds');
      return;
    }

    this.pollingIntervalMs = intervalMs;
    console.log(`[CallPolling] Polling interval set to ${intervalMs / 1000}s`);

    // Restart if currently running
    if (this.isRunning) {
      this.stopPolling();
      this.startPolling();
    }
  }

  /**
   * Clear processed call IDs cache (useful for testing)
   */
  clearProcessedCache() {
    this.processedCallIds.clear();
    console.log('[CallPolling] Cleared processed calls cache');
  }
}

// Export singleton instance
export const callPollingService = new CallPollingService();

// Export class for testing
export default CallPollingService;
