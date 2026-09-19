import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, RotateCw, Filter, Award, AlertCircle, Printer, FileText } from 'lucide-react';
import { useGym } from '../context/GymContext';
import { Membership } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { AssignMembershipModal } from '../components/memberships/AssignMembershipModal';
import { PrintInvoiceModal } from '../components/memberships/PrintInvoiceModal';

export const Memberships: React.FC = () => {
  const { memberships, members, plans, getMember, getPlan, formatCurrency } = useGym();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceMembership, setInvoiceMembership] = useState<Membership | null>(null);

  const filteredMemberships = useMemo(() => {
    return (memberships || []).filter((ms) => {
      const member = getMember(ms.memberId);
      const plan = getPlan(ms.planId);

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (member && member.fullName.toLowerCase().includes(q)) ||
        ms.memberId.toLowerCase().includes(q) ||
        (plan && plan.name.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'All' || ms.status === statusFilter;
      const matchesPlan = planFilter === 'All' || ms.planId === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [memberships, searchQuery, statusFilter, planFilter, getMember, getPlan]);

  const totalPages = Math.ceil(filteredMemberships.length / itemsPerPage);
  const paginatedMemberships = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMemberships.slice(start, start + itemsPerPage);
  }, [filteredMemberships, currentPage]);

  const handleRenew = (ms: Membership) => {
    setSelectedMembership(ms);
    setIsAssignModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Memberships</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track subscriber tenures, validity periods, renewal alerts, and balance dues.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/memberships/plans">
            <Button size="md" variant="outline" icon={<Award className="w-4 h-4" />}>
              Manage Plans
            </Button>
          </Link>
          <Button
            size="md"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setSelectedMembership(null);
              setIsAssignModalOpen(true);
            }}
          >
            Assign Membership
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search member name, ID, or plan..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
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
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
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
        </div>
      </div>

      {/* Memberships Table */}
      {paginatedMemberships.length === 0 ? (
        <EmptyState
          title="No memberships found"
          description="No subscriptions match your current filter settings."
          actionLabel="Assign Membership"
          onAction={() => {
            setSelectedMembership(null);
            setIsAssignModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Member</th>
                  <th className="px-4 py-3.5">Plan</th>
                  <th className="px-4 py-3.5">Tenure Dates</th>
                  <th className="px-4 py-3.5">Total Fee</th>
                  <th className="px-4 py-3.5">Paid</th>
                  <th className="px-4 py-3.5">Balance</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedMemberships.map((ms) => {
                  const member = getMember(ms.memberId);
                  const plan = getPlan(ms.planId);

                  return (
                    <tr key={ms.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={member?.profilePhoto}
                            name={member?.fullName || ms.memberId}
                            size="sm"
                          />
                          <div>
                            <Link
                              to={`/members/${ms.memberId}`}
                              className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors block"
                            >
                              {member?.fullName || ms.memberId}
                            </Link>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {ms.memberId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800">
                          {ms.customPlanName || (plan ? plan.name : 'Custom Plan')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-slate-700">
                          <span className="font-medium">{ms.startDate}</span>
                          <span className="text-slate-400 mx-1">→</span>
                          <span className="font-semibold text-slate-900">{ms.endDate}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {formatCurrency(ms.totalAmount)}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-emerald-600">
                        {formatCurrency(ms.paid)}
                      </td>
                      <td className="px-4 py-3.5">
                        {ms.remaining > 0 ? (
                          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                            {formatCurrency(ms.remaining)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">Cleared</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={
                            ms.status === 'Active'
                              ? 'success'
                              : ms.status === 'Expiring Soon'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {ms.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs py-1 px-2.5 text-slate-700 hover:bg-slate-50"
                            icon={<Printer className="w-3.5 h-3.5" />}
                            onClick={() => {
                              setInvoiceMembership(ms);
                              setIsInvoiceModalOpen(true);
                            }}
                          >
                            Invoice
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs py-1 px-2.5"
                            icon={<RotateCw className="w-3.5 h-3.5" />}
                            onClick={() => handleRenew(ms)}
                          >
                            Renew / Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredMemberships.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {/* Assign / Renew Modal */}
      <AssignMembershipModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedMembership(null);
        }}
        membershipToEdit={selectedMembership}
      />

      {/* Print Invoice Modal */}
      <PrintInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setInvoiceMembership(null);
        }}
        membership={invoiceMembership}
      />
    </div>
  );
};
