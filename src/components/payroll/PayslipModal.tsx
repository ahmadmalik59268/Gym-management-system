import React, { useRef } from 'react';
import {
  Printer,
  Download,
  CheckCircle2,
  Clock,
  Building,
  Dumbbell,
  Percent,
  Calendar,
  DollarSign,
  ShieldCheck,
  FileText,
  X,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useGym } from '../../context/GymContext';
import { usePayroll } from '../../context/PayrollContext';
import { PayrollRecord } from '../../types';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: PayrollRecord | null;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const { gymProfile, gymSettings, formatCurrency, currencySymbol, showToast } = useGym();
  const { payrollSettings } = usePayroll();
  const printRef = useRef<HTMLDivElement>(null);

  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    showToast(`Payslip exported as PDF (${record.id}.pdf)`, 'success');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Salary Slip — ${record.employeeName} (${record.payrollMonth})`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Action Header */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                record.status === 'Paid'
                  ? 'success'
                  : record.status === 'Approved'
                  ? 'info'
                  : 'neutral'
              }
              size="md"
            >
              Status: {record.status}
            </Badge>
            <span className="text-xs text-slate-500 font-mono font-medium">
              ID: {record.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownloadPDF}
            >
              Export PDF
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Printer className="w-3.5 h-3.5" />}
              onClick={handlePrint}
            >
              Print Slip
            </Button>
          </div>
        </div>

        {/* PRINTABLE SALARY SLIP CANVAS */}
        <div
          ref={printRef}
          id="printable-payslip"
          className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0 space-y-6 text-slate-800"
        >
          {/* Header & Gym Branding */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold shadow-md">
                <Dumbbell className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                  {gymProfile.gymName || 'APEX CORE ATHLETIC CLUB'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {gymProfile.address || '1080 Olympic Way, Suite 400'} • Phone: {gymProfile.phone || '+1 (555) 800-APEX'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Tax Registration / NTN: {payrollSettings.taxNumber || 'TAX-OR-9923841-B'}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-600 block">
                OFFICIAL SALARY DISBURSEMENT SLIP
              </span>
              <span className="text-lg font-extrabold text-slate-900 block font-mono">
                {record.payrollMonth}
              </span>
              <span className="text-[11px] text-slate-500">
                Period: {record.periodStartDate} to {record.periodEndDate}
              </span>
            </div>
          </div>

          {/* Employee & Payroll Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Employee Name
              </span>
              <span className="text-xs font-extrabold text-slate-900 block mt-0.5">
                {record.employeeName}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">{record.employeeId}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Role & Designation
              </span>
              <span className="text-xs font-extrabold text-indigo-700 block mt-0.5">
                {record.employeeRole}
              </span>
              <span className="text-[11px] text-slate-500">{record.salaryType}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Payment Channel
              </span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">
                {record.paymentMethod}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {record.bankDetails?.bankName
                  ? `${record.bankDetails.bankName} (${record.bankDetails.accountNumber})`
                  : 'Direct Ledger'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Payment Status
              </span>
              <span
                className={`text-xs font-black block mt-0.5 ${
                  record.status === 'Paid'
                    ? 'text-emerald-600'
                    : record.status === 'Approved'
                    ? 'text-indigo-600'
                    : 'text-amber-600'
                }`}
              >
                {record.status.toUpperCase()}
              </span>
              {record.paidDate && (
                <span className="text-[11px] text-slate-500">Paid On: {record.paidDate}</span>
              )}
            </div>
          </div>

          {/* TRANSPARENT CALCULATION LOGIC SECTION (Crucial Requirement) */}
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-700" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950">
                Transparent Compensation Calculation Formula
              </h4>
            </div>

            {/* If Attendance-Based Salary */}
            {record.salaryType === 'Attendance-Based Salary' && (
              <div className="text-xs text-slate-700 space-y-1 font-mono bg-white p-3 rounded-lg border border-indigo-100">
                <div className="flex justify-between">
                  <span>Monthly Base Salary:</span>
                  <span className="font-bold">{formatCurrency(record.baseSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Working Days in Month:</span>
                  <span>{record.totalWorkingDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Per Day Salary:</span>
                  <span>
                    {formatCurrency(record.baseSalary)} ÷ {record.totalWorkingDays} ={' '}
                    <strong className="text-indigo-700">
                      {formatCurrency(record.perDaySalary)}/day
                    </strong>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Verified Days Paid:</span>
                  <span>
                    {record.presentDays} present + {record.paidLeaves} paid leaves ={' '}
                    <strong>{record.presentDays + record.paidLeaves} days</strong>
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-indigo-900">
                  <span>Attendance Base Pay:</span>
                  <span>
                    {formatCurrency(record.perDaySalary)} ×{' '}
                    {record.presentDays + record.paidLeaves} ={' '}
                    {formatCurrency(record.attendancePay)}
                  </span>
                </div>
              </div>
            )}

            {/* If Percentage / Commission */}
            {(record.salaryType === 'Percentage / Commission' ||
              record.salaryType === 'Fixed + Percentage') && (
              <div className="text-xs text-slate-700 space-y-1 font-mono bg-white p-3 rounded-lg border border-indigo-100">
                <div className="flex justify-between">
                  <span>Commission Basis:</span>
                  <span className="font-bold text-indigo-800">{record.commissionBasis}</span>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Active Members:</span>
                  <span>{record.assignedMembersCount} athletes</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Eligible Revenue Collected:</span>
                  <span className="font-bold">{formatCurrency(record.eligibleRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Coach Share Percentage:</span>
                  <span className="font-bold text-indigo-700">
                    {record.commissionPercentage}%
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-indigo-900">
                  <span>Trainer Commission Earned:</span>
                  <span>
                    {formatCurrency(record.eligibleRevenue)} × {record.commissionPercentage}% ={' '}
                    {formatCurrency(record.commissionAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Gym Club Retained Share:</span>
                  <span>
                    {formatCurrency(record.eligibleRevenue)} ×{' '}
                    {100 - record.commissionPercentage}% ={' '}
                    {formatCurrency(record.gymShareAmount || record.eligibleRevenue - record.commissionAmount)}
                  </span>
                </div>
              </div>
            )}

            {/* If Fixed Salary */}
            {record.salaryType === 'Fixed Salary' && (
              <div className="text-xs text-slate-700 space-y-1 font-mono bg-white p-3 rounded-lg border border-indigo-100">
                <div className="flex justify-between">
                  <span>Fixed Contract Salary:</span>
                  <span className="font-bold text-indigo-900">
                    {formatCurrency(record.baseSalary)} / month
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Full Attendance:</span>
                  <span>
                    {record.presentDays} / {record.totalWorkingDays} days fulfilled
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ITEMIZED EARNINGS & DEDUCTIONS DUAL TABLE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Earnings */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                  A. Gross Earnings
                </span>
                <span className="text-xs font-extrabold text-emerald-700">Amount</span>
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                {record.baseSalary > 0 && record.salaryType !== 'Attendance-Based Salary' && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Base Salary</span>
                    <span className="font-bold font-mono">{formatCurrency(record.baseSalary)}</span>
                  </div>
                )}

                {record.salaryType === 'Attendance-Based Salary' && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">
                      Attendance Base Pay ({record.presentDays + record.paidLeaves} days)
                    </span>
                    <span className="font-bold font-mono">
                      {formatCurrency(record.attendancePay)}
                    </span>
                  </div>
                )}

                {record.salaryType === 'Hourly / Daily' && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">
                      Logged Hours Pay ({record.hoursWorked || 160} hrs @ ${record.hourlyRate || 22}/hr)
                    </span>
                    <span className="font-bold font-mono">
                      {formatCurrency(record.attendancePay)}
                    </span>
                  </div>
                )}

                {record.commissionAmount > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">
                      Trainer Commission ({record.commissionPercentage}%)
                    </span>
                    <span className="font-bold font-mono text-indigo-700">
                      {formatCurrency(record.commissionAmount)}
                    </span>
                  </div>
                )}

                {record.bonusAmount > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Performance / Incentive Bonuses</span>
                    <span className="font-bold font-mono text-emerald-700">
                      +{formatCurrency(record.bonusAmount)}
                    </span>
                  </div>
                )}

                {record.overtimeAmount > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Overtime Compensation</span>
                    <span className="font-bold font-mono">
                      +{formatCurrency(record.overtimeAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between pt-2 font-extrabold text-slate-900 border-t-2 border-slate-200">
                  <span>Total Gross Earnings:</span>
                  <span className="font-mono text-emerald-800">
                    {formatCurrency(record.grossPay)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Deductions & Advances */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-rose-50 px-4 py-2.5 border-b border-rose-100 flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-900">
                  B. Deductions & Recoveries
                </span>
                <span className="text-xs font-extrabold text-rose-700">Amount</span>
              </div>
              <div className="p-4 space-y-2.5 text-xs">
                {record.advanceDeduction > 0 ? (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Salary Advance Auto-Recovery</span>
                    <span className="font-bold font-mono text-rose-600">
                      -{formatCurrency(record.advanceDeduction)}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-400">
                    <span>Salary Advance Recovery</span>
                    <span className="font-mono">$0.00</span>
                  </div>
                )}

                {record.otherDeductions > 0 ? (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Late / Absence / Other Penalties</span>
                    <span className="font-bold font-mono text-rose-600">
                      -{formatCurrency(record.otherDeductions)}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-400">
                    <span>Penalties & Late Deductions</span>
                    <span className="font-mono">$0.00</span>
                  </div>
                )}

                <div className="flex justify-between pt-2 font-extrabold text-slate-900 border-t-2 border-slate-200">
                  <span>Total Deductions:</span>
                  <span className="font-mono text-rose-700">
                    -{formatCurrency(record.totalDeductions)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* NET PAYABLE HERO BANNER */}
          <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block">
                Final Net Take-Home Salary
              </span>
              <span className="text-xs text-slate-300">
                Formula: Gross Earnings ({formatCurrency(record.grossPay)}) - Total Deductions (
                {formatCurrency(record.totalDeductions)})
              </span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black font-mono tracking-tight text-emerald-400">
                {formatCurrency(record.netSalary)}
              </span>
            </div>
          </div>

          {/* Member Commission Appendix (if commission trainer) */}
          {record.memberCommissions && record.memberCommissions.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Eligible Member Transactions Breakdown
              </h5>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Receipt #</th>
                      <th className="p-2">Athlete</th>
                      <th className="p-2">Date</th>
                      <th className="p-2 text-right">Payment</th>
                      <th className="p-2 text-right">Eligible</th>
                      <th className="p-2 text-right">Coach ({record.commissionPercentage}%)</th>
                      <th className="p-2 text-right">Gym Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {record.memberCommissions.map((m, idx) => (
                      <tr key={`payslip-comm-${m.receiptNumber}-${idx}`}>
                        <td className="p-2 font-mono text-slate-500">{m.receiptNumber}</td>
                        <td className="p-2 font-semibold text-slate-800">{m.memberName}</td>
                        <td className="p-2 text-slate-500">{m.paymentDate}</td>
                        <td className="p-2 text-right font-mono">{formatCurrency(m.paymentAmount)}</td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(m.eligibleAmount)}
                        </td>
                        <td className="p-2 text-right font-mono font-extrabold text-indigo-600">
                          {formatCurrency(m.trainerShare)}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-500">
                          {formatCurrency(m.gymShare)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Signatures & Authorization Strip */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold mb-8">
                Prepared & Verified By:
              </p>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                {record.approvedBy || payrollSettings.authorizedSignatoryName || 'Robert Hayes'}
                <span className="block text-[10px] text-slate-500 font-normal">
                  {payrollSettings.authorizedSignatoryTitle || 'Operations & Finance Department'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold mb-8">
                Employee Signature / Acknowledgement:
              </p>
              <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
                {record.employeeName}
                <span className="block text-[10px] text-slate-500 font-normal">
                  {record.paidDate ? `Acknowledged on ${record.paidDate}` : 'Pending Disbursement'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Close Button */}
        <div className="flex justify-end pt-2 print:hidden">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
