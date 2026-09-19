import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  Search,
  Calendar,
  DollarSign,
  CheckCircle2,
  Building,
  User,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { useGym } from '../../context/GymContext';
import { usePayroll } from '../../context/PayrollContext';
import { PayslipModal } from '../../components/payroll/PayslipModal';
import { PayrollRecord } from '../../types';

export const SalarySlips: React.FC = () => {
  const { formatCurrency, currencySymbol } = useGym();
  const {
    payrollRecords,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    activeRole,
    simulatedTrainerId,
    isTrainerRole,
  } = usePayroll();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecordForPayslip, setSelectedRecordForPayslip] = useState<PayrollRecord | null>(
    null
  );

  const filteredRecords = useMemo(() => {
    return payrollRecords.filter((rec) => {
      if (isTrainerRole && rec.employeeId !== simulatedTrainerId) {
        return false;
      }
      const matchesMonth = rec.payrollMonth === selectedMonth;
      const matchesSearch =
        rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesMonth && matchesSearch;
    });
  }, [payrollRecords, isTrainerRole, simulatedTrainerId, selectedMonth, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Salary Slips & Official Payslip Generation</span>
            <span className="text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
              {selectedMonth}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate, print, and export itemized payslips with transparent attendance formulas and
            trainer revenue shares.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Search Toolbar */}
      <Card className="p-4">
        <div className="max-w-md">
          <Input
            placeholder="Search by staff name, ID, or slip number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </Card>

      {/* Payslip Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecords.map((rec) => (
          <Card
            key={rec.id}
            className="p-5 border-slate-200 hover:border-indigo-400 transition-all hover:shadow-md space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={rec.employeePhoto}
                  alt={rec.employeeName}
                  className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{rec.employeeName}</h4>
                  <p className="text-xs text-slate-500">
                    {rec.employeeRole} • <span className="font-mono">{rec.employeeId}</span>
                  </p>
                </div>
              </div>

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
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Cycle Period:</span>
                <span className="font-mono font-medium text-slate-800">{rec.payrollMonth}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Salary Model:</span>
                <span className="font-bold text-slate-900">{rec.salaryType}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Gross Earnings:</span>
                <span className="font-mono text-emerald-700">{formatCurrency(rec.grossPay)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Deductions:</span>
                <span className="font-mono text-rose-600">
                  -{formatCurrency(rec.totalDeductions)}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-200 text-xs font-black text-slate-900">
                <span>Net Payable:</span>
                <span className="font-mono text-base text-indigo-700">
                  {formatCurrency(rec.netSalary)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center"
                icon={<FileText className="w-3.5 h-3.5" />}
                onClick={() => setSelectedRecordForPayslip(rec)}
              >
                View & Print Payslip
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Payslip Modal */}
      <PayslipModal
        isOpen={!!selectedRecordForPayslip}
        onClose={() => setSelectedRecordForPayslip(null)}
        record={selectedRecordForPayslip}
      />
    </div>
  );
};
