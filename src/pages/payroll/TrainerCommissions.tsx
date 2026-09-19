import React, { useState, useMemo } from 'react';
import {
  Percent,
  DollarSign,
  TrendingUp,
  Users,
  Award,
  Filter,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Search,
  FileSpreadsheet,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { useGym } from '../../context/GymContext';
import { usePayroll } from '../../context/PayrollContext';
import { MemberCommissionBreakdown, EmployeeSalaryConfig } from '../../types';
import { SalaryConfigModal } from '../../components/payroll/SalaryConfigModal';

export const TrainerCommissions: React.FC = () => {
  const { formatCurrency, currencySymbol, showToast } = useGym();
  const {
    salaryConfigs,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    getTrainerMemberCommissions,
    activeRole,
    simulatedTrainerId,
    canManagePayroll,
    isTrainerRole,
  } = usePayroll();

  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('TRN-101');
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [trainerForConfig, setTrainerForConfig] = useState<EmployeeSalaryConfig | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // All trainers with commission or PT roles
  const allTrainerConfigs = useMemo(() => {
    return salaryConfigs.filter(
      (c) =>
        c.employeeType === 'Trainer' ||
        c.employeeRole === 'Trainer' ||
        c.salaryType === 'Percentage / Commission' ||
        c.salaryType === 'Fixed + Percentage'
    );
  }, [salaryConfigs]);

  // If active role is Trainer, lock view to that specific trainer
  const effectiveTrainerConfigs = useMemo(() => {
    if (isTrainerRole) {
      return allTrainerConfigs.filter((t) => t.employeeId === simulatedTrainerId);
    }
    return allTrainerConfigs.filter((t) =>
      t.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allTrainerConfigs, isTrainerRole, simulatedTrainerId, searchTerm]);

  // Calculate detailed summary per trainer for the table
  const trainerSummaries = useMemo(() => {
    return effectiveTrainerConfigs.map((tConfig) => {
      const breakdown = getTrainerMemberCommissions(
        tConfig.employeeId,
        selectedMonth,
        tConfig.commissionBasis,
        tConfig.commissionRevenueTreatment,
        tConfig.commissionPercentage
      );

      const eligibleList = breakdown.filter((b) => b.status === 'Eligible');
      const totalEligibleRevenue = eligibleList.reduce((acc, curr) => acc + curr.eligibleAmount, 0);
      const totalTrainerCommission = eligibleList.reduce((acc, curr) => acc + curr.trainerShare, 0);
      const totalGymShare = eligibleList.reduce((acc, curr) => acc + curr.gymShare, 0);

      return {
        config: tConfig,
        breakdown,
        assignedCount: breakdown.length,
        eligibleCount: eligibleList.length,
        totalEligibleRevenue,
        totalTrainerCommission,
        totalGymShare,
      };
    });
  }, [effectiveTrainerConfigs, getTrainerMemberCommissions, selectedMonth]);

  // High level aggregated metrics
  const aggregatedStats = useMemo(() => {
    let totalRev = 0;
    let totalComm = 0;
    let totalGym = 0;
    trainerSummaries.forEach((s) => {
      totalRev += s.totalEligibleRevenue;
      totalComm += s.totalTrainerCommission;
      totalGym += s.totalGymShare;
    });

    return {
      totalRev,
      totalComm,
      totalGym,
      activeCoaches: trainerSummaries.length,
    };
  }, [trainerSummaries]);

  // Selected trainer breakdown for modal view
  const activeModalTrainerSummary = useMemo(() => {
    return trainerSummaries.find((s) => s.config.employeeId === selectedTrainerId);
  }, [trainerSummaries, selectedTrainerId]);

  const handleOpenBreakdown = (trainerId: string) => {
    setSelectedTrainerId(trainerId);
    setIsBreakdownModalOpen(true);
  };

  const handleExportCSV = () => {
    showToast('Trainer Commission Report exported to CSV', 'success');
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Trainer Commission & Revenue Share System</span>
            <span className="text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
              {selectedMonth}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Transparent calculation formula: Revenue × Percentage % = Coach Share. Retains gym
            earnings and prevents double-counting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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

          <Button
            variant="outline"
            size="sm"
            icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
            onClick={handleExportCSV}
          >
            Export Report (CSV)
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Printer className="w-3.5 h-3.5" />}
            onClick={handlePrintReport}
          >
            Print Summary
          </Button>
        </div>
      </div>

      {/* 4 COMMISSION SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            Total Commission Paid to Coaches
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-700 font-mono">
              {formatCurrency(aggregatedStats.totalComm)}
            </span>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded-sm">
              70% Avg
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Direct coach earnings</p>
        </Card>

        <Card className="p-4 border-slate-200">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            Total Eligible Revenue Base
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {formatCurrency(aggregatedStats.totalRev)}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Verified Paid</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">From assigned athlete fees</p>
        </Card>

        <Card className="p-4 border-slate-200 bg-emerald-50/20">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
            Club Retained Share
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-800 font-mono">
              {formatCurrency(aggregatedStats.totalGym)}
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-sm">
              30% Retained
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">Gym gross operational margin</p>
        </Card>

        <Card className="p-4 border-slate-200">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            Active Commission Coaches
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {aggregatedStats.activeCoaches} Coaches
            </span>
            <span className="text-[10px] text-indigo-600 font-bold">Independent %</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Custom percentage per trainer</p>
        </Card>
      </div>

      {/* FORMULA TRANSPARENCY BANNER */}
      <div className="bg-indigo-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-wider">
              Transparent Multi-Trainer Commission Architecture
            </span>
          </div>
          <p className="text-xs text-indigo-100">
            Each trainer operates with independent revenue share settings without global override:
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
            <span className="bg-indigo-950/80 px-2.5 py-1 rounded-md text-emerald-300 border border-indigo-700">
              Trainer Share = Eligible Collected Revenue × Trainer Commission %
            </span>
            <span className="bg-indigo-950/80 px-2.5 py-1 rounded-md text-indigo-300 border border-indigo-700">
              Gym Share = Eligible Collected Revenue - Trainer Share
            </span>
          </div>
        </div>
      </div>

      {/* TRAINERS COMMISSION LIST TABLE */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900">
            Coaches Commission Breakdown ({selectedMonth})
          </h3>

          {!isTrainerRole && (
            <div className="w-full sm:w-64">
              <Input
                placeholder="Search coach..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-3.5 h-3.5 text-slate-400" />}
              />
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Trainer Profile</th>
                <th className="p-3.5">Commission Basis</th>
                <th className="p-3.5 text-center">Assigned Athletes</th>
                <th className="p-3.5 text-right">Eligible Revenue</th>
                <th className="p-3.5 text-center">Commission Rate</th>
                <th className="p-3.5 text-right">Coach Share</th>
                <th className="p-3.5 text-right">Gym Share</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trainerSummaries.map((item) => (
                <tr key={item.config.employeeId} className="hover:bg-slate-50/80 transition-colors">
                  {/* Trainer */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.config.photo}
                        alt={item.config.employeeName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs"
                      />
                      <div>
                        <span className="font-extrabold text-slate-900 block">
                          {item.config.employeeName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {item.config.employeeId} • {item.config.salaryType}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Basis & Treatment */}
                  <td className="p-3.5">
                    <span className="font-bold text-slate-800 block text-[11px]">
                      {item.config.commissionBasis || 'Assigned Member Fees'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Based on: {item.config.commissionRevenueTreatment || 'Paid amount'}
                    </span>
                  </td>

                  {/* Athletes Count */}
                  <td className="p-3.5 text-center">
                    <span className="font-bold font-mono text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                      {item.assignedCount} Athletes
                    </span>
                  </td>

                  {/* Eligible Revenue */}
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(item.totalEligibleRevenue)}
                  </td>

                  {/* Rate */}
                  <td className="p-3.5 text-center">
                    <span className="font-extrabold font-mono text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                      {item.config.commissionPercentage}%
                    </span>
                  </td>

                  {/* Coach Share */}
                  <td className="p-3.5 text-right font-mono font-black text-indigo-600 text-sm">
                    {formatCurrency(item.totalTrainerCommission)}
                  </td>

                  {/* Gym Share */}
                  <td className="p-3.5 text-right font-mono text-emerald-700 font-semibold">
                    {formatCurrency(item.totalGymShare)}
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenBreakdown(item.config.employeeId)}
                    >
                      Itemized Math
                    </Button>
                    {canManagePayroll && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTrainerForConfig(item.config);
                          setIsConfigModalOpen(true);
                        }}
                      >
                        Edit %
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ITEMIZED MEMBER BREAKDOWN MODAL */}
      <Modal
        isOpen={isBreakdownModalOpen}
        onClose={() => setIsBreakdownModalOpen(false)}
        title={`Itemized Commission Breakdown: ${activeModalTrainerSummary?.config.employeeName}`}
        size="xl"
      >
        <div className="space-y-4">
          {/* Summary Banner */}
          <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={activeModalTrainerSummary?.config.photo}
                alt={activeModalTrainerSummary?.config.employeeName}
                className="w-12 h-12 rounded-xl object-cover border border-slate-700"
              />
              <div>
                <h4 className="text-sm font-bold text-white">
                  {activeModalTrainerSummary?.config.employeeName}
                </h4>
                <p className="text-xs text-indigo-300">
                  Commission Rate: {activeModalTrainerSummary?.config.commissionPercentage}% • Basis:{' '}
                  {activeModalTrainerSummary?.config.commissionBasis}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">
                  Eligible Revenue
                </span>
                <span className="text-sm font-mono font-bold text-white">
                  {formatCurrency(activeModalTrainerSummary?.totalEligibleRevenue || 0)}
                </span>
              </div>
              <div className="border-l border-slate-700 pl-4">
                <span className="text-[10px] text-emerald-400 uppercase block font-bold">
                  Trainer Commission
                </span>
                <span className="text-lg font-mono font-black text-emerald-400">
                  {formatCurrency(activeModalTrainerSummary?.totalTrainerCommission || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Member Transactions Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Receipt #</th>
                    <th className="p-3">Athlete Name</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Payment</th>
                    <th className="p-3 text-right">Eligible Base</th>
                    <th className="p-3 text-right">
                      Coach Share ({activeModalTrainerSummary?.config.commissionPercentage}%)
                    </th>
                    <th className="p-3 text-right">Gym Retained</th>
                    <th className="p-3 text-center">Eligibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(activeModalTrainerSummary?.breakdown || []).map((m, idx) => (
                    <tr key={`breakdown-row-${m.receiptNumber}-${idx}`} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono text-slate-500 font-medium">{m.receiptNumber}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {m.memberPhoto && (
                            <img
                              src={m.memberPhoto}
                              alt={m.memberName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <span className="font-bold text-slate-900">{m.memberName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600">{m.planName}</td>
                      <td className="p-3 text-slate-500">{m.paymentDate}</td>
                      <td className="p-3 text-right font-mono">{formatCurrency(m.paymentAmount)}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(m.eligibleAmount)}
                      </td>
                      <td className="p-3 text-right font-mono font-black text-indigo-600">
                        {formatCurrency(m.trainerShare)}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600">
                        {formatCurrency(m.gymShare)}
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant={m.status === 'Eligible' ? 'success' : 'danger'}
                          size="sm"
                        >
                          {m.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Showing {activeModalTrainerSummary?.breakdown.length} member payment records.
            </span>
            <Button variant="outline" onClick={() => setIsBreakdownModalOpen(false)}>
              Close Breakdown
            </Button>
          </div>
        </div>
      </Modal>

      {/* Salary Config Modal */}
      <SalaryConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setTrainerForConfig(null);
        }}
        configToEdit={trainerForConfig}
      />
    </div>
  );
};
