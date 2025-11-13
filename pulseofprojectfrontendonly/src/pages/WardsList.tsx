import React, { useState, useEffect } from 'react';
import {
  Add,
  Edit,
  Delete,
  Search,
  FilterList,
  GetApp,
  CheckBox,
  CheckBoxOutlineBlank,
  Close,
  Save
} from '@mui/icons-material';

interface Ward {
  id: string;
  ward_code: string;
  ward_name: string;
  constituency_code: string;
  constituency_name: string;
  district: string;
  population: number;
  area_sqkm: number;
  created_at: string;
}

export default function WardsList() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [filteredWards, setFilteredWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWards, setSelectedWards] = useState<Set<string>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingWard, setEditingWard] = useState<Ward | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const itemsPerPage = 50;

  // Mock data - Replace with actual API call
  useEffect(() => {
    loadWards();
  }, []);

  const loadWards = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/wards');
      // const data = await response.json();

      // Mock data
      const mockWards: Ward[] = Array.from({ length: 150 }, (_, i) => ({
        id: `ward-${i + 1}`,
        ward_code: `W${String(i + 1).padStart(4, '0')}`,
        ward_name: `Ward ${i + 1}`,
        constituency_code: `AC${String((i % 10) + 1).padStart(3, '0')}`,
        constituency_name: `Constituency ${(i % 10) + 1}`,
        district: ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem'][i % 5],
        population: Math.floor(Math.random() * 50000) + 10000,
        area_sqkm: Math.floor(Math.random() * 20) + 5,
        created_at: new Date(2024, 0, i + 1).toISOString(),
      }));

      setWards(mockWards);
      setFilteredWards(mockWards);
    } catch (error) {
      console.error('Error loading wards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...wards];

    if (searchTerm) {
      filtered = filtered.filter(
        w =>
          w.ward_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.ward_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.constituency_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedConstituency) {
      filtered = filtered.filter(w => w.constituency_code === selectedConstituency);
    }

    if (selectedDistrict) {
      filtered = filtered.filter(w => w.district === selectedDistrict);
    }

    setFilteredWards(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedConstituency, selectedDistrict, wards]);

  const constituencies = Array.from(new Set(wards.map(w => w.constituency_code))).sort();
  const districts = Array.from(new Set(wards.map(w => w.district))).sort();

  const totalPages = Math.ceil(filteredWards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWards = filteredWards.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = () => {
    if (selectedWards.size === paginatedWards.length) {
      setSelectedWards(new Set());
    } else {
      setSelectedWards(new Set(paginatedWards.map(w => w.id)));
    }
  };

  const handleSelectWard = (id: string) => {
    const newSelected = new Set(selectedWards);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedWards(newSelected);
  };

  const handleEdit = (ward: Ward) => {
    setEditingWard({ ...ward });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingWard) return;

    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/wards/${editingWard.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editingWard),
      // });

      setWards(prev => prev.map(w => (w.id === editingWard.id ? editingWard : w)));
      setShowEditModal(false);
      setEditingWard(null);
    } catch (error) {
      console.error('Error saving ward:', error);
      alert('Failed to save ward');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/wards/${id}`, { method: 'DELETE' });

      setWards(prev => prev.filter(w => w.id !== id));
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting ward:', error);
      alert('Failed to delete ward');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedWards.size === 0) return;

    if (!confirm(`Delete ${selectedWards.size} selected wards?`)) return;

    try {
      // TODO: Replace with actual API call
      setWards(prev => prev.filter(w => !selectedWards.has(w.id)));
      setSelectedWards(new Set());
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('Failed to delete wards');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Ward Code', 'Ward Name', 'Constituency Code', 'Constituency Name', 'District', 'Population', 'Area (sq km)'],
      ...filteredWards.map(w => [
        w.ward_code,
        w.ward_name,
        w.constituency_code,
        w.constituency_name,
        w.district,
        w.population,
        w.area_sqkm,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wards-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Wards Management</h1>
        <p className="text-gray-600">View and manage all wards in the system</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={selectedConstituency}
              onChange={(e) => setSelectedConstituency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Districts</option>
              {districts.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || selectedConstituency || selectedDistrict) && (
          <div className="mt-4 flex items-center gap-2">
            <FilterList className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">
              Showing {filteredWards.length} of {wards.length} wards
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedConstituency('');
                setSelectedDistrict('');
              }}
              className="ml-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedWards.size > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-900">
              {selectedWards.size} ward(s) selected
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
                onClick={() => setSelectedWards(new Set())}
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
                    {selectedWards.size === paginatedWards.length && paginatedWards.length > 0 ? (
                      <CheckBox className="w-5 h-5 text-red-600" />
                    ) : (
                      <CheckBoxOutlineBlank className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ward Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ward Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Constituency
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  District
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Population
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Area (sq km)
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedWards.map(ward => (
                <tr key={ward.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button onClick={() => handleSelectWard(ward.id)}>
                      {selectedWards.has(ward.id) ? (
                        <CheckBox className="w-5 h-5 text-red-600" />
                      ) : (
                        <CheckBoxOutlineBlank className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {ward.ward_code}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{ward.ward_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {ward.constituency_name}
                    <br />
                    <span className="text-xs text-gray-400">{ward.constituency_code}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{ward.district}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {ward.population.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{ward.area_sqkm}</td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      onClick={() => handleEdit(ward)}
                      className="text-blue-600 hover:text-blue-700 mr-3"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(ward.id);
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredWards.length)} of{' '}
              {filteredWards.length} wards
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Edit Modal */}
      {showEditModal && editingWard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Ward</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-600 hover:text-gray-900">
                  <Close className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ward Code</label>
                    <input
                      type="text"
                      value={editingWard.ward_code}
                      onChange={e => setEditingWard({ ...editingWard, ward_code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ward Name</label>
                    <input
                      type="text"
                      value={editingWard.ward_name}
                      onChange={e => setEditingWard({ ...editingWard, ward_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Constituency Code</label>
                    <input
                      type="text"
                      value={editingWard.constituency_code}
                      onChange={e => setEditingWard({ ...editingWard, constituency_code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Constituency Name</label>
                    <input
                      type="text"
                      value={editingWard.constituency_name}
                      onChange={e => setEditingWard({ ...editingWard, constituency_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input
                    type="text"
                    value={editingWard.district}
                    onChange={e => setEditingWard({ ...editingWard, district: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Population</label>
                    <input
                      type="number"
                      value={editingWard.population}
                      onChange={e => setEditingWard({ ...editingWard, population: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq km)</label>
                    <input
                      type="number"
                      value={editingWard.area_sqkm}
                      onChange={e => setEditingWard({ ...editingWard, area_sqkm: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
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
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
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
              Are you sure you want to delete this ward? This action cannot be undone.
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
                Delete Ward
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
