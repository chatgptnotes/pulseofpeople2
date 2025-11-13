import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  People as PeopleIcon,
  PersonAdd as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Email as EmailIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Block as BlockIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  Apartment as TenantIcon
} from '@mui/icons-material';
import { useAuth, apiCall } from '../../contexts/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { VersionFooter } from '../../components/VersionFooter';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  assignedTenants: string[];
  tenantNames: string[];
  lastActive?: string;
  createdAt: string;
  invitedBy?: string;
}

interface InvitationFormData {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  assignedTenants: string[];
}

export function UserManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = usePermission('manage_users');

  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'manager' | 'user'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const [inviteForm, setInviteForm] = useState<InvitationFormData>({
    name: '',
    email: '',
    role: 'user',
    assignedTenants: [],
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/unauthorized');
      return;
    }

    loadData();
  }, [isAdmin, navigate, filterRole, filterStatus]);

  async function loadData() {
    try {
      setLoading(true);

      // Fetch users from Django API
      const response = await apiCall('/superadmin/users/');

      if (response.ok) {
        const data = await response.json();
        console.log('[UserManagement] Users loaded:', data);

        // Transform Django response to match our interface
        const usersData = (data.results || data || []).map((u: any) => ({
          id: u.id?.toString() || '',
          name: u.username || u.first_name + ' ' + u.last_name || u.email.split('@')[0],
          email: u.email || '',
          role: u.profile?.role || u.role || 'user',
          status: u.is_active ? 'active' : 'inactive',
          assignedTenants: [],
          tenantNames: [],
          lastActive: u.last_login || undefined,
          createdAt: u.date_joined || new Date().toISOString(),
          invitedBy: u.created_by || undefined,
        }));

        setUsers(usersData);

        // Also load organizations/tenants for dropdowns
        const orgsResponse = await apiCall('/organizations/');
        if (orgsResponse.ok) {
          const orgsData = await orgsResponse.json();
          setTenants((orgsData.results || orgsData || []).map((org: any) => ({
            id: org.id,
            name: org.party_name || org.name,
            display_name: org.party_name || org.name
          })));
        }
      } else {
        console.error('[UserManagement] Failed to load users:', response.status);
        setUsers([]);
      }
    } catch (error) {
      console.error('[UserManagement] Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function getRoleIcon(role: string) {
    switch (role) {
      case 'admin':
        return AdminIcon;
      case 'manager':
        return PeopleIcon;
      default:
        return UserIcon;
    }
  }

  async function handleInviteUser() {
    if (!inviteForm.name || !inviteForm.email) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Create user invitation
      const { data: inviteData, error: inviteError } = await supabase.rpc('invite_user_to_organization', {
        p_organization_id: organizationId,
        p_email: inviteForm.email,
        p_name: inviteForm.name,
        p_role: inviteForm.role,
        p_invited_by: user?.id,
      });

      if (inviteError) throw inviteError;

      const userId = inviteData;

      // Assign user to selected tenants
      if (inviteForm.assignedTenants.length > 0) {
        const tenantAssignments = inviteForm.assignedTenants.map(tenantId => ({
          user_id: userId,
          tenant_id: tenantId,
          granted_by: user?.id,
        }));

        const { error: accessError } = await supabase
          .from('user_tenant_access')
          .insert(tenantAssignments);

        if (accessError) throw accessError;
      }

      // Send invitation email (via Supabase Auth)
      await supabase.auth.admin.inviteUserByEmail(inviteForm.email);

      alert('User invited successfully!');
      setShowInviteModal(false);
      setInviteForm({
        name: '',
        email: '',
        role: 'user',
        assignedTenants: [],
      });

      await loadData();
    } catch (error) {
      console.error('Failed to invite user:', error);
      alert('Failed to invite user. Please try again.');
    }
  }

  async function handleSuspendUser(userId: string) {
    if (!confirm('Are you sure you want to suspend this user?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'suspended' })
        .eq('id', userId);

      if (error) throw error;

      await loadData();
      setShowActionsMenu(null);
    } catch (error) {
      console.error('Failed to suspend user:', error);
      alert('Failed to suspend user. Please try again.');
    }
  }

  async function handleActivateUser(userId: string) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'active' })
        .eq('id', userId);

      if (error) throw error;

      await loadData();
      setShowActionsMenu(null);
    } catch (error) {
      console.error('Failed to activate user:', error);
      alert('Failed to activate user. Please try again.');
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // Remove from organization
      const { error } = await supabase
        .from('user_organizations')
        .delete()
        .eq('user_id', userId)
        .eq('organization_id', organizationId);

      if (error) throw error;

      await loadData();
      setShowActionsMenu(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <PeopleIcon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-500">Invite and manage organization users</p>
              </div>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <AddIcon className="w-5 h-5 mr-2" />
              Invite User
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <PeopleIcon className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter((u) => u.status === 'active').length}
                </p>
              </div>
              <ActiveIcon className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {users.filter((u) => u.status === 'pending').length}
                </p>
              </div>
              <SendIcon className="w-10 h-10 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Admins</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter((u) => u.role === 'admin').length}
                </p>
              </div>
              <AdminIcon className="w-10 h-10 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <FilterIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Assigned Tenants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const RoleIcon = getRoleIcon(u.role);

                    return (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <PeopleIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{u.name}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <EmailIcon className="w-4 h-4 mr-1" />
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <RoleIcon className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900 capitalize">{u.role}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <TenantIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              {u.assignedTenants.length} tenant{u.assignedTenants.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          {u.tenantNames.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {u.tenantNames.slice(0, 2).join(', ')}
                              {u.tenantNames.length > 2 && ` +${u.tenantNames.length - 2} more`}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              u.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : u.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {u.status === 'active' ? (
                              <ActiveIcon className="w-4 h-4 mr-1" />
                            ) : (
                              <InactiveIcon className="w-4 h-4 mr-1" />
                            )}
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {u.lastActive ? formatDate(u.lastActive) : 'Never'}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="relative inline-block">
                            <button
                              onClick={() =>
                                setShowActionsMenu(showActionsMenu === u.id ? null : u.id)
                              }
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <MoreIcon className="w-5 h-5" />
                            </button>

                            {showActionsMenu === u.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                <div className="py-1">
                                  <button
                                    onClick={() => navigate(`/admin/users/${u.id}`)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <EditIcon className="w-4 h-4 mr-2" />
                                    Edit User
                                  </button>
                                  {u.status === 'active' ? (
                                    <button
                                      onClick={() => handleSuspendUser(u.id)}
                                      className="flex items-center w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                                    >
                                      <BlockIcon className="w-4 h-4 mr-2" />
                                      Suspend User
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleActivateUser(u.id)}
                                      className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                    >
                                      <ActiveIcon className="w-4 h-4 mr-2" />
                                      Activate User
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                  >
                                    <DeleteIcon className="w-4 h-4 mr-2" />
                                    Remove User
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Invite New User</h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">User - Basic access</option>
                  <option value="manager">Manager - Can manage users and tenants</option>
                  <option value="admin">Admin - Full organization access</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Tenants
                </label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {tenants.map((tenant) => (
                    <label key={tenant.id} className="flex items-center py-2">
                      <input
                        type="checkbox"
                        checked={inviteForm.assignedTenants.includes(tenant.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setInviteForm({
                              ...inviteForm,
                              assignedTenants: [...inviteForm.assignedTenants, tenant.id],
                            });
                          } else {
                            setInviteForm({
                              ...inviteForm,
                              assignedTenants: inviteForm.assignedTenants.filter(
                                (id) => id !== tenant.id
                              ),
                            });
                          }
                        }}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">{tenant.display_name || tenant.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      <VersionFooter className="mt-12" />
    </div>
  );
}

export default UserManagement;
