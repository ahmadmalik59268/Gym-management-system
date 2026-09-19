import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../components/../common/Button';
import { useGym } from '../../context/GymContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMemberId?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  defaultMemberId,
}) => {
  const { members, memberships, addPayment, currencySymbol } = useGym();

  const [memberId, setMemberId] = useState(defaultMemberId || members[0]?.id || '');
  const [amount, setAmount] = useState(3000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Bank Transfer' | 'Online'>('Cash');
  const [status, setStatus] = useState<'Paid' | 'Pending' | 'Failed'>('Paid');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (defaultMemberId) {
      setMemberId(defaultMemberId);
      const ms = memberships.find((item) => item.memberId === defaultMemberId);
      if (ms && ms.remaining > 0) {
        setAmount(ms.remaining);
      }
    } else if (members[0]?.id) {
      setMemberId(members[0].id);
    }
  }, [defaultMemberId, isOpen, members, memberships]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || amount <= 0) return;

    // Find member's active membership if any
    const ms = memberships.find((item) => item.memberId === memberId && item.status === 'Active');

    addPayment({
      memberId,
      membershipId: ms?.id,
      amount: Number(amount),
      date,
      paymentMethod,
      status,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record New Payment"
      description="Issue official digital receipt and log transaction in facility ledger."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Member"
          value={memberId}
          onChange={(e) => {
            setMemberId(e.target.value);
            const ms = memberships.find((item) => item.memberId === e.target.value);
            if (ms && ms.remaining > 0) {
              setAmount(ms.remaining);
            }
          }}
          disabled={!!defaultMemberId}
          options={members.map((m) => ({
            value: m.id,
            label: `${m.fullName} (${m.id})`,
          }))}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={`Amount Received (${currencySymbol || 'Rs.'})`}
            type="number"
            min="1"
            required
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <Input
            label="Transaction Date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
            options={[
              { value: 'Cash', label: 'Cash' },
              { value: 'Card', label: 'Card' },
              { value: 'Bank Transfer', label: 'Bank Transfer' },
              { value: 'Online', label: 'Online / EasyPaisa / JazzCash' },
            ]}
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={[
              { value: 'Paid', label: 'Paid (Cleared)' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Failed', label: 'Failed' },
            ]}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Internal Note / Reference
          </label>
          <input
            type="text"
            placeholder="e.g. Due installment payment, cash deposit"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md">
            Record Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
