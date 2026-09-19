import React, { useState } from 'react';
import { Calendar, Play, CheckCircle2, DollarSign, Users, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useGym } from '../../context/GymContext';
import { usePayroll } from '../../context/PayrollContext';

interface ProcessPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessed?: () => void;
}

export const ProcessPayrollModal: React.FC<ProcessPayrollModalProps> = ({
  isOpen,
  onClose,
  onProcessed,
}) => {
  const { formatCurrency, currencySymbol } = useGym();
  const {
    selectedMonth,
    setSelectedMonth,
    generatePayrollForMonth,
    salaryConfigs,
    getMonthStats,
  } = usePayroll();

  const [month, setMonth] = useState(selectedMonth || '2026-09');
  const [isProcessing, setIsProcessing] = useState(false);

  const activeStaffCount = salaryConfigs.filter((c) => c.status === 'Active').length;

  const handleRun = () => {
    setIsProcessing(true);
    setTimeout(() => {
      generatePayrollForMonth(month);
      setSelectedMonth(month);
      setIsProcessing(false);
      if (onProcessed) onProcessed();
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate & Calculate Monthly Payroll"
      size="md"
    >
      <div className="space-y-5">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-bold text-indigo-950">
              Automated Payroll Calculation Engine
            </h4>
          </div>
          <p className="text-xs text-indigo-800 leading-relaxed">
            The system will scan all active trainers and staff, compute fixed base pay,
            attendance prorations, member revenue commission percentages (avoiding duplicate
            counts), bonuses, and automatic advance deductions for the cycle.
          </p>
        </div>

        <div>
          <Input
            label="Payroll Month Target"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Eligible Active Employees:</span>
            <span className="font-extrabold text-slate-900 text-sm">{activeStaffCount} personnel</span>
          </div>
          <div>
            <span className="text-slate-500 block">Commission Model:</span>
            <span className="font-extrabold text-indigo-600 text-sm">Transparent Real-Time</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<Play className="w-4 h-4 fill-current" />}
            onClick={handleRun}
            disabled={isProcessing}
          >
            {isProcessing ? 'Calculating Payroll...' : 'Process Payroll Cycle'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
