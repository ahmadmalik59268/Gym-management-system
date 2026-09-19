import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useGym } from '../../context/GymContext';
import { DietPlan } from '../../types';

interface DietPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: DietPlan | null;
  defaultMemberId?: string;
  defaultTrainerId?: string;
}

export const DietPlanModal: React.FC<DietPlanModalProps> = ({
  isOpen,
  onClose,
  planToEdit,
  defaultMemberId,
  defaultTrainerId,
}) => {
  const { members, trainers, addDietPlan, updateDietPlan } = useGym();

  const [title, setTitle] = useState('');
  const [memberId, setMemberId] = useState(defaultMemberId || members[0]?.id || '');
  const [trainerId, setTrainerId] = useState(defaultTrainerId || trainers[0]?.id || '');
  const [goal, setGoal] = useState<'Weight Loss' | 'Muscle Gain' | 'Maintenance' | 'Ketogenic'>('Muscle Gain');
  const [calories, setCalories] = useState(2600);
  const [waterTarget, setWaterTarget] = useState(3.5);
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [dinner, setDinner] = useState('');
  const [snacks, setSnacks] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (planToEdit) {
      setTitle(planToEdit.title || '');
      setMemberId(planToEdit.memberId);
      setTrainerId(planToEdit.trainerId || defaultTrainerId || trainers[0]?.id || '');
      setGoal(planToEdit.goal as any);
      setCalories(planToEdit.calories || 2600);
      setWaterTarget(planToEdit.waterTarget || 3.5);
      setBreakfast(planToEdit.breakfast);
      setLunch(planToEdit.lunch);
      setDinner(planToEdit.dinner);
      setSnacks(planToEdit.snacks);
      setNotes(planToEdit.notes || '');
    } else {
      setTitle('');
      setMemberId(defaultMemberId || members[0]?.id || '');
      setTrainerId(defaultTrainerId || trainers[0]?.id || '');
      setGoal('Muscle Gain');
      setCalories(2600);
      setWaterTarget(3.5);
      setBreakfast('4 whole eggs, 1 cup rolled oats with almond milk, blueberries');
      setLunch('200g grilled chicken breast, 1.5 cups brown rice, steamed broccoli');
      setDinner('200g wild salmon fillet, roasted sweet potato, asparagus with olive oil');
      setSnacks('Whey isolate shake, 30g raw almonds, 1 green apple');
      setNotes('Drink 500ml water immediately upon waking.');
    }
  }, [planToEdit, isOpen, members, trainers, defaultMemberId, defaultTrainerId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;

    const payload = {
      title: title || `${goal} Strategy`,
      memberId,
      trainerId: trainerId || undefined,
      goal,
      calories: Number(calories),
      waterTarget: Number(waterTarget),
      breakfast,
      lunch,
      dinner,
      snacks,
      notes,
    };

    if (planToEdit) {
      updateDietPlan(planToEdit.id, payload);
    } else {
      addDietPlan(payload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={planToEdit ? 'Edit Nutrition Plan' : 'Create Nutrition Plan'}
      description="Prescribe personalized macronutrient split, calorie balance, and daily meal guidelines."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Plan Title"
            placeholder="e.g. Lean Bulk Caloric Surplus"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Select
            label="Target Athlete"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            disabled={!!planToEdit || !!defaultMemberId}
            options={members.map((m) => ({
              value: m.id,
              label: `${m.fullName} (${m.id})`,
            }))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Dietary Objective"
            value={goal}
            onChange={(e) => setGoal(e.target.value as any)}
            options={[
              { value: 'Muscle Gain', label: 'Muscle Gain (Hypertrophy)' },
              { value: 'Weight Loss', label: 'Weight Loss & Caloric Deficit' },
              { value: 'Maintenance', label: 'Maintenance & Energy' },
              { value: 'Ketogenic', label: 'Keto / Low-Carb High Fat' },
            ]}
          />
          <Input
            label="Daily Calorie Target (kcal)"
            type="number"
            value={calories}
            onChange={(e) => setCalories(Number(e.target.value))}
          />
          <Input
            label="Daily Water Intake (L)"
            type="number"
            step="0.5"
            value={waterTarget}
            onChange={(e) => setWaterTarget(Number(e.target.value))}
          />
        </div>

        <div className="space-y-3 pt-2">
          <Input
            label="Breakfast"
            placeholder="e.g. 4 egg whites, 2 whole eggs, 1 bowl oatmeal"
            value={breakfast}
            onChange={(e) => setBreakfast(e.target.value)}
          />
          <Input
            label="Lunch"
            placeholder="e.g. 200g grilled chicken breast, 150g sweet potato"
            value={lunch}
            onChange={(e) => setLunch(e.target.value)}
          />
          <Input
            label="Dinner"
            placeholder="e.g. 200g grilled fish fillet / paneer, mixed vegetables"
            value={dinner}
            onChange={(e) => setDinner(e.target.value)}
          />
          <Input
            label="Mid-Day Snacks & Supplements"
            placeholder="e.g. Whey protein shake, handful of almonds, banana"
            value={snacks}
            onChange={(e) => setSnacks(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Dietary Precautions & Timing
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Avoid sodium post 8 PM, consume 1L water during workout..."
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
            {planToEdit ? 'Save Changes' : 'Publish Nutrition Plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
