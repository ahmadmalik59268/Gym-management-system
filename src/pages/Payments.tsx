import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Receipt,
  CreditCard,
  DollarSign,
  Printer,
  Smartphone,
  Building,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useGym } from '../context/GymContext';
import { Payment } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { PaymentModal } from '../components/payments/PaymentModal';
import { ReceiptModal } from '../components/payments/ReceiptModal';

export const Payments: React.FC = () => {
  const { payments, getMember, formatCurrency } = useGym();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  // Financial summary metrics
  const totalCollected = (payments || []).reduce((acc, p) => acc + p.amount, 0);
  const cardTotal = (payments || [])
    .filter((p) => p.paymentMethod === 'Card')
    .reduce((acc, p) => acc + p.amount, 0);
  const cashTotal = (payments || [])
    .filter((p) => p.paymentMethod === 'Cash')
    .reduce((acc, p) => acc + p.amount, 0);
  const upiTotal = (payments || [])
    .filter((p) => p.paymentMethod === 'UPI' || p.paymentMethod === 'Bank Transfer')
    .reduce((acc, p) => acc + p.amount, 0);

  const filteredPayments = useMemo(() => {
    return (payments || []).filter((p) => {
      const member = getMember(p.memberId);
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        p.receiptNumber.toLowerCase().includes(q) ||
        p.memberId.toLowerCase().includes(q) ||
        (member && member.fullName.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q));

      const matchesMethod = methodFilter === 'All' || p.paymentMethod === methodFilter;
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [payments, searchQuery, methodFilter, statusFilter, getMember]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Payments & Receipts</h2>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile daily gym receipts, invoice balances, and client transaction records.
          </p>
        </div>
        <Button
          size="md"
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddPaymentOpen(true)}
        >
          Add Payment
        </Button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Revenue
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(totalCollected)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">All registered receipts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Card Payments
            </span>
            <CreditCard className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">
            {formatCurrency(cardTotal)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">POS Terminal / Online</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Cash Drawer
            </span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {formatCurrency(cashTotal)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Front counter physical cash</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              UPI & Bank Wire
            </span>
            <Smartphone className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl font-extrabold text-violet-600 mt-1">
            {formatCurrency(upiTotal)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Digital instant transfers</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
            placeholder="Search by receipt #, member name, or notes..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Method Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Channel:</span>
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Channels</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

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
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {paginatedPayments.length === 0 ? (
        <EmptyState
          title="No payments found"
          description="No invoice transactions match your query criteria."
          actionLabel="Add Payment"
          onAction={() => setIsAddPaymentOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Receipt #</th>
                  <th className="px-4 py-3.5">Member</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Payment Method</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Receipt Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPayments.map((p) => {
                  const member = getMember(p.memberId);

                  return (
                    <tr key={p.receiptNumber} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                        {p.receiptNumber}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={member?.profilePhoto}
                            name={member?.fullName || p.memberId}
                            size="xs"
                          />
                          <div>
                            <Link
                              to={`/members/${p.memberId}`}
                              className="font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                            >
                              {member?.fullName || p.memberId}
                            </Link>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {p.memberId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{p.date}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                          {p.paymentMethod === 'Card' && <CreditCard className="w-3.5 h-3.5 text-slate-400" />}
                          {p.paymentMethod === 'Cash' && <DollarSign className="w-3.5 h-3.5 text-slate-400" />}
                          {p.paymentMethod === 'UPI' && <Smartphone className="w-3.5 h-3.5 text-slate-400" />}
                          {p.paymentMethod === 'Bank Transfer' && <Building className="w-3.5 h-3.5 text-slate-400" />}
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-extrabold text-slate-900">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={
                            p.status === 'Paid'
                              ? 'success'
                              : p.status === 'Partial'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs py-1 px-2.5"
                            icon={<Receipt className="w-3.5 h-3.5" />}
                            onClick={() => setSelectedReceipt(p)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs p-1.5 text-slate-400 hover:text-slate-700"
                            title="Print Receipt"
                            onClick={() => setSelectedReceipt(p)}
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Responsive Cards View */}
          <div className="lg:hidden divide-y divide-slate-100">
            {paginatedPayments.map((p) => {
              const member = getMember(p.memberId);
              return (
                <div key={p.receiptNumber} className="p-4 space-y-3 hover:bg-slate-50/40 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">{p.receiptNumber}</span>
                    <Badge
                      variant={
                        p.status === 'Paid'
                          ? 'success'
                          : p.status === 'Partial'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {p.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <Avatar
                      src={member?.profilePhoto}
                      name={member?.fullName || p.memberId}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/members/${p.memberId}`}
                        className="font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors block truncate"
                      >
                        {member?.fullName || p.memberId}
                      </Link>
                      <span className="text-[10px] text-slate-400 block font-mono truncate">
                        ID: {p.memberId}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-sm text-slate-900 block">{formatCurrency(p.amount)}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{p.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/55">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                      {p.paymentMethod === 'Card' && <CreditCard className="w-3.5 h-3.5 text-slate-400" />}
                      {p.paymentMethod === 'Cash' && <DollarSign className="w-3.5 h-3.5 text-slate-400" />}
                      {p.paymentMethod === 'UPI' && <Smartphone className="w-3.5 h-3.5 text-slate-400" />}
                      {p.paymentMethod === 'Bank Transfer' && <Building className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{p.paymentMethod}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs py-1 px-3"
                        icon={<Receipt className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedReceipt(p)}
                      >
                        Receipt
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredPayments.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {/* Add Payment Modal */}
      <PaymentModal
        isOpen={isAddPaymentOpen}
        onClose={() => setIsAddPaymentOpen(false)}
      />

      {/* Official Receipt Printable Modal */}
      <ReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        payment={selectedReceipt}
      />
    </div>
  );
};
