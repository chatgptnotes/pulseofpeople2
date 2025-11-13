import React, { useState, useEffect } from 'react';
import {
  Edit,
  Delete,
  Search,
  FilterList,
  GetApp,
  CheckBox,
  CheckBoxOutlineBlank,
  Close,
  Save,
  LocationOn,
  People,
  Accessible
} from '@mui/icons-material';

interface Booth {
  id: string;
  booth_code: string;
  booth_name: string;
  ward_code: string;
  constituency_code: string;
  constituency_name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  total_voters: number;
  male_voters: number;
  female_voters: number;
  transgender_voters: number;
  accessibility: string;
  created_at: string;
}

export default function BoothsList() {
  const [booths, setBooths] = useState<Booth[]>([]);
  const [filteredBooths, setFilteredBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooths, setSelectedBooths] = useState<Set<string>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingBooth, setEditingBooth] = useState<Booth | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [detailsBooth, setDetailsBooth] = useState<Booth | null>(null);

  const itemsPerPage = 50;

  useEffect(() => {
    loadBooths();
  }, []);

  const loadBooths = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockBooths: Booth[] = Array.from({ length: 500 }, (_, i) => ({
        id: `booth-${i + 1}`,
        booth_code: `B${String(i + 1).padStart(5, '0')}`,
        booth_name: `Polling Booth ${i + 1}`,
        ward_code: `W${String((i % 30) + 1).padStart(4, '0')}`,
        constituency_code: `AC${String((i % 10) + 1).padStart(3, '0')}`,
        constituency_name: `Constituency ${(i % 10) + 1}`,
        address: `${i + 1} Main Street, Tamil Nadu`,
        latitude: 11.0168 + (Math.random() - 0.5) * 0.1,
        longitude: 76.9558 + (Math.random() - 0.5) * 0.1,
        total_voters: Math.floor(Math.random() * 2000) + 500,
        male_voters: Math.floor(Math.random() * 1000) + 250,
        female_voters: Math.floor(Math.random() * 1000) + 250,
        transgender_voters: Math.floor(Math.random() * 5),
        accessibility: ['Accessible', 'Partially Accessible', 'Not Accessible'][i % 3],
        created_at: new Date(2024, 0, i + 1).toISOString(),
      }));

      setBooths(mockBooths);
      setFilteredBooths(mockBooths);
    } catch (error) {
      console.error('Error loading booths:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...booths];

    if (searchTerm) {
      filtered = filtered.filter(
        b =>
          b.booth_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.booth_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedConstituency) {
      filtered = filtered.filter(b => b.constituency_code === selectedConstituency);
    }

    if (selectedWard) {
      filtered = filtered.filter(b => b.ward_code === selectedWard);
    }

    setFilteredBooths(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedConstituency, selectedWard, booths]);

  const constituencies = Array.from(new Set(booths.map(b => b.constituency_code))).sort();
  const wards = Array.from(new Set(booths.map(b => b.ward_code))).sort();

  const totalPages = Math.ceil(filteredBooths.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBooths = filteredBooths.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = () => {
    if (selectedBooths.size === paginatedBooths.length) {
      setSelectedBooths(new Set());
    } else {
      setSelectedBooths(new Set(paginatedBooths.map(b => b.id)));
    }
  };

  const handleSelectBooth = (id: string) => {
    const newSelected = new Set(selectedBooths);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedBooths(newSelected);
  };

  const handleEdit = (booth: Booth) => {
    setEditingBooth({ ...booth });
    setShowEditModal(true);
  };

  const handleViewDetails = (booth: Booth) => {
    setDetailsBooth(booth);
    setShowDetailsModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingBooth) return;

    try {
      // TODO: Replace with actual API call
      setBooths(prev => prev.map(b => (b.id === editingBooth.id ? editingBooth : b)));
      setShowEditModal(false);
      setEditingBooth(null);
    } catch (error) {
      console.error('Error saving booth:', error);
      alert('Failed to save booth');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: Replace with actual API call
      setBooths(prev => prev.filter(b => b.id !== id));
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting booth:', error);
      alert('Failed to delete booth');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBooths.size === 0) return;

    if (!confirm(`Delete ${selectedBooths.size} selected booths?`)) return;

    try {
      setBooths(prev => prev.filter(b => !selectedBooths.has(b.id)));
      setSelectedBooths(new Set());
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('Failed to delete booths');
    }
  };

  const handleExport = () => {
    const csvContent = [
      [
        'Booth Code',
        'Booth Name',
        'Ward Code',
        'Constituency',
        'Address',
        'Latitude',
        'Longitude',
        'Total Voters',
        'Male Voters',
        'Female Voters',
        'Transgender Voters',
        'Accessibility',
      ],
      ...filteredBooths.map(b => [
        b.booth_code,
        b.booth_name,
        b.ward_code,
        b.constituency_name,
        b.address,
        b.latitude || '',
        b.longitude || '',
        b.total_voters,
        b.male_voters,
        b.female_voters,
        b.transgender_voters,
        b.accessibility,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polling-booths-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading polling booths...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Polling Booths Management</h1>
        <p className="text-gray-600">View and manage all polling booths with GPS coordinates</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Booths</p>
              <p className="text-2xl font-bold text-gray-900">{filteredBooths.length}</p>
            </div>
            <LocationOn className="w-10 h-10 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Voters</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredBooths.reduce((sum, b) => sum + b.total_voters, 0).toLocaleString()}
              </p>
            </div>
            <People className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">With GPS</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredBooths.filter(b => b.latitude && b.longitude).length}
              </p>
            </div>
            <LocationOn className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Accessible</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredBooths.filter(b => b.accessibility === 'Accessible').length}
              </p>
            </div>
            <Accessible className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, code, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={selectedConstituency}
              onChange={(e) => setSelectedConstituency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="">All Constituencies</option>
              {constituencies.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="">All Wards</option>
              {wards.map(w => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || selectedConstituency || selectedWard) && (
          <div className="mt-4 flex items-center gap-2">
            <FilterList className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">
              Showing {filteredBooths.length} of {booths.length} booths
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedConstituency('');
                setSelectedWard('');
              }}
              className="ml-2 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedBooths.size > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-900">
              {selectedBooths.size} booth(s) selected
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBulkDelete}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                <Delete className="w-4 h-4 inline mr-1" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedBooths(new Set())}
                className="text-sm text-gray-600 hover:text-gray-700"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button onClick={handleSelectAll}>
                    {selectedBooths.size === paginatedBooths.length && paginatedBooths.length > 0 ? (
                      <CheckBox className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <CheckBoxOutlineBlank className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Booth Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Booth Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ward
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Constituency
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Voters
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  GPS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Accessibility
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBooths.map(booth => (
                <tr key={booth.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button onClick={() => handleSelectBooth(booth.id)}>
                      {selectedBooths.has(booth.id) ? (
                        <CheckBox className="w-5 h-5 text-yellow-600" />
                      ) : (
                        <CheckBoxOutlineBlank className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {booth.booth_code}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewDetails(booth)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {booth.booth_name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{booth.ward_code}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {booth.constituency_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {booth.total_voters.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {booth.latitude && booth.longitude ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                        <LocationOn className="w-3 h-3" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${
                        booth.accessibility === 'Accessible'
                          ? 'text-green-700 bg-green-100'
                          : booth.accessibility === 'Partially Accessible'
                          ? 'text-yellow-700 bg-yellow-100'
                          : 'text-red-700 bg-red-100'
                      }`}
                    >
                      {booth.accessibility}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      onClick={() => handleEdit(booth)}
                      className="text-blue-600 hover:text-blue-700 mr-3"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(booth.id);
                        setShowDeleteConfirm(true);
                      }}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredBooths.length)} of{' '}
              {filteredBooths.length} booths
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <GetApp className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && detailsBooth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Booth Details</h2>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-600 hover:text-gray-900">
                  <Close className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Booth Code</p>
                    <p className="font-semibold text-gray-900">{detailsBooth.booth_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Booth Name</p>
                    <p className="font-semibold text-gray-900">{detailsBooth.booth_name}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="font-semibold text-gray-900">{detailsBooth.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Ward Code</p>
                    <p className="font-semibold text-gray-900">{detailsBooth.ward_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Constituency</p>
                    <p className="font-semibold text-gray-900">{detailsBooth.constituency_name}</p>
                  </div>
                </div>

                {detailsBooth.latitude && detailsBooth.longitude && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <LocationOn className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-green-900 mb-2">GPS Coordinates</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-green-700">Latitude</p>
                            <p className="font-mono text-green-900">{detailsBooth.latitude.toFixed(6)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-green-700">Longitude</p>
                            <p className="font-mono text-green-900">{detailsBooth.longitude.toFixed(6)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <People className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900 mb-3">Voter Statistics</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-blue-700">Total Voters</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {detailsBooth.total_voters.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700">Male Voters</p>
                          <p className="text-xl font-semibold text-blue-900">
                            {detailsBooth.male_voters.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700">Female Voters</p>
                          <p className="text-xl font-semibold text-blue-900">
                            {detailsBooth.female_voters.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700">Transgender Voters</p>
                          <p className="text-xl font-semibold text-blue-900">
                            {detailsBooth.transgender_voters}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Accessibility</p>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-semibold ${
                      detailsBooth.accessibility === 'Accessible'
                        ? 'text-green-700 bg-green-100'
                        : detailsBooth.accessibility === 'Partially Accessible'
                        ? 'text-yellow-700 bg-yellow-100'
                        : 'text-red-700 bg-red-100'
                    }`}
                  >
                    <Accessible className="w-5 h-5" />
                    {detailsBooth.accessibility}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Similar to WardsList but with more fields */}
      {showEditModal && editingBooth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Polling Booth</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-600 hover:text-gray-900">
                  <Close className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Booth Code</label>
                    <input
                      type="text"
                      value={editingBooth.booth_code}
                      onChange={e => setEditingBooth({ ...editingBooth, booth_code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Booth Name</label>
                    <input
                      type="text"
                      value={editingBooth.booth_name}
                      onChange={e => setEditingBooth({ ...editingBooth, booth_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={editingBooth.address}
                    onChange={e => setEditingBooth({ ...editingBooth, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ward Code</label>
                    <input
                      type="text"
                      value={editingBooth.ward_code}
                      onChange={e => setEditingBooth({ ...editingBooth, ward_code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Constituency Code</label>
                    <input
                      type="text"
                      value={editingBooth.constituency_code}
                      onChange={e => setEditingBooth({ ...editingBooth, constituency_code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Constituency Name</label>
                    <input
                      type="text"
                      value={editingBooth.constituency_name}
                      onChange={e => setEditingBooth({ ...editingBooth, constituency_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={editingBooth.latitude || ''}
                      onChange={e => setEditingBooth({ ...editingBooth, latitude: parseFloat(e.target.value) || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={editingBooth.longitude || ''}
                      onChange={e => setEditingBooth({ ...editingBooth, longitude: parseFloat(e.target.value) || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Voters</label>
                    <input
                      type="number"
                      value={editingBooth.total_voters}
                      onChange={e => setEditingBooth({ ...editingBooth, total_voters: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Male Voters</label>
                    <input
                      type="number"
                      value={editingBooth.male_voters}
                      onChange={e => setEditingBooth({ ...editingBooth, male_voters: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Female Voters</label>
                    <input
                      type="number"
                      value={editingBooth.female_voters}
                      onChange={e => setEditingBooth({ ...editingBooth, female_voters: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transgender</label>
                    <input
                      type="number"
                      value={editingBooth.transgender_voters}
                      onChange={e => setEditingBooth({ ...editingBooth, transgender_voters: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accessibility</label>
                  <select
                    value={editingBooth.accessibility}
                    onChange={e => setEditingBooth({ ...editingBooth, accessibility: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="Accessible">Accessible</option>
                    <option value="Partially Accessible">Partially Accessible</option>
                    <option value="Not Accessible">Not Accessible</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this polling booth? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Booth
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
