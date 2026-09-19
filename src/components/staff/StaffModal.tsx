import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useGym } from '../../context/GymContext';
import { Staff } from '../../types';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffToEdit?: Staff | null;
}

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  staffToEdit,
}) => {
  const { addStaff, updateStaff, currencySymbol } = useGym();

  const [formData, setFormData] = useState({
    name: '',
    role: 'Receptionist' as Staff['role'],
    phone: '',
    email: '',
    salary: 2800,
    status: 'Active' as 'Active' | 'Inactive',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (staffToEdit) {
      setFormData({
        name: staffToEdit.name,
        role: staffToEdit.role,
        phone: staffToEdit.phone,
        email: staffToEdit.email,
        salary: staffToEdit.salary,
        status: staffToEdit.status,
      });
    } else {
      setFormData({
        name: '',
        role: 'Receptionist',
        phone: '',
        email: '',
        salary: 2800,
        status: 'Active',
      });
    }
    setErrors({});
  }, [staffToEdit, isOpen]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email = 'Valid email address is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (staffToEdit) {
      updateStaff(staffToEdit.id, {
        name: formData.name.trim(),
        role: formData.role,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        salary: Number(formData.salary),
        status: formData.status,
      });
    } else {
      addStaff({
        name: formData.name.trim(),
        role: formData.role,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        salary: Number(formData.salary),
        status: formData.status,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={staffToEdit ? 'Edit Employee Profile' : 'Onboard Facility Staff Member'}
      description="Register operational personnel, security, front-desk, or maintenance crew."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Legal Name"
          required
          placeholder="e.g. Jordan Miller"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Assigned Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
            options={[
              { value: 'Manager', label: 'General Manager' },
              { value: 'Receptionist', label: 'Front-Desk Receptionist' },
              { value: 'Trainer', label: 'Fitness Trainer' },
              { value: 'Maintenance', label: 'Maintenance Engineer' },
              { value: 'Cleaner', label: 'Facility Hygiene Crew' },
              { value: 'Admin', label: 'System Admin' },
            ]}
          />
          <Input
            label={`Monthly Salary (${currencySymbol || 'Rs.'})`}
            type="number"
            min="0"
            required
            value={formData.salary}
            onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            type="tel"
            required
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={errors.phone}
          />
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="staff@apexfit.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />
        </div>

        <Select
          label="Employment Status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          options={[
            { value: 'Active', label: 'Active (On Duty)' },
            { value: 'Inactive', label: 'Inactive / On Leave' },
          ]}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md">
            {staffToEdit ? 'Save Employee' : 'Onboard Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
