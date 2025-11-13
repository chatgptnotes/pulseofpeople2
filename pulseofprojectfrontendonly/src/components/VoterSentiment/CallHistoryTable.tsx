import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  TextField,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { voterCallsService } from '../../services/voterCallsService';
import type { VoterCall } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { format } from 'date-fns';

interface CallHistoryTableProps {
  organizationId: string;
}

const CallHistoryTable: React.FC<CallHistoryTableProps> = ({ organizationId }) => {
  const [calls, setCalls] = useState<VoterCall[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCall, setSelectedCall] = useState<VoterCall | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadCalls();
  }, [organizationId, page, rowsPerPage]);

  const loadCalls = async () => {
    setIsLoading(true);
    try {
      const data = await voterCallsService.getCalls(
        organizationId,
        { search: searchQuery },
        rowsPerPage,
        page * rowsPerPage
      );
      setCalls(data);
    } catch (error) {
      console.error('Error loading calls:', error);
      showToast('Failed to load calls', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (call: VoterCall) => {
    setSelectedCall(call);
    setShowDetailsDialog(true);
  };

  const handleDelete = async (callId: string) => {
    if (!confirm('Are you sure you want to delete this call record?')) {
      return;
    }

    try {
      await voterCallsService.deleteCall(callId);
      showToast('Call deleted successfully', 'success');
      loadCalls();
    } catch (error) {
      console.error('Error deleting call:', error);
      showToast('Failed to delete call', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
      case 'ringing':
      case 'initiated':
        return 'primary';
      case 'failed':
      case 'cancelled':
        return 'error';
      case 'no_answer':
      case 'busy':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'error';
      case 'neutral':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Card elevation={2}>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Call History
            </Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={loadCalls}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </Box>

          {/* Search and Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by phone number or voter name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadCalls()}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<SearchIcon />}
                  onClick={loadCalls}
                  fullWidth
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  fullWidth
                >
                  Filters
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  fullWidth
                >
                  Export
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Table */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>Voter Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Sentiment</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : calls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      No calls found
                    </TableCell>
                  </TableRow>
                ) : (
                  calls.map((call) => {
                    const sentiment = Array.isArray(call.sentiment_analysis)
                      ? call.sentiment_analysis[0]
                      : call.sentiment_analysis;

                    return (
                      <TableRow key={call.id} hover>
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                          {call.phone_number}
                        </TableCell>
                        <TableCell>
                          {call.voter_name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={call.status.replace('_', ' ').toUpperCase()}
                            color={getStatusColor(call.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {formatDuration(call.duration_seconds)}
                        </TableCell>
                        <TableCell>
                          {sentiment?.overall_sentiment ? (
                            <Chip
                              label={sentiment.overall_sentiment.toUpperCase()}
                              color={getSentimentColor(sentiment.overall_sentiment)}
                              size="small"
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Not analyzed
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(call.created_at), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(call)}
                            color="primary"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(call.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={calls.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Call Details Dialog */}
      <Dialog
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Call Details</DialogTitle>
        <DialogContent>
          {selectedCall && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Basic Info */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Call Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Phone Number
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {selectedCall.phone_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Voter Name
                    </Typography>
                    <Typography variant="body2">
                      {selectedCall.voter_name || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={selectedCall.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(selectedCall.status)}
                        size="small"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="body2">
                      {formatDuration(selectedCall.duration_seconds)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Transcript */}
              {selectedCall.transcript && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Transcript
                  </Typography>
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
                    {selectedCall.transcript}
                  </Paper>
                </Box>
              )}

              {/* Sentiment Analysis */}
              {selectedCall.sentiment_analysis && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Sentiment Analysis
                  </Typography>
                  {(() => {
                    const sentiment = Array.isArray(selectedCall.sentiment_analysis)
                      ? selectedCall.sentiment_analysis[0]
                      : selectedCall.sentiment_analysis;

                    return (
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Previous Government
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                label={sentiment?.previous_govt_sentiment?.toUpperCase() || 'N/A'}
                                color={getSentimentColor(sentiment?.previous_govt_sentiment)}
                                size="small"
                              />
                            </Box>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              TVK Sentiment
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Chip
                                label={sentiment?.tvk_sentiment?.toUpperCase() || 'N/A'}
                                color={getSentimentColor(sentiment?.tvk_sentiment)}
                                size="small"
                              />
                            </Box>
                          </Paper>
                        </Grid>
                        <Grid item xs={12}>
                          <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Overall Summary
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {sentiment?.overall_summary || 'No summary available'}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    );
                  })()}
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CallHistoryTable;
