import React, { useState, useEffect } from 'react';
import { Sparkles, Layers, DollarSign } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useGym } from '../../context/GymContext';
import { Membership } from '../../types';

interface AssignMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  membershipToEdit?: Membership | null;
  defaultMemberId?: string;
}

export const AssignMembershipModal: React.FC<AssignMembershipModalProps> = ({
  isOpen,
  onClose,
  membershipToEdit,
  defaultMemberId,
}) => {
  const { members, plans, addMembership, updateMembership, formatCurrency, currencySymbol } = useGym();

  const [mode, setMode] = useState<'catalog' | 'custom'>('catalog');
  const [memberId, setMemberId] = useState(defaultMemberId || members[0]?.id || '');
  
  // Catalog Plan
  const [planId, setPlanId] = useState(plans[0]?.id || '');

  // Custom Plan fields
  const [customPlanName, setCustomPlanName] = useState('Custom Package');
  const [customDurationValue, setCustomDurationValue] = useState(1);
  const [customDurationUnit, setCustomDurationUnit] = useState<'months' | 'days'>('months');

  // Dates & Payment
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Bank Transfer' | 'Online'>('Cash');
  const [status, setStatus] = useState<'Active' | 'Expired' | 'Expiring Soon'>('Active');

  useEffect(() => {
    if (membershipToEdit) {
      setMemberId(membershipToEdit.memberId);
      if (membershipToEdit.planId === 'custom' || membershipToEdit.customPlanName) {
        setMode('custom');
        setCustomPlanName(membershipToEdit.customPlanName || 'Custom Package');
      } else {
        setMode('catalog');
        setPlanId(membershipToEdit.planId);
      }
      setStartDate(membershipToEdit.startDate);
      setEndDate(membershipToEdit.endDate);
      setTotalAmount(membershipToEdit.totalAmount);
      setPaid(membershipToEdit.paid);
      setStatus(membershipToEdit.status);
    } else {
      if (mode === 'catalog') {
        const selectedPlan = plans.find((p) => p.id === planId) || plans[0];
        if (selectedPlan) {
          setTotalAmount(selectedPlan.price);
          setPaid(selectedPlan.price);

          const start = new Date(startDate);
          const end = new Date(start);
          end.setMonth(end.getMonth() + (selectedPlan.duration || 1));
          setEndDate(end.toISOString().split('T')[0]);
        }
      } else {
        const start = new Date(startDate);
        const end = new Date(start);
        if (customDurationUnit === 'months') {
          end.setMonth(end.getMonth() + Number(customDurationValue || 1));
        } else {
          end.setDate(end.getDate() + Number(customDurationValue || 1));
        }
        setEndDate(end.toISOString().split('T')[0]);
      }
      if (defaultMemberId) {
        setMemberId(defaultMemberId);
      }
    }
  }, [membershipToEdit, planId, startDate, isOpen, defaultMemberId, mode, customDurationValue, customDurationUnit, plans]);

  const handlePlanChange = (newPlanId: string) => {
    setPlanId(newPlanId);
    const p = plans.find((item) => item.id === newPlanId);
    if (p) {
      setTotalAmount(p.price);
      setPaid(p.price);

      const start = new Date(startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + (p.duration || 1));
      setEndDate(end.toISOString().split('T')[0]);
    }
  };

  const handleStartDateChange = (newDate: string) => {
    setStartDate(newDate);
    const start = new Date(newDate);
    const end = new Date(start);
    if (mode === 'catalog') {
      const p = plans.find((item) => item.id === planId);
      end.setMonth(end.getMonth() + (p?.duration || 1));
    } else {
      if (customDurationUnit === 'months') {
        end.setMonth(end.getMonth() + Number(customDurationValue || 1));
      } else {
        end.setDate(end.getDate() + Number(customDurationValue || 1));
      }
    }
    setEndDate(end.toISOString().split('T')[0]);
  };

  const remaining = Math.max(0, totalAmount - paid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;

    const assignedPlanId = mode === 'catalog' ? planId : 'custom';
    const assignedPlanName = mode === 'catalog' 
      ? plans.find((p) => p.id === planId)?.name 
      : customPlanName.trim();

    if (membershipToEdit) {
      updateMembership(membershipToEdit.id, {
        memberId,
        planId: assignedPlanId,
        customPlanName: assignedPlanName,
        startDate,
        endDate,
        totalAmount,
        paid,
        remaining,
        status,
      });
    } else {
      addMembership(
        {
          memberId,
          planId: assignedPlanId,
          customPlanName: assignedPlanName,
          startDate,
          endDate,
          totalAmount,
          paid,
          remaining,
          status: 'Active',
        },
        paymentMethod
      );
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={membershipToEdit ? 'Edit Membership' : 'Assign / Renew Membership'}
      description="Select member, plan tenure, and configure pricing breakdown."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Member"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          disabled={!!membershipToEdit || !!defaultMemberId}
          options={(members || []).map((m) => ({
            value: m.id,
            label: `${m.fullName} (${m.id})`,
          }))}
        />

        {/* Plan Mode Toggle */}
        {!membershipToEdit && (
          <div className="flex items-center justify-between p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setMode('catalog')}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'catalog'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Predefined Plan
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'custom'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Custom Plan (اپنی مرضی کا پلان)
            </button>
          </div>
        )}

        {mode === 'catalog' ? (
          <Select
            label="Membership Plan"
            value={planId}
            onChange={(e) => handlePlanChange(e.target.value)}
            options={(plans || []).map((p) => ({
              value: p.id,
              label: `${p.name} (${formatCurrency(p.price)} / ${p.duration} Mo)`,
            }))}
          />
        ) : (
          <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-200/80 space-y-3">
            <Input
              label="Custom Plan Name"
              required
              placeholder="e.g. VIP 3-Month Special, Student Deal"
              value={customPlanName}
              onChange={(e) => setCustomPlanName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Duration Number"
                required
                type="number"
                min="1"
                value={customDurationValue}
                onChange={(e) => setCustomDurationValue(Math.max(1, Number(e.target.value)))}
              />
              <Select
                label="Duration Unit"
                value={customDurationUnit}
                onChange={(e) => setCustomDurationUnit(e.target.value as any)}
                options={[
                  { value: 'months', label: 'Months' },
                  { value: 'days', label: 'Days' },
                ]}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            required
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
          />
          <Input
            label="End Date (Editable)"
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <Input
            label={`Total Fee (${currencySymbol || 'Rs.'})`}
            type="number"
            min="0"
            value={totalAmount}
            onChange={(e) => setTotalAmount(Number(e.target.value))}
          />
          <Input
            label={`Amount Paid (${currencySymbol || 'Rs.'})`}
            type="number"
            min="0"
            value={paid}
            onChange={(e) => setPaid(Number(e.target.value))}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Due Balance
            </label>
            <div
              className={`px-3 py-2 rounded-lg border text-sm font-bold flex items-center justify-between ${
                remaining > 0
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              <span>{formatCurrency(remaining)}</span>
              <span className="text-[10px] font-normal uppercase">{remaining > 0 ? 'Due' : 'Cleared'}</span>
            </div>
          </div>
        </div>

        {!membershipToEdit && (
          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
            options={[
              { value: 'Cash', label: 'Cash' },
              { value: 'Card', label: 'Card' },
              { value: 'Bank Transfer', label: 'Bank Transfer' },
              { value: 'Online', label: 'Online / UPI' },
            ]}
          />
        )}

        {membershipToEdit && (
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Expiring Soon', label: 'Expiring Soon' },
              { value: 'Expired', label: 'Expired' },
            ]}
          />
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md">
            {membershipToEdit ? 'Save Changes' : 'Assign Membership'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
