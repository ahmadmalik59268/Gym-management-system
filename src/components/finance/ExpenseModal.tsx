import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useGym } from '../../context/GymContext';
import { Expense } from '../../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
}) => {
  const { addExpense, updateExpense, currencySymbol } = useGym();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Rent' | 'Electricity' | 'Maintenance' | 'Salaries' | 'Equipment' | 'Other'>('Maintenance');
  const [amount, setAmount] = useState(250);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Bank Transfer'>('Bank Transfer');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title);
      setCategory(expenseToEdit.category);
      setAmount(expenseToEdit.amount);
      setDate(expenseToEdit.date);
      setPaymentMethod(expenseToEdit.paymentMethod);
      setNotes(expenseToEdit.notes || '');
    } else {
      setTitle('');
      setCategory('Maintenance');
      setAmount(200);
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Bank Transfer');
      setNotes('');
    }
  }, [expenseToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    if (expenseToEdit) {
      updateExpense(expenseToEdit.id, {
        title: title.trim(),
        category,
        amount: Number(amount),
        date,
        paymentMethod,
        notes: notes.trim(),
      });
    } else {
      addExpense({
        title: title.trim(),
        category,
        amount: Number(amount),
        date,
        paymentMethod,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expenseToEdit ? 'Edit Facility Expense' : 'Record Operating Expense'}
      description="Record overhead payments, bills, payroll disbursals, or equipment repairs."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Expense Title"
          required
          placeholder="e.g. Commercial HVAC Filter Replacement"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            options={[
              { value: 'Rent', label: 'Facility Rent' },
              { value: 'Electricity', label: 'Electricity / Utilities' },
              { value: 'Maintenance', label: 'Maintenance & Repairs' },
              { value: 'Salaries', label: 'Payroll & Salaries' },
              { value: 'Equipment', label: 'Equipment Purchase' },
              { value: 'Other', label: 'Other Miscellaneous' },
            ]}
          />
          <Input
            label={`Amount Paid (${currencySymbol || 'Rs.'})`}
            type="number"
            min="1"
            required
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Expense Date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Select
            label="Disbursal Channel"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
            options={[
              { value: 'Bank Transfer', label: 'Bank Wire / ACH' },
              { value: 'Card', label: 'Corporate Card' },
              { value: 'Cash', label: 'Petty Cash' },
            ]}
          />
        </div>

        <Input
          label="Vendor / Invoice Notes"
          placeholder="Vendor name, receipt/invoice #..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md">
            {expenseToEdit ? 'Save Changes' : 'Record Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
