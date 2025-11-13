# ElevenLabs Webhook Implementation Guide

## Overview

This document outlines the recommended approach for implementing ElevenLabs webhooks for production use. Webhooks provide real-time transcript delivery (immediate vs 2-minute polling delay) and are more efficient than the current polling-based approach.

## Current vs Future Architecture

### Current Architecture (Polling-Based)
```
Frontend → ElevenLabs API (Initiate Call)
         ↓
Call Completes
         ↓
Polling Service (checks every 2 minutes)
         ↓
Fetch Transcript from ElevenLabs
         ↓
Save to Supabase
         ↓
Analyze Sentiment
```

**Limitations:**
- 0-2 minute delay in transcript retrieval
- Unnecessary API calls every 2 minutes
- Higher costs (repeated polling requests)
- Not scalable for large campaigns (100+ calls/day)

### Future Architecture (Webhook-Based)
```
Frontend → ElevenLabs API (Initiate Call)
         ↓
Call Completes
         ↓
ElevenLabs → POST /api/webhooks/elevenlabs/post-call (immediate)
         ↓
Backend validates signature
         ↓
Extract transcript from payload
         ↓
Save to Supabase
         ↓
Analyze Sentiment
         ↓
(Optional) Notify frontend via WebSocket/SSE
```

**Benefits:**
- Immediate transcript delivery (seconds vs minutes)
- 90% reduction in API calls
- Lower costs
- Scalable to thousands of calls per day
- Industry best practice

---

## Prerequisites

Before implementing webhooks, you need:

1. **Backend Infrastructure**
   - Node.js/Express server (or Cloudflare Workers)
   - Public endpoint accessible by ElevenLabs
   - HTTPS certificate (required by ElevenLabs)

2. **ElevenLabs Configuration**
   - Access to ElevenLabs dashboard
   - Conversational AI agent already created
   - Phone number configured

3. **Security Requirements**
   - HMAC-SHA256 signature validation
   - Environment variable for webhook secret
   - (Optional) IP whitelisting

---

## Implementation Steps

### Step 1: Create Webhook Endpoint

Create a new backend endpoint to receive webhook POST requests:

```typescript
// backend/routes/webhooks/elevenlabs.ts
import express from 'express';
import crypto from 'crypto';
import { voterCallsService } from '../../services/voterCallsService';
import { voterSentimentService } from '../../services/voterSentimentService';

const router = express.Router();

/**
 * ElevenLabs Post-Call Webhook
 * Receives call completion notifications with transcripts
 */
router.post('/post-call', async (req, res) => {
  try {
    // 1. Validate webhook signature
    const signature = req.headers['x-elevenlabs-signature'] as string;
    if (!validateSignature(req.body, signature)) {
      console.error('[Webhook] Invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // 2. Extract webhook data
    const {
      conversation_id,
      agent_id,
      status,
      transcript,
      duration_seconds,
      start_time,
      end_time,
      customer_phone_number,
      agent_phone_number,
      conversation_initiation_client_data,
    } = req.body;

    console.log(`[Webhook] Received post-call webhook for: ${conversation_id}`);

    // 3. Validate call completed successfully
    if (status !== 'completed' && status !== 'ended') {
      console.log(`[Webhook] Ignoring non-completed call: ${status}`);
      return res.status(200).json({ message: 'Ignored' });
    }

    // 4. Check if already processed (deduplication)
    const existingCall = await voterCallsService.getCallByElevenLabsId(conversation_id);
    if (existingCall && existingCall.transcript_fetched_at) {
      console.log(`[Webhook] Call already processed: ${conversation_id}`);
      return res.status(200).json({ message: 'Already processed' });
    }

    // 5. Extract metadata from conversation initiation data
    const metadata = conversation_initiation_client_data || {};
    const organizationId = metadata.organization_id || 'dev-org-id';

    // 6. Save call to Supabase
    const savedCall = await voterCallsService.createCall({
      organization_id: organizationId,
      call_id: conversation_id,
      phone_number: customer_phone_number,
      voter_name: metadata.voter_name,
      status: 'completed',
      duration_seconds: duration_seconds,
      call_started_at: start_time ? new Date(start_time) : new Date(),
      call_ended_at: end_time ? new Date(end_time) : new Date(),
      transcript: transcript, // Tamil transcript from webhook
      transcript_fetched_at: new Date(),
      elevenlabs_agent_id: agent_id,
      elevenlabs_metadata: req.body,
      created_by: metadata.created_by || metadata.user_id,
    });

    if (!savedCall) {
      throw new Error('Failed to save call to database');
    }

    console.log(`[Webhook] Call saved: ${savedCall.id}`);

    // 7. Analyze sentiment
    const analysis = voterSentimentService.analyzeTranscript(transcript, conversation_id);

    // 8. Save sentiment analysis
    await voterSentimentService.saveSentimentAnalysis(
      savedCall.id,
      organizationId,
      analysis
    );

    console.log(`[Webhook] Sentiment analysis saved for: ${conversation_id}`);

    // 9. Return success response
    res.status(200).json({
      success: true,
      call_id: savedCall.id,
      conversation_id: conversation_id,
    });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Validate HMAC-SHA256 signature from ElevenLabs
 */
function validateSignature(body: any, signature: string): boolean {
  const secret = process.env.ELEVENLABS_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[Webhook] ELEVENLABS_WEBHOOK_SECRET not configured');
    return false;
  }

  const payload = JSON.stringify(body);
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export default router;
```

### Step 2: Register Route in Express App

```typescript
// backend/index.ts
import express from 'express';
import elevenLabsWebhooks from './routes/webhooks/elevenlabs';

const app = express();

// Webhook routes (use raw body for signature validation)
app.use('/api/webhooks/elevenlabs', express.json({ verify: (req, res, buf) => {
  (req as any).rawBody = buf.toString();
}}), elevenLabsWebhooks);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Step 3: Configure Webhook in ElevenLabs Dashboard

1. Go to https://elevenlabs.io/app/conversational-ai
2. Click on your agent
3. Navigate to **Settings** → **Webhooks**
4. Click **Add Webhook**
5. Configure:
   - **Event**: `post_call` or `conversation.ended`
   - **URL**: `https://your-domain.com/api/webhooks/elevenlabs/post-call`
   - **Secret**: Generate a strong random string and save to `.env`
6. Click **Save**

### Step 4: Set Environment Variable

```bash
# backend/.env
ELEVENLABS_WEBHOOK_SECRET=your-strong-random-secret-here
```

Generate secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Test Webhook

1. **Local testing** (use ngrok for public URL):
```bash
ngrok http 3000
# Use ngrok URL in ElevenLabs webhook config
```

2. **Test call**:
   - Initiate a test call via your frontend
   - Complete the call
   - Check backend logs for webhook receipt
   - Verify transcript saved to Supabase

3. **Verify signature validation**:
   - Try sending request with wrong signature → should fail
   - Try sending request without signature → should fail

---

## Webhook Payload Structure

ElevenLabs sends the following payload on post-call webhook:

```json
{
  "conversation_id": "conv_abc123",
  "agent_id": "agent_xyz789",
  "status": "completed",
  "transcript": "Agent: வணக்கம்...\nUser: வணக்கம், நான்...",
  "duration_seconds": 180,
  "start_time": "2025-11-11T10:30:00Z",
  "end_time": "2025-11-11T10:33:00Z",
  "customer_phone_number": "+916260800477",
  "agent_phone_number": "+19896621396",
  "conversation_initiation_client_data": {
    "organization_id": "org_123",
    "voter_name": "John Doe",
    "user_id": "user_456"
  },
  "analysis": {
    "summary": "...",
    "sentiment": "positive"
  }
}
```

---

## Security Best Practices

### 1. Signature Validation (Required)
Always validate HMAC-SHA256 signature to prevent spoofed requests:

```typescript
// Use timing-safe comparison to prevent timing attacks
crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected))
```

### 2. IP Whitelisting (Optional)
Restrict webhook endpoint to ElevenLabs IPs:

```typescript
const ELEVENLABS_IPS = [
  '54.x.x.x', // Get actual IPs from ElevenLabs support
  '52.x.x.x',
];

app.use('/api/webhooks/elevenlabs', (req, res, next) => {
  const ip = req.ip;
  if (!ELEVENLABS_IPS.includes(ip)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});
```

### 3. Idempotency
Handle duplicate webhooks gracefully:

```typescript
// Check if call already processed before saving
const existing = await voterCallsService.getCallByElevenLabsId(conversation_id);
if (existing && existing.transcript_fetched_at) {
  return res.status(200).json({ message: 'Already processed' });
}
```

### 4. Error Handling
Return proper status codes:
- `200` = Success (processed)
- `200` = Success (already processed or ignored)
- `401` = Invalid signature
- `500` = Internal error (ElevenLabs will retry)

---

## Deployment Options

### Option 1: Vercel Serverless Functions
```typescript
// api/webhooks/elevenlabs/post-call.ts
export default async function handler(req, res) {
  // Webhook logic here
}
```

### Option 2: Cloudflare Workers
```typescript
// workers/elevenlabs-webhook.ts
export default {
  async fetch(request: Request) {
    // Webhook logic here
  }
}
```

### Option 3: Traditional Node.js Server
```typescript
// As shown in Step 1 above
```

---

## Migration Plan

### Phase 1: Add Webhooks (Keep Polling)
1. Implement webhook endpoint
2. Configure in ElevenLabs dashboard
3. Run both systems in parallel
4. Monitor for 1-2 weeks

### Phase 2: Reduce Polling Frequency
1. Change polling interval from 2 minutes to 10 minutes
2. Monitor webhook reliability
3. Use polling as backup for missed webhooks

### Phase 3: Polling as Fallback Only
1. Reduce polling to every 1 hour
2. Only catches webhooks that failed after retries
3. Deduplication prevents double-processing

---

## Monitoring & Observability

### Log Important Events
```typescript
console.log('[Webhook] Received:', { conversation_id, status });
console.log('[Webhook] Saved call:', { id, organization_id });
console.log('[Webhook] Analysis complete:', { sentiment });
```

### Track Metrics
- Webhook receipt count
- Processing time
- Failure rate
- Signature validation failures

### Alerts
- Alert on high failure rate (> 5%)
- Alert on signature validation failures (possible attack)
- Alert on processing time > 5 seconds

---

## Troubleshooting

### Webhook Not Received
1. Check ElevenLabs dashboard → Webhooks → Delivery logs
2. Verify endpoint is publicly accessible (use curl)
3. Check firewall/security groups
4. Verify HTTPS certificate is valid

### Signature Validation Fails
1. Check `ELEVENLABS_WEBHOOK_SECRET` matches dashboard
2. Verify you're using raw body (not parsed JSON)
3. Check for extra whitespace in secret

### Duplicate Processing
1. Implement deduplication check (Step 1, point 4)
2. Use database constraints (unique index on `call_id`)
3. Return 200 for duplicates (don't return error)

---

## Cost Comparison

### Current Polling (2-minute interval)
- API calls per day: 720 (30 calls/hour × 24 hours)
- Cost: ~$7-10/month (depending on ElevenLabs pricing)

### Webhook Approach
- API calls per day: ~50 (only for call initiation)
- Cost: ~$0.50-1/month
- **Savings: ~90%**

---

## References

- [ElevenLabs Webhook Documentation](https://elevenlabs.io/docs/webhooks)
- [HMAC Signature Validation](https://en.wikipedia.org/wiki/HMAC)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## Conclusion

Webhooks are the recommended production approach for:
- Immediate transcript delivery
- Cost efficiency
- Scalability
- Reliability

Implement webhooks when you add backend infrastructure. Until then, the optimized polling service (2-minute interval) is sufficient for small-scale testing and early production use.
