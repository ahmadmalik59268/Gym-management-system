import React, { useState, useMemo } from 'react';
import {
  Clock,
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { useGym } from '../../context/GymContext';
import { usePayroll } from '../../context/PayrollContext';
import { AdvanceModal } from '../../components/payroll/AdvanceModal';
import { SalaryAdvance } from '../../types';

export const SalaryAdvances: React.FC = () => {
  const { formatCurrency, currencySymbol, showToast } = useGym();
  const {
    advances,
    deleteAdvance,
    updateAdvance,
    canManagePayroll,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    activeRole,
    simulatedTrainerId,
    isTrainerRole,
  } = usePayroll();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedAdvanceForEdit, setSelectedAdvanceForEdit] = useState<SalaryAdvance | null>(null);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);

  // Filtered advances
  const filteredAdvances = useMemo(() => {
    return advances.filter((adv) => {
      if (isTrainerRole && adv.employeeId !== simulatedTrainerId) {
        return false;
      }

      const matchesSearch =
        adv.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adv.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adv.reason.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || adv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [advances, isTrainerRole, simulatedTrainerId, searchTerm, statusFilter]);

  // KPIs
  const stats = useMemo(() => {
    let totalGiven = 0;
    let totalRecovered = 0;
    let totalRemaining = 0;

    advances.forEach((a) => {
      totalGiven += a.amount;
      totalRecovered += a.recoveredAmount;
      totalRemaining += a.remainingAmount;
    });

    return {
      totalGiven,
      totalRecovered,
      totalRemaining,
      count: advances.length,
    };
  }, [advances]);

  const handleMarkRecovered = (adv: SalaryAdvance) => {
    updateAdvance(adv.id, {
      recoveredAmount: adv.amount,
      remainingAmount: 0,
      status: 'Fully Recovered',
    });
    showToast(`Advance for ${adv.employeeName} marked as fully recovered`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Salary Advances & Recovery System</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Log staff loans and salary advances with automatic monthly cycle recovery.
          </p>
        </div>

        {canManagePayroll && (
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              setSelectedAdvanceForEdit(null);
              setIsAdvanceModalOpen(true);
            }}
          >
            Record Salary Advance
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            Total Advances Disbursed
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {formatCurrency(stats.totalGiven)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">{stats.count} Requests</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">All historical advances</p>
        </Card>

        <Card className="p-4 border-slate-200 bg-emerald-50/20">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
            Total Recovered Amount
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700 font-mono">
              {formatCurrency(stats.totalRecovered)}
            </span>
            <Badge variant="success" size="sm">
              Collected
            </Badge>
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">Deducted from payrolls</p>
        </Card>

        <Card className="p-4 border-amber-200 bg-amber-50/30">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
            Outstanding Advance Balance
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-700 font-mono">
              {formatCurrency(stats.totalRemaining)}
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-sm">
              Pending
            </span>
          </div>
          <p className="text-[11px] text-amber-800/80 mt-1">Due in upcoming cycles</p>
        </Card>
      </div>

      {/* Table & Filters */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search staff, reason, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-3.5 h-3.5 text-slate-400" />}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold p-2 outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved / Active</option>
              <option value="Fully Recovered">Fully Recovered</option>
              <option value="Deducted in Payroll">Deducted in Payroll</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Staff Member</th>
                <th className="p-3.5 text-right">Advance Amount</th>
                <th className="p-3.5">Disbursal Date</th>
                <th className="p-3.5">Recovery Month</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5 text-right">Recovered</th>
                <th className="p-3.5 text-right">Remaining</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdvances.map((adv) => (
                <tr key={adv.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Staff */}
                  <td className="p-3.5">
                    <span className="font-extrabold text-slate-900 block">{adv.employeeName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {adv.employeeRole} • {adv.employeeId}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(adv.amount)}
                  </td>

                  {/* Disbursed Date */}
                  <td className="p-3.5 text-slate-600">{adv.disbursedDate || adv.requestDate}</td>

                  {/* Recovery Month */}
                  <td className="p-3.5 font-mono text-indigo-700 font-bold">
                    {adv.payrollMonth}
                  </td>

                  {/* Reason */}
                  <td className="p-3.5 text-slate-700 max-w-xs truncate" title={adv.reason}>
                    {adv.reason}
                  </td>

                  {/* Recovered */}
                  <td className="p-3.5 text-right font-mono text-emerald-600 font-semibold">
                    {formatCurrency(adv.recoveredAmount)}
                  </td>

                  {/* Remaining */}
                  <td className="p-3.5 text-right font-mono font-black text-rose-600">
                    {formatCurrency(adv.remainingAmount)}
                  </td>

                  {/* Status */}
                  <td className="p-3.5 text-center">
                    <Badge
                      variant={
                        adv.status === 'Fully Recovered'
                          ? 'success'
                          : adv.status === 'Approved'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                    >
                      {adv.status}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                    {canManagePayroll && adv.remainingAmount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkRecovered(adv)}
                      >
                        Mark Recovered
                      </Button>
                    )}
                    {canManagePayroll && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                          onClick={() => {
                            setSelectedAdvanceForEdit(adv);
                            setIsAdvanceModalOpen(true);
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                          onClick={() => deleteAdvance(adv.id)}
                        />
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <AdvanceModal
        isOpen={isAdvanceModalOpen}
        onClose={() => {
          setIsAdvanceModalOpen(false);
          setSelectedAdvanceForEdit(null);
        }}
        advanceToEdit={selectedAdvanceForEdit}
      />
    </div>
  );
};
