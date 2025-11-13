import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
  Grid,
  Paper,
  LinearProgress,
  Divider,
  Stack,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  SentimentSatisfied as SentimentSatisfiedIcon,
  SentimentNeutral as SentimentNeutralIcon,
  SentimentDissatisfied as SentimentDissatisfiedIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { elevenLabsService } from '../../services/elevenLabsService';
import { voterSentimentService } from '../../services/voterSentimentService';
import { voterCallsService } from '../../services/voterCallsService';
import { callPollingService } from '../../services/callPollingService';
import type { VoterCall, CallSentimentAnalysis } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface SingleCallTestProps {
  organizationId: string;
  userId?: string;
  isConfigured: boolean;
}

type CallStatus = 'idle' | 'initiating' | 'calling' | 'fetching_transcript' | 'analyzing' | 'completed' | 'failed';

const SingleCallTest: React.FC<SingleCallTestProps> = ({
  organizationId,
  userId,
  isConfigured,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [voterName, setVoterName] = useState('');
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [currentCall, setCurrentCall] = useState<VoterCall | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [sentimentAnalysis, setSentimentAnalysis] = useState<CallSentimentAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingStatus, setPollingStatus] = useState<any>(null);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const { showToast } = useToast();

  // Update polling status periodically
  useEffect(() => {
    const updateStatus = () => {
      const status = callPollingService.getStatus();
      setPollingStatus(status);
    };

    updateStatus();
    const statusInterval = setInterval(updateStatus, 5000); // Update every 5 seconds

    return () => clearInterval(statusInterval);
  }, []);

  // Poll for call status
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    const pollCallStatus = async () => {
      if (!currentCall?.call_id || !isPolling) return;

      try {
        const status = await elevenLabsService.getCallStatus(currentCall.call_id);

        // Update call in database
        await voterCallsService.updateCall(currentCall.id, {
          status: status.status || currentCall.status,
          duration_seconds: status.duration_seconds || currentCall.duration_seconds,
          elevenlabs_metadata: status,
        });

        // Check if call is completed (handle all possible completion statuses from ElevenLabs)
        const completionStatuses = ['completed', 'ended', 'finished', 'done'];
        const failureStatuses = ['failed', 'error', 'canceled', 'cancelled'];

        if (completionStatuses.includes(status.status?.toLowerCase())) {
          setIsPolling(false);
          setCallStatus('fetching_transcript');
          await fetchTranscriptAndAnalyze(currentCall.call_id);
        } else if (failureStatuses.includes(status.status?.toLowerCase())) {
          setIsPolling(false);
          setCallStatus('failed');
          setError(status.error_message || `Call ${status.status}`);
        }
      } catch (err) {
        console.error('Error polling call status:', err);
      }
    };

    if (isPolling && currentCall?.call_id) {
      // Poll every 3 seconds
      pollInterval = setInterval(pollCallStatus, 3000);
      // Initial poll
      pollCallStatus();
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [isPolling, currentCall]);

  const fetchTranscriptAndAnalyze = async (callId: string) => {
    try {
      // Fetch transcript from ElevenLabs
      setCallStatus('fetching_transcript');
      const transcriptData = await elevenLabsService.getTranscript(callId);
      setTranscript(transcriptData.transcript);

      // Now save the complete call data to Supabase (first time save)
      const savedCall = await voterCallsService.createCall({
        organization_id: organizationId,
        call_id: callId,
        phone_number: currentCall!.phone_number,
        voter_name: currentCall!.voter_name,
        status: 'completed',
        duration_seconds: transcriptData.duration_seconds,
        call_started_at: currentCall!.call_started_at,
        call_ended_at: new Date(),
        transcript: transcriptData.transcript,
        transcript_fetched_at: new Date(),
        elevenlabs_agent_id: import.meta.env.VITE_ELEVENLABS_AGENT_ID,
        elevenlabs_metadata: transcriptData.metadata,
        created_by: userId,
      });

      if (!savedCall) {
        console.warn('Failed to save call to database, continuing with analysis...');
      }

      // Analyze sentiment
      setCallStatus('analyzing');
      const analysis = voterSentimentService.analyzeTranscript(transcriptData.transcript, callId);

      // Save sentiment analysis (only if call was saved)
      if (savedCall) {
        const savedAnalysis = await voterSentimentService.saveSentimentAnalysis(
          savedCall.id,
          organizationId,
          analysis
        );

        if (savedAnalysis) {
          setSentimentAnalysis(savedAnalysis);
        }
      } else {
        // Just show analysis without saving to DB
        setSentimentAnalysis({
          id: 'temp-' + Date.now(),
          call_id: callId,
          organization_id: organizationId,
          ...analysis,
          created_at: new Date(),
          updated_at: new Date(),
        } as CallSentimentAnalysis);
      }

      setCallStatus('completed');
      showToast('Call completed and analyzed successfully', 'success');
    } catch (err: any) {
      console.error('Error fetching transcript:', err);
      setError(err.message || 'Failed to fetch transcript');
      setCallStatus('failed');
    }
  };

  const initiateCall = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    if (!elevenLabsService.isValidPhoneNumber(phoneNumber)) {
      setError('Please enter a valid Indian phone number (10 digits)');
      return;
    }

    setError(null);
    setCallStatus('initiating');
    setTranscript('');
    setSentimentAnalysis(null);

    try {
      // Format phone number
      const formattedNumber = elevenLabsService.formatPhoneNumber(phoneNumber);

      // Initiate call DIRECTLY via ElevenLabs (skip Supabase for now)
      setCallStatus('calling');
      const response = await elevenLabsService.initiateCall(formattedNumber, {
        voter_name: voterName,
        call_type: 'test',
        organization_id: organizationId,
        phone_number: formattedNumber,
      });

      // Store call info locally (will be saved to Supabase by polling service)
      const localCallData: VoterCall = {
        id: response.call_id, // Use ElevenLabs call_id as temporary ID
        organization_id: organizationId,
        call_id: response.call_id,
        phone_number: formattedNumber,
        voter_name: voterName || undefined,
        status: 'initiated',
        call_started_at: new Date(),
        elevenlabs_agent_id: import.meta.env.VITE_ELEVENLABS_AGENT_ID,
        created_at: new Date(),
        updated_at: new Date(),
      };

      setCurrentCall(localCallData);

      showToast('Call initiated successfully! Phone will ring shortly.', 'success');

      // Start polling for call status
      setIsPolling(true);
    } catch (err: any) {
      console.error('Error initiating call:', err);
      setError(err.message || 'Failed to initiate call');
      setCallStatus('failed');
      showToast('Failed to initiate call', 'error');
    }
  };

  const resetForm = () => {
    setPhoneNumber('');
    setVoterName('');
    setCallStatus('idle');
    setCurrentCall(null);
    setTranscript('');
    setSentimentAnalysis(null);
    setError(null);
    setIsPolling(false);
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
      case 'support':
        return <SentimentSatisfiedIcon color="success" />;
      case 'negative':
      case 'against':
        return <SentimentDissatisfiedIcon color="error" />;
      default:
        return <SentimentNeutralIcon color="action" />;
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
      case 'support':
        return 'success';
      case 'negative':
      case 'against':
        return 'error';
      case 'neutral':
      case 'undecided':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleManualRefresh = async () => {
    if (!currentCall?.call_id) return;

    setIsManualRefreshing(true);
    try {
      showToast('Fetching latest transcript...', 'info');
      await fetchTranscriptAndAnalyze(currentCall.call_id);
      showToast('Transcript refreshed successfully!', 'success');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to refresh transcript';
      showToast(errorMsg, 'error');
    } finally {
      setIsManualRefreshing(false);
    }
  };

  const formatTimeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <Box>
      {/* Polling Status Info */}
      {pollingStatus && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => callPollingService.triggerPoll()}
              startIcon={<RefreshIcon />}
            >
              Poll Now
            </Button>
          }
        >
          <AlertTitle>Background Polling Active</AlertTitle>
          Automatically checking for completed calls every {pollingStatus.pollingIntervalSeconds}s.
          Last poll: {pollingStatus.lastPollTime ? formatTimeSince(new Date(pollingStatus.lastPollTime)) : 'Never'}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Test Single Call
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Make a test call to a single voter to verify the system
              </Typography>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+919876543210 or 9876543210"
                  helperText="Enter 10-digit Indian mobile number"
                  disabled={callStatus !== 'idle'}
                />

                <TextField
                  fullWidth
                  label="Voter Name (Optional)"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  placeholder="John Doe"
                  disabled={callStatus !== 'idle'}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={
                      callStatus === 'idle' ? <PhoneIcon /> : <CircularProgress size={20} color="inherit" />
                    }
                    onClick={initiateCall}
                    disabled={!isConfigured || callStatus !== 'idle'}
                    fullWidth
                  >
                    {callStatus === 'idle' ? 'Initiate Call' : 'Calling...'}
                  </Button>

                  {callStatus !== 'idle' && (
                    <Button
                      variant="outlined"
                      onClick={resetForm}
                      startIcon={<RefreshIcon />}
                    >
                      Reset
                    </Button>
                  )}
                </Box>

                {!isConfigured && (
                  <Alert severity="warning">
                    ElevenLabs is not configured. Please add API credentials.
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Call Status
              </Typography>

              <Stack spacing={2}>
                {/* Status Indicator */}
                <Box>
                  {callStatus === 'idle' && (
                    <Chip label="Ready" color="default" icon={<PendingIcon />} />
                  )}
                  {callStatus === 'initiating' && (
                    <Chip
                      label="Initiating Call"
                      color="info"
                      icon={<CircularProgress size={16} color="inherit" />}
                    />
                  )}
                  {callStatus === 'calling' && (
                    <Chip
                      label="Call in Progress"
                      color="primary"
                      icon={<CircularProgress size={16} color="inherit" />}
                    />
                  )}
                  {callStatus === 'fetching_transcript' && (
                    <Chip
                      label="Fetching Transcript"
                      color="info"
                      icon={<CircularProgress size={16} color="inherit" />}
                    />
                  )}
                  {callStatus === 'analyzing' && (
                    <Chip
                      label="Analyzing Sentiment"
                      color="secondary"
                      icon={<CircularProgress size={16} color="inherit" />}
                    />
                  )}
                  {callStatus === 'completed' && (
                    <Chip label="Completed" color="success" icon={<CheckCircleIcon />} />
                  )}
                  {callStatus === 'failed' && (
                    <Chip label="Failed" color="error" icon={<ErrorIcon />} />
                  )}
                </Box>

                {/* Progress Bar */}
                {callStatus !== 'idle' && callStatus !== 'completed' && callStatus !== 'failed' && (
                  <LinearProgress />
                )}

                {/* Error Message */}
                {error && (
                  <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {error}
                  </Alert>
                )}

                {/* Call Info */}
                {currentCall && (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Call ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {currentCall.call_id || currentCall.id}
                    </Typography>
                    {currentCall.duration_seconds && (
                      <>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Duration
                        </Typography>
                        <Typography variant="body2">
                          {Math.floor(currentCall.duration_seconds / 60)}m {currentCall.duration_seconds % 60}s
                        </Typography>
                      </>
                    )}
                  </Paper>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Transcript Section */}
        {transcript && (
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Call Transcript
                  </Typography>
                  {currentCall && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={isManualRefreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
                      onClick={handleManualRefresh}
                      disabled={isManualRefreshing || callStatus === 'fetching_transcript' || callStatus === 'analyzing'}
                    >
                      {isManualRefreshing ? 'Refreshing...' : 'Refresh Transcript'}
                    </Button>
                  )}
                </Box>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    maxHeight: 300,
                    overflow: 'auto',
                    bgcolor: '#f5f5f5',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                  }}
                >
                  {transcript}
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Sentiment Analysis Section */}
        {sentimentAnalysis && (
          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sentiment Analysis
                </Typography>

                <Grid container spacing={3}>
                  {/* Previous Government Sentiment */}
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getSentimentIcon(sentimentAnalysis.previous_govt_sentiment)}
                        <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 600 }}>
                          Previous Government
                        </Typography>
                      </Box>
                      <Chip
                        label={sentimentAnalysis.previous_govt_sentiment?.toUpperCase() || 'N/A'}
                        color={getSentimentColor(sentimentAnalysis.previous_govt_sentiment)}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {sentimentAnalysis.previous_govt_summary || 'No analysis available'}
                      </Typography>
                      {sentimentAnalysis.previous_govt_keywords && sentimentAnalysis.previous_govt_keywords.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {sentimentAnalysis.previous_govt_keywords.slice(0, 5).map((keyword, idx) => (
                            <Chip key={idx} label={keyword} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                          ))}
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  {/* TVK Sentiment */}
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getSentimentIcon(sentimentAnalysis.tvk_sentiment)}
                        <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 600 }}>
                          TVK (Vijay's Party)
                        </Typography>
                      </Box>
                      <Chip
                        label={sentimentAnalysis.tvk_sentiment?.toUpperCase() || 'N/A'}
                        color={getSentimentColor(sentimentAnalysis.tvk_sentiment)}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {sentimentAnalysis.tvk_summary || 'No analysis available'}
                      </Typography>
                      {sentimentAnalysis.tvk_keywords && sentimentAnalysis.tvk_keywords.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {sentimentAnalysis.tvk_keywords.slice(0, 5).map((keyword, idx) => (
                            <Chip key={idx} label={keyword} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                          ))}
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  {/* Voting Intention */}
                  {sentimentAnalysis.voting_intention && (
                    <Grid item xs={12} md={6}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                          Voting Intention
                        </Typography>
                        <Chip
                          label={sentimentAnalysis.voting_intention}
                          color="primary"
                          sx={{ mb: 1 }}
                        />
                        {sentimentAnalysis.voting_confidence && (
                          <Typography variant="body2" color="text.secondary">
                            Confidence: {sentimentAnalysis.voting_confidence.replace('_', ' ')}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  )}

                  {/* Key Issues */}
                  {sentimentAnalysis.key_issues && sentimentAnalysis.key_issues.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                          Key Issues Discussed
                        </Typography>
                        <Stack spacing={0.5}>
                          {sentimentAnalysis.key_issues.slice(0, 5).map((issue, idx) => (
                            <Chip
                              key={idx}
                              label={`${issue.issue} (${issue.sentiment})`}
                              size="small"
                              color={getSentimentColor(issue.sentiment)}
                            />
                          ))}
                        </Stack>
                      </Paper>
                    </Grid>
                  )}

                  {/* Overall Summary */}
                  <Grid item xs={12}>
                    <Alert
                      severity={
                        sentimentAnalysis.overall_sentiment === 'positive' ? 'success' :
                        sentimentAnalysis.overall_sentiment === 'negative' ? 'error' :
                        'info'
                      }
                    >
                      <AlertTitle>Overall Analysis</AlertTitle>
                      {sentimentAnalysis.overall_summary}
                    </Alert>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default SingleCallTest;
