# ElevenLabs Voice Calling Setup Guide

This guide will help you set up ElevenLabs Conversational AI for the Voter Sentiment Analysis feature.

## Overview

The Voter Sentiment Analysis feature uses ElevenLabs Conversational AI to:
- Make outbound calls to voters
- Conduct AI-powered conversations in Tamil
- Collect sentiment data about political issues
- Store and analyze call transcripts

## Prerequisites

1. ElevenLabs account (sign up at https://elevenlabs.io)
2. Twilio account (required for phone number integration)
3. Credit balance in your ElevenLabs account for making calls

## Setup Steps

### Step 1: Create ElevenLabs API Key

1. Go to https://elevenlabs.io/app/settings
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Copy the generated API key (starts with `sk_`)
5. Add to your `.env` file:
   ```
   VITE_ELEVENLABS_API_KEY=sk_your_api_key_here
   ```

### Step 2: Create Conversational AI Agent

1. Go to https://elevenlabs.io/app/conversational-ai
2. Click **Create Agent**
3. Configure your agent:
   - **Name**: "Voter Sentiment Analyst" (or your choice)
   - **Voice**: Choose a Tamil voice (or multilingual voice)
   - **Language**: Tamil (or multilingual)
   - **System Prompt**: Add instructions for the agent's behavior
     ```
     You are a friendly political survey agent calling voters in Tamil Nadu.
     Your goal is to understand voter sentiment about:
     1. The previous government's performance
     2. TVK (Thamizhaga Vetri Kazhagam) party led by Vijay

     Speak in Tamil (தமிழ்). Be respectful, brief, and conversational.
     Ask about their views on the previous government and their interest in TVK.
     Keep the conversation under 3 minutes.
     ```
   - **First Message**: What the agent says when the call is answered
     ```tamil
     வணக்கம். நான் [Your Campaign Name] சார்பாக அழைக்கிறேன்.
     உங்கள் கருத்துகளை சேகரிக்க 2 நிமிடங்கள் ஒதுக்க முடியுமா?
     ```
4. Click **Save** and copy the **Agent ID** (starts with `agent_`)
5. Add to your `.env` file:
   ```
   VITE_ELEVENLABS_AGENT_ID=agent_your_agent_id_here
   ```

### Step 3: Set Up Phone Number (Twilio Integration)

#### Option A: Use Existing Twilio Account

1. Go to https://elevenlabs.io/app/conversational-ai/phone-numbers
2. Click **Add Phone Number**
3. Select **Twilio** as the provider
4. Enter your Twilio credentials:
   - Account SID
   - Auth Token
5. Select or purchase a phone number
6. Copy the **Phone Number ID** from ElevenLabs
7. Add to your `.env` file:
   ```
   VITE_ELEVENLABS_PHONE_NUMBER_ID=your_phone_number_id_here
   ```

#### Option B: Let ElevenLabs Manage Twilio

1. Go to https://elevenlabs.io/app/conversational-ai/phone-numbers
2. Click **Add Phone Number**
3. Select **Let ElevenLabs manage** (they'll create a Twilio account for you)
4. Purchase a phone number (costs will be added to your ElevenLabs billing)
5. Copy the **Phone Number ID**
6. Add to your `.env` file:
   ```
   VITE_ELEVENLABS_PHONE_NUMBER_ID=your_phone_number_id_here
   ```

### Step 4: Configure Agent Tools (Optional)

While the basic setup doesn't require tools, you can enhance your agent with:
- **End conversation**: Let the agent hang up when done
- **Detect language**: Auto-detect caller's language
- **Transfer to agent**: Transfer complex queries to a human

To add tools:
1. Go to your agent settings
2. Navigate to **Tools** tab
3. Enable the tools you want
4. Save changes

### Step 5: Test Your Setup

1. Make sure all environment variables are set in `.env`:
   ```env
   VITE_ELEVENLABS_API_KEY=sk_...
   VITE_ELEVENLABS_AGENT_ID=agent_...
   VITE_ELEVENLABS_PHONE_NUMBER_ID=...
   ```

2. Restart your development server:
   ```bash
   npm run dev
   ```

3. Navigate to **Voter Sentiment Analysis** in the app

4. Go to **Single Call Test** tab

5. Enter your own phone number (with +91 prefix for India)

6. Click **Initiate Call**

7. Answer the call and test the conversation

## Phone Number Format

The system automatically formats Indian phone numbers:
- Input: `9876543210` → Output: `+919876543210`
- Input: `+919876543210` → Output: `+919876543210` (no change)

## Call Flow

1. **Frontend** → Initiate call request to ElevenLabs
2. **ElevenLabs** → Call the voter via Twilio
3. **AI Agent** → Conduct conversation in Tamil
4. **Call Completes** → Transcript available in ElevenLabs
5. **Polling Service** → Fetch transcript every 10 minutes
6. **Backend** → Store transcript in Supabase
7. **Sentiment Analysis** → Analyze keywords and sentiment
8. **Dashboard** → Display results and analytics

## Cost Estimation

ElevenLabs pricing (as of 2025):
- **Voice generation**: ~$0.30 per 1000 characters
- **Conversational AI**: ~$0.50 per minute of conversation
- **Twilio calls**: ~$0.02 per minute (India rates)

Example: 100 calls × 3 minutes average = $150-200 total

## Troubleshooting

### Error: "Phone number ID not configured"
- Make sure `VITE_ELEVENLABS_PHONE_NUMBER_ID` is set in `.env`
- Restart your development server after adding it

### Error: "404 Not Found"
- Verify your API key is correct and active
- Check that your agent ID exists
- Ensure your phone number ID is valid

### Error: "Insufficient credits"
- Add credits to your ElevenLabs account
- Go to https://elevenlabs.io/app/settings/billing

### Calls not appearing in history
- Wait 10 minutes for the polling service to run
- Check browser console for errors
- Verify Supabase connection is working

### Agent not speaking Tamil
- Update your agent's language settings to Tamil
- Choose a Tamil voice from the voice library
- Update the system prompt to specify Tamil responses

## Best Practices

1. **Test thoroughly** before mass calling
2. **Respect call timing**: Don't call late at night (before 9 AM or after 9 PM)
3. **Keep calls brief**: 2-3 minutes maximum
4. **Be transparent**: Clearly state who you are and why you're calling
5. **Honor opt-outs**: Stop calling voters who request it
6. **Follow regulations**: Comply with Indian telecom regulations (TRAI)
7. **Monitor costs**: Set up billing alerts in ElevenLabs

## Support

- **ElevenLabs Docs**: https://docs.elevenlabs.io
- **ElevenLabs Support**: support@elevenlabs.io
- **Twilio Docs**: https://www.twilio.com/docs

## Legal Disclaimer

⚠️ **Important**: Ensure compliance with:
- TRAI (Telecom Regulatory Authority of India) regulations
- Do Not Call (DNC) registry
- Data privacy laws (IT Act 2000)
- Election Commission of India guidelines

Consult with a legal advisor before conducting mass calling campaigns.
