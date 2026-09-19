import React, { useState, useMemo } from 'react';
import {
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Download,
  Printer,
  DollarSign,
  Layers,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { useGym } from '../../context/GymContext';
import { usePayroll } from '../../context/PayrollContext';
import { PayslipModal } from '../../components/payroll/PayslipModal';
import { PayrollRecord } from '../../types';

export const PayrollHistory: React.FC = () => {
  const { formatCurrency, currencySymbol, showToast } = useGym();
  const {
    payrollRecords,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    approvePayrollRecord,
    markAsPaid,
    deletePayrollRecord,
    recalculateRecord,
    approveAllForMonth,
    markAllPaidForMonth,
    canManagePayroll,
    activeRole,
    simulatedTrainerId,
    isTrainerRole,
  } = usePayroll();

  const [monthFilter, setMonthFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRecordForPayslip, setSelectedRecordForPayslip] = useState<PayrollRecord | null>(
    null
  );

  // Filtered records
  const filteredRecords = useMemo(() => {
    return payrollRecords.filter((rec) => {
      if (isTrainerRole && rec.employeeId !== simulatedTrainerId) {
        return false;
      }

      const matchesMonth = monthFilter === 'All' || rec.payrollMonth === monthFilter;
      const matchesStatus = statusFilter === 'All' || rec.status === statusFilter;
      const matchesSearch =
        rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesMonth && matchesStatus && matchesSearch;
    });
  }, [payrollRecords, isTrainerRole, simulatedTrainerId, monthFilter, statusFilter, searchTerm]);

  // High level sums for current filtered view
  const totals = useMemo(() => {
    let gross = 0;
    let net = 0;
    let commission = 0;
    let deductions = 0;

    filteredRecords.forEach((r) => {
      gross += r.grossPay;
      net += r.netSalary;
      commission += r.commissionAmount || 0;
      deductions += r.totalDeductions;
    });

    return { gross, net, commission, deductions, count: filteredRecords.length };
  }, [filteredRecords]);

  const handleExport = () => {
    showToast('Historical payroll records exported to CSV', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Payroll History & Audit Records</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete historical registry of processed salaries, paid commissions, and disbursement
            receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManagePayroll && monthFilter !== 'All' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => approveAllForMonth(monthFilter)}
              >
                Approve All for {monthFilter}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => markAllPaidForMonth(monthFilter)}
              >
                Pay All for {monthFilter}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 border-slate-200">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">
            Filtered Records
          </span>
          <span className="text-xl font-black text-slate-900 block mt-1 font-mono">
            {totals.count} Payslips
          </span>
        </Card>

        <Card className="p-3 border-slate-200">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">Gross Payroll</span>
          <span className="text-xl font-black text-slate-900 block mt-1 font-mono">
            {formatCurrency(totals.gross)}
          </span>
        </Card>

        <Card className="p-3 border-slate-200">
          <span className="text-[10px] font-extrabold uppercase text-indigo-500">
            Total Commissions
          </span>
          <span className="text-xl font-black text-indigo-700 block mt-1 font-mono">
            {formatCurrency(totals.commission)}
          </span>
        </Card>

        <Card className="p-3 border-slate-900 bg-slate-900 text-white">
          <span className="text-[10px] font-extrabold uppercase text-emerald-400">
            Net Paid Out
          </span>
          <span className="text-xl font-black text-emerald-400 block mt-1 font-mono">
            {formatCurrency(totals.net)}
          </span>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by name, ID, slip ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Month:</span>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold p-2 outline-hidden"
            >
              <option value="All">All Months</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m} Cycle
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold p-2 outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Records Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Slip / Employee</th>
                <th className="p-3.5">Cycle</th>
                <th className="p-3.5">Salary Model</th>
                <th className="p-3.5 text-right">Base / Attend.</th>
                <th className="p-3.5 text-right">Commission</th>
                <th className="p-3.5 text-right">Bonuses</th>
                <th className="p-3.5 text-right">Deductions</th>
                <th className="p-3.5 text-right">Net Salary</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Slip & Employee */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rec.employeePhoto}
                        alt={rec.employeeName}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <span className="font-extrabold text-slate-900 block">{rec.employeeName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {rec.id} • {rec.employeeRole}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Cycle */}
                  <td className="p-3.5 font-mono font-bold text-slate-800">{rec.payrollMonth}</td>

                  {/* Model */}
                  <td className="p-3.5 text-slate-700">{rec.salaryType}</td>

                  {/* Base */}
                  <td className="p-3.5 text-right font-mono text-slate-700">
                    {formatCurrency(rec.attendancePay || rec.baseSalary)}
                  </td>

                  {/* Commission */}
                  <td className="p-3.5 text-right font-mono text-indigo-700 font-bold">
                    {rec.commissionAmount > 0 ? formatCurrency(rec.commissionAmount) : '—'}
                  </td>

                  {/* Bonuses */}
                  <td className="p-3.5 text-right font-mono text-emerald-600">
                    {rec.bonusAmount > 0 ? `+${formatCurrency(rec.bonusAmount)}` : '—'}
                  </td>

                  {/* Deductions */}
                  <td className="p-3.5 text-right font-mono text-rose-600">
                    {rec.totalDeductions > 0 ? `-${formatCurrency(rec.totalDeductions)}` : '—'}
                  </td>

                  {/* Net */}
                  <td className="p-3.5 text-right font-mono font-black text-slate-900 text-sm">
                    {formatCurrency(rec.netSalary)}
                  </td>

                  {/* Status */}
                  <td className="p-3.5 text-center">
                    <Badge
                      variant={
                        rec.status === 'Paid'
                          ? 'success'
                          : rec.status === 'Approved'
                          ? 'info'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {rec.status}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<FileText className="w-3.5 h-3.5" />}
                      onClick={() => setSelectedRecordForPayslip(rec)}
                    >
                      Slip
                    </Button>
                    {canManagePayroll && rec.status === 'Pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => approvePayrollRecord(rec.id)}
                      >
                        Approve
                      </Button>
                    )}
                    {canManagePayroll && rec.status === 'Approved' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => markAsPaid(rec.id)}
                      >
                        Pay
                      </Button>
                    )}
                    {canManagePayroll && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<RefreshCw className="w-3.5 h-3.5" />}
                          onClick={() => recalculateRecord(rec.id)}
                          title="Recalculate Math"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                          onClick={() => deletePayrollRecord(rec.id)}
                          title="Delete Record"
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

      {/* Payslip Modal */}
      <PayslipModal
        isOpen={!!selectedRecordForPayslip}
        onClose={() => setSelectedRecordForPayslip(null)}
        record={selectedRecordForPayslip}
      />
    </div>
  );
};
