import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useGym } from '../../context/GymContext';
import { Equipment } from '../../types';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentToEdit?: Equipment | null;
}

export const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  equipmentToEdit,
}) => {
  const { addEquipment, updateEquipment } = useGym();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Cardio' | 'Strength' | 'Flexibility' | 'Accessories'>('Strength');
  const [quantity, setQuantity] = useState(1);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [status, setStatus] = useState<'Working' | 'Under Maintenance' | 'Broken'>('Working');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (equipmentToEdit) {
      setName(equipmentToEdit.name);
      setCategory(equipmentToEdit.category);
      setQuantity(equipmentToEdit.quantity);
      setPurchaseDate(equipmentToEdit.purchaseDate);
      setMaintenanceDate(equipmentToEdit.maintenanceDate);
      setStatus(equipmentToEdit.status);
      setNotes(equipmentToEdit.notes || '');
    } else {
      setName('');
      setCategory('Strength');
      setQuantity(2);
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setMaintenanceDate('');
      setStatus('Working');
      setNotes('');
    }
  }, [equipmentToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || quantity <= 0) return;

    if (equipmentToEdit) {
      updateEquipment(equipmentToEdit.id, {
        name: name.trim(),
        category,
        quantity: Number(quantity),
        purchaseDate,
        maintenanceDate: maintenanceDate || purchaseDate,
        status,
        notes: notes.trim(),
      });
    } else {
      addEquipment({
        name: name.trim(),
        category,
        quantity: Number(quantity),
        purchaseDate,
        maintenanceDate: maintenanceDate || purchaseDate,
        status,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={equipmentToEdit ? 'Edit Equipment Asset' : 'Register Gym Equipment Asset'}
      description="Record asset procurement, quantity on gym floor, and servicing history."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Equipment Name"
          required
          placeholder="e.g. Life Fitness Synrgy 360"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            options={[
              { value: 'Strength', label: 'Strength & Free Weights' },
              { value: 'Cardio', label: 'Cardio Machines' },
              { value: 'Flexibility', label: 'Flexibility & Yoga' },
              { value: 'Accessories', label: 'Floor Accessories' },
            ]}
          />
          <Input
            label="Inventory Count (Units)"
            type="number"
            min="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Purchase Date"
            type="date"
            required
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
          <Input
            label="Last Inspection Date"
            type="date"
            value={maintenanceDate}
            onChange={(e) => setMaintenanceDate(e.target.value)}
          />
        </div>

        <Select
          label="Operational Condition"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          options={[
            { value: 'Working', label: 'Operational & Working' },
            { value: 'Under Maintenance', label: 'Under Maintenance / Servicing' },
            { value: 'Broken', label: 'Out of Order / Broken' },
          ]}
        />

        <Input
          label="Maintenance / Serial Number Notes"
          placeholder="Brand warranty, cable tension notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md">
            {equipmentToEdit ? 'Save Asset' : 'Register Equipment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
