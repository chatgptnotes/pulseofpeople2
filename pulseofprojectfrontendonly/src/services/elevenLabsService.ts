/**
 * ElevenLabs API Service
 * Handles all interactions with ElevenLabs Conversational AI API for voter calling
 */

import type {
  ElevenLabsCallRequest,
  ElevenLabsCallResponse,
  ElevenLabsTranscript
} from '../types';

class ElevenLabsService {
  private apiKey: string;
  private agentId: string;
  private phoneNumberId: string;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
    this.agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';
    this.phoneNumberId = import.meta.env.VITE_ELEVENLABS_PHONE_NUMBER_ID || '';

    if (!this.apiKey) {
      console.warn('VITE_ELEVENLABS_API_KEY not found in environment variables');
    }
    if (!this.agentId) {
      console.warn('VITE_ELEVENLABS_AGENT_ID not found in environment variables');
    }
    if (!this.phoneNumberId) {
      console.warn('VITE_ELEVENLABS_PHONE_NUMBER_ID not found in environment variables');
    }
  }

  /**
   * Get authorization headers for API requests
   */
  private getHeaders(): HeadersInit {
    return {
      'xi-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Initiate a call to a voter
   * @param phoneNumber - Phone number in E.164 format (e.g., +919876543210)
   * @param metadata - Optional metadata to attach to the call
   * @returns Call ID and status
   */
  async initiateCall(
    phoneNumber: string,
    metadata?: Record<string, any>
  ): Promise<ElevenLabsCallResponse> {
    try {
      // Validate phone number format
      if (!phoneNumber.startsWith('+')) {
        throw new Error('Phone number must be in E.164 format (start with +)');
      }

      // Check if phone number ID is configured
      if (!this.phoneNumberId) {
        throw new Error('Phone number ID not configured. Please set up a phone number in ElevenLabs dashboard and add VITE_ELEVENLABS_PHONE_NUMBER_ID to your environment variables.');
      }

      // Build request body according to ElevenLabs Twilio API
      const request = {
        agent_id: this.agentId,
        agent_phone_number_id: this.phoneNumberId,
        to_number: phoneNumber,
        conversation_initiation_client_data: metadata || {},
      };

      console.log('[ElevenLabs] Initiating call to:', phoneNumber);

      const response = await fetch(`${this.baseUrl}/convai/twilio/outbound-call`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.detail?.message ||
          error.message ||
          `ElevenLabs API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      console.log('[ElevenLabs] Call initiated successfully:', data);

      return {
        call_id: data.conversation_id || data.call_id,
        status: data.success ? 'initiated' : 'failed',
        message: data.message || 'Call initiated',
      };
    } catch (error) {
      console.error('[ElevenLabs] Error initiating call:', error);
      throw error;
    }
  }

  /**
   * Get the status of a call
   * @param callId - The ElevenLabs conversation/call ID
   * @returns Call status and metadata
   */
  async getCallStatus(callId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/convai/conversations/${callId}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.detail?.message ||
          error.message ||
          `Failed to get call status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting call status:', error);
      throw error;
    }
  }

  /**
   * Get the transcript of a completed call
   * @param callId - The ElevenLabs conversation/call ID
   * @returns Transcript data
   */
  async getTranscript(callId: string): Promise<ElevenLabsTranscript> {
    try {
      // ElevenLabs returns full conversation data, not separate transcript endpoint
      const response = await fetch(
        `${this.baseUrl}/convai/conversations/${callId}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.detail?.message ||
          error.message ||
          `Failed to get transcript: ${response.status}`
        );
      }

      const data = await response.json();

      // Transform the response to our format
      const transcript = this.formatTranscript(data);

      return {
        call_id: callId,
        transcript: transcript,
        duration_seconds: data.duration_seconds || data.call_duration || 0,
        status: data.status || 'completed',
        metadata: data,
      };
    } catch (error) {
      console.error('Error getting transcript:', error);
      throw error;
    }
  }

  /**
   * Format transcript from ElevenLabs API response
   * @param data - Raw API response
   * @returns Formatted transcript string
   */
  private formatTranscript(data: any): string {
    // Debug logging to understand API response structure
    console.log('[ElevenLabs] Formatting transcript, data structure:', {
      hasTranscript: !!data.transcript,
      transcriptType: typeof data.transcript,
      isTranscriptArray: Array.isArray(data.transcript),
      hasMessages: !!data.messages,
      hasTurns: !!data.turns,
      sampleKeys: data.transcript && Array.isArray(data.transcript) && data.transcript.length > 0
        ? Object.keys(data.transcript[0]).slice(0, 10)
        : []
    });

    // Check if transcript exists and is already a string
    if (data.transcript && typeof data.transcript === 'string') {
      return data.transcript;
    }

    // Handle transcript as an array of conversation turn objects (ElevenLabs actual format)
    if (data.transcript && Array.isArray(data.transcript)) {
      return data.transcript
        .map((turn: any) => {
          const role = turn.role === 'agent' ? 'Agent' : 'Voter';
          // Check multiple possible fields for the actual message text
          const message = turn.message || turn.content || turn.text || '';
          return `${role}: ${message}`;
        })
        .filter(line => {
          // Filter out empty messages
          const trimmed = line.trim();
          return trimmed !== 'Agent:' && trimmed !== 'Voter:';
        })
        .join('\n\n');
    }

    // If transcript is in messages format
    if (data.messages && Array.isArray(data.messages)) {
      return data.messages
        .map((msg: any) => {
          const role = msg.role === 'agent' ? 'Agent' : 'Voter';
          const message = msg.content || msg.message || msg.text || '';
          return `${role}: ${message}`;
        })
        .filter(line => {
          const trimmed = line.trim();
          return trimmed !== 'Agent:' && trimmed !== 'Voter:';
        })
        .join('\n\n');
    }

    // If transcript is in turns format
    if (data.turns && Array.isArray(data.turns)) {
      return data.turns
        .map((turn: any) => {
          const speaker = turn.speaker || turn.role || 'Unknown';
          const text = turn.text || turn.content || turn.message || '';
          return `${speaker}: ${text}`;
        })
        .filter(line => !line.endsWith(': '))
        .join('\n\n');
    }

    console.warn('[ElevenLabs] Could not format transcript, unknown structure');
    return 'Transcript not available';
  }

  /**
   * Cancel an ongoing call
   * Note: This endpoint may not be available in all ElevenLabs API versions
   * @param callId - The ElevenLabs conversation/call ID
   */
  async cancelCall(callId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/convai/conversations/${callId}/end`,
        {
          method: 'POST',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.detail?.message ||
          error.message ||
          `Failed to cancel call: ${response.status}`
        );
      }
    } catch (error) {
      console.error('Error canceling call:', error);
      throw error;
    }
  }

  /**
   * Get list of all conversations/calls
   * @param limit - Maximum number of results
   * @param offset - Offset for pagination
   * @returns List of conversations
   */
  async getConversations(limit: number = 100, offset: number = 0): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/convai/conversations?page_size=${limit}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get conversations: ${response.status}`);
      }

      const data = await response.json();
      return data.conversations || data.items || data || [];
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  /**
   * Validate configuration
   * @returns true if API key, agent ID, and phone number ID are configured
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.agentId && this.phoneNumberId);
  }

  /**
   * Get agent details
   * @returns Agent configuration and details
   */
  async getAgentDetails(): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/convai/agents/${this.agentId}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.detail?.message ||
          error.message ||
          `Failed to get agent details: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting agent details:', error);
      throw error;
    }
  }

  /**
   * Format phone number to E.164 format for Indian numbers
   * @param phoneNumber - Phone number (with or without country code)
   * @returns Formatted phone number in E.164 format
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');

    // If already has country code
    if (digits.startsWith('91') && digits.length === 12) {
      return `+${digits}`;
    }

    // If 10-digit Indian number
    if (digits.length === 10) {
      return `+91${digits}`;
    }

    // Return as-is with + prefix if not matching patterns
    return phoneNumber.startsWith('+') ? phoneNumber : `+${digits}`;
  }

  /**
   * Validate phone number format
   * @param phoneNumber - Phone number to validate
   * @returns true if valid
   */
  isValidPhoneNumber(phoneNumber: string): boolean {
    const formatted = this.formatPhoneNumber(phoneNumber);
    // Indian phone numbers: +91 followed by 10 digits
    return /^\+91\d{10}$/.test(formatted);
  }
}

// Export singleton instance
export const elevenLabsService = new ElevenLabsService();

// Export class for testing
export default ElevenLabsService;
