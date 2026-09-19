import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Plus,
  RefreshCw,
  Edit2,
  DollarSign,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { useGym } from '../../context/GymContext';
import { usePayroll } from '../../context/PayrollContext';
import { PayrollRecord } from '../../types';

export const AttendanceSalary: React.FC = () => {
  const { formatCurrency, currencySymbol, showToast } = useGym();
  const {
    payrollRecords,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    updatePayrollRecord,
    canManagePayroll,
  } = usePayroll();

  const currentRecords = useMemo(() => {
    return payrollRecords.filter((r) => r.payrollMonth === selectedMonth);
  }, [payrollRecords, selectedMonth]);

  // Edit attendance state
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editPresentDays, setEditPresentDays] = useState<number>(26);
  const [editPaidLeaves, setEditPaidLeaves] = useState<number>(0);
  const [editOvertimeHours, setEditOvertimeHours] = useState<number>(0);

  const startEdit = (rec: PayrollRecord) => {
    setEditingRecordId(rec.id);
    setEditPresentDays(rec.presentDays);
    setEditPaidLeaves(rec.paidLeaves);
    setEditOvertimeHours(rec.overtimeHours || 0);
  };

  const saveEdit = (rec: PayrollRecord) => {
    const totalWorking = rec.totalWorkingDays || 26;
    const perDay = totalWorking > 0 ? (rec.baseSalary || 0) / totalWorking : 0;
    const effectiveDays = editPresentDays + editPaidLeaves;
    const newAttendancePay =
      rec.salaryType === 'Fixed Salary'
        ? rec.baseSalary
        : Math.round(perDay * effectiveDays * 100) / 100;

    const otRate = 25;
    const newOtPay = editOvertimeHours * otRate;

    const newGross =
      Math.round(
        (newAttendancePay +
          (rec.commissionAmount || 0) +
          (rec.bonusAmount || 0) +
          newOtPay) *
          100
      ) / 100;

    const newNet = Math.max(0, Math.round((newGross - rec.totalDeductions) * 100) / 100);

    updatePayrollRecord(rec.id, {
      presentDays: editPresentDays,
      absentDays: Math.max(0, totalWorking - effectiveDays),
      paidLeaves: editPaidLeaves,
      unpaidLeaves: Math.max(0, totalWorking - effectiveDays),
      attendancePay: newAttendancePay,
      overtimeHours: editOvertimeHours,
      overtimeAmount: newOtPay,
      grossPay: newGross,
      netSalary: newNet,
    });

    setEditingRecordId(null);
    showToast(`Attendance updated for ${rec.employeeName}`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Attendance & Prorated Salary Management</span>
            <span className="text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
              {selectedMonth}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Calculates per-day compensation rate: (Monthly Base ÷ Standard Days) × (Present Days +
            Paid Leaves) + Overtime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent outline-hidden cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m} Cycle
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Salary Model</th>
                <th className="p-3.5 text-right">Base Salary</th>
                <th className="p-3.5 text-center">Working Days</th>
                <th className="p-3.5 text-center">Present / Paid Leaves</th>
                <th className="p-3.5 text-right">Per-Day Rate</th>
                <th className="p-3.5 text-right">Overtime (Hrs)</th>
                <th className="p-3.5 text-right">Attendance Pay</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentRecords.map((rec) => {
                const isEditing = editingRecordId === rec.id;

                return (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Employee Profile */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={rec.employeePhoto}
                          alt={rec.employeeName}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-2xs"
                        />
                        <div>
                          <span className="font-extrabold text-slate-900 block">
                            {rec.employeeName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {rec.employeeRole} • {rec.employeeId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Salary Model */}
                    <td className="p-3.5 font-medium text-slate-700">
                      <span className="font-bold block">{rec.salaryType}</span>
                    </td>

                    {/* Base Salary */}
                    <td className="p-3.5 text-right font-mono font-bold text-slate-800">
                      {rec.baseSalary > 0 ? formatCurrency(rec.baseSalary) : '— (Commission)'}
                    </td>

                    {/* Total Working Days */}
                    <td className="p-3.5 text-center font-mono text-slate-600">
                      {rec.totalWorkingDays} days
                    </td>

                    {/* Present / Leaves */}
                    <td className="p-3.5 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="31"
                            value={editPresentDays}
                            onChange={(e) => setEditPresentDays(parseInt(e.target.value) || 0)}
                            className="w-14 bg-white border border-indigo-500 text-center font-bold text-xs rounded-md p-1"
                            title="Present Days"
                          />
                          <span className="text-slate-400">+</span>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={editPaidLeaves}
                            onChange={(e) => setEditPaidLeaves(parseInt(e.target.value) || 0)}
                            className="w-12 bg-white border border-slate-300 text-center text-xs rounded-md p-1"
                            title="Paid Leaves"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            {rec.presentDays} Pres.
                          </span>
                          {rec.paidLeaves > 0 && (
                            <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100 text-[10px] font-bold">
                              +{rec.paidLeaves} Leave
                            </span>
                          )}
                          {rec.absentDays > 0 && (
                            <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100 text-[10px] font-bold">
                              {rec.absentDays} Abs.
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Per Day Rate */}
                    <td className="p-3.5 text-right font-mono text-slate-700">
                      {rec.perDaySalary > 0 ? `${formatCurrency(rec.perDaySalary)}/d` : '—'}
                    </td>

                    {/* Overtime */}
                    <td className="p-3.5 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          max="80"
                          value={editOvertimeHours}
                          onChange={(e) => setEditOvertimeHours(parseInt(e.target.value) || 0)}
                          className="w-14 bg-white border border-slate-300 text-right text-xs rounded-md p-1"
                        />
                      ) : rec.overtimeHours && rec.overtimeHours > 0 ? (
                        <span className="text-emerald-700 font-bold">
                          {rec.overtimeHours} hrs (+{formatCurrency(rec.overtimeAmount || 0)})
                        </span>
                      ) : (
                        <span className="text-slate-400">0 hrs</span>
                      )}
                    </td>

                    {/* Attendance Pay Result */}
                    <td className="p-3.5 text-right font-mono font-black text-indigo-700 text-sm">
                      {formatCurrency(rec.attendancePay || rec.baseSalary)}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => saveEdit(rec)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingRecordId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                          onClick={() => startEdit(rec)}
                          disabled={!canManagePayroll}
                        >
                          Adjust
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
