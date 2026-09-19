import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { MembershipPlan } from '../../types';
import { useGym } from '../../context/GymContext';
import { Plus, X } from 'lucide-react';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: MembershipPlan | null;
}

export const PlanModal: React.FC<PlanModalProps> = ({
  isOpen,
  onClose,
  planToEdit,
}) => {
  const { addPlan, updatePlan, currency, currencySymbol } = useGym();

  const [formData, setFormData] = useState({
    name: '',
    duration: 1,
    price: 50,
    description: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (planToEdit) {
      setFormData({
        name: planToEdit.name,
        duration: planToEdit.duration,
        price: planToEdit.price,
        description: planToEdit.description,
        status: planToEdit.status,
      });
      setFeatures(
        Array.isArray(planToEdit.features) && planToEdit.features.length > 0
          ? [...planToEdit.features]
          : ['Cardio & Strength Machines', 'Locker Room Access', 'Free High-Speed Wi-Fi']
      );
    } else {
      setFormData({
        name: '',
        duration: 1,
        price: 49,
        description: '',
        status: 'Active',
      });
      setFeatures(['Cardio & Strength Access', 'Locker Room Access', 'Free WiFi']);
    }
    setError('');
  }, [planToEdit, isOpen]);

  const addFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Plan name is required');
      return;
    }
    if (formData.price <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (planToEdit) {
      updatePlan(planToEdit.id, {
        name: formData.name.trim(),
        duration: Number(formData.duration),
        price: Number(formData.price),
        description: formData.description.trim(),
        features: features.length > 0 ? features : ['Standard Access'],
        status: formData.status,
      });
    } else {
      addPlan({
        name: formData.name.trim(),
        duration: Number(formData.duration),
        price: Number(formData.price),
        description: formData.description.trim(),
        features: features.length > 0 ? features : ['Standard Access'],
        status: formData.status,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={planToEdit ? 'Edit Membership Plan' : 'Create Membership Plan'}
      description="Define duration, commercial pricing, and package privileges."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg font-medium border border-rose-200">
            {error}
          </div>
        )}

        <Input
          label="Plan Title"
          required
          placeholder="e.g. Platinum All-Inclusive"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Plan Duration"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
            options={[
              { value: 1, label: 'Monthly (1 Month)' },
              { value: 3, label: 'Quarterly (3 Months)' },
              { value: 6, label: 'Half-Yearly (6 Months)' },
              { value: 12, label: 'Yearly (12 Months)' },
            ]}
          />
          <Input
            label={`Price (${currencySymbol || 'Rs.'} ${currency || 'PKR'})`}
            required
            type="number"
            min="1"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
          />
        </div>

        <Select
          label="Plan Availability"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          options={[
            { value: 'Active', label: 'Active (Available for Sign-up)' },
            { value: 'Inactive', label: 'Inactive (Archived)' },
          ]}
        />

        <Input
          label="Plan Description"
          placeholder="Brief value proposition or target athlete..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        {/* Feature List Builder */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Included Features & Perks
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g. Free Sauna & Steam Room access"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFeature();
                }
              }}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={addFeature}
            >
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
            {features.map((feat, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-700 shadow-xs"
              >
                <span>{feat}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {features.length === 0 && (
              <span className="text-xs text-slate-400 italic">No features added yet.</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md">
            {planToEdit ? 'Update Plan' : 'Create Plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
