import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  MapPin,
  HeartHandshake,
  CreditCard,
  CalendarCheck,
  Dumbbell,
  Apple,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Receipt,
  Plus,
  Clock,
  Award,
  RefreshCw,
  UserCheck,
  Activity,
  Flame,
  Droplets,
  DollarSign,
  AlertCircle,
  ShieldAlert,
  Printer,
} from 'lucide-react';
import { useGym } from '../context/GymContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { MemberModal } from '../components/members/MemberModal';
import { ReceiptModal } from '../components/payments/ReceiptModal';
import { PaymentModal } from '../components/payments/PaymentModal';
import { AssignMembershipModal } from '../components/memberships/AssignMembershipModal';
import { AssignTrainerModal } from '../components/trainers/AssignTrainerModal';
import { WorkoutPlanModal } from '../components/fitness/WorkoutPlanModal';
import { DietPlanModal } from '../components/fitness/DietPlanModal';
import { AttendanceModal } from '../components/attendance/AttendanceModal';
import { PrintMemberProfileModal } from '../components/members/PrintMemberProfileModal';
import { Payment } from '../types';

export const MemberProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getMember,
    memberships,
    payments,
    attendance,
    workoutPlans,
    dietPlans,
    trainers,
    assignments,
    getPlan,
    markCheckIn,
    markCheckOut,
    deleteMember,
    formatCurrency,
  } = useGym();

  const member = id ? getMember(id) : undefined;

  const [activeTab, setActiveTab] = useState<
    'overview' | 'membership' | 'payments' | 'attendance' | 'workout' | 'diet'
  >('overview');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isDietModalOpen, setIsDietModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isPrintProfileModalOpen, setIsPrintProfileModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = (attendance || []).find(
    (a) => (a.personId === member?.id || a.memberId === member?.id) && a.date === todayStr
  );
  const isMemberCheckedInToday = todayAttendance && !todayAttendance.checkOutTime && todayAttendance.status !== 'Absent' && todayAttendance.status !== 'Leave';

  if (!member) {
    return (
      <div className="space-y-6">
        <Link to="/members">
          <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Members
          </Button>
        </Link>
        <EmptyState
          title="Member Not Found"
          description={`No registered athlete found with ID "${id}". It may have been removed.`}
          actionLabel="View All Members"
          onAction={() => navigate('/members')}
        />
      </div>
    );
  }

  // Related Member Data
  const memberMemberships = (memberships || []).filter((ms) => ms.memberId === member.id);
  const currentMembership = memberMemberships[0]; // most recent
  const currentPlan = currentMembership ? getPlan(currentMembership.planId) : undefined;

  const memberPayments = (payments || []).filter((p) => p.memberId === member.id);
  const totalPaid = memberPayments.reduce((acc, p) => acc + p.amount, 0);

  const memberAttendance = (attendance || []).filter((a) => a.memberId === member.id);
  const lastAttendance = memberAttendance[0];

  const memberWorkout = (workoutPlans || []).find((w) => w.memberId === member.id);
  const memberDiet = (dietPlans || []).find((d) => d.memberId === member.id);

  const memberAssignment = (assignments || []).find((a) => a.memberId === member.id);
  const assignedTrainer = memberAssignment
    ? (trainers || []).find((t) => t.id === memberAssignment.trainerId)
    : memberWorkout
    ? (trainers || []).find((t) => t.id === memberWorkout.trainerId)
    : undefined;

  const handleDeleteConfirm = () => {
    deleteMember(member.id);
    navigate('/members');
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Back Link & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/members">
            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Athlete Profile
              <span className="text-xs font-mono font-bold text-slate-400">({member.id})</span>
            </h1>
            <p className="text-xs text-slate-500">
              Complete account management, subscriptions, diet, workout splits & payment ledger.
            </p>
          </div>
        </div>

        {/* Quick Action Button Group */}
        <div className="flex flex-wrap items-center gap-2">
          {!todayAttendance ? (
            <Button
              size="sm"
              variant="outline"
              className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
              icon={<CalendarCheck className="w-3.5 h-3.5" />}
              onClick={() => markCheckIn(member.id, 'Member')}
            >
              Check-In Now
            </Button>
          ) : isMemberCheckedInToday ? (
            <Button
              size="sm"
              variant="outline"
              className="text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200"
              icon={<CalendarCheck className="w-3.5 h-3.5" />}
              onClick={() => markCheckOut(todayAttendance.id)}
            >
              Check-Out ({todayAttendance.checkInTime})
            </Button>
          ) : (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
              ✓ Checked In Today ({todayAttendance.checkInTime} - {todayAttendance.checkOutTime || ''})
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            className="text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-300"
            icon={<Printer className="w-3.5 h-3.5" />}
            onClick={() => setIsPrintProfileModalOpen(true)}
          >
            Print Profile
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
            icon={<CreditCard className="w-3.5 h-3.5" />}
            onClick={() => setIsPaymentModalOpen(true)}
          >
            Record Payment
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => setIsRenewModalOpen(true)}
          >
            Renew Plan
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Edit2 className="w-3.5 h-3.5" />}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-rose-600 hover:bg-rose-50 border-rose-200"
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => setIsDeleteConfirmOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
            {/* Photo and Primary Identity */}
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <Avatar
                  src={member.profilePhoto}
                  name={member.fullName}
                  size="xl"
                  className="ring-4 ring-slate-100 shadow-md w-20 h-20 sm:w-24 sm:h-24"
                />
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full shadow-sm hover:bg-indigo-700 transition-colors"
                  title="Change Photo"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {member.fullName}
                  </h2>
                  <Badge
                    variant={
                      member.status === 'Active'
                        ? 'success'
                        : member.status === 'Expiring Soon'
                        ? 'warning'
                        : 'danger'
                    }
                    size="sm"
                  >
                    {member.status}
                  </Badge>
                </div>

                {member.guardianName && member.guardianName !== 'N/A' && (
                  <p className="text-xs text-slate-500 font-medium">
                    Guardian: {member.guardianName}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {member.phone}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {member.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Joined: {member.joinDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Balance & Dues Display */}
            {currentMembership && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 min-w-[220px] text-right sm:text-left md:text-right space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Current Plan
                </span>
                <span className="font-extrabold text-sm text-slate-900 block">
                  {currentMembership.customPlanName || (currentPlan ? currentPlan.name : 'Active Plan')}
                </span>
                <div className="pt-1">
                  {currentMembership.remaining > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                      <AlertCircle className="w-3 h-3" />
                      Due: {formatCurrency(currentMembership.remaining)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                      <CheckCircle className="w-3 h-3" />
                      Paid in Full
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-t border-slate-200 bg-slate-50/70 px-4">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'membership', label: 'Membership & Renewal', icon: Award },
            { id: 'payments', label: 'Payments & Receipts', icon: CreditCard },
            { id: 'attendance', label: 'Attendance Log', icon: CalendarCheck },
            { id: 'workout', label: 'Workout Plan', icon: Dumbbell },
            { id: 'diet', label: 'Diet & Nutrition', icon: Apple },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENTS */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Key Details & Quick Summaries */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Check-Ins</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">
                  {memberAttendance.length}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Last: {lastAttendance ? lastAttendance.date : 'None'}
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Paid to Date</span>
                <span className="text-xl font-black text-emerald-600 mt-1 block">
                  {formatCurrency(totalPaid)}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {memberPayments.length} transactions
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Assigned Coach</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block truncate">
                  {assignedTrainer ? assignedTrainer.name : 'Unassigned'}
                </span>
                <span className="text-[10px] text-indigo-600 mt-0.5 block truncate">
                  {assignedTrainer ? assignedTrainer.specialization : '1-on-1 Guidance'}
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Fitness Goal</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block truncate">
                  {memberWorkout?.goal || memberDiet?.goal || 'General Health'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {memberWorkout?.workoutDays.length || 3} days/wk
                </span>
              </div>
            </div>

            {/* Athlete Bio & Personal Information */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">Personal Information</h3>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Info
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block font-medium">Date of Birth</span>
                  <span className="text-slate-800 font-bold text-sm mt-0.5 block">
                    {member.dob || 'Not specified'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block font-medium">Gender</span>
                  <span className="text-slate-800 font-bold text-sm mt-0.5 block">
                    {member.gender}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg sm:col-span-2">
                  <span className="text-slate-400 block font-medium">Physical Address</span>
                  <span className="text-slate-800 font-bold text-sm mt-0.5 block flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {member.address || 'Address on file at facility'}
                  </span>
                </div>
              </div>
            </div>

            {/* Health & Medical Notes */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
              <h3 className="text-sm font-extrabold text-slate-900">Health & Medical Notes</h3>
              <p className="text-xs text-slate-600 bg-amber-50/60 p-3.5 rounded-lg border border-amber-200/60 leading-relaxed">
                {member.notes || 'No special medical conditions, chronic illnesses, or dietary allergies reported.'}
              </p>
            </div>
          </div>

          {/* Right Col: Emergency Contact & Assigned Coach Card */}
          <div className="space-y-6">
            {/* Emergency Contact */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-extrabold text-slate-900">Emergency Contact</h3>
              </div>
              <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-lg space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">
                    {member.emergencyContact.name}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded">
                    {member.emergencyContact.relation}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 pt-1 font-medium">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {member.emergencyContact.phone}
                </div>
              </div>
            </div>

            {/* Assigned Coach Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">Assigned Coach</h3>
                <button
                  onClick={() => setIsTrainerModalOpen(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  {assignedTrainer ? 'Change Coach' : 'Assign Coach'}
                </button>
              </div>

              {assignedTrainer ? (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <Avatar src={assignedTrainer.photo} name={assignedTrainer.name} size="md" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{assignedTrainer.name}</h4>
                    <p className="text-xs text-indigo-600 font-medium">
                      {assignedTrainer.specialization}
                    </p>
                    <p className="text-[11px] text-slate-400">{assignedTrainer.phone}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 space-y-2">
                  <p className="text-xs text-slate-500">No personal coach assigned to this member.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsTrainerModalOpen(true)}
                    className="text-xs"
                  >
                    Assign Coach Now
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. MEMBERSHIP TAB */}
      {activeTab === 'membership' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">Membership Packages & Subscriptions</h3>
            <Button
              size="sm"
              variant="primary"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => setIsRenewModalOpen(true)}
            >
              Renew / Assign New Package
            </Button>
          </div>

          {memberMemberships.length === 0 ? (
            <EmptyState
              title="No Membership Assigned"
              description="This member currently does not have any active or past membership subscription."
              actionLabel="Assign Membership Plan"
              onAction={() => setIsRenewModalOpen(true)}
            />
          ) : (
            <div className="space-y-4">
              {memberMemberships.map((ms, idx) => {
                const plan = getPlan(ms.planId);
                const isDue = ms.remaining > 0;

                return (
                  <div
                    key={ms.id ? `ms-${ms.id}` : `ms-idx-${idx}`}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base text-slate-900">
                            {ms.customPlanName || (plan ? plan.name : 'Custom Plan')}
                          </span>
                          <Badge
                            variant={
                              ms.status === 'Active'
                                ? 'success'
                                : ms.status === 'Expiring Soon'
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {ms.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-400">
                          Period: {ms.startDate} to {ms.endDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isDue ? (
                          <span className="px-3 py-1 bg-rose-50 text-rose-700 font-bold text-xs rounded-lg border border-rose-200">
                            Due: {formatCurrency(ms.remaining)}
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200">
                            ✓ Fully Settled
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsPaymentModalOpen(true)}
                          className="text-xs"
                        >
                          Record Payment
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-400 block font-medium">Plan Fee</span>
                        <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                          {formatCurrency(ms.amount)}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-400 block font-medium">Admission Fee</span>
                        <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                          {formatCurrency(ms.admissionFee || 0)}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-400 block font-medium">Amount Paid</span>
                        <span className="font-bold text-emerald-600 text-sm mt-0.5 block">
                          {formatCurrency(ms.paid)}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-400 block font-medium">Remaining Due</span>
                        <span className={`font-bold text-sm mt-0.5 block ${isDue ? 'text-rose-600' : 'text-slate-700'}`}>
                          {formatCurrency(ms.remaining)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. PAYMENTS TAB */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">Payment Ledger & Receipts</h3>
            <Button
              size="sm"
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsPaymentModalOpen(true)}
            >
              + Record Payment
            </Button>
          </div>

          {memberPayments.length === 0 ? (
            <EmptyState
              title="No Payment Records"
              description="No financial transactions recorded for this athlete yet."
              actionLabel="Record Payment"
              onAction={() => setIsPaymentModalOpen(true)}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Receipt #</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Amount</th>
                    <th className="px-4 py-3.5">Payment Method</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Invoice / Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {memberPayments.map((p, idx) => (
                    <tr
                      key={p.receiptNumber ? `pmt-${p.receiptNumber}` : (p as any).id ? `pmt-${(p as any).id}` : `pmt-idx-${idx}`}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                        {p.receiptNumber || (p as any).id || `RCP-${idx + 1}`}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">
                        {p.date}
                      </td>
                      <td className="px-4 py-3.5 font-black text-slate-900 text-sm">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">
                        {p.paymentMethod}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={
                            p.status === 'Paid'
                              ? 'success'
                              : p.status === 'Pending'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<Receipt className="w-3.5 h-3.5" />}
                          onClick={() => setSelectedReceipt(p)}
                          className="text-xs py-1"
                        >
                          Print Receipt
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. ATTENDANCE TAB */}
      {activeTab === 'attendance' && (() => {
        const memberLogs = (attendance || []).filter(
          (a) => a.personId === member.id || a.memberId === member.id
        ).sort((a, b) => b.date.localeCompare(a.date));

        const currentMonthPrefix = todayStr.substring(0, 7);
        const thisMonthVisits = memberLogs.filter((a) => a.date.startsWith(currentMonthPrefix) && (a.status === 'Present' || a.status === 'Late')).length;

        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Athlete Facility Attendance</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live turnstile check-ins, facility access history, and session duration logs.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!todayAttendance ? (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<CalendarCheck className="w-4 h-4" />}
                    onClick={() => markCheckIn(member.id, 'Member')}
                  >
                    Check In Today
                  </Button>
                ) : isMemberCheckedInToday ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    icon={<CalendarCheck className="w-4 h-4" />}
                    onClick={() => markCheckOut(todayAttendance.id)}
                  >
                    Check Out Now
                  </Button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    ✓ Session Done Today
                  </span>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsAttendanceModalOpen(true)}
                >
                  Log Custom Date
                </Button>
              </div>
            </div>

            {/* Attendance Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Facility Visits</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{memberLogs.length}</span>
                <span className="text-xs text-slate-500 mt-0.5 block">Lifetime check-ins</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Visits This Month</span>
                <span className="text-2xl font-black text-indigo-600 mt-1 block">{thisMonthVisits}</span>
                <span className="text-xs text-indigo-500 mt-0.5 block">Active workout consistency</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Current Status</span>
                <span className="text-lg font-bold text-emerald-600 mt-1 block">
                  {isMemberCheckedInToday ? 'In Facility (Active)' : 'Checked Out'}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  {isMemberCheckedInToday ? `Since ${todayAttendance.checkInTime}` : 'Turnstile idle'}
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Membership Validity</span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">
                  {currentMembership?.status || 'No Plan'}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  {currentMembership?.endDate ? `Expires ${currentMembership.endDate}` : 'N/A'}
                </span>
              </div>
            </div>

            {memberLogs.length === 0 ? (
              <EmptyState
                title="No Attendance History"
                description="Athlete has not checked in to the facility yet."
                actionLabel="Mark First Check-In"
                onAction={() => markCheckIn(member.id, 'Member')}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Log ID</th>
                      <th className="px-4 py-3.5">Date</th>
                      <th className="px-4 py-3.5">Check-In Time</th>
                      <th className="px-4 py-3.5">Check-Out Time</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {memberLogs.map((a, idx) => (
                      <tr
                        key={a.id ? `att-${a.id}` : `att-idx-${idx}`}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-mono text-slate-400 text-[11px]">
                          {a.id}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-800">
                          {a.date}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-indigo-600">
                          {a.checkInTime || '-'}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          {a.checkOutTime || (!a.checkOutTime && (a.status === 'Present' || a.status === 'Late') ? (
                            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">In Facility</span>
                          ) : '-')}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={a.status === 'Present' ? 'success' : a.status === 'Late' ? 'warning' : a.status === 'Leave' ? 'info' : 'danger'} size="sm">
                            {a.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 italic">
                          {a.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* 5. WORKOUT TAB */}
      {activeTab === 'workout' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">Customized Workout Program</h3>
            <Button
              size="sm"
              variant="primary"
              icon={<Dumbbell className="w-4 h-4" />}
              onClick={() => setIsWorkoutModalOpen(true)}
            >
              {memberWorkout ? 'Edit Workout Plan' : 'Create Workout Plan'}
            </Button>
          </div>

          {memberWorkout ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    {memberWorkout.title || 'Personalized Routine'}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="font-semibold text-indigo-600">Goal: {memberWorkout.goal}</span>
                    <span>•</span>
                    <span>Days: {memberWorkout.workoutDays.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Exercise Roster */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Target Exercises ({memberWorkout.exercises.length})
                </h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="px-4 py-2.5">Muscle Group</th>
                        <th className="px-4 py-2.5">Exercise</th>
                        <th className="px-4 py-2.5">Sets</th>
                        <th className="px-4 py-2.5">Reps</th>
                        <th className="px-4 py-2.5">Rest</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {memberWorkout.exercises.map((ex, i) => (
                        <tr key={`ex-${ex.name || 'item'}-${i}`} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-indigo-600">
                            {ex.category}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {ex.name}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold">
                            {ex.sets}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {ex.reps}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {ex.restTime}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {memberWorkout.notes && (
                <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1">
                  <span className="font-bold block">Coach Notes & Progression:</span>
                  <p>{memberWorkout.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="No Workout Routine Assigned"
              description="Athlete has not been assigned a specific workout schedule yet."
              actionLabel="Create Workout Plan"
              onAction={() => setIsWorkoutModalOpen(true)}
            />
          )}
        </div>
      )}

      {/* 6. DIET TAB */}
      {activeTab === 'diet' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">Nutrition & Meal Protocol</h3>
            <Button
              size="sm"
              variant="primary"
              icon={<Apple className="w-4 h-4" />}
              onClick={() => setIsDietModalOpen(true)}
            >
              {memberDiet ? 'Edit Nutrition Plan' : 'Create Nutrition Plan'}
            </Button>
          </div>

          {memberDiet ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    {memberDiet.title || 'Nutritional Protocol'}
                  </h4>
                  <span className="text-xs font-semibold text-emerald-600 mt-0.5 block">
                    Objective: {memberDiet.goal}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-emerald-600" />
                    {memberDiet.calories} kcal/day
                  </div>
                  <div className="px-4 py-2 bg-sky-50 text-sky-800 rounded-xl border border-sky-200 text-xs font-bold flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-sky-600" />
                    {memberDiet.waterTarget} L Water
                  </div>
                </div>
              </div>

              {/* Meals Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    🍳 Breakfast
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {memberDiet.breakfast || 'Not prescribed'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    🥗 Lunch
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {memberDiet.lunch || 'Not prescribed'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    🍲 Dinner
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {memberDiet.dinner || 'Not prescribed'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    🍎 Snacks & Supplements
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {memberDiet.snacks || 'Not prescribed'}
                  </p>
                </div>
              </div>

              {memberDiet.notes && (
                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                  <span className="font-bold block">Dietary Guidelines & Precautions:</span>
                  <p>{memberDiet.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="No Nutrition Plan Assigned"
              description="Athlete has not been assigned a specific diet protocol yet."
              actionLabel="Create Nutrition Plan"
              onAction={() => setIsDietModalOpen(true)}
            />
          )}
        </div>
      )}

      {/* MODALS */}
      <MemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        memberToEdit={member}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        defaultMemberId={member.id}
      />

      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        defaultPersonType="Member"
        defaultPersonId={member.id}
      />

      {/* Print Member Profile Modal */}
      <PrintMemberProfileModal
        isOpen={isPrintProfileModalOpen}
        onClose={() => setIsPrintProfileModalOpen(false)}
        member={member}
      />

      <AssignMembershipModal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        defaultMemberId={member.id}
      />

      <AssignTrainerModal
        isOpen={isTrainerModalOpen}
        onClose={() => setIsTrainerModalOpen(false)}
        defaultMemberId={member.id}
      />

      <WorkoutPlanModal
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
        defaultMemberId={member.id}
        planToEdit={memberWorkout}
      />

      <DietPlanModal
        isOpen={isDietModalOpen}
        onClose={() => setIsDietModalOpen(false)}
        defaultMemberId={member.id}
        planToEdit={memberDiet}
      />

      {selectedReceipt && (
        <ReceiptModal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          payment={selectedReceipt}
        />
      )}

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Athlete Record"
        message={`Are you sure you want to delete ${member.fullName}? This action cannot be undone.`}
        confirmLabel="Yes, Delete Record"
      />
    </div>
  );
};
