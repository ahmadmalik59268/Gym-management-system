import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  DollarSign,
  Percent,
  Calendar,
  Building,
  CheckCircle2,
  Briefcase,
  Layers,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { useGym } from '../../context/GymContext';
import { usePayroll } from '../../context/PayrollContext';
import { SalaryConfigModal } from '../../components/payroll/SalaryConfigModal';
import { EmployeeSalaryConfig, SalaryType } from '../../types';

export const SalaryManagement: React.FC = () => {
  const { formatCurrency, currencySymbol } = useGym();
  const { salaryConfigs, canManagePayroll, selectedMonth, payrollRecords } = usePayroll();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [salaryTypeFilter, setSalaryTypeFilter] = useState('All');
  const [selectedConfigForEdit, setSelectedConfigForEdit] = useState<EmployeeSalaryConfig | null>(
    null
  );
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Filtered configs
  const filteredConfigs = useMemo(() => {
    return salaryConfigs.filter((cfg) => {
      const matchesSearch =
        cfg.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cfg.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cfg.employeeRole.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === 'All' ||
        cfg.employeeRole === roleFilter ||
        (roleFilter === 'Staff' && cfg.employeeType === 'Staff');

      const matchesType = salaryTypeFilter === 'All' || cfg.salaryType === salaryTypeFilter;

      return matchesSearch && matchesRole && matchesType;
    });
  }, [salaryConfigs, searchQuery, roleFilter, salaryTypeFilter]);

  const handleEdit = (config: EmployeeSalaryConfig) => {
    setSelectedConfigForEdit(config);
    setIsConfigModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Staff Salary & Compensation Structure
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure salary types (Fixed, Attendance, Commission, Hybrid) and banking information
            for all gym staff and personal trainers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="md">
            {salaryConfigs.length} Total Profiles
          </Badge>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by staff name, role, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold p-2.5 outline-hidden"
            >
              <option value="All">All Roles</option>
              <option value="Trainer">Trainers</option>
              <option value="Manager">Managers</option>
              <option value="Receptionist">Receptionists</option>
              <option value="Admin">Admins</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Model:</span>
            <select
              value={salaryTypeFilter}
              onChange={(e) => setSalaryTypeFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold p-2.5 outline-hidden"
            >
              <option value="All">All Salary Types</option>
              <option value="Fixed Salary">Fixed Salary</option>
              <option value="Attendance-Based Salary">Attendance-Based Salary</option>
              <option value="Percentage / Commission">Percentage / Commission</option>
              <option value="Fixed + Percentage">Fixed + Percentage</option>
              <option value="Hourly / Daily">Hourly / Daily</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Salary Configs Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Designation</th>
                <th className="p-3.5">Salary Model</th>
                <th className="p-3.5 text-right">Base Pay / Rate</th>
                <th className="p-3.5 text-right">Commission Share</th>
                <th className="p-3.5">Working Days</th>
                <th className="p-3.5">Bank Information</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredConfigs.map((cfg) => {
                const currentMonthRecord = payrollRecords.find(
                  (r) => r.employeeId === cfg.employeeId && r.payrollMonth === selectedMonth
                );

                return (
                  <tr key={cfg.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Employee Profile */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            cfg.photo ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                          }
                          alt={cfg.employeeName}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-2xs"
                        />
                        <div>
                          <span className="font-extrabold text-slate-900 block">
                            {cfg.employeeName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {cfg.employeeId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-3.5">
                      <Badge
                        variant={
                          cfg.employeeRole === 'Trainer'
                            ? 'info'
                            : cfg.employeeRole === 'Admin'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {cfg.employeeRole}
                      </Badge>
                    </td>

                    {/* Salary Model */}
                    <td className="p-3.5 font-medium text-slate-800">
                      <span className="block font-bold">{cfg.salaryType}</span>
                      {cfg.salaryType === 'Percentage / Commission' && (
                        <span className="text-[10px] text-indigo-600">
                          Basis: {cfg.commissionBasis || 'Assigned Members'}
                        </span>
                      )}
                    </td>

                    {/* Base Pay */}
                    <td className="p-3.5 text-right font-mono font-bold text-slate-800">
                      {cfg.baseSalary > 0
                        ? formatCurrency(cfg.baseSalary)
                        : cfg.salaryType === 'Hourly / Daily'
                        ? `${formatCurrency(cfg.hourlyRate || 22)}/hr`
                        : '— (Commission only)'}
                    </td>

                    {/* Commission % */}
                    <td className="p-3.5 text-right font-mono">
                      {cfg.commissionPercentage && cfg.commissionPercentage > 0 ? (
                        <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {cfg.commissionPercentage}%
                        </span>
                      ) : (
                        <span className="text-slate-400">0%</span>
                      )}
                    </td>

                    {/* Working Days */}
                    <td className="p-3.5 text-slate-600 font-medium">
                      {cfg.workingDaysPerMonth || 26} days/mo
                    </td>

                    {/* Bank Info */}
                    <td className="p-3.5 text-slate-600">
                      {cfg.bankDetails?.bankName ? (
                        <div>
                          <span className="font-bold text-slate-800 block text-[11px]">
                            {cfg.bankDetails.bankName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {cfg.bankDetails.accountNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Cash / Ledger</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-3.5 text-center">
                      <Badge variant="success" size="sm">
                        {cfg.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Edit2 className="w-3.5 h-3.5" />}
                        onClick={() => handleEdit(cfg)}
                        disabled={!canManagePayroll}
                      >
                        Configure
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <SalaryConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => {
          setIsConfigModalOpen(false);
          setSelectedConfigForEdit(null);
        }}
        configToEdit={selectedConfigForEdit}
      />
    </div>
  );
};
