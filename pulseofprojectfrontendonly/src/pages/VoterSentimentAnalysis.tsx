import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Container, Typography, Alert, AlertTitle } from '@mui/material';
import {
  Phone as PhoneIcon,
  Groups as GroupsIcon,
  History as HistoryIcon,
  Analytics as AnalyticsIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { elevenLabsService } from '../services/elevenLabsService';
import { callPollingService } from '../services/callPollingService';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import SingleCallTest from '../components/VoterSentiment/SingleCallTest';
import MassCallingManager from '../components/VoterSentiment/MassCallingManager';
import CallHistoryTable from '../components/VoterSentiment/CallHistoryTable';
import SentimentAnalyticsDashboard from '../components/VoterSentiment/SentimentAnalyticsDashboard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`voter-sentiment-tabpanel-${index}`}
      aria-labelledby={`voter-sentiment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `voter-sentiment-tab-${index}`,
    'aria-controls': `voter-sentiment-tabpanel-${index}`,
  };
}

const VoterSentimentAnalysis: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isConfigured, setIsConfigured] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const { user } = useAuth();
  const { currentOrganization } = useTenant();

  // DEV MODE: Use user's organization_id or a development fallback (valid UUID)
  // Using a fixed UUID for development: represents "Development Organization"
  const DEV_ORG_ID = '00000000-0000-0000-0000-000000000001';
  const organizationId = currentOrganization?.id || user?.organization_id || DEV_ORG_ID;

  useEffect(() => {
    // Check if ElevenLabs is configured
    const configured = elevenLabsService.isConfigured();
    setIsConfigured(configured);

    if (!configured) {
      setConfigError(
        'ElevenLabs API is not configured. Please add VITE_ELEVENLABS_API_KEY and VITE_ELEVENLABS_AGENT_ID to your environment variables.'
      );
    }

    // Start polling service (runs every 10 minutes to fetch completed calls)
    if (configured) {
      console.log('Starting call polling service...');
      callPollingService.startPolling();
    }

    // Cleanup: stop polling when component unmounts
    return () => {
      callPollingService.stopPolling();
    };
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 8 }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
            Voter Sentiment Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            AI-powered voter outreach and sentiment tracking using ElevenLabs voice calling
          </Typography>
        </Box>

        {/* Development Mode Info */}
        {!currentOrganization && organizationId === 'dev-org-id' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Development Mode</AlertTitle>
            Running in development mode without an organization. Data will use a temporary organization ID.
            For production, please set up proper organization management.
          </Alert>
        )}

        {/* Configuration Warning */}
        {!isConfigured && configError && (
          <Alert severity="error" sx={{ mb: 3 }} icon={<WarningIcon />}>
            <AlertTitle>Configuration Required</AlertTitle>
            {configError}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="voter sentiment analysis tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              px: 2,
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              },
            }}
          >
            <Tab
              icon={<PhoneIcon />}
              iconPosition="start"
              label="Single Call Test"
              {...a11yProps(0)}
            />
            <Tab
              icon={<GroupsIcon />}
              iconPosition="start"
              label="Mass Calling"
              {...a11yProps(1)}
            />
            <Tab
              icon={<HistoryIcon />}
              iconPosition="start"
              label="Call History"
              {...a11yProps(2)}
            />
            <Tab
              icon={<AnalyticsIcon />}
              iconPosition="start"
              label="Analytics"
              {...a11yProps(3)}
            />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ p: 3 }}>
            <TabPanel value={tabValue} index={0}>
              <SingleCallTest
                organizationId={organizationId}
                userId={user?.id}
                isConfigured={isConfigured}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <MassCallingManager
                organizationId={organizationId}
                userId={user?.id}
                isConfigured={isConfigured}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <CallHistoryTable
                organizationId={organizationId}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <SentimentAnalyticsDashboard
                organizationId={organizationId}
              />
            </TabPanel>
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            mt: 4,
            pt: 2,
            textAlign: 'center',
            color: 'text.secondary',
            fontSize: '0.75rem',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            v1.0 - 2025-11-11
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default VoterSentimentAnalysis;
