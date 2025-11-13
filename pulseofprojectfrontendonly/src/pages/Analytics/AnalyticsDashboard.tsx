import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Campaign as CampaignIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsData {
  voterAnalytics: any;
  campaignAnalytics: any;
  interactionAnalytics: any;
  sentimentAnalytics: any;
}

const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    setDateTo(today.toISOString().split('T')[0]);
    setDateFrom(thirtyDaysAgo.toISOString().split('T')[0]);

    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (selectedState) params.append('state', selectedState);
      if (selectedDistrict) params.append('district', selectedDistrict);
      if (selectedConstituency) params.append('constituency', selectedConstituency);

      // Fetch all analytics in parallel
      const [voterRes, campaignRes, interactionRes, sentimentRes] = await Promise.all([
        fetch(`/api/analytics/voters/?${params}`),
        fetch(`/api/analytics/campaigns/?${params}`),
        fetch(`/api/analytics/interactions/?${params}`),
        fetch(`/api/analytics/sentiment/?${params}`),
      ]);

      const data = {
        voterAnalytics: await voterRes.json(),
        campaignAnalytics: await campaignRes.json(),
        interactionAnalytics: await interactionRes.json(),
        sentimentAnalytics: await sentimentRes.json(),
      };

      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const response = await fetch('/api/export/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resource: 'analytics',
          format: format,
          filters: {
            date_from: dateFrom,
            date_to: dateTo,
            state: selectedState,
          },
        }),
      });

      const data = await response.json();
      alert(`Export job created: ${data.job_id}`);
    } catch (error) {
      console.error('Error creating export:', error);
    }
  };

  const renderMetricCard = (title: string, value: string | number, icon: React.ReactNode, color: string) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value.toLocaleString()}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderVoterAnalytics = () => {
    if (!analyticsData?.voterAnalytics) return null;

    const { by_sentiment, by_gender, growth_trend } = analyticsData.voterAnalytics;

    // Prepare sentiment data for pie chart
    const sentimentData = Object.entries(by_sentiment).map(([key, value]) => ({
      name: key.replace('_', ' ').toUpperCase(),
      value: value as number,
    }));

    // Prepare gender data for bar chart
    const genderData = Object.entries(by_gender).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value as number,
    }));

    return (
      <Box>
        <Grid container spacing={3}>
          {/* Metric Cards */}
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Total Voters',
              analyticsData.voterAnalytics.total_voters,
              <GroupIcon sx={{ color: 'white' }} />,
              '#3b82f6'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Strong Supporters',
              by_sentiment.strong_supporter,
              <TrendingUpIcon sx={{ color: 'white' }} />,
              '#10b981'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Supporters',
              by_sentiment.supporter,
              <TrendingUpIcon sx={{ color: 'white' }} />,
              '#3b82f6'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Neutral',
              by_sentiment.neutral,
              <GroupIcon sx={{ color: 'white' }} />,
              '#f59e0b'
            )}
          </Grid>

          {/* Sentiment Distribution */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sentiment Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Gender Distribution */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Gender Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={genderData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Growth Trend */}
          {growth_trend && growth_trend.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Voter Growth Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={growth_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Total Voters" />
                    <Line type="monotone" dataKey="new" stroke="#10b981" name="New Voters" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  const renderCampaignAnalytics = () => {
    if (!analyticsData?.campaignAnalytics) return null;

    const data = analyticsData.campaignAnalytics;

    return (
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Total Campaigns',
              data.total_campaigns,
              <CampaignIcon sx={{ color: 'white' }} />,
              '#3b82f6'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Total Reach',
              data.total_reach,
              <GroupIcon sx={{ color: 'white' }} />,
              '#10b981'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Conversions',
              data.total_conversions,
              <TrendingUpIcon sx={{ color: 'white' }} />,
              '#f59e0b'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderMetricCard(
              'Conversion Rate',
              `${data.conversion_rate}%`,
              <TrendingUpIcon sx={{ color: 'white' }} />,
              '#8b5cf6'
            )}
          </Grid>

          {/* Weekly Trend */}
          {data.weekly_trend && data.weekly_trend.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Weekly Campaign Performance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.weekly_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week_start" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="reach" stroke="#3b82f6" name="Reach" />
                    <Line type="monotone" dataKey="conversions" stroke="#10b981" name="Conversions" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  const renderInteractionAnalytics = () => {
    if (!analyticsData?.interactionAnalytics) return null;

    const data = analyticsData.interactionAnalytics;
    const interactionTypeData = Object.entries(data.by_type).map(([key, value]) => ({
      name: key.replace('_', ' ').toUpperCase(),
      value: value as number,
    }));

    return (
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            {renderMetricCard(
              'Total Interactions',
              data.total_interactions,
              <GroupIcon sx={{ color: 'white' }} />,
              '#3b82f6'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {renderMetricCard(
              'Active Volunteers',
              data.active_volunteers,
              <GroupIcon sx={{ color: 'white' }} />,
              '#10b981'
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            {renderMetricCard(
              'Conversion Rate',
              `${data.conversion_rate}%`,
              <TrendingUpIcon sx={{ color: 'white' }} />,
              '#f59e0b'
            )}
          </Grid>

          {/* Interaction Types */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Interaction Types
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={interactionTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Daily Trend */}
          {data.daily_trend && data.daily_trend.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Daily Interaction Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.daily_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="interactions" stroke="#3b82f6" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  const renderSentimentAnalytics = () => {
    if (!analyticsData?.sentimentAnalytics) return null;

    const data = analyticsData.sentimentAnalytics;

    return (
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Overall Sentiment Score
              </Typography>
              <Typography variant="h2" color={data.overall_sentiment_score > 0 ? 'success.main' : 'error.main'}>
                {data.overall_sentiment_score > 0 ? '+' : ''}
                {data.overall_sentiment_score}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Scale: -100 (Very Negative) to +100 (Very Positive)
              </Typography>
            </Paper>
          </Grid>

          {/* Sentiment Trend */}
          {data.sentiment_trend && data.sentiment_trend.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Sentiment Trend Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.sentiment_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 1]} />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Analytics Dashboard
        </Typography>
        <Box display="flex" gap={2}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchAnalytics} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('excel')}
          >
            Export Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('pdf')}
          >
            Export PDF
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Date From"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Date To"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>State</InputLabel>
              <Select
                value={selectedState}
                label="State"
                onChange={(e) => setSelectedState(e.target.value)}
              >
                <MenuItem value="">All States</MenuItem>
                {/* Add state options */}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={fetchAnalytics}
              sx={{ height: '56px' }}
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Voter Analytics" />
          <Tab label="Campaign Analytics" />
          <Tab label="Interactions" />
          <Tab label="Sentiment Analysis" />
        </Tabs>
      </Paper>

      {/* Content */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {activeTab === 0 && renderVoterAnalytics()}
          {activeTab === 1 && renderCampaignAnalytics()}
          {activeTab === 2 && renderInteractionAnalytics()}
          {activeTab === 3 && renderSentimentAnalytics()}
        </Box>
      )}
    </Container>
  );
};

export default AnalyticsDashboard;
