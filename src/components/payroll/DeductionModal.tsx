import React, { useState, useEffect } from 'react';
import { DollarSign, AlertTriangle, FileText } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useGym } from '../../context/GymContext';
import { usePayroll } from '../../context/PayrollContext';
import { PayrollDeduction, DeductionType } from '../../types';

interface DeductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  deductionToEdit?: PayrollDeduction | null;
}

export const DeductionModal: React.FC<DeductionModalProps> = ({
  isOpen,
  onClose,
  deductionToEdit,
}) => {
  const { currencySymbol } = useGym();
  const { salaryConfigs, addDeduction, updateDeduction, selectedMonth } = usePayroll();

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    employeeRole: 'Staff' as any,
    type: 'Late deduction' as DeductionType,
    amount: 50,
    date: new Date().toISOString().split('T')[0],
    reason: '',
    payrollMonth: selectedMonth || '2026-09',
    notes: '',
  });

  useEffect(() => {
    if (deductionToEdit) {
      setFormData({
        employeeId: deductionToEdit.employeeId,
        employeeName: deductionToEdit.employeeName,
        employeeRole: deductionToEdit.employeeRole,
        type: deductionToEdit.type,
        amount: deductionToEdit.amount,
        date: deductionToEdit.date,
        reason: deductionToEdit.reason,
        payrollMonth: deductionToEdit.payrollMonth,
        notes: deductionToEdit.notes || '',
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
  }, [deductionToEdit, isOpen, salaryConfigs, selectedMonth]);

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

    if (deductionToEdit) {
      updateDeduction(deductionToEdit.id, formData);
    } else {
      addDeduction(formData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={deductionToEdit ? 'Edit Deduction' : 'Add Payroll Deduction'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Select
            label="Staff Member / Trainer"
            value={formData.employeeId}
            onChange={(e) => handleEmployeeChange(e.target.value)}
            options={salaryConfigs.map((c) => ({
              value: c.employeeId,
              label: `${c.employeeName} (${c.employeeRole})`,
            }))}
            disabled={!!deductionToEdit}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Select
              label="Deduction Category"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as DeductionType })
              }
              options={[
                { value: 'Late deduction', label: 'Late Arrival Penalty' },
                { value: 'Unpaid leave', label: 'Unpaid Absence Deduction' },
                { value: 'Advance recovery', label: 'Manual Advance Recovery' },
                { value: 'Tax', label: 'Statutory Income Tax' },
                { value: 'Damage / Penalty', label: 'Equipment Damage / Rule Penalty' },
                { value: 'Other deduction', label: 'Other Miscellaneous Deduction' },
              ]}
            />
          </div>
          <div>
            <Input
              label={`Deduction Amount (${currencySymbol})`}
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Incident / Deduction Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div>
            <Input
              label="Payroll Month"
              type="month"
              value={formData.payrollMonth}
              onChange={(e) => setFormData({ ...formData, payrollMonth: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <Input
            label="Reason / Details"
            placeholder="e.g. 2x unexcused late arrivals or equipment damage"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Accounting Notes
          </label>
          <textarea
            rows={2}
            className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
            placeholder="Recorded per employee agreement..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {deductionToEdit ? 'Save Changes' : 'Apply Deduction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
