import React, { useState, useMemo } from 'react';
import {
  Award,
  AlertTriangle,
  Plus,
  Search,
  DollarSign,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { useGym } from '../../context/GymContext';
import { usePayroll } from '../../context/PayrollContext';
import { BonusModal } from '../../components/payroll/BonusModal';
import { DeductionModal } from '../../components/payroll/DeductionModal';
import { PayrollBonus, PayrollDeduction } from '../../types';

export const DeductionsBonuses: React.FC = () => {
  const { formatCurrency, currencySymbol } = useGym();
  const {
    bonuses,
    deductions,
    deleteBonus,
    deleteDeduction,
    canManagePayroll,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    activeRole,
    simulatedTrainerId,
    isTrainerRole,
  } = usePayroll();

  const [activeTab, setActiveTab] = useState<'bonuses' | 'deductions'>('bonuses');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [selectedBonusForEdit, setSelectedBonusForEdit] = useState<PayrollBonus | null>(null);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);

  const [selectedDeductionForEdit, setSelectedDeductionForEdit] = useState<PayrollDeduction | null>(
    null
  );
  const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false);

  // Filtered Bonuses
  const filteredBonuses = useMemo(() => {
    return bonuses.filter((b) => {
      if (isTrainerRole && b.employeeId !== simulatedTrainerId) return false;
      const matchesSearch =
        b.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.reason.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [bonuses, isTrainerRole, simulatedTrainerId, searchTerm]);

  // Filtered Deductions
  const filteredDeductions = useMemo(() => {
    return deductions.filter((d) => {
      if (isTrainerRole && d.employeeId !== simulatedTrainerId) return false;
      const matchesSearch =
        d.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.reason.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [deductions, isTrainerRole, simulatedTrainerId, searchTerm]);

  const totalBonusesSum = useMemo(
    () => filteredBonuses.reduce((acc, curr) => acc + curr.amount, 0),
    [filteredBonuses]
  );

  const totalDeductionsSum = useMemo(
    () => filteredDeductions.reduce((acc, curr) => acc + curr.amount, 0),
    [filteredDeductions]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Bonuses & Compliance Deductions</span>
            <span className="text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
              {selectedMonth}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Reward stellar staff performance and enforce compliance adjustments.
          </p>
        </div>

        {canManagePayroll && (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<Award className="w-3.5 h-3.5" />}
              onClick={() => {
                setSelectedBonusForEdit(null);
                setIsBonusModalOpen(true);
              }}
            >
              + Award Bonus
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
              onClick={() => {
                setSelectedDeductionForEdit(null);
                setIsDeductionModalOpen(true);
              }}
            >
              + Add Deduction
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('bonuses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'bonuses'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Staff Bonuses ({filteredBonuses.length})</span>
            <span className="bg-emerald-700/50 px-1.5 py-0.2 rounded-full text-[10px]">
              +{formatCurrency(totalBonusesSum)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('deductions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'deductions'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Payroll Deductions ({filteredDeductions.length})</span>
            <span className="bg-rose-700/50 px-1.5 py-0.2 rounded-full text-[10px]">
              -{formatCurrency(totalDeductionsSum)}
            </span>
          </button>
        </div>

        <div className="w-64 hidden sm:block">
          <Input
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-3.5 h-3.5 text-slate-400" />}
          />
        </div>
      </div>

      {/* TAB 1: BONUSES TABLE */}
      {activeTab === 'bonuses' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Staff / Trainer</th>
                  <th className="p-3.5">Bonus Type</th>
                  <th className="p-3.5 text-right">Bonus Amount</th>
                  <th className="p-3.5">Date Awarded</th>
                  <th className="p-3.5">Payroll Month</th>
                  <th className="p-3.5">Reason / Target Achieved</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBonuses.map((bon) => (
                  <tr key={bon.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Employee */}
                    <td className="p-3.5">
                      <span className="font-extrabold text-slate-900 block">{bon.employeeName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {bon.employeeRole} • {bon.employeeId}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="p-3.5">
                      <Badge variant="success" size="sm">
                        {bon.type}
                      </Badge>
                    </td>

                    {/* Amount */}
                    <td className="p-3.5 text-right font-mono font-black text-emerald-700 text-sm">
                      +{formatCurrency(bon.amount)}
                    </td>

                    {/* Date */}
                    <td className="p-3.5 text-slate-600">{bon.date}</td>

                    {/* Month */}
                    <td className="p-3.5 font-mono font-bold text-indigo-700">{bon.payrollMonth}</td>

                    {/* Reason */}
                    <td className="p-3.5 text-slate-700 max-w-sm truncate" title={bon.reason}>
                      {bon.reason}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                      {canManagePayroll && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Edit2 className="w-3.5 h-3.5" />}
                            onClick={() => {
                              setSelectedBonusForEdit(bon);
                              setIsBonusModalOpen(true);
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                            onClick={() => deleteBonus(bon.id)}
                          />
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: DEDUCTIONS TABLE */}
      {activeTab === 'deductions' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Staff / Trainer</th>
                  <th className="p-3.5">Deduction Type</th>
                  <th className="p-3.5 text-right">Deduction Amount</th>
                  <th className="p-3.5">Incident Date</th>
                  <th className="p-3.5">Payroll Month</th>
                  <th className="p-3.5">Reason / Incident</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeductions.map((ded) => (
                  <tr key={ded.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Employee */}
                    <td className="p-3.5">
                      <span className="font-extrabold text-slate-900 block">{ded.employeeName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {ded.employeeRole} • {ded.employeeId}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="p-3.5">
                      <Badge variant="danger" size="sm">
                        {ded.type}
                      </Badge>
                    </td>

                    {/* Amount */}
                    <td className="p-3.5 text-right font-mono font-black text-rose-600 text-sm">
                      -{formatCurrency(ded.amount)}
                    </td>

                    {/* Date */}
                    <td className="p-3.5 text-slate-600">{ded.date}</td>

                    {/* Month */}
                    <td className="p-3.5 font-mono font-bold text-indigo-700">{ded.payrollMonth}</td>

                    {/* Reason */}
                    <td className="p-3.5 text-slate-700 max-w-sm truncate" title={ded.reason}>
                      {ded.reason}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                      {canManagePayroll && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Edit2 className="w-3.5 h-3.5" />}
                            onClick={() => {
                              setSelectedDeductionForEdit(ded);
                              setIsDeductionModalOpen(true);
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                            onClick={() => deleteDeduction(ded.id)}
                          />
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modals */}
      <BonusModal
        isOpen={isBonusModalOpen}
        onClose={() => {
          setIsBonusModalOpen(false);
          setSelectedBonusForEdit(null);
        }}
        bonusToEdit={selectedBonusForEdit}
      />

      <DeductionModal
        isOpen={isDeductionModalOpen}
        onClose={() => {
          setIsDeductionModalOpen(false);
          setSelectedDeductionForEdit(null);
        }}
        deductionToEdit={selectedDeductionForEdit}
      />
    </div>
  );
};
