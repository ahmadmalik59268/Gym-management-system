import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Users,
  Shield,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Briefcase,
  DollarSign,
  CalendarCheck,
  LogIn,
  LogOut,
  Clock,
  CheckCircle2,
  Lock,
  KeyRound,
  ShieldAlert,
  Check,
  UserCheck,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useGym } from '../context/GymContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Staff, PersonType } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { StaffModal } from '../components/staff/StaffModal';
import { AttendanceModal } from '../components/attendance/AttendanceModal';
import { AttendanceSummaryModal } from '../components/attendance/AttendanceSummaryModal';

export const StaffPage: React.FC = () => {
  const {
    staff,
    deleteStaff,
    formatCurrency,
    attendance,
    markCheckIn,
    markCheckOut,
  } = useGym();

  const { role: currentAuthRole } = useAuth();
  const { showToast } = useGym();

  const [activeTab, setActiveTab] = useState<'staff' | 'users'>('staff');

  // Users & Roles state
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userStatusFilter, setUserStatusFilter] = useState('All');

  // Edit User Modal state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  const fetchUserProfiles = async () => {
    setIsUsersLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUserProfiles(data || []);
    } catch (err: any) {
      console.error('Error fetching user profiles:', err);
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && currentAuthRole === 'Admin') {
      fetchUserProfiles();
    }
  }, [activeTab, currentAuthRole]);

  const handleUpdateUserAccess = async () => {
    if (!editingUser) return;
    
    // Prevent modifying or demoting the permanent admin
    if (editingUser.email === 'ahmadmalik59268@gmail.com') {
      showToast('The primary Admin account cannot be modified or demoted.', 'error');
      setEditingUser(null);
      return;
    }

    // Secondary Admin restriction
    if (newRole === 'Admin') {
      showToast('Only one permanent Admin is allowed. No secondary admin can be created.', 'error');
      return;
    }

    setIsUpdatingUser(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          role: newRole,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      showToast('User permissions and role updated successfully!', 'success');
      setEditingUser(null);
      fetchUserProfiles();
    } catch (err: any) {
      console.error('Error updating user permissions:', err);
      showToast(err.message || 'Failed to update user access level', 'error');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return (userProfiles || []).filter((u) => {
      const q = userSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phone || '').includes(q);

      const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
      const matchesStatus = userStatusFilter === 'All' || u.status === userStatusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [userProfiles, userSearchQuery, userRoleFilter, userStatusFilter]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deleteStaffId, setDeleteStaffId] = useState<string | null>(null);

  // Attendance Modals
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceModalStaffId, setAttendanceModalStaffId] = useState<string>('');
  const [summaryStaff, setSummaryStaff] = useState<{ id: string; name: string } | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const totalPayroll = (staff || []).reduce((acc, s) => acc + s.salary, 0);

  const staffOnDutyToday = (staff || []).filter((s) => {
    const rec = (attendance || []).find((a) => a.personId === s.id && a.date === todayStr);
    return rec && !rec.checkOutTime && rec.status !== 'Absent' && rec.status !== 'Leave';
  }).length;

  const filteredStaff = useMemo(() => {
    return (staff || []).filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.role.toLowerCase().includes(q);

      const matchesRole = roleFilter === 'All' || s.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staff, searchQuery, roleFilter, statusFilter]);

  const handleEdit = (s: Staff) => {
    setEditingStaff(s);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteStaffId(id);
  };

  const confirmDelete = () => {
    if (deleteStaffId) {
      deleteStaff(deleteStaffId);
      setDeleteStaffId(null);
    }
  };

  const handleOpenMarkAttendance = (staffId: string) => {
    setAttendanceModalStaffId(staffId);
    setIsAttendanceModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Staff & Employee Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain facility shift roles, administrative access rights, and staff attendance logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="md"
            variant="outline"
            icon={<CalendarCheck className="w-4 h-4 text-indigo-600" />}
            onClick={() => handleOpenMarkAttendance(staff[0]?.id || '')}
          >
            Mark Staff Attendance
          </Button>
          <Button
            size="md"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setEditingStaff(null);
              setIsModalOpen(true);
            }}
          >
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* Role-Based Tabs (Admin Only) */}
      {currentAuthRole === 'Admin' && (
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-5 py-3 text-sm font-extrabold tracking-tight transition-all duration-150 border-b-2 flex items-center gap-2 ${
              activeTab === 'staff'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-indigo-600'
            }`}
          >
            <Users className="w-4 h-4" />
            Operational Staff Team
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-3 text-sm font-extrabold tracking-tight transition-all duration-150 border-b-2 flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-indigo-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            System Users & Access Roles
          </button>
        </div>
      )}

      {/* Tab Contents */}
      {activeTab === 'users' && currentAuthRole === 'Admin' ? (
        <div className="space-y-6">
          {/* User Management KPI banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
              <Shield className="w-48 h-48" />
            </div>
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-[11px] font-black uppercase tracking-wider mb-3 border border-indigo-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Administrative Command Center
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">System Users & Access Roles</h3>
              <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
                As the Primary System Admin, you can audit registration profiles, change access roles (Manager, Receptionist, Trainer, Member), and revoke system access. All modifications enforce strict database security row-level authorization.
              </p>
            </div>
          </div>

          {/* Search and filter toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search registered accounts by name, email, phone..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Role Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">System Role:</span>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Trainer">Trainer</option>
                  <option value="Member">Member</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">Access Status:</span>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                icon={<RefreshCw className={`w-3.5 h-3.5 ${isUsersLoading ? 'animate-spin' : ''}`} />}
                onClick={fetchUserProfiles}
              >
                Sync
              </Button>
            </div>
          </div>

          {/* User Profiles Table */}
          {isUsersLoading ? (
            <div className="py-12 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200">
              <div className="w-8 h-8 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-medium">Fetching registered profiles...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 bg-white rounded-xl border border-slate-200">
              <EmptyState
                title="No registered accounts found"
                description="No users matched your filters or search terms."
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                    <tr>
                      <th className="px-5 py-3.5">User Profile</th>
                      <th className="px-4 py-3.5">Email / Sign-In</th>
                      <th className="px-4 py-3.5">Phone Number</th>
                      <th className="px-4 py-3.5">System Access Role</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Registered On</th>
                      <th className="px-5 py-3.5 text-right">Access Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => {
                      const isPrimaryAdmin = u.email === 'ahmadmalik59268@gmail.com';
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar name={u.full_name || u.email || 'Gym Member'} size="sm" />
                              <div>
                                <span className="font-bold text-slate-900 block text-sm flex items-center gap-1">
                                  {u.full_name || 'No Name Provided'}
                                  {isPrimaryAdmin && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-indigo-100 text-indigo-700 text-[9px] font-extrabold uppercase">
                                      Owner
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono block">{u.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-medium text-slate-700">{u.email}</td>
                          <td className="px-4 py-3.5 text-slate-500 font-mono">{u.phone || 'N/A'}</td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-1 rounded-md font-extrabold text-[10px] uppercase border tracking-wider ${
                              u.role === 'Admin'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : u.role === 'Manager'
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : u.role === 'Receptionist'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : u.role === 'Trainer'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              u.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              {u.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-500">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Prior'}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            {isPrimaryAdmin ? (
                              <span className="text-[11px] text-slate-400 italic flex items-center justify-end gap-1">
                                <Lock className="w-3 h-3" /> Root Protected
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                icon={<Edit2 className="w-3 h-3" />}
                                onClick={() => {
                                  setEditingUser(u);
                                  setNewRole(u.role || 'Member');
                                  setNewStatus(u.status || 'Active');
                                }}
                              >
                                Edit Access
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Team Members
            </span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{staff.length}</div>
          <span className="text-xs text-slate-500 mt-1 block">Active administrative roster</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Staff On Duty Today
            </span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{staffOnDutyToday}</div>
          <span className="text-xs text-emerald-600 mt-1 block">Currently on floor</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Monthly Base Payroll
            </span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(totalPayroll)}</div>
          <span className="text-xs text-slate-500 mt-1 block">Excluding bonuses & deductions</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, role, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="Manager">Manager</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Trainer">Trainer</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Cleaner">Cleaner</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      {filteredStaff.length === 0 ? (
        <EmptyState
          title="No staff members found"
          description="No personnel record matches your current search criteria."
          actionLabel="Add Staff Member"
          onAction={() => {
            setEditingStaff(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Employee Name</th>
                  <th className="px-4 py-3.5">Role / Position</th>
                  <th className="px-4 py-3.5">Today's Shift Status</th>
                  <th className="px-4 py-3.5">Contact Phone</th>
                  <th className="px-4 py-3.5">Monthly Base Pay</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions & Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((s) => {
                  const todayRec = (attendance || []).find(
                    (a) => a.personId === s.id && a.date === todayStr
                  );
                  const isCheckedIn = todayRec && !todayRec.checkOutTime && todayRec.status !== 'Absent' && todayRec.status !== 'Leave';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={s.name} size="sm" />
                          <div>
                            <span className="font-bold text-slate-900 block text-sm">{s.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{s.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-100">
                          {s.role}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {todayRec ? (
                          <div className="flex items-center gap-1.5">
                            {isCheckedIn ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                On Duty ({todayRec.checkInTime})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                                {todayRec.status} ({todayRec.checkInTime} - {todayRec.checkOutTime || 'End'})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not Checked In</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-slate-700">{s.phone}</td>

                      <td className="px-4 py-3.5 font-extrabold text-slate-900">
                        {formatCurrency(s.salary)}
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge variant={s.status === 'Active' ? 'success' : 'neutral'} size="sm">
                          {s.status}
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!todayRec ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-indigo-600 hover:bg-indigo-50 text-xs py-1"
                              onClick={() => markCheckIn(s.id, 'Staff')}
                            >
                              <LogIn className="w-3.5 h-3.5 mr-1" />
                              Check In
                            </Button>
                          ) : isCheckedIn ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-rose-600 hover:bg-rose-50 text-xs py-1"
                              onClick={() => markCheckOut(todayRec.id)}
                            >
                              <LogOut className="w-3.5 h-3.5 mr-1" />
                              Check Out
                            </Button>
                          ) : null}

                          <button
                            onClick={() => handleOpenMarkAttendance(s.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Mark Attendance Shift"
                          >
                            <CalendarCheck className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setSummaryStaff({ id: s.id, name: s.name })}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Attendance Summary"
                          >
                            <Clock className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleEdit(s)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Edit Staff"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Remove Staff"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </div>
      )}

      {/* Edit User Access Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Modify System Access</h3>
                  <p className="text-xs text-slate-400">Update system privilege levels</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="sr-only">Close</span>
                &times;
              </button>
            </div>

            <div className="space-y-4">
              {/* User Profile Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <Avatar name={editingUser.full_name || editingUser.email} size="sm" />
                <div className="overflow-hidden">
                  <span className="font-bold text-slate-900 block text-xs truncate">{editingUser.full_name || 'No Name'}</span>
                  <span className="text-[10px] text-slate-400 truncate block font-mono">{editingUser.email}</span>
                </div>
              </div>

              {/* Privilege Role Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  System Access Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                >
                  <option value="Member">Member (Client Roster, Profile only)</option>
                  <option value="Trainer">Trainer (Assigned Workouts, Client Logs)</option>
                  <option value="Receptionist">Receptionist (Attendance, Registrations)</option>
                  <option value="Manager">Manager (Operational oversight)</option>
                </select>
                <p className="text-[10px] text-slate-400">
                  Changing roles adjusts active module permissions immediately on their next reload.
                </p>
              </div>

              {/* Account Status */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Access Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStatus('Active')}
                    className={`px-3 py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all duration-150 ${
                      newStatus === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Active Access
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus('Inactive')}
                    className={`px-3 py-2 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all duration-150 ${
                      newStatus === 'Inactive'
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Suspended
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs py-2 bg-slate-50 hover:bg-slate-100 text-slate-600"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                className="flex-1 text-xs py-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-bold"
                onClick={handleUpdateUserAccess}
                isLoading={isUpdatingUser}
              >
                Save Permissions
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        staffMember={editingStaff}
      />

      {/* Mark Attendance Modal */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        defaultPersonType="Staff"
        defaultPersonId={attendanceModalStaffId}
      />

      {/* Staff Attendance Summary Modal */}
      {summaryStaff && (
        <AttendanceSummaryModal
          isOpen={!!summaryStaff}
          onClose={() => setSummaryStaff(null)}
          personId={summaryStaff.id}
          personType="Staff"
          personName={summaryStaff.name}
          onOpenMarkModal={() => handleOpenMarkAttendance(summaryStaff.id)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteStaffId}
        onClose={() => setDeleteStaffId(null)}
        onConfirm={confirmDelete}
        title="Remove Staff Member"
        message="Are you sure you want to remove this staff member from your team? This action cannot be undone."
      />
    </div>
  );
};
