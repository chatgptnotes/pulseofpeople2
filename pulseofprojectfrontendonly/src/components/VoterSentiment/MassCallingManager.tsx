import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  AlertTitle,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  UploadFile as UploadFileIcon,
  Groups as GroupsIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { voterCallsService } from '../../services/voterCallsService';
import type { CallCampaign } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface MassCallingManagerProps {
  organizationId: string;
  userId?: string;
  isConfigured: boolean;
}

const MassCallingManager: React.FC<MassCallingManagerProps> = ({
  organizationId,
  userId,
  isConfigured,
}) => {
  const [campaigns, setCampaigns] = useState<CallCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDescription, setNewCampaignDescription] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    loadCampaigns();
  }, [organizationId]);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await voterCallsService.getCampaigns(organizationId);
      setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      showToast('Failed to load campaigns', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      showToast('Please upload a CSV file', 'error');
      return;
    }

    setCsvFile(file);

    // Parse CSV for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(0, 6); // Header + 5 rows
      const rows = lines.map(line => line.split(','));
      setCsvPreview(rows);
    };
    reader.readAsText(file);
  };

  const handleCreateCampaign = async () => {
    if (!newCampaignName) {
      showToast('Please enter a campaign name', 'error');
      return;
    }

    try {
      const campaign = await voterCallsService.createCampaign({
        organization_id: organizationId,
        name: newCampaignName,
        description: newCampaignDescription,
        status: 'pending',
        total_calls: 0,
        completed_calls: 0,
        successful_calls: 0,
        failed_calls: 0,
        max_concurrent_calls: 5,
        created_by: userId,
      });

      if (campaign) {
        showToast('Campaign created successfully', 'success');
        setShowCreateDialog(false);
        setNewCampaignName('');
        setNewCampaignDescription('');
        setCsvFile(null);
        setCsvPreview([]);
        loadCampaigns();
      } else {
        showToast('Failed to create campaign', 'error');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      showToast('Failed to create campaign', 'error');
    }
  };

  const handleStartCampaign = async (campaignId: string) => {
    try {
      await voterCallsService.updateCampaign(campaignId, {
        status: 'in_progress',
        started_at: new Date(),
      });
      showToast('Campaign started', 'success');
      loadCampaigns();
    } catch (error) {
      console.error('Error starting campaign:', error);
      showToast('Failed to start campaign', 'error');
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      await voterCallsService.updateCampaign(campaignId, {
        status: 'paused',
      });
      showToast('Campaign paused', 'info');
      loadCampaigns();
    } catch (error) {
      console.error('Error pausing campaign:', error);
      showToast('Failed to pause campaign', 'error');
    }
  };

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'paused':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Create Campaign Section */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Mass Calling Campaigns
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<GroupsIcon />}
                  onClick={() => setShowCreateDialog(true)}
                  disabled={!isConfigured}
                >
                  Create Campaign
                </Button>
              </Box>

              {!isConfigured && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <AlertTitle>Configuration Required</AlertTitle>
                  ElevenLabs is not configured. Please add API credentials to create campaigns.
                </Alert>
              )}

              <Alert severity="info">
                <AlertTitle>How Mass Calling Works</AlertTitle>
                <ol style={{ marginLeft: 20, marginBottom: 0 }}>
                  <li>Create a campaign and upload a CSV file with voter phone numbers</li>
                  <li>The system will automatically call voters using the configured ElevenLabs agent</li>
                  <li>Transcripts and sentiment analysis will be generated for each call</li>
                  <li>Monitor progress and view analytics in real-time</li>
                </ol>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Campaigns List */}
        {isLoading ? (
          <Grid item xs={12}>
            <LinearProgress />
          </Grid>
        ) : campaigns.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <GroupsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No campaigns yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first mass calling campaign to get started
              </Typography>
            </Paper>
          </Grid>
        ) : (
          campaigns.map((campaign) => (
            <Grid item xs={12} md={6} key={campaign.id}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">
                        {campaign.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {campaign.description || 'No description'}
                      </Typography>
                    </Box>
                    <Chip
                      label={campaign.status.toUpperCase()}
                      color={getCampaignStatusColor(campaign.status)}
                      size="small"
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Total Calls
                      </Typography>
                      <Typography variant="h6">
                        {campaign.total_calls}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Completed
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {campaign.successful_calls}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        In Progress
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        {campaign.completed_calls - campaign.successful_calls - campaign.failed_calls}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Failed
                      </Typography>
                      <Typography variant="h6" color="error.main">
                        {campaign.failed_calls}
                      </Typography>
                    </Grid>
                  </Grid>

                  {campaign.total_calls > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(campaign.completed_calls / campaign.total_calls) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {Math.round((campaign.completed_calls / campaign.total_calls) * 100)}% complete
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    {campaign.status === 'pending' && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => handleStartCampaign(campaign.id)}
                      >
                        Start
                      </Button>
                    )}
                    {campaign.status === 'in_progress' && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PauseIcon />}
                        onClick={() => handlePauseCampaign(campaign.id)}
                      >
                        Pause
                      </Button>
                    )}
                    {campaign.status === 'paused' && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => handleStartCampaign(campaign.id)}
                      >
                        Resume
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                    >
                      View
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Create Campaign Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Mass Calling Campaign</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Campaign Name"
              value={newCampaignName}
              onChange={(e) => setNewCampaignName(e.target.value)}
              placeholder="Tamil Nadu Voter Outreach 2025"
            />

            <TextField
              fullWidth
              label="Description (Optional)"
              value={newCampaignDescription}
              onChange={(e) => setNewCampaignDescription(e.target.value)}
              placeholder="Describe the purpose of this campaign"
              multiline
              rows={3}
            />

            <Divider />

            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Upload Voter List
            </Typography>

            <Alert severity="info">
              <AlertTitle>CSV Format</AlertTitle>
              Your CSV file should have columns: <strong>name, phone_number, voter_id (optional)</strong>
              <br />
              Example: John Doe, 9876543210, V12345
            </Alert>

            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              fullWidth
            >
              Upload CSV File
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleCSVUpload}
              />
            </Button>

            {csvFile && (
              <Alert severity="success">
                File uploaded: <strong>{csvFile.name}</strong> ({(csvFile.size / 1024).toFixed(2)} KB)
              </Alert>
            )}

            {csvPreview.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Preview (first 5 rows):
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}>
                  <pre style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    {csvPreview.map((row, idx) => row.join(' | ')).join('\n')}
                  </pre>
                </Paper>
              </Box>
            )}

            <Typography variant="caption" color="text.secondary">
              Note: Calls will be queued and processed automatically. The system will respect rate limits and make concurrent calls based on your configuration.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateCampaign}
            variant="contained"
            disabled={!newCampaignName}
          >
            Create Campaign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MassCallingManager;
