import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Plus, Trash2 } from 'lucide-react';
import { useGym } from '../../context/GymContext';
import { WorkoutPlan, ExerciseItem } from '../../types';

interface WorkoutPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: WorkoutPlan | null;
  defaultMemberId?: string;
  defaultTrainerId?: string;
}

export const WorkoutPlanModal: React.FC<WorkoutPlanModalProps> = ({
  isOpen,
  onClose,
  planToEdit,
  defaultMemberId,
  defaultTrainerId,
}) => {
  const { members, trainers, addWorkoutPlan, updateWorkoutPlan } = useGym();

  const [title, setTitle] = useState('');
  const [memberId, setMemberId] = useState(defaultMemberId || members[0]?.id || '');
  const [trainerId, setTrainerId] = useState(defaultTrainerId || trainers[0]?.id || '');
  const [goal, setGoal] = useState<'Weight Loss' | 'Muscle Gain' | 'Endurance' | 'General Fitness'>('Muscle Gain');
  const [workoutDays, setWorkoutDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [notes, setNotes] = useState('');

  const [exercises, setExercises] = useState<ExerciseItem[]>([
    { name: 'Barbell Bench Press', sets: 4, reps: '8-10', restTime: '90s', category: 'Chest' },
    { name: 'Incline Dumbbell Fly', sets: 3, reps: '12', restTime: '60s', category: 'Chest' },
  ]);

  useEffect(() => {
    if (planToEdit) {
      setTitle(planToEdit.title || '');
      setMemberId(planToEdit.memberId);
      setTrainerId(planToEdit.trainerId || defaultTrainerId || trainers[0]?.id || '');
      setGoal(planToEdit.goal as any);
      setWorkoutDays(planToEdit.workoutDays);
      setNotes(planToEdit.notes || '');
      setExercises(planToEdit.exercises);
    } else {
      setTitle('');
      setMemberId(defaultMemberId || members[0]?.id || '');
      setTrainerId(defaultTrainerId || trainers[0]?.id || '');
      setGoal('Muscle Gain');
      setWorkoutDays(['Mon', 'Tue', 'Thu', 'Fri']);
      setNotes('');
      setExercises([
        { name: 'Barbell Squat', sets: 4, reps: '6-8', restTime: '120s', category: 'Legs' },
        { name: 'Romanian Deadlift', sets: 3, reps: '10', restTime: '90s', category: 'Legs' },
      ]);
    }
  }, [planToEdit, isOpen, members, trainers, defaultMemberId, defaultTrainerId]);

  const addExerciseRow = () => {
    setExercises([
      ...exercises,
      { name: '', sets: 3, reps: '10-12', restTime: '60s', category: 'Chest' },
    ]);
  };

  const removeExerciseRow = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof ExerciseItem, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const toggleDay = (day: string) => {
    if (workoutDays.includes(day)) {
      setWorkoutDays(workoutDays.filter((d) => d !== day));
    } else {
      setWorkoutDays([...workoutDays, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || exercises.length === 0) return;

    const payload = {
      title: title || `${goal} Routine`,
      memberId,
      trainerId: trainerId || undefined,
      goal,
      workoutDays,
      exercises,
      notes,
    };

    if (planToEdit) {
      updateWorkoutPlan(planToEdit.id, payload);
    } else {
      addWorkoutPlan(payload);
    }

    onClose();
  };

  const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={planToEdit ? 'Edit Workout Plan' : 'Create Workout Plan'}
      description="Design customized workout routine, exercise splits, and volume parameters."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Plan Title"
            placeholder="e.g. 4-Day Hypertrophy Split"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Select
            label="Primary Goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value as any)}
            options={[
              { value: 'Muscle Gain', label: 'Muscle Gain (Hypertrophy)' },
              { value: 'Weight Loss', label: 'Weight Loss & Fat Reduction' },
              { value: 'Endurance', label: 'Stamina & Athletic Conditioning' },
              { value: 'General Fitness', label: 'General Health & Mobility' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Target Member"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            disabled={!!planToEdit || !!defaultMemberId}
            options={members.map((m) => ({
              value: m.id,
              label: `${m.fullName} (${m.id})`,
            }))}
          />
          <Select
            label="Overseeing Coach"
            value={trainerId}
            onChange={(e) => setTrainerId(e.target.value)}
            options={trainers.map((t) => ({
              value: t.id,
              label: `${t.name} (${t.specialization})`,
            }))}
          />
        </div>

        {/* Workout Days Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Active Training Days
          </label>
          <div className="flex flex-wrap gap-2">
            {daysList.map((day) => {
              const isSelected = workoutDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Exercise Roster ({exercises.length})
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={addExerciseRow}
            >
              Add Exercise
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {exercises.map((ex, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-2 items-center p-2.5 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="col-span-3">
                  <select
                    value={ex.category}
                    onChange={(e) => updateExercise(idx, 'category', e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-md py-1.5 px-2 focus:outline-none"
                  >
                    <option value="Chest">Chest</option>
                    <option value="Back">Back</option>
                    <option value="Legs">Legs</option>
                    <option value="Shoulders">Shoulders</option>
                    <option value="Arms">Arms</option>
                    <option value="Core">Core</option>
                    <option value="Cardio">Cardio</option>
                  </select>
                </div>
                <div className="col-span-4">
                  <input
                    type="text"
                    placeholder="Exercise name"
                    value={ex.name}
                    onChange={(e) => updateExercise(idx, 'name', e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-md py-1.5 px-2.5 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Sets"
                    min="1"
                    value={ex.sets}
                    onChange={(e) => updateExercise(idx, 'sets', Number(e.target.value))}
                    className="w-full text-xs text-center bg-white border border-slate-200 rounded-md py-1.5 px-1 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Reps"
                    value={ex.reps}
                    onChange={(e) => updateExercise(idx, 'reps', e.target.value)}
                    className="w-full text-xs text-center bg-white border border-slate-200 rounded-md py-1.5 px-1 focus:outline-none"
                  />
                </div>
                <div className="col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeExerciseRow(idx)}
                    disabled={exercises.length <= 1}
                    className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Trainer Guidelines & Form Tips
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Progressive overload every 2 weeks, prioritize full range of motion..."
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
            {planToEdit ? 'Save Changes' : 'Publish Workout Plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
