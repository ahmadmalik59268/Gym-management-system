import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Percent,
  Calendar,
  Building,
  CreditCard,
  Briefcase,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useGym } from '../../context/GymContext';
import { usePayroll } from '../../context/PayrollContext';
import {
  EmployeeSalaryConfig,
  SalaryType,
  CommissionBasis,
  CommissionRevenueTreatment,
} from '../../types';

interface SalaryConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  configToEdit?: EmployeeSalaryConfig | null;
}

export const SalaryConfigModal: React.FC<SalaryConfigModalProps> = ({
  isOpen,
  onClose,
  configToEdit,
}) => {
  const { currencySymbol } = useGym();
  const { updateSalaryConfig, addSalaryConfig, salaryConfigs } = usePayroll();

  const [formData, setFormData] = useState<Partial<EmployeeSalaryConfig>>({
    salaryType: 'Fixed Salary',
    baseSalary: 3000,
    hourlyRate: 20,
    dailyRate: 160,
    workingDaysPerMonth: 26,
    dailyHours: 8,
    commissionPercentage: 70,
    commissionBasis: 'Assigned Member Fees',
    commissionRevenueTreatment: 'Paid amount',
    joiningDate: new Date().toISOString().split('T')[0],
    salaryEffectiveDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    bankDetails: {
      bankName: '',
      accountTitle: '',
      accountNumber: '',
      ibanOrRouting: '',
    },
    status: 'Active',
    notes: '',
  });

  useEffect(() => {
    if (configToEdit) {
      setFormData({
        ...configToEdit,
        bankDetails: configToEdit.bankDetails || {
          bankName: '',
          accountTitle: '',
          accountNumber: '',
          ibanOrRouting: '',
        },
      });
    }
  }, [configToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configToEdit?.id) return;

    updateSalaryConfig(configToEdit.id, formData);
    onClose();
  };

  const isCommissionType =
    formData.salaryType === 'Percentage / Commission' ||
    formData.salaryType === 'Fixed + Percentage';

  const isAttendanceType = formData.salaryType === 'Attendance-Based Salary';
  const isHourlyType = formData.salaryType === 'Hourly / Daily';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Compensation Structure: ${configToEdit?.employeeName || 'Staff Member'}`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Summary Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {configToEdit?.photo && (
              <img
                src={configToEdit.photo}
                alt={configToEdit.employeeName}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
              />
            )}
            <div>
              <h4 className="text-sm font-bold text-slate-900">{configToEdit?.employeeName}</h4>
              <p className="text-xs text-slate-500">
                {configToEdit?.employeeRole} • ID: {configToEdit?.employeeId}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Current Model
            </span>
            <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 mt-0.5 inline-block">
              {formData.salaryType}
            </span>
          </div>
        </div>

        {/* Primary Salary Type Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            1. Staff Salary Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {(
              [
                {
                  type: 'Fixed Salary',
                  desc: 'Fixed monthly paycheck regardless of athlete volume',
                },
                {
                  type: 'Attendance-Based Salary',
                  desc: 'Prorated monthly pay based on verified working days',
                },
                {
                  type: 'Percentage / Commission',
                  desc: 'Earns commission % based on eligible athlete revenue',
                },
                {
                  type: 'Fixed + Percentage',
                  desc: 'Guaranteed base pay plus percentage commission',
                },
                {
                  type: 'Hourly / Daily',
                  desc: 'Rate per clocked hour or assigned shift day',
                },
              ] as { type: SalaryType; desc: string }[]
            ).map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => setFormData({ ...formData, salaryType: opt.type })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  formData.salaryType === opt.type
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-extrabold ${
                      formData.salaryType === opt.type ? 'text-indigo-900' : 'text-slate-800'
                    }`}
                  >
                    {opt.type}
                  </span>
                  {formData.salaryType === opt.type && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Base Pay Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200/80">
          <div>
            <Input
              label={
                formData.salaryType === 'Fixed + Percentage'
                  ? `Guaranteed Base Salary (${currencySymbol})`
                  : `Monthly Base Salary (${currencySymbol})`
              }
              type="number"
              min="0"
              value={formData.baseSalary || 0}
              onChange={(e) =>
                setFormData({ ...formData, baseSalary: parseFloat(e.target.value) || 0 })
              }
              disabled={formData.salaryType === 'Percentage / Commission' || isHourlyType}
              icon={<DollarSign className="w-4 h-4 text-slate-400" />}
            />
            {formData.salaryType === 'Percentage / Commission' && (
              <p className="text-[11px] text-slate-400 mt-1 italic">
                Base salary is 0 for 100% commission-based compensation.
              </p>
            )}
          </div>

          <div>
            <Input
              label="Standard Working Days per Month"
              type="number"
              min="1"
              max="31"
              value={formData.workingDaysPerMonth || 26}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  workingDaysPerMonth: parseInt(e.target.value) || 26,
                })
              }
              icon={<Calendar className="w-4 h-4 text-slate-400" />}
            />
            {isAttendanceType && (
              <p className="text-[11px] text-indigo-600 font-medium mt-1">
                Per-day rate: {currencySymbol}
                {((formData.baseSalary || 0) / (formData.workingDaysPerMonth || 26)).toFixed(2)}/day
              </p>
            )}
          </div>

          {isHourlyType && (
            <>
              <div>
                <Input
                  label={`Hourly Rate (${currencySymbol}/hr)`}
                  type="number"
                  min="0"
                  value={formData.hourlyRate || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Input
                  label={`Daily Shift Rate (${currencySymbol}/day)`}
                  type="number"
                  min="0"
                  value={formData.dailyRate || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, dailyRate: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </>
          )}
        </div>

        {/* Trainer / Commission Rules (Very Important Section) */}
        {isCommissionType && (
          <div className="bg-indigo-50/40 border border-indigo-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-950">
                Coach Commission & Percentage Configuration
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Input
                  label="Commission Percentage (%)"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.commissionPercentage || 70}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commissionPercentage: parseFloat(e.target.value) || 0,
                    })
                  }
                  icon={<Percent className="w-4 h-4 text-slate-400" />}
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Trainer receives {formData.commissionPercentage || 70}%, Gym retains{' '}
                  {100 - (formData.commissionPercentage || 70)}%.
                </p>
              </div>

              <div>
                <Select
                  label="Percentage Based On"
                  value={formData.commissionBasis || 'Assigned Member Fees'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commissionBasis: e.target.value as CommissionBasis,
                    })
                  }
                  options={[
                    { value: 'Assigned Member Fees', label: 'Assigned Member Fees' },
                    { value: 'Personal Training Fees', label: 'Personal Training Fees' },
                    { value: 'Membership Fees', label: 'All Membership Fees' },
                    { value: 'Selected Revenue', label: 'Selected Revenue' },
                    { value: 'Custom Eligible Revenue', label: 'Custom Eligible Revenue' },
                  ]}
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Only payments from eligible revenue stream generate commission.
                </p>
              </div>

              <div>
                <Select
                  label="Revenue Calculation Basis"
                  value={formData.commissionRevenueTreatment || 'Paid amount'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commissionRevenueTreatment: e.target.value as CommissionRevenueTreatment,
                    })
                  }
                  options={[
                    { value: 'Paid amount', label: 'Paid Amount (Actual Cash Received)' },
                    {
                      value: 'Final membership amount',
                      label: 'Final Membership Price (Invoice Amount)',
                    },
                    {
                      value: 'Personal training revenue',
                      label: 'Personal Training Revenue Only',
                    },
                    { value: 'Custom revenue', label: 'Custom Verified Revenue' },
                  ]}
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Protects gym by avoiding commission on unpaid balances.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Effective Dates & Payment Channel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Input
              label="Joining Date"
              type="date"
              value={formData.joiningDate || ''}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
            />
          </div>
          <div>
            <Input
              label="Salary Effective Date"
              type="date"
              value={formData.salaryEffectiveDate || ''}
              onChange={(e) => setFormData({ ...formData, salaryEffectiveDate: e.target.value })}
            />
          </div>
          <div>
            <Select
              label="Disbursement Method"
              value={formData.paymentMethod || 'Bank Transfer'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentMethod: e.target.value as any,
                })
              }
              options={[
                { value: 'Bank Transfer', label: 'Bank Transfer / Direct Deposit' },
                { value: 'Cash', label: 'Cash Disbursement' },
                { value: 'Cheque', label: 'Cheque' },
                { value: 'Online Wallet', label: 'Online Wallet' },
              ]}
            />
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-500" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Direct Deposit & Bank Information
            </h5>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              label="Bank Name"
              placeholder="e.g. Chase Bank NA"
              value={formData.bankDetails?.bankName || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bankDetails: {
                    ...formData.bankDetails!,
                    bankName: e.target.value,
                  },
                })
              }
            />
            <Input
              label="Account Title / Beneficiary"
              placeholder="e.g. Frank Coleman"
              value={formData.bankDetails?.accountTitle || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bankDetails: {
                    ...formData.bankDetails!,
                    accountTitle: e.target.value,
                  },
                })
              }
            />
            <Input
              label="Account Number"
              placeholder="•••• 1234"
              value={formData.bankDetails?.accountNumber || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bankDetails: {
                    ...formData.bankDetails!,
                    accountNumber: e.target.value,
                  },
                })
              }
            />
            <Input
              label="Routing / IBAN"
              placeholder="e.g. 021000021"
              value={formData.bankDetails?.ibanOrRouting || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bankDetails: {
                    ...formData.bankDetails!,
                    ibanOrRouting: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Compensation Structure
          </Button>
        </div>
      </form>
    </Modal>
  );
};
