import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, FileText, User } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useGym } from '../../context/GymContext';
import { usePayroll } from '../../context/PayrollContext';
import { SalaryAdvance, AdvanceStatus } from '../../types';

interface AdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  advanceToEdit?: SalaryAdvance | null;
}

export const AdvanceModal: React.FC<AdvanceModalProps> = ({
  isOpen,
  onClose,
  advanceToEdit,
}) => {
  const { currencySymbol, formatCurrency } = useGym();
  const { salaryConfigs, addAdvance, updateAdvance, selectedMonth } = usePayroll();

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    employeeRole: 'Trainer' as any,
    amount: 500,
    requestDate: new Date().toISOString().split('T')[0],
    disbursedDate: new Date().toISOString().split('T')[0],
    reason: '',
    payrollMonth: selectedMonth || '2026-09',
    paymentMethod: 'Bank Transfer' as 'Bank Transfer' | 'Cash' | 'Cheque',
    notes: '',
  });

  useEffect(() => {
    if (advanceToEdit) {
      setFormData({
        employeeId: advanceToEdit.employeeId,
        employeeName: advanceToEdit.employeeName,
        employeeRole: advanceToEdit.employeeRole,
        amount: advanceToEdit.amount,
        requestDate: advanceToEdit.requestDate,
        disbursedDate: advanceToEdit.disbursedDate || advanceToEdit.requestDate,
        reason: advanceToEdit.reason,
        payrollMonth: advanceToEdit.payrollMonth,
        paymentMethod: (advanceToEdit.paymentMethod as any) || 'Bank Transfer',
        notes: advanceToEdit.notes || '',
      });
    } else if (salaryConfigs.length > 0) {
      const first = salaryConfigs[0];
      setFormData((prev) => ({
        ...prev,
        employeeId: first.employeeId,
        employeeName: first.employeeName,
        employeeRole: first.employeeRole,
        payrollMonth: selectedMonth,
      }));
    }
  }, [advanceToEdit, isOpen, salaryConfigs, selectedMonth]);

  const handleEmployeeChange = (empId: string) => {
    const found = salaryConfigs.find((c) => c.employeeId === empId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        employeeId: found.employeeId,
        employeeName: found.employeeName,
        employeeRole: found.employeeRole,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId || formData.amount <= 0) return;

    if (advanceToEdit) {
      updateAdvance(advanceToEdit.id, formData);
    } else {
      addAdvance(formData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={advanceToEdit ? 'Edit Salary Advance' : 'Record New Salary Advance'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Select
            label="Select Staff / Trainer"
            value={formData.employeeId}
            onChange={(e) => handleEmployeeChange(e.target.value)}
            options={salaryConfigs.map((c) => ({
              value: c.employeeId,
              label: `${c.employeeName} (${c.employeeRole})`,
            }))}
            disabled={!!advanceToEdit}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label={`Advance Amount (${currencySymbol})`}
              type="number"
              min="1"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
              }
              icon={<DollarSign className="w-4 h-4 text-slate-400" />}
              required
            />
          </div>
          <div>
            <Input
              label="Payroll Month for Recovery"
              type="month"
              value={formData.payrollMonth}
              onChange={(e) => setFormData({ ...formData, payrollMonth: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Request / Disbursal Date"
              type="date"
              value={formData.requestDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  requestDate: e.target.value,
                  disbursedDate: e.target.value,
                })
              }
              required
            />
          </div>
          <div>
            <Select
              label="Disbursement Mode"
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({ ...formData, paymentMethod: e.target.value as any })
              }
              options={[
                { value: 'Bank Transfer', label: 'Bank Transfer / Online' },
                { value: 'Cash', label: 'Cash in Hand' },
                { value: 'Cheque', label: 'Company Cheque' },
              ]}
            />
          </div>
        </div>

        <div>
          <Input
            label="Reason for Advance"
            placeholder="e.g. Urgent family emergency or equipment purchase"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Internal Accounting Notes
          </label>
          <textarea
            rows={2}
            className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
            placeholder="Will be deducted automatically during monthly payroll run..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800">
          <span className="font-bold">Notice:</span>
          <span>
            This advance will automatically deduct {formatCurrency(formData.amount)} from{' '}
            {formData.employeeName}&apos;s net pay in the {formData.payrollMonth} cycle.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {advanceToEdit ? 'Save Changes' : 'Record Advance'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
