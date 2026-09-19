import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Award,
  AlertCircle,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Percent,
  Plus,
  Play,
  FileText,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useGym } from '../../context/GymContext';
import { usePayroll } from '../../context/PayrollContext';
import { RoleSwitcherBar } from '../../components/payroll/RoleSwitcherBar';
import { ProcessPayrollModal } from '../../components/payroll/ProcessPayrollModal';
import { AdvanceModal } from '../../components/payroll/AdvanceModal';
import { BonusModal } from '../../components/payroll/BonusModal';
import { DeductionModal } from '../../components/payroll/DeductionModal';
import { PayslipModal } from '../../components/payroll/PayslipModal';
import { PayrollRecord } from '../../types';

export const PayrollDashboard: React.FC<{ onNavigateTab?: (tab: string) => void }> = ({
  onNavigateTab,
}) => {
  const { formatCurrency, currencySymbol } = useGym();
  const {
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    getMonthStats,
    payrollRecords,
    activeRole,
    simulatedTrainerId,
    approvePayrollRecord,
    markAsPaid,
    approveAllForMonth,
    markAllPaidForMonth,
    canManagePayroll,
    isTrainerRole,
    isRestrictedRole,
  } = usePayroll();

  // Modals
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [isAdvanceOpen, setIsAdvanceOpen] = useState(false);
  const [isBonusOpen, setIsBonusOpen] = useState(false);
  const [isDeductionOpen, setIsDeductionOpen] = useState(false);
  const [selectedRecordForPayslip, setSelectedRecordForPayslip] = useState<PayrollRecord | null>(
    null
  );

  const stats = useMemo(() => getMonthStats(selectedMonth), [selectedMonth, getMonthStats]);

  // Records for current selected month
  const currentMonthRecords = useMemo(
    () => payrollRecords.filter((r) => r.payrollMonth === selectedMonth),
    [payrollRecords, selectedMonth]
  );

  // If role is Trainer, filter dashboard to only this trainer's performance
  const trainerRecord = useMemo(() => {
    return currentMonthRecords.find((r) => r.employeeId === simulatedTrainerId);
  }, [currentMonthRecords, simulatedTrainerId]);

  // Chart 1: Fixed vs Commission vs Bonuses vs Net
  const compositionData = useMemo(() => {
    return [
      { name: 'Fixed / Attendance Pay', value: stats.totalFixedSalaries, color: '#4f46e5' },
      { name: 'Trainer Commissions', value: stats.totalCommissions, color: '#06b6d4' },
      { name: 'Bonuses & Incentives', value: stats.totalBonuses, color: '#10b981' },
      { name: 'Deductions & Advances', value: stats.totalDeductions + stats.totalAdvances, color: '#f43f5e' },
    ];
  }, [stats]);

  // Chart 2: Historical Monthly Trend (Sample + Computed)
  const historicalTrendData = useMemo(() => {
    return [
      { month: 'Apr 2026', gross: 28400, net: 26900, commission: 8900 },
      { month: 'May 2026', gross: 30100, net: 28350, commission: 9800 },
      { month: 'Jun 2026', gross: 31800, net: 30200, commission: 10400 },
      { month: 'Jul 2026', gross: 33500, net: 31600, commission: 11200 },
      { month: 'Aug 2026', gross: 35100, net: 33200, commission: 12100 },
      {
        month: selectedMonth === '2026-09' ? 'Sep 2026 (Curr)' : selectedMonth,
        gross: stats.totalPayroll,
        net: stats.netPayroll,
        commission: stats.totalCommissions,
      },
    ];
  }, [stats, selectedMonth]);

  // Paid vs Pending Donut data
  const paymentStatusData = useMemo(() => {
    return [
      { name: 'Paid Salaries', value: stats.paidSalaries, color: '#10b981' },
      { name: 'Approved & Pending', value: stats.approvedSalaries + stats.pendingSalaries, color: '#f59e0b' },
    ];
  }, [stats]);

  // Top Coach Earning Leaderboard
  const topCoaches = useMemo(() => {
    return currentMonthRecords
      .filter((r) => r.commissionAmount > 0 || r.employeeRole === 'Trainer')
      .sort((a, b) => b.netSalary - a.netSalary)
      .slice(0, 4);
  }, [currentMonthRecords]);

  if (isRestrictedRole) {
    return (
      <div className="space-y-6">
        <RoleSwitcherBar />
        <Card className="p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
          <p className="text-sm text-slate-500 mt-2">
            Your current simulated role ({activeRole}) does not have permission to view financial
            payroll records. Switch to <strong>Admin</strong> or <strong>Manager</strong> above.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Interactive Role Switcher Banner */}
      <RoleSwitcherBar />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Payroll & Compensation Hub</span>
            <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              Cycle: {selectedMonth}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-staff salary calculation, transparent trainer commissions, and payment tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Month Selector */}
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

          {canManagePayroll && (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setIsAdvanceOpen(true)}
              >
                Advance
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setIsBonusOpen(true)}
              >
                Bonus
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Play className="w-3.5 h-3.5 fill-current" />}
                onClick={() => setIsProcessOpen(true)}
              >
                Process Payroll
              </Button>
            </>
          )}
        </div>
      </div>

      {/* TRAINER VIEW CUSTOM BANNER (If logged in as Trainer) */}
      {isTrainerRole && trainerRecord && (
        <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-5 border border-indigo-700 shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={trainerRecord.employeePhoto}
                alt={trainerRecord.employeeName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-400/50 shadow-sm"
              />
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-300">
                  Coach Self-Service Portal • {trainerRecord.payrollMonth}
                </span>
                <h3 className="text-xl font-black text-white">{trainerRecord.employeeName}</h3>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Compensation Model: <span className="font-bold">{trainerRecord.salaryType}</span> (
                  {trainerRecord.commissionPercentage}% Commission Share)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-indigo-950/60 border border-indigo-700/60 rounded-xl p-3 text-right">
                <span className="text-[10px] text-indigo-300 font-bold block uppercase">
                  Estimated Take-Home Pay
                </span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {formatCurrency(trainerRecord.netSalary)}
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={<FileText className="w-4 h-4" />}
                onClick={() => setSelectedRecordForPayslip(trainerRecord)}
                className="bg-white text-indigo-900 hover:bg-slate-100 font-bold"
              >
                View My Payslip
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PRIMARY 8-CARD METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Total Monthly Payroll */}
        <Card className="p-4 relative overflow-hidden border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Total Monthly Payroll
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {formatCurrency(stats.totalPayroll)}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +5.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Gross accrued liability</p>
        </Card>

        {/* 2. Total Fixed Salaries */}
        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Fixed & Base Salaries
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {formatCurrency(stats.totalFixedSalaries)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {stats.totalEmployeesCount} Employees
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Contractual baseline</p>
        </Card>

        {/* 3. Total Trainer Commissions (Crucial) */}
        <Card className="p-4 border-indigo-200 bg-indigo-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
              Trainer Commissions
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-950 font-mono">
              {formatCurrency(stats.totalCommissions)}
            </span>
            <span className="text-[11px] font-bold text-indigo-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> 70% Share
            </span>
          </div>
          <p className="text-[11px] text-indigo-600/80 mt-1">From eligible member revenue</p>
        </Card>

        {/* 4. Total Bonuses */}
        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Performance Bonuses
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700 font-mono">
              +{formatCurrency(stats.totalBonuses)}
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-sm">
              Incentives
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Target & special rewards</p>
        </Card>

        {/* 5. Total Advances */}
        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Salary Advances Deducted
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-700 font-mono">
              -{formatCurrency(stats.totalAdvances)}
            </span>
            <span className="text-[10px] text-amber-600 font-medium">Auto-Recovered</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Adjusted from net salary</p>
        </Card>

        {/* 6. Total Deductions */}
        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Penalties & Deductions
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-700 font-mono">
              -{formatCurrency(stats.totalDeductions)}
            </span>
            <span className="text-[10px] text-rose-600 font-medium">Lateness & Leaves</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Compliance adjustments</p>
        </Card>

        {/* 7. Paid Salaries */}
        <Card className="p-4 border-slate-200 bg-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
              Paid Disbursements
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-800 font-mono">
              {formatCurrency(stats.paidSalaries)}
            </span>
            <Badge variant="success" size="sm">
              Settled
            </Badge>
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">Transferred via bank</p>
        </Card>

        {/* 8. Net Payroll Payable */}
        <Card className="p-4 border-slate-900 bg-slate-900 text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400">
              Net Payable Payroll
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-sm">
              Final Net
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {formatCurrency(stats.netPayroll)}
            </span>
            <span className="text-[10px] text-slate-400">
              Pending: {formatCurrency(stats.pendingSalaries + stats.approvedSalaries)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Gross - Deductions - Advances</p>
        </Card>
      </div>

      {/* ANALYTICS & CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: 6-Month Trend (Area) */}
        <Card className="p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Payroll Expenditure Trend</h3>
              <p className="text-xs text-slate-500">Gross Payroll vs Net Paid vs Trainer Commission volume</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
              H1-H2 2026
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalTrendData}>
                <defs>
                  <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="gross"
                  name="Gross Payroll"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGross)"
                />
                <Area
                  type="monotone"
                  dataKey="commission"
                  name="Trainer Commission"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorComm)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Fixed vs Commission Breakdown (Donut) */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Payroll Composition</h3>
              <p className="text-xs text-slate-500">Fixed base vs Commission</p>
            </div>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={compositionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {compositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs">
            {compositionData.map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-600">{c.name}</span>
                </div>
                <span className="font-bold text-slate-900 font-mono">{formatCurrency(c.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* QUICK WORKFLOW & PENDING PAYROLL ACTIONS TABLE */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Active Month Payroll Records ({selectedMonth})
            </h3>
            <p className="text-xs text-slate-500">
              Review individual calculated salaries, verify transparent commissions, and approve payouts.
            </p>
          </div>

          {canManagePayroll && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => approveAllForMonth(selectedMonth)}
              >
                Approve All Pending
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => markAllPaidForMonth(selectedMonth)}
              >
                Mark All as Paid
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Staff / Coach</th>
                <th className="p-3">Salary Model</th>
                <th className="p-3 text-right">Base / Attendance</th>
                <th className="p-3 text-right">Commission</th>
                <th className="p-3 text-right">Bonuses</th>
                <th className="p-3 text-right">Deductions</th>
                <th className="p-3 text-right">Net Payable</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentMonthRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Staff Info */}
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rec.employeePhoto}
                        alt={rec.employeeName}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{rec.employeeName}</span>
                        <span className="text-[11px] text-slate-400">
                          {rec.employeeRole} • {rec.employeeId}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Salary Model */}
                  <td className="p-3">
                    <span className="font-medium text-slate-700 block">{rec.salaryType}</span>
                    {rec.commissionPercentage ? (
                      <span className="text-[10px] text-indigo-600 font-bold">
                        {rec.commissionPercentage}% of {rec.assignedMembersCount} athletes
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        {rec.presentDays}/{rec.totalWorkingDays} days
                      </span>
                    )}
                  </td>

                  {/* Base Pay */}
                  <td className="p-3 text-right font-mono font-medium text-slate-700">
                    {formatCurrency(rec.attendancePay || rec.baseSalary)}
                  </td>

                  {/* Commission */}
                  <td className="p-3 text-right font-mono font-bold text-indigo-600">
                    {rec.commissionAmount > 0 ? formatCurrency(rec.commissionAmount) : '—'}
                  </td>

                  {/* Bonuses */}
                  <td className="p-3 text-right font-mono text-emerald-600">
                    {rec.bonusAmount > 0 ? `+${formatCurrency(rec.bonusAmount)}` : '—'}
                  </td>

                  {/* Deductions + Advances */}
                  <td className="p-3 text-right font-mono text-rose-600">
                    {rec.totalDeductions > 0 ? `-${formatCurrency(rec.totalDeductions)}` : '—'}
                  </td>

                  {/* Net Payable */}
                  <td className="p-3 text-right font-mono font-black text-slate-900 text-sm">
                    {formatCurrency(rec.netSalary)}
                  </td>

                  {/* Status Badge */}
                  <td className="p-3 text-center">
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
                  <td className="p-3 text-right space-x-1 whitespace-nowrap">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODALS */}
      <ProcessPayrollModal
        isOpen={isProcessOpen}
        onClose={() => setIsProcessOpen(false)}
      />

      <AdvanceModal
        isOpen={isAdvanceOpen}
        onClose={() => setIsAdvanceOpen(false)}
      />

      <BonusModal
        isOpen={isBonusOpen}
        onClose={() => setIsBonusOpen(false)}
      />

      <DeductionModal
        isOpen={isDeductionOpen}
        onClose={() => setIsDeductionOpen(false)}
      />

      <PayslipModal
        isOpen={!!selectedRecordForPayslip}
        onClose={() => setSelectedRecordForPayslip(null)}
        record={selectedRecordForPayslip}
      />
    </div>
  );
};
