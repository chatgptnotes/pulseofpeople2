import { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, XCircle, Filter, Search, Plus, Settings } from 'lucide-react';
import { useAlertData } from '../hooks/useSentimentData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { filterAlertsBySeverity } from '../utils/dataProcessing';
import { AlertData } from '../types';

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  issues: string[];
  regions: string[];
}

export default function Alerts() {
  const { data: alertData, refetch } = useAlertData();
  const [alertRules] = useLocalStorage<AlertRule[]>('alert-rules', []);
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [, setShowRuleModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);

  const filteredAlerts = alertData ? 
    (selectedSeverity === 'all' ? alertData : filterAlertsBySeverity(alertData, selectedSeverity))
      .filter(alert => 
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) : [];

  const markAsRead = (alertId: string) => {
    console.log('Marking alert as read:', alertId);
  };

  const deleteAlert = (alertId: string) => {
    console.log('Deleting alert:', alertId);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return AlertTriangle;
      case 'medium': return Bell;
      case 'low': return CheckCircle;
      default: return Bell;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-gray-600">Manage notifications and alert rules</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowRuleModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Alerts', value: filteredAlerts.length, color: 'text-blue-600' },
          { label: 'High Priority', value: filteredAlerts.filter(a => a.severity === 'high').length, color: 'text-red-600' },
          { label: 'Medium Priority', value: filteredAlerts.filter(a => a.severity === 'medium').length, color: 'text-yellow-600' },
          { label: 'Low Priority', value: filteredAlerts.filter(a => a.severity === 'low').length, color: 'text-blue-600' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <Bell className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
                <button
                  onClick={() => refetch()}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Refresh
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Severities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredAlerts.map((alert) => {
                const SeverityIcon = getSeverityIcon(alert.severity);
                return (
                  <div
                    key={alert.id}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className={`p-2 rounded-lg border mr-4 ${getSeverityColor(alert.severity)}`}>
                          <SeverityIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">{alert.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{alert.timestamp.toLocaleString()}</span>
                            {alert.issue && <span>Issue: {alert.issue}</span>}
                            {alert.ward && <span>Region: {alert.ward}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(alert.id);
                          }}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAlert(alert.id);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Alert Rules
            </h3>
            
            <div className="space-y-3">
              {alertRules.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No alert rules configured</p>
                  <button
                    onClick={() => setShowRuleModal(true)}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Create your first rule
                  </button>
                </div>
              ) : (
                alertRules.map((rule) => (
                  <div key={rule.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{rule.name}</h4>
                      <div className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                    <p className="text-xs text-gray-600">{rule.condition}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">Threshold: {rule.threshold}</span>
                      <button className="text-blue-600 hover:text-blue-700 text-xs">
                        Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                Mark all as read
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                Export alerts
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                Alert history
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded">
                Clear all alerts
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Alert Details</h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">{selectedAlert.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedAlert.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">Severity:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${getSeverityColor(selectedAlert.severity)}`}>
                    {selectedAlert.severity.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Time:</span>
                  <span className="ml-2 text-gray-600">{selectedAlert.timestamp.toLocaleString()}</span>
                </div>
                {selectedAlert.issue && (
                  <div>
                    <span className="font-medium text-gray-900">Issue:</span>
                    <span className="ml-2 text-gray-600">{selectedAlert.issue}</span>
                  </div>
                )}
                {selectedAlert.ward && (
                  <div>
                    <span className="font-medium text-gray-900">Region:</span>
                    <span className="ml-2 text-gray-600">{selectedAlert.ward}</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    markAsRead(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Mark as Read
                </button>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}