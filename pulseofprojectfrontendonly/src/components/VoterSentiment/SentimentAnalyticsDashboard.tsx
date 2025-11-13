import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Groups as GroupsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { voterCallsService } from '../../services/voterCallsService';
import type { CallAnalytics, SentimentStats } from '../../types';

interface SentimentAnalyticsDashboardProps {
  organizationId: string;
}

const COLORS = {
  positive: '#4caf50',
  negative: '#f44336',
  neutral: '#ff9800',
  mixed: '#9c27b0',
  support: '#2196f3',
  against: '#f44336',
  undecided: '#ff9800',
  not_mentioned: '#9e9e9e',
};

const SentimentAnalyticsDashboard: React.FC<SentimentAnalyticsDashboardProps> = ({
  organizationId,
}) => {
  const [analytics, setAnalytics] = useState<CallAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [organizationId]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await voterCallsService.getCallAnalytics(organizationId);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No analytics data available
        </Typography>
      </Box>
    );
  }

  const stats = analytics.sentiment_stats;

  // Prepare data for previous govt chart
  const govtSentimentData = [
    { name: 'Positive', value: stats.previous_govt.positive, color: COLORS.positive },
    { name: 'Negative', value: stats.previous_govt.negative, color: COLORS.negative },
    { name: 'Neutral', value: stats.previous_govt.neutral, color: COLORS.neutral },
    { name: 'Not Mentioned', value: stats.previous_govt.not_mentioned, color: COLORS.not_mentioned },
  ].filter(item => item.value > 0);

  // Prepare data for TVK sentiment chart
  const tvkSentimentData = [
    { name: 'Support', value: stats.tvk.support, color: COLORS.support },
    { name: 'Against', value: stats.tvk.against, color: COLORS.against },
    { name: 'Undecided', value: stats.tvk.undecided, color: COLORS.undecided },
    { name: 'Not Mentioned', value: stats.tvk.not_mentioned, color: COLORS.not_mentioned },
  ].filter(item => item.value > 0);

  // Prepare voting intention data
  const votingIntentionData = Object.entries(stats.voting_intention)
    .map(([party, count]) => ({ party, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Success rate
  const successRate = analytics.total_calls > 0
    ? (analytics.successful_calls / analytics.total_calls) * 100
    : 0;

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <GroupsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Total Calls
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {analytics.total_calls}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Successful
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {analytics.successful_calls}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {successRate.toFixed(1)}% success rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ErrorIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Failed
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                {analytics.failed_calls}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimelineIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Avg Duration
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {Math.floor(analytics.avg_duration / 60)}m
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {analytics.avg_duration % 60}s
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Previous Government Sentiment */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Previous Government Sentiment
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={govtSentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {govtSentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* TVK Sentiment */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                TVK (Vijay's Party) Sentiment
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tvkSentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tvkSentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Voting Intention */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Voting Intention Distribution
              </Typography>
              {votingIntentionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={votingIntentionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="party" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#2196f3" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No voting intention data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Issues */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Issues Discussed
              </Typography>
              {stats.top_issues.length > 0 ? (
                <Stack spacing={2}>
                  {stats.top_issues.map((issue, index) => (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">
                          {issue.issue}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {issue.count} mentions
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(issue.count / stats.analyzed_calls) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#f0f0f0',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: issue.avg_sentiment > 0 ? COLORS.positive :
                                     issue.avg_sentiment < 0 ? COLORS.negative :
                                     COLORS.neutral,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No issues data available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Call Trends */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Call Trends (Last 30 Days)
              </Typography>
              {analytics.by_date.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.by_date}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="calls" stroke="#2196f3" name="Total Calls" />
                    <Line type="monotone" dataKey="successful" stroke="#4caf50" name="Successful" />
                    <Line type="monotone" dataKey="failed" stroke="#f44336" name="Failed" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No trend data available yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Analysis Coverage */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analysis Coverage
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {stats.analyzed_calls}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Analyzed Calls
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {stats.total_calls > 0 ? ((stats.analyzed_calls / stats.total_calls) * 100).toFixed(1) : 0}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Analysis Rate
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {stats.total_calls - stats.analyzed_calls}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pending Analysis
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SentimentAnalyticsDashboard;
