import React, { useState } from 'react';
import {
  LayoutDashboard,
  DollarSign,
  Percent,
  Calendar,
  Clock,
  Award,
  History,
  FileText,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { PayrollDashboard } from './PayrollDashboard';
import { SalaryManagement } from './SalaryManagement';
import { TrainerCommissions } from './TrainerCommissions';
import { AttendanceSalary } from './AttendanceSalary';
import { SalaryAdvances } from './SalaryAdvances';
import { DeductionsBonuses } from './DeductionsBonuses';
import { PayrollHistory } from './PayrollHistory';
import { SalarySlips } from './SalarySlips';
import { PayrollSettingsPage } from './PayrollSettingsPage';
import { usePayroll } from '../../context/PayrollContext';

export const PayrollLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const { activeRole, isRestrictedRole } = usePayroll();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'salary-management', label: 'Salary Management', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'trainer-commissions', label: 'Trainer Commissions', icon: <Percent className="w-4 h-4" /> },
    { id: 'attendance-salary', label: 'Attendance & Salary', icon: <Calendar className="w-4 h-4" /> },
    { id: 'advances', label: 'Salary Advances', icon: <Clock className="w-4 h-4" /> },
    { id: 'bonuses-deductions', label: 'Bonuses & Deductions', icon: <Award className="w-4 h-4" /> },
    { id: 'history', label: 'Payroll History', icon: <History className="w-4 h-4" /> },
    { id: 'salary-slips', label: 'Salary Slips', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: 'Payroll Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Horizontal Tab Navigation */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-1.5 shadow-2xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab View Render */}
      <div>
        {activeTab === 'dashboard' && <PayrollDashboard onNavigateTab={(t) => setActiveTab(t)} />}
        {activeTab === 'salary-management' && <SalaryManagement />}
        {activeTab === 'trainer-commissions' && <TrainerCommissions />}
        {activeTab === 'attendance-salary' && <AttendanceSalary />}
        {activeTab === 'advances' && <SalaryAdvances />}
        {activeTab === 'bonuses-deductions' && <DeductionsBonuses />}
        {activeTab === 'history' && <PayrollHistory />}
        {activeTab === 'salary-slips' && <SalarySlips />}
        {activeTab === 'settings' && <PayrollSettingsPage />}
      </div>
    </div>
  );
};
