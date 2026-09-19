import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Select } from '../common/Select';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useGym } from '../../context/GymContext';

interface AssignTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTrainerId?: string;
  defaultMemberId?: string;
}

export const AssignTrainerModal: React.FC<AssignTrainerModalProps> = ({
  isOpen,
  onClose,
  defaultTrainerId,
  defaultMemberId,
}) => {
  const { trainers, members, assignTrainer } = useGym();

  const [trainerId, setTrainerId] = useState(defaultTrainerId || trainers[0]?.id || '');
  const [memberId, setMemberId] = useState(defaultMemberId || members[0]?.id || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (defaultTrainerId) setTrainerId(defaultTrainerId);
    if (defaultMemberId) setMemberId(defaultMemberId);
  }, [defaultTrainerId, defaultMemberId, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerId || !memberId) return;

    assignTrainer({
      trainerId,
      memberId,
      startDate,
      status: 'Active',
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Personal Coach"
      description="Pair an athlete with a certified coach for 1-on-1 personal guidance."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Coach"
          value={trainerId}
          onChange={(e) => setTrainerId(e.target.value)}
          options={trainers.map((t) => ({
            value: t.id,
            label: `${t.name} (${t.specialization})`,
          }))}
        />

        <Select
          label="Select Member"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          disabled={!!defaultMemberId}
          options={members.map((m) => ({
            value: m.id,
            label: `${m.fullName} (${m.id})`,
          }))}
        />

        <Input
          label="Assignment Start Date"
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md">
            Assign Coach
          </Button>
        </div>
      </form>
    </Modal>
  );
};
