import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Award,
  Users,
  Dumbbell,
  Apple,
  Clock,
  Edit2,
  Plus,
  Trash2,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  ExternalLink,
  ShieldCheck,
  Activity,
  ArrowRight,
  Eye,
  UserCheck,
  UserX,
  Percent,
  Calculator,
  TrendingUp,
  Receipt,
  Download,
  AlertCircle,
  CreditCard,
  Building2,
  ArrowUpRight,
  CalendarCheck,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useGym } from '../context/GymContext';
import { usePayroll } from '../context/PayrollContext';
import { useAuth } from '../context/AuthContext';
import { Trainer, Member, WorkoutPlan, DietPlan } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { TrainerModal } from '../components/trainers/TrainerModal';
import { AssignMembersToTrainerModal } from '../components/trainers/AssignMembersToTrainerModal';
import { WorkoutPlanModal } from '../components/fitness/WorkoutPlanModal';
import { DietPlanModal } from '../components/fitness/DietPlanModal';
import { AttendanceModal } from '../components/attendance/AttendanceModal';

export const TrainerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const {
    trainers,
    members,
    trainerAssignments,
    removeMemberFromTrainer,
    workoutPlans,
    dietPlans,
    memberships,
    plans,
    attendance,
    currencySymbol,
    formatCurrency,
    deleteWorkoutPlan,
    deleteDietPlan,
    markCheckIn,
    markCheckOut,
    getAttendanceForPerson,
    getAttendanceSummary,
  } = useGym();

  const {
    selectedMonth: globalMonth,
    availableMonths,
    getSalaryConfig,
    calculateSingleEmployeePayroll,
    getTrainerMemberCommissions,
    payrollRecords,
  } = usePayroll();

  // Find target trainer
  const trainer = useMemo(() => {
    return trainers.find((t) => t.id === id);
  }, [trainers, id]);

  const [activeTab, setActiveTab] = useState<'members' | 'workouts' | 'diets' | 'attendance' | 'payroll' | 'about'>('members');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>(globalMonth || '2026-09');

  useEffect(() => {
    if (globalMonth) {
      setSelectedMonth(globalMonth);
    }
  }, [globalMonth]);

  // Modals state
  const [isEditTrainerOpen, setIsEditTrainerOpen] = useState(false);
  const [isAssignMembersOpen, setIsAssignMembersOpen] = useState(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedMemberForWorkout, setSelectedMemberForWorkout] = useState<string | undefined>(undefined);
  const [workoutToEdit, setWorkoutToEdit] = useState<WorkoutPlan | null>(null);

  const [isDietModalOpen, setIsDietModalOpen] = useState(false);
  const [selectedMemberForDiet, setSelectedMemberForDiet] = useState<string | undefined>(undefined);
  const [dietToEdit, setDietToEdit] = useState<DietPlan | null>(null);

  const [unassignMemberId, setUnassignMemberId] = useState<string | null>(null);
  const [deleteWorkoutId, setDeleteWorkoutId] = useState<string | null>(null);
  const [deleteDietId, setDeleteDietId] = useState<string | null>(null);

  // If trainer not found
  if (!trainer) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          size="sm"
          icon={<ChevronLeft className="w-4 h-4" />}
          onClick={() => navigate('/trainers')}
        >
          Back to Trainers
        </Button>
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-xs">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Trainer Not Found</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            The coach record you are looking for (ID: {id}) does not exist or was removed.
          </p>
          <div className="mt-6">
            <Button variant="primary" size="md" onClick={() => navigate('/trainers')}>
              Return to Coach Directory
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Security Check: Trainer can only view their own profile
  const isOwnTrainerProfile =
    Boolean(trainer.auth_user_id && trainer.auth_user_id === user?.id) ||
    Boolean(trainer.email && user?.email && trainer.email.toLowerCase() === user.email.toLowerCase());

  if (role === 'Trainer' && !isOwnTrainerProfile) {
    return (
      <div className="space-y-6">
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center max-w-lg mx-auto">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-rose-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-rose-600 mb-5">
            Security Policy: Trainers may only view and manage their personal coach profile.
          </p>
          <Button variant="primary" onClick={() => navigate('/workout-plans')}>
            Return to My Assigned Athletes
          </Button>
        </div>
      </div>
    );
  }

  if (role === 'Member') {
    return (
      <div className="space-y-6">
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center max-w-lg mx-auto">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-rose-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-rose-600 mb-5">
            Security Policy: Members cannot inspect trainer internal operational profiles.
          </p>
          <Button variant="primary" onClick={() => navigate('/workout-plans')}>
            Return to My Fitness
          </Button>
        </div>
      </div>
    );
  }

  // Calculate assigned members
  const assignedAssignments = useMemo(() => {
    return (trainerAssignments || []).filter(
      (a) => a.trainerId === trainer.id && (a.status === 'Active' || !a.status)
    );
  }, [trainerAssignments, trainer.id]);

  const assignedMemberIds = useMemo(() => {
    return assignedAssignments.map((a) => a.memberId);
  }, [assignedAssignments]);

  const assignedMemberList = useMemo(() => {
    return members.filter((m) => assignedMemberIds.includes(m.id));
  }, [members, assignedMemberIds]);

  // Filtered members inside trainer profile
  const filteredAssignedMembers = useMemo(() => {
    const q = memberSearchQuery.toLowerCase().trim();
    if (!q) return assignedMemberList;
    return assignedMemberList.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [assignedMemberList, memberSearchQuery]);

  // Calculate active & expiring members
  const activeMembersCount = useMemo(() => {
    return assignedMemberList.filter((m) => m.status === 'Active').length;
  }, [assignedMemberList]);

  const expiringMembersCount = useMemo(() => {
    return assignedMemberList.filter((m) => m.status === 'Expiring Soon').length;
  }, [assignedMemberList]);

  // Workout plans assigned to or created for this trainer's members or by this trainer
  const trainerWorkouts = useMemo(() => {
    return (workoutPlans || []).filter(
      (wp) => wp.trainerId === trainer.id || (wp.memberId && assignedMemberIds.includes(wp.memberId))
    );
  }, [workoutPlans, trainer.id, assignedMemberIds]);

  // Diet plans assigned to or created for this trainer's members or by this trainer
  const trainerDiets = useMemo(() => {
    return (dietPlans || []).filter(
      (dp) => dp.trainerId === trainer.id || (dp.memberId && assignedMemberIds.includes(dp.memberId))
    );
  }, [dietPlans, trainer.id, assignedMemberIds]);

  // Recent attendance for assigned athletes
  const assignedAttendanceLogs = useMemo(() => {
    return (attendance || [])
      .filter((a) => assignedMemberIds.includes(a.memberId))
      .slice(0, 15);
  }, [attendance, assignedMemberIds]);

  // Payroll information and calculations
  const salaryConfig = useMemo(() => {
    return getSalaryConfig ? getSalaryConfig(trainer.id) : undefined;
  }, [getSalaryConfig, trainer.id]);

  const effectiveSalaryType = trainer.salaryType || salaryConfig?.salaryType || 'Percentage / Commission';
  const effectiveCommissionBasis = trainer.commissionBasis || salaryConfig?.commissionBasis || "Assigned Members' Membership Payments";
  const effectiveCommissionPercentage = trainer.commissionPercentage ?? salaryConfig?.commissionPercentage ?? 50;

  // Monthly payroll calculation
  const monthlyPayroll = useMemo(() => {
    if (calculateSingleEmployeePayroll) {
      return calculateSingleEmployeePayroll(trainer.id, selectedMonth);
    }
    return null;
  }, [calculateSingleEmployeePayroll, trainer.id, selectedMonth]);

  // Commission transactions breakdown
  const memberCommissions = useMemo(() => {
    if (getTrainerMemberCommissions) {
      return getTrainerMemberCommissions(
        trainer.id,
        selectedMonth,
        trainer.commissionBasis || salaryConfig?.commissionBasis,
        trainer.commissionRevenueTreatment || salaryConfig?.commissionRevenueTreatment,
        trainer.commissionPercentage ?? salaryConfig?.commissionPercentage
      );
    }
    return [];
  }, [getTrainerMemberCommissions, trainer, salaryConfig, selectedMonth]);

  // Historic records for this trainer
  const historicalPayslips = useMemo(() => {
    return (payrollRecords || []).filter((r) => r.employeeId === trainer.id);
  }, [payrollRecords, trainer.id]);

  const handleConfirmUnassign = () => {
    if (unassignMemberId) {
      removeMemberFromTrainer(trainer.id, unassignMemberId);
      setUnassignMemberId(null);
    }
  };

  const handleConfirmDeleteWorkout = () => {
    if (deleteWorkoutId) {
      deleteWorkoutPlan(deleteWorkoutId);
      setDeleteWorkoutId(null);
    }
  };

  const handleConfirmDeleteDiet = () => {
    if (deleteDietId) {
      deleteDietPlan(deleteDietId);
      setDeleteDietId(null);
    }
  };

  // Helper formatting for salary display pill in header
  const getCompensationDisplay = () => {
    if (effectiveSalaryType === 'Percentage / Commission') {
      return `${effectiveCommissionPercentage}% Commission (${trainer.commissionBasis || "Assigned Members"})`;
    }
    if (effectiveSalaryType === 'Fixed Salary') {
      return `${formatCurrency(trainer.salary || salaryConfig?.baseSalary || 0)} / mo (Fixed)`;
    }
    if (effectiveSalaryType === 'Fixed + Percentage') {
      return `${formatCurrency(trainer.salary || 0)} + ${effectiveCommissionPercentage}% Commission`;
    }
    if (effectiveSalaryType === 'Attendance-Based Salary' || (effectiveSalaryType as string) === 'Attendance Based') {
      return `${formatCurrency(trainer.salary || 0)} / mo (Attendance)`;
    }
    if (effectiveSalaryType === 'Hourly / Daily') {
      if (trainer.hourlyRate) return `${formatCurrency(trainer.hourlyRate)}/hr`;
      if (trainer.dailyRate) return `${formatCurrency(trainer.dailyRate)}/day`;
      return 'Hourly / Daily Rate';
    }
    return `${formatCurrency(trainer.salary || 0)} / mo`;
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/trainers" className="hover:text-indigo-600 font-medium flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Coaches & Trainers
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">{trainer.name}</span>
        </div>
      </div>

      {/* Hero Trainer Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left: Avatar + Identification */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-indigo-500/20 shadow-md bg-slate-100 shrink-0">
                  <img
                    src={trainer.photo}
                    alt={trainer.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2">
                  <Badge
                    variant={trainer.status === 'Active' ? 'success' : 'neutral'}
                    size="md"
                    className="shadow-xs"
                  >
                    {trainer.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {trainer.name}
                  </h1>
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
                    {trainer.id}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                  <Award className="w-4 h-4" />
                  <span>{trainer.specialization}</span>
                  {trainer.experience && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-medium">{trainer.experience} yrs experience</span>
                    </>
                  )}
                </div>

                {/* Contact & Compensation Quick Info */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                  <a
                    href={`tel:${trainer.phone}`}
                    className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors font-medium"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{trainer.phone}</span>
                  </a>
                  <a
                    href={`mailto:${trainer.email}`}
                    className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors font-medium"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{trainer.email}</span>
                  </a>
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Joined {new Date(trainer.joiningDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{getCompensationDisplay()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <Button
                variant="primary"
                size="md"
                icon={<UserCheck className="w-4 h-4" />}
                onClick={() => setIsAssignMembersOpen(true)}
              >
                Assign Member
              </Button>
              <Button
                variant="outline"
                size="md"
                icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
                onClick={() => setActiveTab('payroll')}
              >
                Payroll & Commission
              </Button>
              <Button
                variant="outline"
                size="md"
                icon={<CalendarCheck className="w-4 h-4 text-indigo-600" />}
                onClick={() => setIsAttendanceModalOpen(true)}
              >
                Mark Attendance
              </Button>
              <Button
                variant="outline"
                size="md"
                icon={<Dumbbell className="w-4 h-4 text-indigo-600" />}
                onClick={() => {
                  setWorkoutToEdit(null);
                  setSelectedMemberForWorkout(assignedMemberList[0]?.id || undefined);
                  setIsWorkoutModalOpen(true);
                }}
              >
                Workout
              </Button>
              <Button
                variant="outline"
                size="md"
                icon={<Apple className="w-4 h-4 text-teal-600" />}
                onClick={() => {
                  setDietToEdit(null);
                  setSelectedMemberForDiet(assignedMemberList[0]?.id || undefined);
                  setIsDietModalOpen(true);
                }}
              >
                Diet
              </Button>
              <Button
                variant="outline"
                size="md"
                icon={<Edit2 className="w-4 h-4" />}
                onClick={() => setIsEditTrainerOpen(true)}
              >
                Edit Coach
              </Button>
            </div>
          </div>

          {/* Coach Bio / Statement if present */}
          {trainer.bio && (
            <div className="mt-6 pt-5 border-t border-slate-100 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Coach Profile & Athletic Philosophy
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{trainer.bio}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Metric Overview Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 border-t border-slate-200 divide-x divide-y sm:divide-y-0 divide-slate-100 bg-slate-50/50">
          <div className="p-4 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Assigned Athletes
            </span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">
              {assignedMemberList.length}
            </span>
          </div>

          <div className="p-4 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Members
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-0.5 block">
              {activeMembersCount}
            </span>
          </div>

          <div className="p-4 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Eligible Revenue ({selectedMonth.split(' ')[0]})
            </span>
            <span className="text-2xl font-black text-indigo-600 mt-0.5 block">
              {formatCurrency(monthlyPayroll?.eligibleRevenue || 0)}
            </span>
          </div>

          <div className="p-4 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Calculated Net Pay
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-0.5 block">
              {formatCurrency(monthlyPayroll?.netSalary || 0)}
            </span>
          </div>

          <div className="p-4 text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Compensation Model
            </span>
            <span className="text-xs font-bold text-slate-700 mt-2 block truncate px-2">
              {effectiveSalaryType}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'members'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Assigned Athletes ({assignedMemberList.length})
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'payroll'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-500" />
          Payroll & Salary Information
        </button>

        <button
          onClick={() => setActiveTab('workouts')}
          className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'workouts'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          Workout Plans ({trainerWorkouts.length})
        </button>

        <button
          onClick={() => setActiveTab('diets')}
          className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'diets'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Apple className="w-4 h-4" />
          Diet Plans ({trainerDiets.length})
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          Client Check-ins ({assignedAttendanceLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'about'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Credentials & Bio
        </button>
      </div>

      {/* Tab 1: Assigned Athletes */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Action & Filter Header */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search athletes by name, member ID, phone, or email..."
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={<UserPlusIcon className="w-3.5 h-3.5" />}
                onClick={() => setIsAssignMembersOpen(true)}
              >
                Assign Athletes
              </Button>
            </div>
          </div>

          {filteredAssignedMembers.length === 0 ? (
            <EmptyState
              title="No athletes assigned"
              description={
                memberSearchQuery
                  ? 'No assigned athlete matches your search.'
                  : 'Assign gym members to this coach to manage training routines, nutrition schedules, and generate trainer commission revenue.'
              }
              actionLabel="Assign First Member"
              onAction={() => setIsAssignMembersOpen(true)}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-5 py-3.5">Athlete</th>
                      <th className="px-5 py-3.5">Contact Info</th>
                      <th className="px-5 py-3.5">Membership Plan</th>
                      <th className="px-5 py-3.5">Membership Status</th>
                      <th className="px-5 py-3.5">Assigned On</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAssignedMembers.map((member) => {
                      const activeMembership = (memberships || []).find(
                        (m) => m.memberId === member.id && m.status === 'Active'
                      );
                      const plan = activeMembership
                        ? (plans || []).find((p) => p.id === activeMembership.planId)
                        : null;
                      const assignment = (trainerAssignments || []).find(
                        (a) => a.trainerId === trainer.id && a.memberId === member.id
                      );

                      return (
                        <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar src={member.profilePhoto} name={member.fullName} size="md" />
                              <div>
                                <Link
                                  to={`/members/${member.id}`}
                                  className="font-bold text-slate-900 hover:text-indigo-600"
                                >
                                  {member.fullName}
                                </Link>
                                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                                  {member.id}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="space-y-0.5">
                              <p className="font-medium text-slate-900">{member.phone}</p>
                              <p className="text-[11px] text-slate-400">{member.email}</p>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            {plan ? (
                              <div>
                                <span className="font-bold text-slate-900 block">{plan.name}</span>
                                <span className="text-[11px] text-indigo-600 font-semibold">
                                  {formatCurrency(plan.price)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No Active Plan</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge
                              variant={
                                member.status === 'Active'
                                  ? 'success'
                                  : member.status === 'Expiring Soon'
                                  ? 'warning'
                                  : 'neutral'
                              }
                              size="sm"
                            >
                              {member.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 font-medium">
                            {assignment ? new Date(assignment.assignedDate).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link to={`/members/${member.id}`}>
                                <Button size="sm" variant="outline" className="text-xs">
                                  View
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                title="Unassign Athlete"
                                onClick={() => setUnassignMemberId(member.id)}
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </Button>
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

      {/* Tab 2: Payroll & Salary Information (NEW & COMPREHENSIVE) */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {/* Header Bar with Month Filter and Action Buttons */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <DollarSign className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Coach Compensation & Commission Breakdown
                  </h2>
                  <p className="text-xs text-slate-500">
                    Calculated salary, assigned member payment commissions, bonuses, and net payout.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-600">Payroll Cycle:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  {(availableMonths || ['March 2025', 'February 2025', 'January 2025']).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <Link to="/payroll/commissions">
                <Button size="sm" variant="outline" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                  Commissions Module
                </Button>
              </Link>
              <Link to="/payroll/slips">
                <Button size="sm" variant="outline" icon={<Receipt className="w-3.5 h-3.5" />}>
                  Salary Slips
                </Button>
              </Link>
              <Button
                size="sm"
                variant="primary"
                icon={<Edit2 className="w-3.5 h-3.5" />}
                onClick={() => setIsEditTrainerOpen(true)}
              >
                Edit Salary Terms
              </Button>
            </div>
          </div>

          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Salary Type & Base */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                1. Salary Type & Base
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-slate-900">
                  {effectiveSalaryType}
                </span>
                <Badge variant="info" size="sm">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-slate-600 pt-1 border-t border-slate-100">
                {effectiveSalaryType === 'Fixed Salary' && `Fixed Base: ${formatCurrency(monthlyPayroll?.baseSalary || trainer.salary || 0)}/mo`}
                {effectiveSalaryType === 'Percentage / Commission' && `Rate: ${effectiveCommissionPercentage}% of eligible fees`}
                {effectiveSalaryType === 'Fixed + Percentage' && `Base ${formatCurrency(monthlyPayroll?.baseSalary || trainer.salary || 0)} + ${effectiveCommissionPercentage}% Comm.`}
                {(effectiveSalaryType === 'Attendance-Based Salary' || (effectiveSalaryType as string) === 'Attendance Based') && `Attendance Based (${trainer.workingDaysPerMonth || 26} days/mo)`}
                {effectiveSalaryType === 'Hourly / Daily' && `Hourly: ${formatCurrency(trainer.hourlyRate || 0)} | Daily: ${formatCurrency(trainer.dailyRate || 0)}`}
              </p>
            </div>

            {/* Card 2: Assigned Members & Eligible Revenue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">
                2. Eligible Revenue ({selectedMonth.split(' ')[0]})
              </span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-indigo-700">
                  {formatCurrency(monthlyPayroll?.eligibleRevenue || 0)}
                </span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {assignedMemberList.length} Assigned
                </span>
              </div>
              <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">
                Basis: <span className="font-medium text-slate-700">{effectiveCommissionBasis}</span>
              </p>
            </div>

            {/* Card 3: Calculated Commission */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                3. Calculated Commission
              </span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-emerald-600">
                  {formatCurrency(monthlyPayroll?.commissionAmount || 0)}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {effectiveCommissionPercentage}%
                </span>
              </div>
              <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">
                Formula: {formatCurrency(monthlyPayroll?.eligibleRevenue || 0)} × {effectiveCommissionPercentage}%
              </p>
            </div>

            {/* Card 4: Net Pay & Payment Status */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 bg-radial from-emerald-50/20 to-white">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                4. Net Pay ({selectedMonth.split(' ')[0]})
              </span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-slate-900">
                  {formatCurrency(monthlyPayroll?.netSalary || 0)}
                </span>
                <Badge
                  variant={
                    monthlyPayroll?.status === 'Paid'
                      ? 'success'
                      : monthlyPayroll?.status === 'Approved'
                      ? 'info'
                      : 'warning'
                  }
                  size="md"
                >
                  {monthlyPayroll?.status || 'Pending'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span>Bonuses: +{formatCurrency(monthlyPayroll?.bonusAmount || 0)}</span>
                <span>Deductions: -{formatCurrency((monthlyPayroll?.totalDeductions || 0) + (monthlyPayroll?.advanceDeduction || 0))}</span>
              </div>
            </div>
          </div>

          {/* Formula Card */}
          <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-indigo-600" />
              Compensation Math Breakdown ({selectedMonth})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-200">
              <div className="space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Fixed Base</span>
                <span className="font-bold text-slate-800">{formatCurrency(monthlyPayroll?.baseSalary || 0)}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">+ Commission ({effectiveCommissionPercentage}%)</span>
                <span className="font-bold text-emerald-600">{formatCurrency(monthlyPayroll?.commissionAmount || 0)}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">+ Bonus</span>
                <span className="font-bold text-indigo-600">{formatCurrency(monthlyPayroll?.bonusAmount || 0)}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">- Deductions / Adv.</span>
                <span className="font-bold text-rose-600">
                  {formatCurrency((monthlyPayroll?.totalDeductions || 0) + (monthlyPayroll?.advanceDeduction || 0))}
                </span>
              </div>
              <div className="space-y-0.5 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <span className="text-emerald-800 text-[10px] uppercase font-black block">= Net Salary Payout</span>
                <span className="font-black text-emerald-700 text-sm">{formatCurrency(monthlyPayroll?.netSalary || 0)}</span>
              </div>
            </div>
          </div>

          {/* Assigned Members Payment Breakdown Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-600" />
                  Assigned Members' Membership Payments & Commission Share
                </h3>
                <p className="text-xs text-slate-500">
                  All paid athlete invoices generating commission in {selectedMonth}.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {memberCommissions.length} Transactions Found
              </span>
            </div>

            {memberCommissions.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
                <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">No Payment Transactions Recorded Yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  When assigned members pay their membership fees in {selectedMonth}, commission shares will automatically appear here.
                </p>
                <div className="pt-2">
                  <Link to="/billing">
                    <Button size="sm" variant="outline">
                      Record Member Fee in Billing
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-5 py-3.5">Assigned Member</th>
                        <th className="px-5 py-3.5">Plan / Description</th>
                        <th className="px-5 py-3.5">Payment Date</th>
                        <th className="px-5 py-3.5">Invoice Amount</th>
                        <th className="px-5 py-3.5">Paid Amount</th>
                        <th className="px-5 py-3.5">Commission %</th>
                        <th className="px-5 py-3.5">Coach Share</th>
                        <th className="px-5 py-3.5">Gym Share</th>
                        <th className="px-5 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {memberCommissions.map((comm) => (
                        <tr key={comm.paymentId || comm.receiptNumber} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <Avatar name={comm.memberName} size="xs" />
                              <span>{comm.memberName}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-medium text-slate-800 block">{comm.planName}</span>
                            <span className="text-[10px] font-mono text-slate-400">{comm.receiptNumber}</span>
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-600">{comm.paymentDate}</td>
                          <td className="px-5 py-3.5 font-semibold text-slate-700">
                            {formatCurrency(comm.invoiceAmount)}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-indigo-600">
                            {formatCurrency(comm.paymentAmount)}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-800">
                            {comm.commissionPercentage}%
                          </td>
                          <td className="px-5 py-3.5 font-black text-emerald-600">
                            {formatCurrency(comm.trainerShare)}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-500">
                            {formatCurrency(comm.gymShare)}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge
                              variant={comm.status === 'Eligible' ? 'success' : 'neutral'}
                              size="sm"
                            >
                              {comm.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                      <tr>
                        <td className="px-5 py-3.5" colSpan={4}>
                          Total Eligible Revenue:
                        </td>
                        <td className="px-5 py-3.5 font-black text-indigo-700">
                          {formatCurrency(
                            memberCommissions.reduce((acc, c) => acc + c.paymentAmount, 0)
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400">—</td>
                        <td className="px-5 py-3.5 font-black text-emerald-700">
                          {formatCurrency(
                            memberCommissions.reduce((acc, c) => acc + c.trainerShare, 0)
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-700">
                          {formatCurrency(
                            memberCommissions.reduce((acc, c) => acc + c.gymShare, 0)
                          )}
                        </td>
                        <td className="px-5 py-3.5"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Workouts */}
      {activeTab === 'workouts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Workout Programs</h3>
              <p className="text-xs text-slate-500">
                Exercise regimens and split routines tailored for assigned athletes.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setWorkoutToEdit(null);
                setSelectedMemberForWorkout(assignedMemberList[0]?.id || undefined);
                setIsWorkoutModalOpen(true);
              }}
            >
              Add Workout Routine
            </Button>
          </div>

          {trainerWorkouts.length === 0 ? (
            <EmptyState
              title="No workout routines"
              description="This coach hasn't authored any customized workout splits yet."
              actionLabel="Create Workout Routine"
              onAction={() => {
                setWorkoutToEdit(null);
                setSelectedMemberForWorkout(assignedMemberList[0]?.id || undefined);
                setIsWorkoutModalOpen(true);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainerWorkouts.map((wp) => {
                const athlete = members.find((m) => m.id === wp.memberId);

                return (
                  <div
                    key={wp.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{wp.title}</h4>
                          <span className="text-[11px] font-semibold text-indigo-600 block mt-0.5">
                            {wp.goal}
                          </span>
                        </div>
                        <Badge variant="info" size="sm">
                          {wp.difficulty}
                        </Badge>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Target Athlete:</span>
                          <span className="font-bold text-slate-900">
                            {athlete?.fullName || 'General / Unassigned'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Duration / Frequency:</span>
                          <span className="font-medium text-slate-800">
                            {wp.durationWeeks} Weeks • {wp.daysPerWeek || 4} Days/wk
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Exercises Logged:</span>
                          <span className="font-medium text-indigo-600">
                            {wp.exercises?.length || 0} movements
                          </span>
                        </div>
                      </div>

                      {wp.notes && (
                        <p className="text-xs text-slate-500 italic line-clamp-2">"{wp.notes}"</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <span className="text-slate-400 text-[11px]">
                        Updated {new Date(wp.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setWorkoutToEdit(wp);
                            setIsWorkoutModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() => setDeleteWorkoutId(wp.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Diet Plans */}
      {activeTab === 'diets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Nutrition Programs</h3>
              <p className="text-xs text-slate-500">
                Macronutrient guidelines and meal structures prescribed by this coach.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setDietToEdit(null);
                setSelectedMemberForDiet(assignedMemberList[0]?.id || undefined);
                setIsDietModalOpen(true);
              }}
            >
              Add Diet Plan
            </Button>
          </div>

          {trainerDiets.length === 0 ? (
            <EmptyState
              title="No diet programs"
              description="This coach hasn't logged any nutritional meal schedules yet."
              actionLabel="Prescribe Diet Plan"
              onAction={() => {
                setDietToEdit(null);
                setSelectedMemberForDiet(assignedMemberList[0]?.id || undefined);
                setIsDietModalOpen(true);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainerDiets.map((dp) => {
                const athlete = members.find((m) => m.id === dp.memberId);

                return (
                  <div
                    key={dp.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{dp.title}</h4>
                          <span className="text-[11px] font-semibold text-teal-600 block mt-0.5">
                            {dp.goal}
                          </span>
                        </div>
                        <Badge variant="success" size="sm">
                          {dp.dailyCalories} kcal
                        </Badge>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Target Athlete:</span>
                          <span className="font-bold text-slate-900">
                            {athlete?.fullName || 'General / Unassigned'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-1 text-center font-semibold text-[11px]">
                          <div className="bg-white p-1.5 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">Protein</span>
                            <span className="text-slate-900">{dp.proteinGrams || 160}g</span>
                          </div>
                          <div className="bg-white p-1.5 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">Carbs</span>
                            <span className="text-slate-900">{dp.carbsGrams || 220}g</span>
                          </div>
                          <div className="bg-white p-1.5 rounded border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">Fats</span>
                            <span className="text-slate-900">{dp.fatsGrams || 65}g</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <span className="text-slate-400 text-[11px]">
                        Updated {new Date(dp.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setDietToEdit(dp);
                            setIsDietModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() => setDeleteDietId(dp.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Attendance */}
      {activeTab === 'attendance' && (() => {
        const coachAttendanceLogs = getAttendanceForPerson(trainer.id, selectedMonth);
        const coachSummary = getAttendanceSummary(trainer.id, selectedMonth, 26);
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecord = (attendance || []).find(
          (a) => a.personId === trainer.id && a.date === todayStr
        );
        const isCurrentlyCheckedIn = todayRecord && !todayRecord.checkOutTime && todayRecord.status !== 'Absent' && todayRecord.status !== 'Leave';

        return (
          <div className="space-y-6">
            {/* Coach's Own Duty Attendance Section */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-indigo-600" />
                    Coach Duty Attendance Ledger ({selectedMonth})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official shift records used for attendance verification and attendance-based salary calculations.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!todayRecord ? (
                    <Button
                      size="sm"
                      variant="primary"
                      icon={<LogIn className="w-3.5 h-3.5" />}
                      onClick={() => markCheckIn(trainer.id, 'Trainer')}
                    >
                      Check In Today
                    </Button>
                  ) : isCurrentlyCheckedIn ? (
                    <Button
                      size="sm"
                      variant="outline"
                      icon={<LogOut className="w-3.5 h-3.5" />}
                      onClick={() => markCheckOut(todayRecord.id)}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      Check Out
                    </Button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      ✓ Completed Shift Today
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => setIsAttendanceModalOpen(true)}
                  >
                    Log Date / Shift
                  </Button>
                </div>
              </div>

              {/* Attendance KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/80">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Present Days</span>
                  <span className="text-xl font-extrabold text-emerald-700 mt-0.5 block">{coachSummary.presentDays}</span>
                  <span className="text-[10px] text-emerald-600 mt-0.5 block">Shifts completed</span>
                </div>
                <div className="bg-orange-50/60 p-3 rounded-xl border border-orange-200/80">
                  <span className="text-[10px] font-bold text-orange-800 uppercase block">Late Days</span>
                  <span className="text-xl font-extrabold text-orange-700 mt-0.5 block">{coachSummary.lateDays}</span>
                  <span className="text-[10px] text-orange-600 mt-0.5 block">Turnstile late</span>
                </div>
                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/80">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Approved Leaves</span>
                  <span className="text-xl font-extrabold text-amber-700 mt-0.5 block">{coachSummary.leaveDays}</span>
                  <span className="text-[10px] text-amber-600 mt-0.5 block">Paid / excused</span>
                </div>
                <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-200/80">
                  <span className="text-[10px] font-bold text-rose-800 uppercase block">Absences</span>
                  <span className="text-xl font-extrabold text-rose-700 mt-0.5 block">{coachSummary.absentDays}</span>
                  <span className="text-[10px] text-rose-600 mt-0.5 block">Unexcused</span>
                </div>
                <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-200/80">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase block">Attendance Rate</span>
                  <span className="text-xl font-extrabold text-indigo-700 mt-0.5 block">{coachSummary.attendancePercentage}%</span>
                  <span className="text-[10px] text-indigo-600 mt-0.5 block">Of 26 working days</span>
                </div>
              </div>

              {/* Coach Shift History Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                {coachAttendanceLogs.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-500">
                    No duty shifts logged for {selectedMonth} yet.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-2.5">Date</th>
                        <th className="px-4 py-2.5">Check-In</th>
                        <th className="px-4 py-2.5">Check-Out</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5">Duty Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {coachAttendanceLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2.5 font-bold text-slate-900">{log.date}</td>
                          <td className="px-4 py-2.5 font-medium text-indigo-600">{log.checkInTime || '-'}</td>
                          <td className="px-4 py-2.5 text-slate-500">{log.checkOutTime || (log.status === 'Present' ? 'Active On Floor' : '-')}</td>
                          <td className="px-4 py-2.5">
                            <Badge variant={log.status === 'Present' ? 'success' : log.status === 'Late' ? 'warning' : log.status === 'Leave' ? 'info' : 'danger'} size="sm">
                              {log.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-slate-500 italic truncate max-w-xs">{log.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Assigned Athletes Turnstile Check-Ins */}
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="font-bold text-slate-900 text-sm">Assigned Athlete Turnstile Check-Ins</h3>
                <p className="text-xs text-slate-500">
                  Live facility turnstile check-ins from athletes assigned to this coach.
                </p>
              </div>

              {assignedAttendanceLogs.length === 0 ? (
                <EmptyState
                  title="No recent attendance logs"
                  description="Assigned members have not checked in through the turnstile recently."
                />
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="px-5 py-3.5">Athlete</th>
                          <th className="px-5 py-3.5">Date</th>
                          <th className="px-5 py-3.5">Check-In Time</th>
                          <th className="px-5 py-3.5">Check-Out Time</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Profile</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {assignedAttendanceLogs.map((log) => {
                          const athlete = members.find((m) => m.id === log.memberId);

                          return (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-5 py-3.5">
                                {athlete ? (
                                  <div className="flex items-center gap-2.5">
                                    <Avatar src={athlete.profilePhoto} name={athlete.fullName} size="sm" />
                                    <div>
                                      <span className="font-bold text-slate-900 block">{athlete.fullName}</span>
                                      <span className="text-[10px] font-mono text-slate-400">{athlete.id}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="font-mono text-slate-400">{log.memberId}</span>
                                )}
                              </td>
                              <td className="px-5 py-3.5 font-medium">{log.date}</td>
                              <td className="px-5 py-3.5 font-bold text-indigo-600">{log.checkInTime}</td>
                              <td className="px-5 py-3.5 text-slate-500">{log.checkOutTime || '— In Session —'}</td>
                              <td className="px-5 py-3.5">
                                <Badge variant={log.status === 'Present' ? 'success' : 'warning'} size="sm">
                                  {log.status}
                                </Badge>
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                {athlete && (
                                  <Link to={`/members/${athlete.id}`}>
                                    <Button size="sm" variant="ghost" className="text-xs">
                                      View
                                    </Button>
                                  </Link>
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
          </div>
        );
      })()}

      {/* Tab 6: Coach Credentials & Bio */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Professional Record */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Coach Credentials & Bio
              </h3>

              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>{trainer.bio || 'No detailed biography provided for this coach.'}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">
                    Specialty Certification
                  </span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                    {trainer.specialization}
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">
                    Years Coaching
                  </span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                    {trainer.experience || 3} Years Active Experience
                  </span>
                </div>
              </div>
            </div>

            {/* Compensation & Contract */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Compensation & Payroll Structure
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-center">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                    Salary Type
                  </span>
                  <span className="text-base font-black text-emerald-700 mt-1 block">
                    {effectiveSalaryType}
                  </span>
                  <span className="text-[10px] text-emerald-600 mt-0.5 block">
                    {effectiveSalaryType === 'Fixed Salary'
                      ? `${formatCurrency(trainer.salary)} / mo`
                      : `${effectiveCommissionPercentage}% Commission`}
                  </span>
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-center">
                  <span className="text-[11px] font-bold text-indigo-800 uppercase block">
                    Client Roster
                  </span>
                  <span className="text-xl font-black text-indigo-700 mt-1 block">
                    {assignedMemberList.length} Athletes
                  </span>
                  <span className="text-[10px] text-indigo-600 mt-0.5 block">Active Assignments</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                  <span className="text-[11px] font-bold text-slate-600 uppercase block">
                    Hire Date
                  </span>
                  <span className="text-base font-bold text-slate-900 mt-1 block">
                    {new Date(trainer.joiningDate).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Contract Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick Contact & Metadata */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-slate-900">Coach Contact Details</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">
                      Direct Phone
                    </span>
                    <a href={`tel:${trainer.phone}`} className="font-bold text-slate-900 hover:text-indigo-600">
                      {trainer.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${trainer.email}`}
                      className="font-bold text-slate-900 hover:text-indigo-600 truncate block"
                    >
                      {trainer.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">
                      Account Status
                    </span>
                    <span className="font-bold text-emerald-600">{trainer.status}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  icon={<Edit2 className="w-4 h-4" />}
                  onClick={() => setIsEditTrainerOpen(true)}
                >
                  Edit Information
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Trainer Modal */}
      <TrainerModal
        isOpen={isEditTrainerOpen}
        onClose={() => setIsEditTrainerOpen(false)}
        trainerToEdit={trainer}
      />

      {/* Assign Members Modal */}
      <AssignMembersToTrainerModal
        isOpen={isAssignMembersOpen}
        onClose={() => setIsAssignMembersOpen(false)}
        trainer={trainer}
      />

      {/* Workout Plan Modal */}
      <WorkoutPlanModal
        isOpen={isWorkoutModalOpen}
        onClose={() => {
          setIsWorkoutModalOpen(false);
          setWorkoutToEdit(null);
          setSelectedMemberForWorkout(undefined);
        }}
        planToEdit={workoutToEdit}
        defaultMemberId={selectedMemberForWorkout}
        defaultTrainerId={trainer.id}
      />

      {/* Diet Plan Modal */}
      <DietPlanModal
        isOpen={isDietModalOpen}
        onClose={() => {
          setIsDietModalOpen(false);
          setDietToEdit(null);
          setSelectedMemberForDiet(undefined);
        }}
        planToEdit={dietToEdit}
        defaultMemberId={selectedMemberForDiet}
        defaultTrainerId={trainer.id}
      />

      {/* Unassign Confirmation */}
      <ConfirmDialog
        isOpen={!!unassignMemberId}
        onClose={() => setUnassignMemberId(null)}
        onConfirm={handleConfirmUnassign}
        title="Unassign Athlete"
        message="Are you sure you want to remove this athlete from this coach's roster? The athlete's membership and workout plans will be retained."
      />

      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        defaultPersonType="Trainer"
        defaultPersonId={trainer.id}
      />

      {/* Delete Workout Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteWorkoutId}
        onClose={() => setDeleteWorkoutId(null)}
        onConfirm={handleConfirmDeleteWorkout}
        title="Delete Workout Routine"
        message="Are you sure you want to delete this workout routine? This action cannot be undone."
      />

      {/* Delete Diet Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteDietId}
        onClose={() => setDeleteDietId(null)}
        onConfirm={handleConfirmDeleteDiet}
        title="Delete Nutrition Plan"
        message="Are you sure you want to delete this nutrition plan? This action cannot be undone."
      />
    </div>
  );
};

function UserPlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
}
