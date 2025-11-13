import React, { useState, useRef } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { dashboardService } from '../services/dashboardService';

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts: boolean;
  includeTables: boolean;
  includeMetrics: boolean;
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'all';
  sections: {
    summary: boolean;
    sentiment_analysis: boolean;
    trending_topics: boolean;
    geographic_data: boolean;
    alerts: boolean;
    social_media: boolean;
    recommendations: boolean;
  };
  customization: {
    title?: string;
    subtitle?: string;
    color_scheme?: 'blue' | 'green' | 'purple' | 'orange';
  };
}

interface ExportManagerProps {
  className?: string;
  onExportComplete?: (result: { success: boolean; message: string }) => void;
}

export default function ExportManager({ className = '', onExportComplete }: ExportManagerProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeCharts: true,
    includeTables: true,
    includeMetrics: true,
    dateRange: 'week',
    sections: {
      summary: true,
      sentiment_analysis: true,
      trending_topics: true,
      geographic_data: true,
      alerts: true,
      social_media: true,
      recommendations: true
    },
    customization: {
      title: 'Election Sentiment Analysis Report',
      subtitle: 'Political Intelligence Dashboard',
      color_scheme: 'blue'
    }
  });

  // Helper function to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const data = await dashboardService.getDashboardData(options.dateRange);
      return data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  };

  // Helper function to download file
  const downloadFile = (content: string | Blob, filename: string, mimeType: string) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // PDF Report Generator
  const generatePDFReport = async (data: any, timestamp: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.text(options.customization.title || 'Animal-I Sentiment Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Subtitle
    doc.setFontSize(12);
    doc.text(options.customization.subtitle || 'Political Intelligence Dashboard', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Summary Section
    if (options.sections.summary && data.summary) {
      doc.setFontSize(14);
      doc.text('Summary', 15, yPosition);
      yPosition += 8;
      doc.setFontSize(10);
      doc.text(`Total Sentiments: ${data.summary.totalSentiments || 0}`, 15, yPosition);
      yPosition += 6;
      doc.text(`Positive: ${data.summary.positive || 0}%`, 15, yPosition);
      yPosition += 6;
      doc.text(`Neutral: ${data.summary.neutral || 0}%`, 15, yPosition);
      yPosition += 6;
      doc.text(`Negative: ${data.summary.negative || 0}%`, 15, yPosition);
      yPosition += 12;
    }

    // Sentiment Analysis Section
    if (options.sections.sentiment_analysis && data.sentimentAnalysis) {
      doc.setFontSize(14);
      doc.text('Sentiment Analysis', 15, yPosition);
      yPosition += 8;
      doc.setFontSize(10);
      doc.text(`Overall Sentiment: ${data.sentimentAnalysis.overall || 'Neutral'}`, 15, yPosition);
      yPosition += 6;
      doc.text(`Confidence Score: ${data.sentimentAnalysis.confidence || 0}%`, 15, yPosition);
      yPosition += 12;
    }

    // Trending Topics Section
    if (options.sections.trending_topics && data.trendingTopics) {
      doc.setFontSize(14);
      doc.text('Trending Topics', 15, yPosition);
      yPosition += 8;
      doc.setFontSize(10);
      data.trendingTopics.slice(0, 5).forEach((topic: any, index: number) => {
        doc.text(`${index + 1}. ${topic.name || topic.topic}: ${topic.count || topic.mentions} mentions`, 15, yPosition);
        yPosition += 6;
      });
      yPosition += 12;
    }

    // Alerts Section
    if (options.sections.alerts && data.alerts) {
      doc.setFontSize(14);
      doc.text('Alerts & Notifications', 15, yPosition);
      yPosition += 8;
      doc.setFontSize(10);
      doc.text(`Total Alerts: ${data.alerts.length || 0}`, 15, yPosition);
      yPosition += 6;
      doc.text(`Critical: ${data.alerts.filter((a: any) => a.severity === 'critical').length || 0}`, 15, yPosition);
      yPosition += 12;
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.text('Generated with Claude Code - Animal-I Sentiment Analysis Platform', pageWidth / 2, footerY, { align: 'center' });

    return doc.output('blob');
  };

  // Excel Workbook Generator
  const generateExcelWorkbook = async (data: any, timestamp: string) => {
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    if (options.sections.summary && data.summary) {
      const summaryData = [
        ['Animal-I Sentiment Analysis Report'],
        [options.customization.subtitle || 'Political Intelligence Dashboard'],
        [`Generated: ${new Date().toLocaleString()}`],
        [],
        ['Metric', 'Value'],
        ['Total Sentiments', data.summary.totalSentiments || 0],
        ['Positive %', data.summary.positive || 0],
        ['Neutral %', data.summary.neutral || 0],
        ['Negative %', data.summary.negative || 0]
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }

    // Sentiment Analysis Sheet
    if (options.sections.sentiment_analysis && data.sentimentAnalysis) {
      const sentimentData = [
        ['Sentiment Analysis Details'],
        [],
        ['Metric', 'Value'],
        ['Overall Sentiment', data.sentimentAnalysis.overall || 'Neutral'],
        ['Confidence Score', `${data.sentimentAnalysis.confidence || 0}%`],
        ['Positive Count', data.sentimentAnalysis.positiveCount || 0],
        ['Neutral Count', data.sentimentAnalysis.neutralCount || 0],
        ['Negative Count', data.sentimentAnalysis.negativeCount || 0]
      ];
      const sentimentSheet = XLSX.utils.aoa_to_sheet(sentimentData);
      XLSX.utils.book_append_sheet(workbook, sentimentSheet, 'Sentiment Analysis');
    }

    // Trending Topics Sheet
    if (options.sections.trending_topics && data.trendingTopics) {
      const topicsData = [
        ['Trending Topics'],
        [],
        ['Rank', 'Topic', 'Mentions', 'Sentiment']
      ];
      data.trendingTopics.forEach((topic: any, index: number) => {
        topicsData.push([
          index + 1,
          topic.name || topic.topic,
          topic.count || topic.mentions,
          topic.sentiment || 'Neutral'
        ]);
      });
      const topicsSheet = XLSX.utils.aoa_to_sheet(topicsData);
      XLSX.utils.book_append_sheet(workbook, topicsSheet, 'Trending Topics');
    }

    // Geographic Data Sheet
    if (options.sections.geographic_data && data.geographicData) {
      const geoData = [
        ['Geographic Distribution'],
        [],
        ['Region', 'Sentiments', 'Positive %', 'Neutral %', 'Negative %']
      ];
      Object.entries(data.geographicData).forEach(([region, stats]: [string, any]) => {
        geoData.push([
          region,
          stats.total || 0,
          stats.positive || 0,
          stats.neutral || 0,
          stats.negative || 0
        ]);
      });
      const geoSheet = XLSX.utils.aoa_to_sheet(geoData);
      XLSX.utils.book_append_sheet(workbook, geoSheet, 'Geographic Data');
    }

    // Alerts Sheet
    if (options.sections.alerts && data.alerts) {
      const alertsData = [
        ['Alerts & Notifications'],
        [],
        ['Timestamp', 'Severity', 'Message', 'Status']
      ];
      data.alerts.forEach((alert: any) => {
        alertsData.push([
          new Date(alert.timestamp).toLocaleString(),
          alert.severity,
          alert.message,
          alert.status || 'Active'
        ]);
      });
      const alertsSheet = XLSX.utils.aoa_to_sheet(alertsData);
      XLSX.utils.book_append_sheet(workbook, alertsSheet, 'Alerts');
    }

    return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  };

  // CSV Report Generator
  const generateCSVReport = async (data: any, timestamp: string) => {
    let csv = `${options.customization.title || 'Animal-I Sentiment Analysis Report'}\n`;
    csv += `${options.customization.subtitle || 'Political Intelligence Dashboard'}\n`;
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;

    // Summary
    if (options.sections.summary && data.summary) {
      csv += 'SUMMARY\n';
      csv += 'Metric,Value\n';
      csv += `Total Sentiments,${data.summary.totalSentiments || 0}\n`;
      csv += `Positive %,${data.summary.positive || 0}\n`;
      csv += `Neutral %,${data.summary.neutral || 0}\n`;
      csv += `Negative %,${data.summary.negative || 0}\n\n`;
    }

    // Sentiment Analysis
    if (options.sections.sentiment_analysis && data.sentimentAnalysis) {
      csv += 'SENTIMENT ANALYSIS\n';
      csv += 'Metric,Value\n';
      csv += `Overall Sentiment,${data.sentimentAnalysis.overall || 'Neutral'}\n`;
      csv += `Confidence Score,${data.sentimentAnalysis.confidence || 0}%\n\n`;
    }

    // Trending Topics
    if (options.sections.trending_topics && data.trendingTopics) {
      csv += 'TRENDING TOPICS\n';
      csv += 'Rank,Topic,Mentions,Sentiment\n';
      data.trendingTopics.forEach((topic: any, index: number) => {
        csv += `${index + 1},"${topic.name || topic.topic}",${topic.count || topic.mentions},${topic.sentiment || 'Neutral'}\n`;
      });
      csv += '\n';
    }

    // Geographic Data
    if (options.sections.geographic_data && data.geographicData) {
      csv += 'GEOGRAPHIC DISTRIBUTION\n';
      csv += 'Region,Total Sentiments,Positive %,Neutral %,Negative %\n';
      Object.entries(data.geographicData).forEach(([region, stats]: [string, any]) => {
        csv += `"${region}",${stats.total || 0},${stats.positive || 0},${stats.neutral || 0},${stats.negative || 0}\n`;
      });
      csv += '\n';
    }

    // Alerts
    if (options.sections.alerts && data.alerts) {
      csv += 'ALERTS & NOTIFICATIONS\n';
      csv += 'Timestamp,Severity,Message,Status\n';
      data.alerts.forEach((alert: any) => {
        csv += `"${new Date(alert.timestamp).toLocaleString()}",${alert.severity},"${alert.message}",${alert.status || 'Active'}\n`;
      });
    }

    return csv;
  };

  // JSON Report Generator
  const generateJSONReport = async (data: any, timestamp: string) => {
    const report = {
      metadata: {
        title: options.customization.title || 'Animal-I Sentiment Analysis Report',
        subtitle: options.customization.subtitle || 'Political Intelligence Dashboard',
        generatedAt: new Date().toISOString(),
        dateRange: options.dateRange,
        colorScheme: options.customization.color_scheme
      },
      summary: options.sections.summary ? data.summary : undefined,
      sentimentAnalysis: options.sections.sentiment_analysis ? data.sentimentAnalysis : undefined,
      trendingTopics: options.sections.trending_topics ? data.trendingTopics : undefined,
      geographicData: options.sections.geographic_data ? data.geographicData : undefined,
      alerts: options.sections.alerts ? data.alerts : undefined,
      socialMedia: options.sections.social_media ? data.socialMedia : undefined,
      recommendations: options.sections.recommendations ? data.recommendations : undefined
    };

    return JSON.stringify(report, null, 2);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Fetch dashboard data
      const data = await fetchDashboardData();

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Animal-I_Report_${timestamp}`;

      // Generate export based on format
      switch (options.format) {
        case 'pdf':
          const pdfBlob = await generatePDFReport(data, timestamp);
          downloadFile(pdfBlob, `${filename}.pdf`, 'application/pdf');
          break;

        case 'excel':
          const excelBuffer = await generateExcelWorkbook(data, timestamp);
          const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          downloadFile(excelBlob, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          break;

        case 'csv':
          const csvContent = await generateCSVReport(data, timestamp);
          downloadFile(csvContent, `${filename}.csv`, 'text/csv');
          break;

        case 'json':
          const jsonContent = await generateJSONReport(data, timestamp);
          downloadFile(jsonContent, `${filename}.json`, 'application/json');
          break;
      }

      if (onExportComplete) {
        onExportComplete({ success: true, message: `Report exported successfully as ${filename}.${options.format}` });
      }
    } catch (error) {
      console.error('Export failed:', error);
      if (onExportComplete) {
        onExportComplete({ success: false, message: 'Export failed. Please try again.' });
      }
    } finally {
      setIsExporting(false);
      setShowOptions(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        disabled={isExporting}
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </>
        )}
      </button>

      {/* Export Options Modal */}
      {showOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Export Options</h3>
                <button
                  onClick={() => setShowOptions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'pdf', label: 'PDF Report', icon: FileText },
                    { value: 'excel', label: 'Excel Workbook', icon: Table },
                    { value: 'csv', label: 'CSV Data', icon: Table },
                    { value: 'json', label: 'JSON Data', icon: FileText }
                  ].map(format => (
                    <button
                      key={format.value}
                      onClick={() => setOptions(prev => ({ ...prev, format: format.value as any }))}
                      className={`p-3 border rounded-lg flex items-center space-x-2 ${
                        options.format === format.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <format.icon className="w-4 h-4" />
                      <span className="text-sm">{format.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={options.dateRange}
                  onChange={(e) => setOptions(prev => ({ ...prev, dateRange: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 90 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowOptions(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isExporting ? 'Exporting...' : 'Export'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

