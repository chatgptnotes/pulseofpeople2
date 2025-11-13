import React, { useState, useEffect } from 'react';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import {
  LocationOn,
  HowToVote,
  People,
  Female,
  Male,
  Accessible,
  GetApp,
  TrendingUp,
  Assessment
} from '@mui/icons-material';
import * as XLSX from 'xlsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Analytics {
  totalWards: number;
  totalBooths: number;
  totalVoters: number;
  maleVoters: number;
  femaleVoters: number;
  transgenderVoters: number;
  boothsWithGPS: number;
  accessibleBooths: number;
  partiallyAccessibleBooths: number;
  notAccessibleBooths: number;
  boothsByConstituency: { [key: string]: number };
  votersByConstituency: { [key: string]: number };
  wardsByDistrict: { [key: string]: number };
  averageVotersPerBooth: number;
  genderRatio: number;
}

export default function WardsBoothsAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/analytics/wards-booths');
      // const data = await response.json();

      // Mock data
      const mockAnalytics: Analytics = {
        totalWards: 150,
        totalBooths: 500,
        totalVoters: 850000,
        maleVoters: 425000,
        femaleVoters: 424000,
        transgenderVoters: 1000,
        boothsWithGPS: 475,
        accessibleBooths: 300,
        partiallyAccessibleBooths: 150,
        notAccessibleBooths: 50,
        boothsByConstituency: {
          'AC001': 45,
          'AC002': 52,
          'AC003': 48,
          'AC004': 55,
          'AC005': 50,
          'AC006': 58,
          'AC007': 47,
          'AC008': 51,
          'AC009': 49,
          'AC010': 45,
        },
        votersByConstituency: {
          'AC001': 78000,
          'AC002': 92000,
          'AC003': 84000,
          'AC004': 95000,
          'AC005': 87000,
          'AC006': 99000,
          'AC007': 81000,
          'AC008': 88000,
          'AC009': 85000,
          'AC010': 76000,
        },
        wardsByDistrict: {
          'Chennai': 35,
          'Coimbatore': 30,
          'Madurai': 25,
          'Trichy': 28,
          'Salem': 32,
        },
        averageVotersPerBooth: 1700,
        genderRatio: 0.998,
      };

      setAnalytics(mockAnalytics);
      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!analytics) return;

    const workbook = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Wards', analytics.totalWards],
      ['Total Booths', analytics.totalBooths],
      ['Total Voters', analytics.totalVoters],
      ['Male Voters', analytics.maleVoters],
      ['Female Voters', analytics.femaleVoters],
      ['Transgender Voters', analytics.transgenderVoters],
      ['Booths with GPS', analytics.boothsWithGPS],
      ['Accessible Booths', analytics.accessibleBooths],
      ['Partially Accessible', analytics.partiallyAccessibleBooths],
      ['Not Accessible', analytics.notAccessibleBooths],
      ['Average Voters/Booth', analytics.averageVotersPerBooth],
      ['Gender Ratio (F/M)', analytics.genderRatio.toFixed(3)],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Constituency sheet
    const constituencyData = [
      ['Constituency', 'Booths', 'Voters'],
      ...Object.keys(analytics.boothsByConstituency).map(c => [
        c,
        analytics.boothsByConstituency[c],
        analytics.votersByConstituency[c],
      ]),
    ];
    const constituencySheet = XLSX.utils.aoa_to_sheet(constituencyData);
    XLSX.utils.book_append_sheet(workbook, constituencySheet, 'Constituencies');

    // Districts sheet
    const districtData = [
      ['District', 'Wards'],
      ...Object.keys(analytics.wardsByDistrict).map(d => [
        d,
        analytics.wardsByDistrict[d],
      ]),
    ];
    const districtSheet = XLSX.utils.aoa_to_sheet(districtData);
    XLSX.utils.book_append_sheet(workbook, districtSheet, 'Districts');

    XLSX.writeFile(workbook, `wards-booths-analytics-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  const genderChartData = {
    labels: ['Male', 'Female', 'Transgender'],
    datasets: [
      {
        data: [analytics.maleVoters, analytics.femaleVoters, analytics.transgenderVoters],
        backgroundColor: ['#3B82F6', '#EC4899', '#8B5CF6'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const constituencyBarData = {
    labels: Object.keys(analytics.boothsByConstituency),
    datasets: [
      {
        label: 'Booths',
        data: Object.values(analytics.boothsByConstituency),
        backgroundColor: '#EAB308',
        borderRadius: 6,
      },
    ],
  };

  const districtPieData = {
    labels: Object.keys(analytics.wardsByDistrict),
    datasets: [
      {
        data: Object.values(analytics.wardsByDistrict),
        backgroundColor: [
          '#DC2626',
          '#EAB308',
          '#3B82F6',
          '#10B981',
          '#8B5CF6',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const accessibilityData = {
    labels: ['Accessible', 'Partially Accessible', 'Not Accessible'],
    datasets: [
      {
        data: [
          analytics.accessibleBooths,
          analytics.partiallyAccessibleBooths,
          analytics.notAccessibleBooths,
        ],
        backgroundColor: ['#10B981', '#EAB308', '#DC2626'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const coveragePercentage = ((analytics.boothsWithGPS / analytics.totalBooths) * 100).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wards & Booths Analytics</h1>
          <p className="text-gray-600">Comprehensive statistics and insights</p>
        </div>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          <GetApp className="w-5 h-5" />
          Export to Excel
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <LocationOn className="w-12 h-12 opacity-80" />
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-red-100 text-sm mb-1">Total Wards</p>
          <p className="text-4xl font-bold">{analytics.totalWards}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <HowToVote className="w-12 h-12 opacity-80" />
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-yellow-100 text-sm mb-1">Total Booths</p>
          <p className="text-4xl font-bold">{analytics.totalBooths}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <People className="w-12 h-12 opacity-80" />
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-blue-100 text-sm mb-1">Total Voters</p>
          <p className="text-4xl font-bold">{(analytics.totalVoters / 1000).toFixed(0)}K</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Assessment className="w-12 h-12 opacity-80" />
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-green-100 text-sm mb-1">Avg Voters/Booth</p>
          <p className="text-4xl font-bold">{analytics.averageVotersPerBooth}</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 rounded-lg p-3">
              <Male className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Male Voters</p>
              <p className="text-2xl font-bold text-gray-900">
                {(analytics.maleVoters / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${(analytics.maleVoters / analytics.totalVoters) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-pink-100 rounded-lg p-3">
              <Female className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Female Voters</p>
              <p className="text-2xl font-bold text-gray-900">
                {(analytics.femaleVoters / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-600 rounded-full"
              style={{ width: `${(analytics.femaleVoters / analytics.totalVoters) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-100 rounded-lg p-3">
              <Accessible className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Accessible Booths</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.accessibleBooths}</p>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full"
              style={{ width: `${(analytics.accessibleBooths / analytics.totalBooths) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* GPS Coverage */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">GPS Coverage</h3>
            <p className="text-sm text-gray-600">Booths with GPS coordinates</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-green-600">{coveragePercentage}%</p>
            <p className="text-sm text-gray-600">{analytics.boothsWithGPS} / {analytics.totalBooths}</p>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
            style={{ width: `${coveragePercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Gender Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Breakdown</h3>
          <div className="h-80 flex items-center justify-center">
            <Pie
              data={genderChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      font: {
                        size: 12,
                      },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = analytics.totalVoters;
                        const percentage = ((value / total) * 100).toFixed(2);
                        return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Accessibility Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Accessibility Status</h3>
          <div className="h-80 flex items-center justify-center">
            <Doughnut
              data={accessibilityData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      font: {
                        size: 12,
                      },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = analytics.totalBooths;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Booths by Constituency */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booths by Constituency</h3>
          <div className="h-80">
            <Bar
              data={constituencyBarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return `Booths: ${context.parsed.y}`;
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Wards by District */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Wards by District</h3>
          <div className="h-80 flex items-center justify-center">
            <Pie
              data={districtPieData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      padding: 15,
                      font: {
                        size: 12,
                      },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: ${value} wards`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Missing Data Report */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-orange-900 mb-4">Missing Data Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Booths without GPS</p>
            <p className="text-2xl font-bold text-orange-600">
              {analytics.totalBooths - analytics.boothsWithGPS}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Not Accessible Booths</p>
            <p className="text-2xl font-bold text-red-600">{analytics.notAccessibleBooths}</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Gender Ratio</p>
            <p className="text-2xl font-bold text-blue-600">{analytics.genderRatio.toFixed(3)}</p>
            <p className="text-xs text-gray-500 mt-1">Female to Male ratio</p>
          </div>
        </div>
      </div>
    </div>
  );
}
