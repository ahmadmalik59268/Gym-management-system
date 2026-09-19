import React, { useState, useEffect } from 'react';
import { DollarSign, Sparkles, Award } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useGym } from '../../context/GymContext';
import { usePayroll } from '../../context/PayrollContext';
import { PayrollBonus, BonusType } from '../../types';

interface BonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  bonusToEdit?: PayrollBonus | null;
}

export const BonusModal: React.FC<BonusModalProps> = ({
  isOpen,
  onClose,
  bonusToEdit,
}) => {
  const { currencySymbol } = useGym();
  const { salaryConfigs, addBonus, updateBonus, selectedMonth } = usePayroll();

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    employeeRole: 'Trainer' as any,
    type: 'Performance bonus' as BonusType,
    amount: 250,
    date: new Date().toISOString().split('T')[0],
    reason: '',
    payrollMonth: selectedMonth || '2026-09',
    notes: '',
  });

  useEffect(() => {
    if (bonusToEdit) {
      setFormData({
        employeeId: bonusToEdit.employeeId,
        employeeName: bonusToEdit.employeeName,
        employeeRole: bonusToEdit.employeeRole,
        type: bonusToEdit.type,
        amount: bonusToEdit.amount,
        date: bonusToEdit.date,
        reason: bonusToEdit.reason,
        payrollMonth: bonusToEdit.payrollMonth,
        notes: bonusToEdit.notes || '',
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
  }, [bonusToEdit, isOpen, salaryConfigs, selectedMonth]);

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

    if (bonusToEdit) {
      updateBonus(bonusToEdit.id, formData);
    } else {
      addBonus(formData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bonusToEdit ? 'Edit Staff Bonus' : 'Award Staff Bonus'}
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
            disabled={!!bonusToEdit}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Select
              label="Bonus Classification"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as BonusType })
              }
              options={[
                { value: 'Performance bonus', label: 'Performance Bonus' },
                { value: 'Target bonus', label: 'Target Achievement Bonus' },
                { value: 'Special bonus', label: 'Special Contribution Bonus' },
                { value: 'Holiday bonus', label: 'Holiday / Festival Bonus' },
                { value: 'Other bonus', label: 'Other Incentive Bonus' },
              ]}
            />
          </div>
          <div>
            <Input
              label={`Bonus Amount (${currencySymbol})`}
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
              label="Award Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div>
            <Input
              label="Payroll Month Applied"
              type="month"
              value={formData.payrollMonth}
              onChange={(e) => setFormData({ ...formData, payrollMonth: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <Input
            label="Reason / Benchmark Description"
            placeholder="e.g. Exceeded athlete retention target by 25%"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Additional Recognition Notes
          </label>
          <textarea
            rows={2}
            className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden"
            placeholder="Approved by Operations Manager..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {bonusToEdit ? 'Save Changes' : 'Award Bonus'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
