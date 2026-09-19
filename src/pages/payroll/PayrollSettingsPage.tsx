import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Building,
  Percent,
  Calendar,
  DollarSign,
  Save,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { useGym } from '../../context/GymContext';
import { usePayroll } from '../../context/PayrollContext';
import { PayrollSettings, CommissionBasis, CommissionRevenueTreatment } from '../../types';

export const PayrollSettingsPage: React.FC = () => {
  const { currencySymbol, showToast } = useGym();
  const { payrollSettings, updatePayrollSettings, canManagePayroll } = usePayroll();

  const [formData, setFormData] = useState<PayrollSettings>(payrollSettings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePayrollSettings(formData);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Payroll Global Rules & Settings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Define global defaults, commission revenue treatment, anti-double counting flags, and
            payslip signatory details.
          </p>
        </div>

        {canManagePayroll && (
          <Button
            variant="primary"
            size="sm"
            icon={<Save className="w-3.5 h-3.5" />}
            onClick={handleSubmit}
          >
            Save Global Settings
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Default Attendance & Calendar Rules */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              1. Attendance & Working Days Defaults
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Standard Working Days per Month"
                type="number"
                min="1"
                max="31"
                value={formData.defaultWorkingDaysPerMonth || 26}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultWorkingDaysPerMonth: parseInt(e.target.value) || 26,
                  })
                }
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Used to compute per-day prorated salary = Monthly Base ÷ Working Days
              </p>
            </div>

            <div>
              <Input
                label="Standard Daily Working Hours"
                type="number"
                min="1"
                max="24"
                value={formData.defaultDailyHours || 8}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultDailyHours: parseInt(e.target.value) || 8,
                  })
                }
              />
              <p className="text-[11px] text-slate-400 mt-1">Standard shift benchmark for overtime</p>
            </div>
          </div>
        </Card>

        {/* Card 2: Commission & Revenue Treatment Rules */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
            <Percent className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              2. Default Commission & Double-Counting Safeguards
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Select
                label="Default Commission Revenue Stream"
                value={formData.defaultCommissionBasis || 'Assigned Member Fees'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultCommissionBasis: e.target.value as CommissionBasis,
                  })
                }
                options={[
                  { value: 'Assigned Member Fees', label: 'Assigned Member Fees' },
                  { value: 'Personal Training Fees', label: 'Personal Training Fees Only' },
                  { value: 'Membership Fees', label: 'All Membership Fees' },
                  { value: 'Selected Revenue', label: 'Selected Verified Revenue' },
                ]}
              />
            </div>

            <div>
              <Select
                label="Revenue Treatment Basis"
                value={formData.commissionRevenueTreatment || 'Paid amount'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commissionRevenueTreatment: e.target.value as CommissionRevenueTreatment,
                  })
                }
                options={[
                  { value: 'Paid amount', label: 'Paid Amount (Actual Cash Collected)' },
                  {
                    value: 'Final membership amount',
                    label: 'Final Membership Price (Invoice Amount)',
                  },
                  {
                    value: 'Personal training revenue',
                    label: 'Personal Training Revenue Only',
                  },
                ]}
              />
            </div>
          </div>

          {/* Checkbox safeguards */}
          <div className="pt-2 space-y-3">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.excludeRefundedPayments}
                onChange={(e) =>
                  setFormData({ ...formData, excludeRefundedPayments: e.target.checked })
                }
                className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="font-semibold">
                Exclude Refunded Transactions from Commission Pool (Recommended)
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.excludeCancelledPayments}
                onChange={(e) =>
                  setFormData({ ...formData, excludeCancelledPayments: e.target.checked })
                }
                className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="font-semibold">
                Exclude Cancelled / Failed Invoices from Commission Calculations
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoDeductAdvances}
                onChange={(e) =>
                  setFormData({ ...formData, autoDeductAdvances: e.target.checked })
                }
                className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="font-semibold">
                Auto-Deduct Outstanding Salary Advances on Monthly Payroll Processing
              </span>
            </label>
          </div>
        </Card>

        {/* Card 3: Tax & Official Payslip Signatory */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
            <FileCheck className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              3. Tax Registration & Authorized Payslip Signatory
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="Tax Identification / NTN Number"
                placeholder="e.g. TAX-OR-9923841-B"
                value={formData.taxNumber || ''}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="Authorized Signatory Full Name"
                placeholder="e.g. Robert Hayes"
                value={formData.authorizedSignatoryName || ''}
                onChange={(e) =>
                  setFormData({ ...formData, authorizedSignatoryName: e.target.value })
                }
              />
            </div>

            <div>
              <Input
                label="Signatory Title / Designation"
                placeholder="e.g. Head of Operations & Finance"
                value={formData.authorizedSignatoryTitle || ''}
                onChange={(e) =>
                  setFormData({ ...formData, authorizedSignatoryTitle: e.target.value })
                }
              />
            </div>
          </div>
        </Card>

        {canManagePayroll && (
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              icon={<Save className="w-4 h-4" />}
            >
              Save Configuration
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};
