import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  CalendarCheck,
  CreditCard,
  RefreshCw,
  UserCheck,
  Dumbbell,
  Clock,
  Sparkles,
  DollarSign,
  AlertCircle,
  User,
} from 'lucide-react';
import { useGym } from '../context/GymContext';
import { Member } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { MemberModal } from '../components/members/MemberModal';
import { AssignMembershipModal } from '../components/memberships/AssignMembershipModal';
import { PaymentModal } from '../components/payments/PaymentModal';

export const Members: React.FC = () => {
  const {
    members,
    deleteMember,
    memberships,
    plans,
    getPlan,
    trainers,
    assignments,
    markCheckIn,
    formatCurrency,
    showToast,
  } = useGym();
  const navigate = useNavigate();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [trainerFilter, setTrainerFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Quick Action Modals state
  const [quickPaymentMemberId, setQuickPaymentMemberId] = useState<string | null>(null);
  const [renewMembershipMemberId, setRenewMembershipMemberId] = useState<string | null>(null);

  // Filtered list
  const filteredMembers = useMemo(() => {
    return (members || []).filter((m) => {
      const matchesSearch =
        m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.phone.includes(searchQuery) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;

      let matchesPlan = true;
      if (planFilter !== 'All') {
        const ms = (memberships || []).find((item) => item.memberId === m.id);
        matchesPlan = ms?.planId === planFilter;
      }

      let matchesTrainer = true;
      if (trainerFilter !== 'All') {
        const asg = (assignments || []).find((a) => a.memberId === m.id);
        matchesTrainer = asg?.trainerId === trainerFilter;
      }

      return matchesSearch && matchesStatus && matchesPlan && matchesTrainer;
    });
  }, [members, searchQuery, statusFilter, planFilter, trainerFilter, memberships, assignments]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(start, start + itemsPerPage);
  }, [filteredMembers, currentPage]);

  const handleEdit = (m: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMember(m);
    setIsMemberModalOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDeleteAction = () => {
    if (deleteConfirmId) {
      deleteMember(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleQuickCheckIn = (m: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    markCheckIn(m.id);
  };

  const handleQuickPayment = (m: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickPaymentMemberId(m.id);
  };

  const handleQuickRenew = (m: Member, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenewMembershipMemberId(m.id);
  };

  return (
    <div className="space-y-6">
      {/* Page Header with prominent Add Member */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Member Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active athlete profiles, subscriptions, trainer assignments, and fast front-desk actions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/members/add">
            <Button
              size="md"
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              className="shadow-sm"
            >
              + New Member (Guided Wizard)
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by member name, ID, phone, email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Plan:</span>
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Plans</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Trainer Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Trainer:</span>
            <select
              value={trainerFilter}
              onChange={(e) => {
                setTrainerFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Coaches</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Members Display: Responsive Table & Mobile Cards */}
      {paginatedMembers.length === 0 ? (
        <EmptyState
          title="No members found"
          description="No athlete records match the search and filter query. Register a new member using the guided workflow."
          actionLabel="+ Register New Member"
          onAction={() => navigate('/members/add')}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Athlete Profile</th>
                  <th className="px-4 py-3.5">Member ID</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Membership & Expiry</th>
                  <th className="px-4 py-3.5">Assigned Coach</th>
                  <th className="px-4 py-3.5">Payment Status</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedMembers.map((m) => {
                  const ms = (memberships || []).find((item) => item.memberId === m.id);
                  const plan = ms ? getPlan(ms.planId) : undefined;
                  const asg = (assignments || []).find((a) => a.memberId === m.id);
                  const trainer = asg ? (trainers || []).find((t) => t.id === asg.trainerId) : undefined;

                  const isDue = ms && ms.remaining > 0;

                  return (
                    <tr
                      key={m.id}
                      onClick={() => navigate(`/members/${m.id}`)}
                      className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Photo & Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={m.profilePhoto}
                            name={m.fullName}
                            size="md"
                            className="border border-slate-200 shadow-xs shrink-0"
                          />
                          <div>
                            <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors block">
                              {m.fullName}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Joined: {m.joinDate} • {m.gender}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* ID */}
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-700">
                        {m.id}
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{m.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[140px]">{m.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Membership & Expiry */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800 block">
                          {ms?.customPlanName || (plan ? plan.name : 'No Active Plan')}
                        </span>
                        {ms ? (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            Expires: {ms.endDate}
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-600">Unassigned</span>
                        )}
                      </td>

                      {/* Assigned Coach */}
                      <td className="px-4 py-3.5">
                        {trainer ? (
                          <div className="flex items-center gap-2">
                            <Avatar src={trainer.photo} name={trainer.name} size="xs" />
                            <div>
                              <span className="font-medium text-slate-800 block text-xs">
                                {trainer.name}
                              </span>
                              <span className="text-[10px] text-indigo-600 block">
                                {trainer.specialization}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">No Trainer</span>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="px-4 py-3.5">
                        {ms ? (
                          isDue ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
                              Due: {formatCurrency(ms.remaining)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                              ✓ Paid in Full
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={
                            m.status === 'Active'
                              ? 'success'
                              : m.status === 'Expiring Soon'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {m.status}
                        </Badge>
                      </td>

                      {/* Quick Action Buttons */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => handleQuickCheckIn(m, e)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Quick Check-In (Attendance)"
                          >
                            <CalendarCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleQuickPayment(m, e)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Record Payment"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleQuickRenew(m, e)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Renew Membership"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/members/${m.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={(e) => handleEdit(m, e)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Member"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(m.id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
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

          {/* Mobile / Tablet Responsive Card Layout */}
          <div className="lg:hidden divide-y divide-slate-100">
            {paginatedMembers.map((m) => {
              const ms = (memberships || []).find((item) => item.memberId === m.id);
              const plan = ms ? getPlan(ms.planId) : undefined;
              const asg = (assignments || []).find((a) => a.memberId === m.id);
              const trainer = asg ? (trainers || []).find((t) => t.id === asg.trainerId) : undefined;
              const isDue = ms && ms.remaining > 0;

              return (
                <div
                  key={m.id}
                  onClick={() => navigate(`/members/${m.id}`)}
                  className="p-4 space-y-3.5 cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  {/* Card Header with Photo */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={m.profilePhoto}
                        name={m.fullName}
                        size="lg"
                        className="border border-slate-200 shadow-xs"
                      />
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                          {m.fullName}
                        </h3>
                        <span className="text-[11px] font-mono font-bold text-slate-400 block">
                          ID: {m.id}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {m.phone}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        m.status === 'Active'
                          ? 'success'
                          : m.status === 'Expiring Soon'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {m.status}
                    </Badge>
                  </div>

                  {/* Grid details */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Plan
                      </span>
                      <span className="font-bold text-slate-800 block truncate">
                        {ms?.customPlanName || (plan ? plan.name : 'No Plan')}
                      </span>
                      {ms && (
                        <span className="text-[10px] text-slate-400">
                          Exp: {ms.endDate}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Coach
                      </span>
                      <span className="font-bold text-slate-800 block truncate">
                        {trainer ? trainer.name : 'Unassigned'}
                      </span>
                    </div>

                    <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Payment Status
                      </span>
                      {ms ? (
                        isDue ? (
                          <span className="text-rose-600 font-extrabold text-xs">
                            Due: {formatCurrency(ms.remaining)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-extrabold text-xs">
                            ✓ Cleared
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Touch Bar */}
                  <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs py-1"
                      onClick={(e) => handleQuickCheckIn(m, e)}
                    >
                      Check-In
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs py-1"
                      onClick={(e) => handleQuickPayment(m, e)}
                    >
                      Payment
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs py-1 text-amber-600"
                      onClick={(e) => handleQuickRenew(m, e)}
                    >
                      Renew
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      className="text-xs py-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/members/${m.id}`);
                      }}
                    >
                      Profile
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredMembers.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {/* Member Modal for Quick Edit */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setEditingMember(null);
        }}
        memberToEdit={editingMember}
      />

      {/* Quick Record Payment Modal */}
      {quickPaymentMemberId && (
        <PaymentModal
          isOpen={!!quickPaymentMemberId}
          onClose={() => setQuickPaymentMemberId(null)}
          defaultMemberId={quickPaymentMemberId}
        />
      )}

      {/* Quick Renew Membership Modal */}
      {renewMembershipMemberId && (
        <AssignMembershipModal
          isOpen={!!renewMembershipMemberId}
          onClose={() => setRenewMembershipMemberId(null)}
          defaultMemberId={renewMembershipMemberId}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDeleteAction}
        title="Delete Member Profile"
        message="Are you sure you want to permanently delete this member? All associated memberships, workout routines, and payment logs will also be removed."
        confirmLabel="Yes, Delete Member"
      />
    </div>
  );
};
