import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  DollarSign,
  TrendingDown,
  Building,
  Zap,
  Wrench,
  Users,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react';
import { useGym } from '../context/GymContext';
import { Expense } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ExpenseModal } from '../components/finance/ExpenseModal';

export const Expenses: React.FC = () => {
  const { expenses, deleteExpense, formatCurrency } = useGym();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);

  // Financial totals
  const totalExpenses = (expenses || []).reduce((acc, exp) => acc + exp.amount, 0);
  const rentTotal = (expenses || [])
    .filter((e) => e.category === 'Rent')
    .reduce((acc, e) => acc + e.amount, 0);
  const salariesTotal = (expenses || [])
    .filter((e) => e.category === 'Salaries')
    .reduce((acc, e) => acc + e.amount, 0);
  const utilitiesTotal = (expenses || [])
    .filter((e) => e.category === 'Electricity' || e.category === 'Maintenance')
    .reduce((acc, e) => acc + e.amount, 0);

  const filteredExpenses = useMemo(() => {
    return (expenses || []).filter((e) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        (e.notes && e.notes.toLowerCase().includes(q));

      const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchQuery, categoryFilter]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(start, start + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  const handleEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteExpenseId(id);
  };

  const confirmDelete = () => {
    if (deleteExpenseId) {
      deleteExpense(deleteExpenseId);
      setDeleteExpenseId(null);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Rent':
        return <Badge variant="neutral">{cat}</Badge>;
      case 'Salaries':
        return <Badge variant="indigo">{cat}</Badge>;
      case 'Electricity':
        return <Badge variant="warning">{cat}</Badge>;
      case 'Maintenance':
        return <Badge variant="danger">{cat}</Badge>;
      case 'Equipment':
        return <Badge variant="success">{cat}</Badge>;
      default:
        return <Badge variant="neutral">{cat}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Expense Management</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track club overhead, rent liabilities, equipment upkeep, and utility billing.
          </p>
        </div>
        <Button
          size="md"
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingExpense(null);
            setIsModalOpen(true);
          }}
        >
          Add Expense
        </Button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Overhead
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(totalExpenses)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">All registered disbursements</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Facility Rent
            </span>
            <Building className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800 mt-1">
            {formatCurrency(rentTotal)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Commercial lease contract</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Staff Payroll
            </span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">
            {formatCurrency(salariesTotal)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Coaches & front-desk team</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Maintenance & Utilities
            </span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            {formatCurrency(utilitiesTotal)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Power, water & repairs</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search expense description, vendor, or notes..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Rent">Rent</option>
            <option value="Electricity">Electricity</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Salaries">Salaries</option>
            <option value="Equipment">Equipment</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      {paginatedExpenses.length === 0 ? (
        <EmptyState
          title="No expenses found"
          description="No cost entries match the selected filters."
          actionLabel="Add Expense"
          onAction={() => {
            setEditingExpense(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Expense Item</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Disbursal Method</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Notes</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{exp.title}</td>
                    <td className="px-4 py-3.5">{getCategoryBadge(exp.category)}</td>
                    <td className="px-4 py-3.5 text-slate-600">{exp.date}</td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">{exp.paymentMethod}</td>
                    <td className="px-4 py-3.5 font-extrabold text-slate-900">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 max-w-xs truncate">
                      {exp.notes || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(exp)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Responsive Cards View */}
          <div className="lg:hidden divide-y divide-slate-100">
            {paginatedExpenses.map((exp) => (
              <div key={exp.id} className="p-4 space-y-3 hover:bg-slate-50/40 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-slate-900">{exp.title}</span>
                  <span className="font-extrabold text-sm text-slate-900">{formatCurrency(exp.amount)}</span>
                </div>
                
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    {getCategoryBadge(exp.category)}
                    <span className="font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{exp.paymentMethod}</span>
                  </div>
                  <span className="font-mono text-slate-400">{exp.date}</span>
                </div>

                {exp.notes && (
                  <p className="text-[11px] text-slate-500 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/55 line-clamp-2">
                    {exp.notes}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs py-1 px-3"
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                    onClick={() => handleEdit(exp)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs py-1 px-3 text-rose-600 hover:bg-rose-50 border-rose-200"
                    icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                    onClick={() => handleDelete(exp.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredExpenses.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        expenseToEdit={editingExpense}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteExpenseId}
        onClose={() => setDeleteExpenseId(null)}
        onConfirm={confirmDelete}
        title="Delete Expense Entry"
        message="Are you sure you want to remove this ledger expense entry? This will adjust your net profit calculations."
      />
    </div>
  );
};
