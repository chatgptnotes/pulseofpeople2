import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Save as SaveIcon,
  PlayArrow as GenerateIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

interface Metric {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface Visualization {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'table';
  metric: string;
  title: string;
}

const ReportBuilder: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('custom');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveTemplateDialog, setSaveTemplateDialog] = useState(false);

  const steps = ['Select Metrics', 'Configure Visualizations', 'Set Filters', 'Generate Report'];

  // Available metrics
  const availableMetrics: Metric[] = [
    { id: 'total_voters', name: 'Total Voters', category: 'Voters', description: 'Total number of registered voters' },
    { id: 'new_voters', name: 'New Voters', category: 'Voters', description: 'Newly registered voters in period' },
    { id: 'sentiment_score', name: 'Sentiment Score', category: 'Sentiment', description: 'Average sentiment score' },
    { id: 'total_interactions', name: 'Total Interactions', category: 'Interactions', description: 'Total field interactions' },
    { id: 'conversion_rate', name: 'Conversion Rate', category: 'Campaign', description: 'Percentage of conversions' },
    { id: 'feedback_count', name: 'Feedback Count', category: 'Feedback', description: 'Total feedback submissions' },
    { id: 'field_reports', name: 'Field Reports', category: 'Reports', description: 'Number of field reports' },
    { id: 'campaign_reach', name: 'Campaign Reach', category: 'Campaign', description: 'Total campaign reach' },
  ];

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricId)
        ? prev.filter((id) => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleAddVisualization = () => {
    const newViz: Visualization = {
      id: `viz-${Date.now()}`,
      type: 'bar',
      metric: selectedMetrics[0] || '',
      title: 'New Chart',
    };
    setVisualizations([...visualizations, newViz]);
  };

  const handleUpdateVisualization = (id: string, field: keyof Visualization, value: any) => {
    setVisualizations((prev) =>
      prev.map((viz) => (viz.id === id ? { ...viz, [field]: value } : viz))
    );
  };

  const handleDeleteVisualization = (id: string) => {
    setVisualizations((prev) => prev.filter((viz) => viz.id !== id));
  };

  const handleAddRecipient = () => {
    if (recipientEmail && !recipients.includes(recipientEmail)) {
      setRecipients([...recipients, recipientEmail]);
      setRecipientEmail('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients((prev) => prev.filter((e) => e !== email));
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reports/custom/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: selectedMetrics,
          filters: {
            date_from: dateFrom,
            date_to: dateTo,
          },
          visualizations: visualizations,
          format: exportFormat,
          save_as_template: false,
        }),
      });

      const data = await response.json();
      alert(`Report generation started! Report ID: ${data.report_id}`);

      // Navigate to report status page or show modal
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (templateName: string) => {
    try {
      const response = await fetch('/api/reports/templates/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          report_type: reportType,
          metrics: selectedMetrics,
          filters: {
            date_from: dateFrom,
            date_to: dateTo,
          },
          visualizations: visualizations,
          is_scheduled: isScheduled,
          schedule_frequency: scheduleFrequency,
          recipients: recipients,
        }),
      });

      const data = await response.json();
      alert(`Template saved! Template ID: ${data.template_id}`);
      setSaveTemplateDialog(false);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        // Select Metrics
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Metrics to Include
            </Typography>
            <Grid container spacing={2}>
              {availableMetrics.map((metric) => (
                <Grid item xs={12} sm={6} md={4} key={metric.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedMetrics.includes(metric.id) ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    }}
                    onClick={() => handleMetricToggle(metric.id)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {metric.name}
                          </Typography>
                          <Chip label={metric.category} size="small" sx={{ mt: 1 }} />
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            {metric.description}
                          </Typography>
                        </Box>
                        <Checkbox checked={selectedMetrics.includes(metric.id)} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 1:
        // Configure Visualizations
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Configure Visualizations</Typography>
              <Button startIcon={<AddIcon />} onClick={handleAddVisualization} variant="outlined">
                Add Visualization
              </Button>
            </Box>

            {visualizations.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  No visualizations added. Click "Add Visualization" to get started.
                </Typography>
              </Paper>
            ) : (
              <List>
                {visualizations.map((viz) => (
                  <Paper key={viz.id} sx={{ mb: 2, p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={1}>
                        <IconButton>
                          <DragIcon />
                        </IconButton>
                      </Grid>
                      <Grid item xs={11} sm={3}>
                        <TextField
                          fullWidth
                          label="Chart Title"
                          value={viz.title}
                          onChange={(e) => handleUpdateVisualization(viz.id, 'title', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                          <InputLabel>Chart Type</InputLabel>
                          <Select
                            value={viz.type}
                            label="Chart Type"
                            onChange={(e) => handleUpdateVisualization(viz.id, 'type', e.target.value)}
                          >
                            <MenuItem value="bar">Bar Chart</MenuItem>
                            <MenuItem value="line">Line Chart</MenuItem>
                            <MenuItem value="pie">Pie Chart</MenuItem>
                            <MenuItem value="table">Table</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                          <InputLabel>Metric</InputLabel>
                          <Select
                            value={viz.metric}
                            label="Metric"
                            onChange={(e) => handleUpdateVisualization(viz.id, 'metric', e.target.value)}
                          >
                            {selectedMetrics.map((metricId) => {
                              const metric = availableMetrics.find((m) => m.id === metricId);
                              return (
                                <MenuItem key={metricId} value={metricId}>
                                  {metric?.name}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        <IconButton color="error" onClick={() => handleDeleteVisualization(viz.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </List>
            )}
          </Box>
        );

      case 2:
        // Set Filters
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Set Report Filters
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date From"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date To"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Export Format</InputLabel>
                  <Select
                    value={exportFormat}
                    label="Export Format"
                    onChange={(e) => setExportFormat(e.target.value)}
                  >
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="excel">Excel</MenuItem>
                    <MenuItem value="both">Both (PDF + Excel)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox checked={isScheduled} onChange={(e) => setIsScheduled(e.target.checked)} />
                  }
                  label="Schedule recurring report"
                />
              </Grid>

              {isScheduled && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Frequency</InputLabel>
                      <Select
                        value={scheduleFrequency}
                        label="Frequency"
                        onChange={(e) => setScheduleFrequency(e.target.value)}
                      >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Email Recipients
                    </Typography>
                    <Box display="flex" gap={1} mb={2}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddRecipient();
                          }
                        }}
                      />
                      <Button onClick={handleAddRecipient}>Add</Button>
                    </Box>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {recipients.map((email) => (
                        <Chip
                          key={email}
                          label={email}
                          onDelete={() => handleRemoveRecipient(email)}
                        />
                      ))}
                    </Box>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        );

      case 3:
        // Preview and Generate
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Report Summary
            </Typography>
            <Paper sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Selected Metrics:</Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                    {selectedMetrics.map((metricId) => {
                      const metric = availableMetrics.find((m) => m.id === metricId);
                      return <Chip key={metricId} label={metric?.name} />;
                    })}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2">Visualizations:</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {visualizations.length} chart(s) configured
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Date Range:</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {dateFrom} to {dateTo}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Export Format:</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {exportFormat.toUpperCase()}
                  </Typography>
                </Grid>

                {isScheduled && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Scheduled:</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {scheduleFrequency.charAt(0).toUpperCase() + scheduleFrequency.slice(1)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Recipients:</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {recipients.join(', ')}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Custom Report Builder</Typography>
        <Box display="flex" gap={2}>
          <Button
            startIcon={<SaveIcon />}
            variant="outlined"
            onClick={() => setSaveTemplateDialog(true)}
          >
            Save Template
          </Button>
        </Box>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Paper sx={{ p: 3, mb: 3 }}>{renderStepContent()}</Paper>

      {/* Navigation Buttons */}
      <Box display="flex" justifyContent="space-between">
        <Button disabled={activeStep === 0} onClick={() => setActiveStep((prev) => prev - 1)}>
          Back
        </Button>
        <Box display="flex" gap={2}>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <GenerateIcon />}
              onClick={handleGenerateReport}
              disabled={loading}
            >
              Generate Report
            </Button>
          ) : (
            <Button variant="contained" onClick={() => setActiveStep((prev) => prev + 1)}>
              Next
            </Button>
          )}
        </Box>
      </Box>

      {/* Save Template Dialog */}
      <Dialog open={saveTemplateDialog} onClose={() => setSaveTemplateDialog(false)}>
        <DialogTitle>Save Report Template</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Template Name"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveTemplateDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleSaveTemplate(reportName)}
            variant="contained"
            disabled={!reportName}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReportBuilder;
