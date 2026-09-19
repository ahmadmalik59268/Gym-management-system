import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Search,
  LogIn,
  LogOut,
  Clock,
  UserCheck,
  Users,
  Activity,
  CheckCircle2,
  Calendar,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Download,
  AlertCircle,
  Eye,
  Briefcase,
  Dumbbell,
  Shield,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';
import { useGym } from '../context/GymContext';
import { PersonType, AttendanceStatus, Attendance as AttendanceType } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { AttendanceModal } from '../components/attendance/AttendanceModal';
import { EditAttendanceModal } from '../components/attendance/EditAttendanceModal';
import { AttendanceSummaryModal } from '../components/attendance/AttendanceSummaryModal';
import { PrintAttendanceReportModal } from '../components/attendance/PrintAttendanceReportModal';

type ActiveTab = 'members' | 'trainers' | 'staff' | 'history';

export const Attendance: React.FC = () => {
  const {
    attendance,
    members,
    trainers,
    staff,
    markCheckIn,
    markCheckOut,
    deleteAttendance,
    getMember,
    getTrainer,
  } = useGym();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<ActiveTab>('members');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('All');

  // Quick Check-in Inputs
  const [quickInput, setQuickInput] = useState('');
  const [selectedRosterId, setSelectedRosterId] = useState('');

  // Modals
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [markModalDefaultType, setMarkModalDefaultType] = useState<PersonType>('Member');
  const [markModalDefaultId, setMarkModalDefaultId] = useState('');

  const [editingRecord, setEditingRecord] = useState<AttendanceType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  const [summaryPerson, setSummaryPerson] = useState<{
    id: string;
    type: PersonType;
    name: string;
  } | null>(null);

  // Set today date shortcut
  const handleSetToday = () => {
    setSelectedDate(todayStr);
  };

  const handleClearDate = () => {
    setSelectedDate('');
  };

  // Daily statistics for selected date (or today if all dates)
  const activeStatsDate = selectedDate || todayStr;
  const dateRecords = useMemo(() => {
    return (attendance || []).filter((a) => a.date === activeStatsDate);
  }, [attendance, activeStatsDate]);

  const memberRecords = dateRecords.filter(
    (a) => a.personType === 'Member' || (!a.personType && a.memberId)
  );
  const trainerRecords = dateRecords.filter((a) => a.personType === 'Trainer');
  const staffRecords = dateRecords.filter((a) => a.personType === 'Staff');

  const membersPresent = memberRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const trainersPresent = trainerRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const staffPresent = staffRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length;

  const totalCurrentlyInside = dateRecords.filter((a) => !a.checkOutTime && (a.status === 'Present' || a.status === 'Late')).length;
  const totalLateCount = dateRecords.filter((a) => a.status === 'Late').length;
  const totalLeaveCount = dateRecords.filter((a) => a.status === 'Leave').length;

  // Quick Check-in Handler
  const handleQuickCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = quickInput.trim();
    if (!query) return;

    if (activeTab === 'members') {
      const match = members.find(
        (m) =>
          m.id.toLowerCase() === query.toLowerCase() ||
          m.fullName.toLowerCase().includes(query.toLowerCase()) ||
          m.phone.includes(query)
      );
      if (match) {
        markCheckIn(match.id, 'Member', selectedDate || todayStr);
        setQuickInput('');
      } else {
        markCheckIn(query.toUpperCase(), 'Member', selectedDate || todayStr);
        setQuickInput('');
      }
    } else if (activeTab === 'trainers') {
      const match = trainers.find(
        (t) =>
          t.id.toLowerCase() === query.toLowerCase() ||
          t.name.toLowerCase().includes(query.toLowerCase())
      );
      if (match) {
        markCheckIn(match.id, 'Trainer', selectedDate || todayStr);
        setQuickInput('');
      }
    } else if (activeTab === 'staff') {
      const match = staff.find(
        (s) =>
          s.id.toLowerCase() === query.toLowerCase() ||
          s.name.toLowerCase().includes(query.toLowerCase())
      );
      if (match) {
        markCheckIn(match.id, 'Staff', selectedDate || todayStr);
        setQuickInput('');
      }
    }
  };

  const handleDropdownCheckIn = () => {
    if (!selectedRosterId) return;
    const type: PersonType =
      activeTab === 'members' ? 'Member' : activeTab === 'trainers' ? 'Trainer' : 'Staff';
    markCheckIn(selectedRosterId, type, selectedDate || todayStr);
    setSelectedRosterId('');
  };

  // Helper to open mark attendance modal
  const handleOpenMarkModal = (type: PersonType, personId?: string) => {
    setMarkModalDefaultType(type);
    setMarkModalDefaultId(personId || '');
    setIsMarkModalOpen(true);
  };

  // Member roster for today with status
  const memberRosterData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return members
      .filter((m) => {
        const matchesQuery =
          !q ||
          m.fullName.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.phone.includes(q);
        return matchesQuery;
      })
      .map((m) => {
        const targetDate = selectedDate || todayStr;
        const attRecord = (attendance || []).find(
          (a) =>
            (a.personId === m.id || a.memberId === m.id) &&
            a.date === targetDate
        );
        return {
          member: m,
          attRecord,
          status: attRecord ? attRecord.status : 'Not Marked',
          isCheckedIn: !!attRecord && !attRecord.checkOutTime && attRecord.status !== 'Absent' && attRecord.status !== 'Leave',
        };
      })
      .filter((item) => {
        if (statusFilter === 'All') return true;
        if (statusFilter === 'Not Marked') return !item.attRecord;
        return item.status === statusFilter;
      });
  }, [members, attendance, selectedDate, todayStr, searchQuery, statusFilter]);

  // Trainer roster for today with status
  const trainerRosterData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return trainers
      .filter((t) => {
        const matchesQuery =
          !q ||
          t.name.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.specialization.toLowerCase().includes(q);
        return matchesQuery;
      })
      .map((t) => {
        const targetDate = selectedDate || todayStr;
        const attRecord = (attendance || []).find(
          (a) => a.personId === t.id && a.date === targetDate
        );
        return {
          trainer: t,
          attRecord,
          status: attRecord ? attRecord.status : 'Not Marked',
          isCheckedIn: !!attRecord && !attRecord.checkOutTime && attRecord.status !== 'Absent' && attRecord.status !== 'Leave',
        };
      })
      .filter((item) => {
        if (statusFilter === 'All') return true;
        if (statusFilter === 'Not Marked') return !item.attRecord;
        return item.status === statusFilter;
      });
  }, [trainers, attendance, selectedDate, todayStr, searchQuery, statusFilter]);

  // Staff roster for today with status
  const staffRosterData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return staff
      .filter((s) => {
        const matchesQuery =
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q);
        return matchesQuery;
      })
      .map((s) => {
        const targetDate = selectedDate || todayStr;
        const attRecord = (attendance || []).find(
          (a) => a.personId === s.id && a.date === targetDate
        );
        return {
          staff: s,
          attRecord,
          status: attRecord ? attRecord.status : 'Not Marked',
          isCheckedIn: !!attRecord && !attRecord.checkOutTime && attRecord.status !== 'Absent' && attRecord.status !== 'Leave',
        };
      })
      .filter((item) => {
        if (statusFilter === 'All') return true;
        if (statusFilter === 'Not Marked') return !item.attRecord;
        return item.status === statusFilter;
      });
  }, [staff, attendance, selectedDate, todayStr, searchQuery, statusFilter]);

  // Master History & Logs Tab
  const [historyPage, setHistoryPage] = useState(1);
  const historyItemsPerPage = 12;

  const filteredHistoryLogs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return (attendance || [])
      .filter((a) => {
        const matchesDate = !selectedDate || a.date === selectedDate;
        const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
        const recordType = a.personType || (a.memberId ? 'Member' : 'Other');
        const matchesType = historyTypeFilter === 'All' || recordType === historyTypeFilter;

        let personName = a.personName || '';
        if (!personName) {
          if (recordType === 'Member') personName = getMember(a.personId || a.memberId || '')?.fullName || '';
          else if (recordType === 'Trainer') personName = getTrainer(a.personId)?.name || '';
        }

        const matchesQuery =
          !q ||
          (a.personId && a.personId.toLowerCase().includes(q)) ||
          (a.memberId && a.memberId.toLowerCase().includes(q)) ||
          personName.toLowerCase().includes(q) ||
          (a.notes && a.notes.toLowerCase().includes(q));

        return matchesDate && matchesStatus && matchesType && matchesQuery;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendance, selectedDate, statusFilter, historyTypeFilter, searchQuery, getMember, getTrainer]);

  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * historyItemsPerPage;
    return filteredHistoryLogs.slice(start, start + historyItemsPerPage);
  }, [filteredHistoryLogs, historyPage]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Person ID', 'Name', 'Check-In', 'Check-Out', 'Status', 'Notes'];
    const rows = filteredHistoryLogs.map((a) => [
      a.id,
      a.date,
      a.personType || 'Member',
      a.personId || a.memberId || '',
      a.personName || '',
      a.checkInTime || '',
      a.checkOutTime || '',
      a.status,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apex_attendance_export_${selectedDate || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: AttendanceStatus | 'Not Marked') => {
    switch (status) {
      case 'Present':
        return <Badge variant="success" size="sm">Present</Badge>;
      case 'Late':
        return <Badge variant="warning" size="sm">Late</Badge>;
      case 'Half Day':
        return <Badge variant="indigo" size="sm">Half Day</Badge>;
      case 'Leave':
        return <Badge variant="info" size="sm">On Leave</Badge>;
      case 'Absent':
        return <Badge variant="danger" size="sm">Absent</Badge>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">Not Marked</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Central Attendance Management
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Unified live check-ins, duty rosters, and full historical logs for Athletes, Coaches, and Staff.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Selector with Today Button */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleSetToday}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                selectedDate === todayStr
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Today
            </button>
            {selectedDate && (
              <button
                onClick={handleClearDate}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200"
              >
                All Dates
              </button>
            )}
          </div>

          {/* Print Report & Mark Attendance Buttons */}
          <Button
            size="md"
            variant="outline"
            icon={<Printer className="w-4 h-4" />}
            onClick={() => setIsPrintReportOpen(true)}
          >
            Print Report
          </Button>

          <Button
            size="md"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => handleOpenMarkModal(activeTab === 'staff' ? 'Staff' : activeTab === 'trainers' ? 'Trainer' : 'Member')}
          >
            Mark Attendance
          </Button>
        </div>
      </div>

      {/* 2. KPI Summary Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Athletes In
            </span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{membersPresent}</div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
            {selectedDate ? `On ${selectedDate}` : 'Today'}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Coaches In
            </span>
            <Dumbbell className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{trainersPresent}</div>
          <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">Coaches on floor</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Staff In
            </span>
            <Briefcase className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{staffPresent}</div>
          <span className="text-[10px] text-violet-600 font-semibold block mt-0.5">Front desk & admin</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              On Floor Now
            </span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-xl font-extrabold text-emerald-600 mt-1">{totalCurrentlyInside}</div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Checked-in & active</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Late Arrivals
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-amber-600 mt-1">{totalLateCount}</div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Turnstile alerts</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Approved Leave
            </span>
            <AlertCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-extrabold text-blue-600 mt-1">{totalLeaveCount}</div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Excused absences</span>
        </div>
      </div>

      {/* 3. Central Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/70 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('members');
              setSearchQuery('');
              setStatusFilter('All');
            }}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all shrink-0 ${
              activeTab === 'members'
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Members ({members.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('trainers');
              setSearchQuery('');
              setStatusFilter('All');
            }}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all shrink-0 ${
              activeTab === 'trainers'
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Trainers / Coaches ({trainers.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('staff');
              setSearchQuery('');
              setStatusFilter('All');
            }}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all shrink-0 ${
              activeTab === 'staff'
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Staff ({staff.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('history');
              setSearchQuery('');
              setStatusFilter('All');
            }}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-all shrink-0 ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Attendance History & Logs ({attendance.length})</span>
          </button>
        </div>

        {/* 4. Controls & Quick Check-in Bar for Active Tab */}
        <div className="p-5 border-b border-slate-100 bg-white space-y-4">
          {activeTab !== 'history' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
              {/* Quick Scan / Check-In Input */}
              <form
                onSubmit={handleQuickCheckInSubmit}
                className="lg:col-span-5 flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    placeholder={
                      activeTab === 'members'
                        ? 'Quick Turnstile Scan (Name, ID, or Phone)...'
                        : activeTab === 'trainers'
                        ? 'Quick Coach ID or Name Scan...'
                        : 'Quick Staff ID or Name Scan...'
                    }
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  icon={<LogIn className="w-3.5 h-3.5" />}
                  className="shrink-0"
                >
                  Check In
                </Button>
              </form>

              {/* Quick Select & Check-In Dropdown */}
              <div className="lg:col-span-4 flex items-center gap-2">
                <select
                  value={selectedRosterId}
                  onChange={(e) => setSelectedRosterId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">
                    -- Select {activeTab === 'members' ? 'Member' : activeTab === 'trainers' ? 'Coach' : 'Staff'} --
                  </option>
                  {activeTab === 'members' &&
                    members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.id})
                      </option>
                    ))}
                  {activeTab === 'trainers' &&
                    trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.id})
                      </option>
                    ))}
                  {activeTab === 'staff' &&
                    staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id} • {s.role})
                      </option>
                    ))}
                </select>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleDropdownCheckIn}
                  disabled={!selectedRosterId}
                  className="shrink-0"
                >
                  Check In
                </Button>
              </div>

              {/* Status Filter */}
              <div className="lg:col-span-3 flex items-center justify-end gap-2">
                <span className="text-xs font-semibold text-slate-500">Filter:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Leave">On Leave</option>
                  <option value="Absent">Absent</option>
                  <option value="Not Marked">Not Marked</option>
                </select>
              </div>
            </div>
          ) : (
            /* History Filters Bar */
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs by name, ID, or notes..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={historyTypeFilter}
                  onChange={(e) => setHistoryTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Categories</option>
                  <option value="Member">Members Only</option>
                  <option value="Trainer">Trainers Only</option>
                  <option value="Staff">Staff Only</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Leave">Leave</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>

              <Button
                size="sm"
                variant="outline"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={handleExportCSV}
              >
                Export CSV ({filteredHistoryLogs.length})
              </Button>
            </div>
          )}
        </div>

        {/* 5. TAB 1: MEMBERS ATTENDANCE ROSTER */}
        {activeTab === 'members' && (
          <div className="overflow-x-auto">
            {memberRosterData.length === 0 ? (
              <EmptyState
                title="No member records found"
                description={`No athletes match "${searchQuery}" or status "${statusFilter}" on ${selectedDate || todayStr}.`}
                actionLabel="Mark Attendance"
                onAction={() => handleOpenMarkModal('Member')}
              />
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Athlete</th>
                    <th className="px-4 py-3.5">ID / Phone</th>
                    <th className="px-4 py-3.5">Check-In</th>
                    <th className="px-4 py-3.5">Check-Out / Floor</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Floor Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {memberRosterData.map(({ member, attRecord, status, isCheckedIn }) => (
                    <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={member.profilePhoto}
                            alt={member.fullName}
                            fallback={member.fullName.charAt(0)}
                            size="sm"
                          />
                          <div>
                            <Link
                              to={`/members/${member.id}`}
                              className="font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                            >
                              {member.fullName}
                            </Link>
                            <span className="text-[11px] text-slate-400">
                              Joined {member.joinDate}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-mono text-slate-600 font-semibold">{member.id}</div>
                        <div className="text-[11px] text-slate-400">{member.phone}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        {attRecord?.checkInTime ? (
                          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                            <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{attRecord.checkInTime}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">--</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        {attRecord?.checkOutTime ? (
                          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <LogOut className="w-3.5 h-3.5 text-slate-500" />
                            <span>{attRecord.checkOutTime}</span>
                          </div>
                        ) : isCheckedIn ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Inside Facility
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">--</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">{getStatusBadge(status)}</td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!attRecord ? (
                            <Button
                              size="sm"
                              variant="primary"
                              icon={<LogIn className="w-3.5 h-3.5" />}
                              onClick={() => markCheckIn(member.id, 'Member', selectedDate || todayStr)}
                              className="text-xs py-1"
                            >
                              Check In
                            </Button>
                          ) : isCheckedIn ? (
                            <Button
                              size="sm"
                              variant="outline"
                              icon={<LogOut className="w-3.5 h-3.5" />}
                              onClick={() => markCheckOut(attRecord.id)}
                              className="text-xs py-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                            >
                              Check Out
                            </Button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium mr-1">
                              Completed
                            </span>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenMarkModal('Member', member.id)}
                            className="text-xs py-1 text-slate-600 hover:bg-slate-100"
                            title="Set Status / Times"
                          >
                            Mark
                          </Button>

                          <Link to={`/members/${member.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs py-1 text-slate-500 hover:bg-slate-100"
                              title="View Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 6. TAB 2: TRAINERS / COACHES ATTENDANCE ROSTER */}
        {activeTab === 'trainers' && (
          <div className="overflow-x-auto">
            {trainerRosterData.length === 0 ? (
              <EmptyState
                title="No coach records found"
                description={`No coaches match "${searchQuery}" or status "${statusFilter}".`}
                actionLabel="Mark Coach Attendance"
                onAction={() => handleOpenMarkModal('Trainer')}
              />
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Coach / Trainer</th>
                    <th className="px-4 py-3.5">Specialization</th>
                    <th className="px-4 py-3.5">Check-In</th>
                    <th className="px-4 py-3.5">Check-Out / Shift</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Floor & Duty Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trainerRosterData.map(({ trainer, attRecord, status, isCheckedIn }) => (
                    <tr key={trainer.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={trainer.photo}
                            alt={trainer.name}
                            fallback={trainer.name.charAt(0)}
                            size="sm"
                          />
                          <div>
                            <Link
                              to={`/trainers/${trainer.id}`}
                              className="font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                            >
                              {trainer.name}
                            </Link>
                            <span className="text-[11px] font-mono text-slate-400">
                              {trainer.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">{trainer.specialization}</div>
                        <div className="text-[11px] text-slate-400">{trainer.email}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        {attRecord?.checkInTime ? (
                          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                            <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{attRecord.checkInTime}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">--</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        {attRecord?.checkOutTime ? (
                          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <LogOut className="w-3.5 h-3.5 text-slate-500" />
                            <span>{attRecord.checkOutTime}</span>
                          </div>
                        ) : isCheckedIn ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            On Floor Duty
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">--</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">{getStatusBadge(status)}</td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!attRecord ? (
                            <Button
                              size="sm"
                              variant="primary"
                              icon={<LogIn className="w-3.5 h-3.5" />}
                              onClick={() => markCheckIn(trainer.id, 'Trainer', selectedDate || todayStr)}
                              className="text-xs py-1"
                            >
                              Check In
                            </Button>
                          ) : isCheckedIn ? (
                            <Button
                              size="sm"
                              variant="outline"
                              icon={<LogOut className="w-3.5 h-3.5" />}
                              onClick={() => markCheckOut(attRecord.id)}
                              className="text-xs py-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                            >
                              Check Out
                            </Button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium mr-1">
                              Shift Done
                            </span>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenMarkModal('Trainer', trainer.id)}
                            className="text-xs py-1 text-slate-600 hover:bg-slate-100"
                          >
                            Mark
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setSummaryPerson({
                                id: trainer.id,
                                type: 'Trainer',
                                name: trainer.name,
                              })
                            }
                            className="text-xs py-1 text-indigo-600 hover:bg-indigo-50"
                            title="Monthly Summary"
                          >
                            Summary
                          </Button>

                          <Link to={`/trainers/${trainer.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs py-1 text-slate-500 hover:bg-slate-100"
                              title="View Coach Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 7. TAB 3: STAFF ATTENDANCE ROSTER */}
        {activeTab === 'staff' && (
          <div className="overflow-x-auto">
            {staffRosterData.length === 0 ? (
              <EmptyState
                title="No staff records found"
                description={`No staff match "${searchQuery}" or status "${statusFilter}".`}
                actionLabel="Mark Staff Attendance"
                onAction={() => handleOpenMarkModal('Staff')}
              />
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Employee Name</th>
                    <th className="px-4 py-3.5">Shift Role</th>
                    <th className="px-4 py-3.5">Check-In</th>
                    <th className="px-4 py-3.5">Check-Out / Shift</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Floor Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffRosterData.map(({ staff: s, attRecord, status, isCheckedIn }) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 font-extrabold flex items-center justify-center text-slate-700 text-xs">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{s.name}</span>
                            <span className="text-[11px] font-mono text-slate-400">{s.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge variant="indigo" size="sm">
                          {s.role}
                        </Badge>
                        <div className="text-[11px] text-slate-400 mt-0.5">{s.email}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        {attRecord?.checkInTime ? (
                          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                            <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{attRecord.checkInTime}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">--</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        {attRecord?.checkOutTime ? (
                          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <LogOut className="w-3.5 h-3.5 text-slate-500" />
                            <span>{attRecord.checkOutTime}</span>
                          </div>
                        ) : isCheckedIn ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-[11px] font-bold">
                            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                            On Duty
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">--</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">{getStatusBadge(status)}</td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!attRecord ? (
                            <Button
                              size="sm"
                              variant="primary"
                              icon={<LogIn className="w-3.5 h-3.5" />}
                              onClick={() => markCheckIn(s.id, 'Staff', selectedDate || todayStr)}
                              className="text-xs py-1"
                            >
                              Check In
                            </Button>
                          ) : isCheckedIn ? (
                            <Button
                              size="sm"
                              variant="outline"
                              icon={<LogOut className="w-3.5 h-3.5" />}
                              onClick={() => markCheckOut(attRecord.id)}
                              className="text-xs py-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                            >
                              Check Out
                            </Button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium mr-1">
                              Completed
                            </span>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenMarkModal('Staff', s.id)}
                            className="text-xs py-1 text-slate-600 hover:bg-slate-100"
                          >
                            Mark
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setSummaryPerson({
                                id: s.id,
                                type: 'Staff',
                                name: s.name,
                              })
                            }
                            className="text-xs py-1 text-indigo-600 hover:bg-indigo-50"
                            title="Monthly Summary"
                          >
                            Summary
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 8. TAB 4: MASTER ATTENDANCE HISTORY & LOGS */}
        {activeTab === 'history' && (
          <div>
            <div className="overflow-x-auto">
              {filteredHistoryLogs.length === 0 ? (
                <EmptyState
                  title="No attendance logs found"
                  description="No records match your selected date, type, or search filters."
                  actionLabel="Mark Attendance"
                  onAction={() => handleOpenMarkModal('Member')}
                />
              ) : (
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                    <tr>
                      <th className="px-5 py-3.5">Log ID / Date</th>
                      <th className="px-4 py-3.5">Individual</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Check-In</th>
                      <th className="px-4 py-3.5">Check-Out</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Notes</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedHistory.map((log) => {
                      const pType = log.personType || (log.memberId ? 'Member' : 'Member');
                      let pName = log.personName;
                      if (!pName) {
                        if (pType === 'Member') pName = getMember(log.personId || log.memberId || '')?.fullName;
                        else if (pType === 'Trainer') pName = getTrainer(log.personId)?.name;
                      }

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-mono text-slate-500 font-semibold">{log.id}</div>
                            <div className="font-bold text-slate-900 mt-0.5">{log.date}</div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-900">{pName || log.personId || log.memberId}</div>
                            <div className="font-mono text-[11px] text-slate-400">{log.personId || log.memberId}</div>
                          </td>

                          <td className="px-4 py-3.5">
                            <Badge
                              variant={
                                pType === 'Member'
                                  ? 'info'
                                  : pType === 'Trainer'
                                  ? 'success'
                                  : 'indigo'
                              }
                              size="sm"
                            >
                              {pType}
                            </Badge>
                          </td>

                          <td className="px-4 py-3.5 font-medium text-slate-800">
                            {log.checkInTime || '-'}
                          </td>

                          <td className="px-4 py-3.5 font-medium text-slate-800">
                            {log.checkOutTime || (
                              <span className="text-emerald-600 font-bold text-[11px]">Active</span>
                            )}
                          </td>

                          <td className="px-4 py-3.5">{getStatusBadge(log.status)}</td>

                          <td className="px-4 py-3.5 text-slate-500 max-w-xs truncate italic">
                            {log.notes || '-'}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingRecord(log);
                                  setIsEditModalOpen(true);
                                }}
                                className="text-slate-600 hover:bg-slate-100 p-1.5"
                                title="Edit Log"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteTargetId(log.id)}
                                className="text-rose-600 hover:bg-rose-50 p-1.5"
                                title="Delete Log"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination for History */}
            {filteredHistoryLogs.length > historyItemsPerPage && (
              <div className="p-4 border-t border-slate-100 flex justify-center">
                <Pagination
                  currentPage={historyPage}
                  totalPages={Math.ceil(filteredHistoryLogs.length / historyItemsPerPage)}
                  onPageChange={setHistoryPage}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 9. MODALS */}
      {/* Mark Attendance Modal */}
      <AttendanceModal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        defaultPersonType={markModalDefaultType}
        defaultPersonId={markModalDefaultId}
        defaultDate={selectedDate || todayStr}
      />

      {/* Edit Attendance Modal */}
      <EditAttendanceModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingRecord(null);
        }}
        record={editingRecord}
      />

      {/* Attendance Summary Modal */}
      {summaryPerson && (
        <AttendanceSummaryModal
          isOpen={!!summaryPerson}
          onClose={() => setSummaryPerson(null)}
          personId={summaryPerson.id}
          personType={summaryPerson.type}
          personName={summaryPerson.name}
          onOpenMarkModal={() => handleOpenMarkModal(summaryPerson.type, summaryPerson.id)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            deleteAttendance(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Delete Attendance Log"
        message="Are you sure you want to delete this attendance record? This will permanently remove the log from history."
        confirmLabel="Delete Log"
        isDangerous={true}
      />

      {/* Print Attendance Report Modal */}
      <PrintAttendanceReportModal
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        dateFilter={selectedDate}
        typeFilter={activeTab === 'history' ? historyTypeFilter : activeTab}
        records={activeTab === 'history' ? filteredHistoryLogs : dateRecords}
      />
    </div>
  );
};
